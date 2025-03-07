import json
import requests
import pyotp

from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.exceptions import ValidationError, APIException, NotAuthenticated
from rest_framework.response import Response
from authentication.services.jwt_service import JWTService
from utils.logger_utils import logger
from users.serializers import UserSerializer
from sharing.serializers import SharingSerializer
from users.models import User, UserOTPSettings
from users.validators.password_validators import validate_password
from mail.services import MailService
from db_analytics.services import KlaviyoService, FacebookConversionServices
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponseRedirect

class AuthenticationService:

    def register_user(self, request):
        try:
            user = self._register_user(request, request.data)

            sharing_code = request.data.get('sharing_code', None)
            if sharing_code:
                logger.debug(f'[AuthenticationService][register_user] Sharing code: {sharing_code}.')
                serializer = SharingSerializer(data={'code': sharing_code}, context={'referee': user})
                serializer.is_valid(raise_exception=False)
                sharing = serializer.save()
                logger.debug(f'[AuthenticationService][register_user] Sharing object created: {sharing}.')

            return Response(data=UserSerializer(user).data, status=status.HTTP_200_OK)
        except (ValidationError, APIException) as error:
            return Response(data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST)
        except NotAuthenticated as error:
            logger.error(f'[register_user] NotAuthenticated: {error.detail}')
            return Response(data={'detail': error.detail}, status=status.HTTP_401_UNAUTHORIZED)

    def _register_user(self, request, user_data):
        try:
            user_email = user_data.get('email')
            if not user_email:
                raise ValidationError('No email provided')

            user = User.objects.get(email=user_email.lower())
            error_msg = 'Attempting to register a user that already exists.'
            logger.debug(f"[_register_user] {error_msg}: {user}")

            # User will not have a password if the account was created by Facebook
            # Can't do partial update here as the serializer checks for the confirmation password
            password = user_data.get('password')
            if not user.password and password:
                if validate_password(password) is None:
                    user.password = make_password(password)
                    user.save()
                    return user

            raise ValidationError(error_msg)
        except User.DoesNotExist:
            try:
                # Create a new user
                logger.debug(f"[_register_user] Registering a new user: {user_data.get('email')} ")
                serializer = UserSerializer(data=user_data)
                serializer.is_valid(raise_exception=True)
                user = serializer.save()
                customer_group, created = Group.objects.get_or_create(name='Customers')
                user.groups.add(customer_group)
                user.save()

                # try:
                #     MailService().send_user_email_sign_up(user)
                # except APIException as error:
                #     error_msg = f'Failed to send user {user.email}. Error: {error.detail}.'
                #     logger.error(error_msg)
                #     MailService.send_error_notification_email(notification='USER NOTIFICATION EMAIL ERROR', data=error_msg)

                FacebookConversionServices().track_registration_complete(request, user)
                return user
            except ValidationError as error:
                logger.debug(f'[_register_user] Registration ValidationError: {error.get_full_details()}')
                error_msg = "Validation error: "
                for error_key, error_value in error.get_full_details().items():
                    field_error_message = error_value[0].get('message')
                    field_error = f'{error_key} - {field_error_message}.'
                    error_msg += field_error
                raise ValidationError(error_msg)
            except NotAuthenticated as error:
                raise NotAuthenticated(error)
            except APIException as error:
                raise APIException(error)


    def login_user(self, request):
        email = request.data.get('email').lower()
        password = request.data.get('password')

        logger.debug(f'[authentication_service][login_user] Logging in user: {email}.')

        user = authenticate(email=email, password=password)

        if user:
            return self._login_user(user, request)

        error_msg = f'Invalid email/password combination. Please try logging in again.'
        return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    def _login_user(self, user, request):
        login(request, user)

        KlaviyoService().identify(user)
        logger.debug(f'[authentication_service][login_user] Successfully Logged in user: {user}.')

        return JWTService().obtain_and_set_to_cookie_jwt_token(request=request, user=user)

    def logout_user(self, request):
        logger.debug(f'Logging out user: {request.user}')
        logout(request)

        response = Response(data={'success': True}, status=status.HTTP_200_OK)
        response.delete_cookie(settings.JWT_AUTH_COOKIE)

        return response

    def facebook_authentication(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response(data={'detail': 'Missing access token.'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = self._get_facebook_user_data(access_token)
        email = user_data.get('email')
        try:
            user = User.objects.get(email=email)
            if not user.facebook_user_id:
                user.facebook_user_id = user_data.get('facebook_user_id')
                user.save()
            logger.debug(f"[facebook_authentication] Found user: {user} for FB ID: "
                         f"{user_data.get('facebook_user_id')}")
        except User.DoesNotExist:
            try:
                user = self._register_user(request, user_data)
                logger.debug(
                    f"[facebook_authentication] Registering new user: {user} "
                    f"for FB ID: {user_data.get('facebook_user_id')}")
            except (ValidationError, APIException) as error:
                return Response(data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST)
            except NotAuthenticated as error:
                return Response(data={'detail': error.detail}, status=status.HTTP_401_UNAUTHORIZED)

        if user:
            user = authenticate(user.email)
            return self._login_user(user, request)

        return Response(data={'detail': f'Unable to authenticate user {email}.'}, status=status.HTTP_400_BAD_REQUEST)

    def _get_facebook_user_data(self, token=None):
        '''
        Get user info from Facebook Graph API.

        :param token: Access token generated by the FB Javascript SDK in the client
        :return: User data from Facebook (limited to 'first_name', 'last_name', 'email', and 'id')
        '''

        headers = {'Content-Type': 'application/json'}
        url = settings.FACEBOOK_GRAPH_URI_GRAPH_ME.format(access_token=token)
        response = requests.get(url=url, headers=headers)

        logger.debug(f'[_get_facebook_user_data] '
                     f'URL: {url}. '
                     f'Access token: {token}. '
                     f'Facebook response: {response.content}.')

        user_data = json.loads(response.content)
        user_data['facebook_user_id'] = user_data.pop('id')

        logger.debug(f"[_get_facebook_user_data] "
                     f"Email: {user_data.get('email')}. "
                     f"Facebook user id: {user_data.get('facebook_user_id')}. "
                     f"First name: {user_data.get('first_name')}. "
                     f"Last name: {user_data.get('last_name')}")

        return user_data


    def validate_otp(self, request):
        logger.debug(f'[validate_otp]: User {request.user.id} validating OTP.')
        try:
            user = request.user
            code = request.GET.get('code')

            enable_2fa_timeout = json.loads(request.GET.get('enable2faTimeout'))
            logger.debug(f'[validate_otp] enable_2fa_timeout: {enable_2fa_timeout}. request.GET: {request.GET}')
            # Get user OTP settings
            user_otp_settings = user.otp_settings
            if user_otp_settings.two_factor_enabled:
                # logger.debug(f'[validate_otp] user secret code : {user_otp_settings.code}.')
                # Time-based OTPs
                totp = pyotp.TOTP(user_otp_settings.code)
                totp_code = totp.now()
                if totp_code == code:
                    if enable_2fa_timeout:
                        user_otp_settings.session_expire_datetime = timezone.now() + timedelta(days=30)
                        user_otp_settings.save(update_fields=['session_expire_datetime'])
                    user_data = UserSerializer(user).data
                    logger.debug(f'[validate_otp]: OTP validation success. User data: {user_data}.')
                    return Response(data=user_data, status=status.HTTP_200_OK)
                else:
                    logger.error(f'[validate_otp] Invalid token.')
                    return Response(data={'detail': "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data={'detail': "2FA not enabled."}, status=status.HTTP_400_BAD_REQUEST)
        except UserOTPSettings.DoesNotExist as e:
            logger.error(f'[validate_otp] DoesNotExist exception: {e}.')
            return Response(data={'detail': '2FA not set up.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'[validate_otp] Exception: {e}.')
            return Response(data={'detail': 'Unable to validate token.'}, status=status.HTTP_400_BAD_REQUEST)


    def get_2fa_setup_code(self, request):
        logger.debug(f'[get_2fa_setup_code] User: {request.user.id}.')
        totp_code = pyotp.random_base32()
        url = pyotp.totp.TOTP(totp_code).provisioning_uri(name='dearbrightly.com', issuer_name='Dear Brightly')
        return Response(data={'code': totp_code, 'url': url}, status=status.HTTP_200_OK)

    
    def open_browser(self, request):
        logger.debug(
            f'[AuthenticationService][open_browser] Redirect user if coming through instagram by sending back some dummy bytes back')
        bytes_string = b'redirect out of instagram'

        user_agent = request.META['HTTP_USER_AGENT']
        instagram_key = 'Instagram'
        referer = request.GET.get('referer', None)
        if instagram_key in user_agent:
            return Response(bytes_string, status=status.HTTP_200_OK, content_type='application/octet-stream')
        else:
            return HttpResponseRedirect(referer)

    def confirm_2fa_activation(self, request):
        logger.debug(f'[confirm_2fa_activation] User {request.user.id} confirming 2fa.')

        code = request.GET.get('code')
        secret = request.GET.get('secret')

        # logger.debug(f'[confirm_2fa_activation] User: {request.user}, Code: {code}, secret: {secret}')

        try:
            user = request.user
            totp = pyotp.TOTP(secret)
            totp_code = totp.now()
            # logger.debug(f'[confirm_2fa_activation] CODE now: {totp_code}')
            if totp_code == code:
                try:
                    otp_settings = user.otp_settings
                    otp_settings.user = user
                    otp_settings.code = secret
                    otp_settings.two_factor_enabled = True
                    otp_settings.save()
                except UserOTPSettings.DoesNotExist:
                    UserOTPSettings(user=user, code=secret, two_factor_enabled=True).save()

                return Response({'success': True}, status=status.HTTP_200_OK)
            else:
                logger.error(f'[confirm_2fa_activation] Invalid code.')
                return Response(data={'detail': "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f'[confirm_2fa_activation] Exception: {e}.')
            return Response(data={'detail': "2FA setup failed, try again later."}, status=status.HTTP_400_BAD_REQUEST)

        
    def disable_2fa(self, request):
        code = request.data.get('code')
        logger.debug(f'[disable_2fa] Disable 2FA requested by user: {request.user.id}.')
        try:
            if code:
                user = request.user
                # logger.debug(f'[disable_2fa] user_id: {user.id}')
                otp_settings = user.otp_settings
                totp = pyotp.TOTP(otp_settings.code)
                totp_code = totp.now()
                # logger.debug(f'[disable_2fa] code now: {totp_code}. code: {code}.')
                if totp_code == code:
                    otp_settings.two_factor_enabled = False
                    otp_settings.session_expire_datetime = None
                    otp_settings.save(update_fields=['session_expire_datetime', 'two_factor_enabled'])
                    logger.debug(f'[disable_2fa] Two-factor disabled for user {user.id}.')
                    return Response({'success': True}, status=status.HTTP_200_OK)
            logger.error(f'[disable_2fa] Invalid code.')
            return Response(data={'detail': "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)
        except UserOTPSettings.DoesNotExist as e:
            logger.error(f'[disable_2fa] Exception: {e}')
            return Response(data={'detail': "2FA disable failed, try again later."}, status=status.HTTP_400_BAD_REQUEST)

    def toggle_otp_timeout(self, request):
        logger.debug(f'[toggle_otp_timeout] OTP timeout toggle requested by user: {request.user.id}.')
        try:
            user = request.user
            otp_settings = user.otp_settings
            if otp_settings and otp_settings.session_expire_datetime:
                otp_settings.session_expire_datetime = None
            else:
                otp_settings.session_expire_datetime = timezone.now() + timedelta(days=30)
            otp_settings.save()

            logger.debug(f'[toggle_otp_timeout] OTP timeout toggle success. session_expire_datetime: {otp_settings.session_expire_datetime}.')
            return Response(data={'otp_session_timeout': otp_settings.session_expire_datetime}, status=status.HTTP_200_OK)
        except UserOTPSettings.DoesNotExist as e:
            logger.error(f'[toggle_otp_timeout] Exception: {e}')
            return Response(data={'detail': "Unable to modify 2FA timeout. Try again later."},status=status.HTTP_400_BAD_REQUEST)
        







