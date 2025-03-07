import csv
import logging
from dearbrightly.pagination import CustomPagination
from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse
from django.utils.encoding import smart_str
from django_filters import rest_framework as filters
from django.utils import timezone
from emr.services import DoseSpotService
from mail.templates import PasswordResetRequestMail
from mixins.bulk_delete_mixin import ListDestroyMixin
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from users.filters import UserFilter, VacationDaysFilter
from users.models import PasswordResetToken, User
from users.permissions import (
    IsAuthenticatedAdmin,
    IsAdminOrUserWithUuidCheck,
    Dear_Brightly_API_Key_Auth,
    IsAdminOrDearBrightlyAPIKey,
)
from users.serializers import (
    PasswordChangeSerializer,
    PasswordResetSerializer,
    UserSerializer,
)
from users.services import UserService
import dateutil.parser
from subscriptions.services import SubscriptionsService
from django.shortcuts import get_object_or_404
from payment_new.services.payment_service import PaymentService as NewPaymentService
from users.serializers import VacationDaysSerializer, MedicalProviderUserStatesSerializer
from users.models import VacationDays, MedicalProviderUser
from subscriptions.models import Subscription

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class UserViewSet(
    mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    serializer_class = UserSerializer
    lookup_field = 'uuid'
    bulk_model = User
    pagination_class = CustomPagination

    def get_permissions(self):
        if self.action in [
            'reset_password',
            'reset_password_confirm',
            'reset_password_token',
            'unsubscribe',
        ]:
            permission_classes = [AllowAny]
        else:  # ['update', 'partial_update', 'change_password', 'update_credit_card_info', 'customer_payment_methods']
            permission_classes = [IsAdminOrUserWithUuidCheck]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.none()

        if user and user.is_superuser:
            qs = User.objects.active_users().order_by('-date_joined')

        if user and not user.is_superuser:
            qs = User.objects.filter(uuid=user.uuid).order_by('-date_joined')

        logger.debug(f'[UserViewSet][get_queryset] qs: {qs}')
        return qs

    @action(
        methods=('post',),
        serializer_class=PasswordChangeSerializer,
        detail=True,
        url_name='change_password',
    )
    def change_password(self, request, uuid):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(request.data.get('old_password')):
            return Response(
                data={'detail': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST
            )
        request.user.set_password(request.data.get('new_password_1'))
        request.user.save()
        return Response(
            data={'detail': 'Password change succeeded.'}, status=status.HTTP_200_OK
        )

    @action(
        methods=('post',),
        serializer_class=PasswordResetSerializer,
        detail=False,
        url_name='reset_password',
    )
    def reset_password(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.data.get('email')
            logger.debug(f'Attempting to reset password for: {email}.')
            normalized_email = email.lower()
            user = User.objects.get(email=normalized_email)
            token = PasswordResetToken.objects.create(user=user)
            scheme = 'https' if request.is_secure() else 'http'
            PasswordResetRequestMail(user_id=user.pk, token=token, scheme=scheme).send(
                to_email=normalized_email, request=request
            )
            logger.debug(f'Password reset email has been sent to {normalized_email}.')
            return Response(
                data={'detail': 'Password reset email has been sent.'},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            error_msg = f'Account with email {normalized_email} does not exist.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )
        except APIException as error:
            error_msg = f'Unable to reset password. User with provided email not found.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(methods=('post',), detail=False, url_name='reset_password_token')
    def reset_password_token(self, request):
        try:
            User.objects.get(password_reset_token=request.data.get('token'))
        except User.DoesNotExist:
            return Response(
                data={'detail': 'Reset password link expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            data={'detail': 'Reset password token is valid.'}, status=status.HTTP_200_OK
        )

    @action(methods=('post',), detail=False, url_name='unsubscribe')
    def unsubscribe(self, request):
        try:
            email = request.data.get('email')
            token = request.data.get('token')

            # logger.debug(f'[unsubscribe] Email: {email}. Token: {token}')

            user = get_object_or_404(User, email=email)

            user.check_token(token)
            user.opt_out_marketing_emails = True
            user.save(update_fields=['opt_out_marketing_emails'])

            # logger.debug(f'[unsubscribe] success. email: {email}. Token: {token}')
        except APIException as error:
            return Response(
                data={'detail': 'Unable to unsubscribe user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            data={'detail': 'Unsubscribe success.'}, status=status.HTTP_200_OK
        )

    @action(
        methods=('patch',),
        detail=False,
        serializer_class=UserSerializer,
        url_name='reset_password_confirm',
    )
    def reset_password_confirm(self, request):
        user = User.objects.get(password_reset_token=request.data.get('token'))
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        PasswordResetToken.objects.filter(user=user).delete()
        return Response(
            data={'detail': 'Password has been updated.'}, status=status.HTTP_200_OK
        )

    @action(methods=('post',), detail=True, url_name='update_credit_card_info')
    def update_credit_card_info(self, request, uuid):
        try:
            token = request.data.get('token')
            user = get_object_or_404(User, uuid=uuid)
            subscriptions = request.data.get('subscriptions')

            logger.debug(
                f'[UserViewSet][update_credit_card_info] User: {user.email}. Request: {request.data}'
            )
            if subscriptions:
                uuids = [subscription.get('uuid') for subscription in subscriptions]
                subscriptions = Subscription.objects.filter(uuid__in=uuids)
                user = NewPaymentService().update_credit_card_info_for_subscriptions(user, token, subscriptions)
            else:
                user = NewPaymentService().update_credit_card_info(request, user, token)

            serializer = UserSerializer(user)
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        except APIException as error:
            error_msg = f'Unable to update user credit card info for user uuid {uuid}.'
            logger.error(error_msg)
            return Response(
                data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(methods=('get',), detail=True, url_name='customer_payment_methods')
    def customer_payment_methods(self, request, uuid):
        from payment.services.services import Service

        get_default_payment_method = request.GET.get('default', False)
        user = get_object_or_404(User, uuid=uuid)
        try:
            if user.payment_processor_customer_id:
                if get_default_payment_method:
                    default_payment_method = Service().get_customer_default_payment_method(
                        user.payment_processor_customer_id
                    )
                    payment_methods = [default_payment_method] if default_payment_method else []
                else:
                    payment_methods = Service().get_customer_payment_methods(
                        user.payment_processor_customer_id
                    )
                logger.debug(
                    f'[UserViewSet][customer_payment_methods] payment_methods: {payment_methods}.'
                )
                return Response(data=payment_methods, status=status.HTTP_200_OK)
            else:
                return Response(
                    data={'detail': 'No payment processor customer id'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except APIException as error:
            return Response(
                data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST
            )


class AdminUserViewSet(viewsets.ModelViewSet, ListDestroyMixin):
    serializer_class = UserSerializer
    lookup_field = 'uuid'
    bulk_model = User
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    ordering = ['-date_joined']
    search_fields = (
        'date_joined',
        '$email',
        '$first_name',
        '=id',
        '$last_name',
    )
    filter_class = UserFilter

    def get_permissions(self):
        if self.action in ['create', 'list', 'partial_update', 'retrieve', 'update']:
            permission_classes = [IsAdminOrDearBrightlyAPIKey]
        else:
            permission_classes = [Dear_Brightly_API_Key_Auth]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        user = self.request.user
        if user and user.is_superuser:
            qs = qs.filter(is_active=True).order_by('-date_joined')
        logger.debug(f'[AdminUserViewSet][get_queryset] qs: {qs}')
        return qs

    def list(self, request, pk=None):
        export = self.request.query_params.get('export', None)

        # logger.debug(f'[AdminUserViewSet][list] Request: {request.data}')

        if pk == None:
            users_queryset = self.get_queryset()
        else:
            users_queryset = self.get_queryset.filter(id=pk)

        filtered_users_queryset = self.filter_queryset(users_queryset)

        if export:
            return self._export(filtered_users_queryset)

        page = self.paginate_queryset(filtered_users_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered_users_queryset, many=True)
        return Response(serializer.data)

    @action(methods=('post',), detail=False, url_name='generate_reset_password_token')
    def generate_reset_password_token(self, request):
        try:
            email = request.data.get('email')
            user = User.objects.get(email=email.lower())
            token = PasswordResetToken.objects.create(user=user)
            scheme = 'https' if request.is_secure() else 'http'
            host = request.META['HTTP_HOST']
            reset_password_url = f'{scheme}://{host}/reset-password/{token}'
            return Response(data={reset_password_url}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            error_msg = f'Account with email {email} does not exist.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )
        except APIException as error:
            error_msg = f'Unable to get reset password token. User with provided email not found.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def patch_payment_processor_customer_id(self, request):
        from payment.services.services import Service
        from users.models import User

        for user in User.objects.all():
            if not user.payment_processor_customer_id:
                stripe_customer_id = Service().fetch_stripe_user_id(user.email)
                if stripe_customer_id:
                    user.payment_processor_customer_id = stripe_customer_id
                    user.save(update_fields=['payment_processor_customer_id'])
                    logger.debug(
                        f'[patch_payment_processor_customer_id] User: {user.email}. Stripe customer ID: {stripe_customer_id}.'
                    )
                else:
                    logger.debug(
                        f'[patch_payment_processor_customer_id] Unable to get Stripe customer ID for user: {user.email}.'
                    )
        return Response(status=status.HTTP_200_OK)

    # Patch user's first and last names if they have shipping details
    @action(detail=False, methods=['post'])
    def patch_users_name(self, request):
        from users.models import User

        users_missing_name = User.objects.filter(
            Q(first_name__isnull=True)
            & Q(last_name__isnull=True)
            & Q(shipping_details__isnull=False)
        )
        logger.debug(f'[patch_users_name] users_missing_name: {users_missing_name}.')

        for user_missing_name in users_missing_name:
            logger.debug(
                f'[patch_users_name] Updating name for user {user_missing_name.id}.'
            )
            if user_missing_name.shipping_details:
                user_missing_name.first_name = (
                    user_missing_name.shipping_details.first_name
                    if user_missing_name.shipping_details.first_name
                    else None
                )
                user_missing_name.last_name = (
                    user_missing_name.shipping_details.last_name
                    if user_missing_name.shipping_details.last_name
                    else None
                )
                user_missing_name.save(update_fields=['first_name', 'last_name'])
                logger.debug(
                    f'[patch_users_name] first_name: {user_missing_name.first_name}. last_name: {user_missing_name.last_name}.'
                )

        return Response(status=status.HTTP_200_OK)

    @action(methods=('post',), detail=True, url_name='create_dosespot_patient')
    def create_dosespot_patient(self, request, uuid):
        if settings.DEBUG:
            try:
                patient = User.objects.get(uuid=uuid)
                patient.dosespot_id = DoseSpotService().create_patient(request, patient)
                patient.save(update_fields=['dosespot_id'])
                return Response(
                    data=UserSerializer(patient).data, status=status.HTTP_200_OK
                )
            except User.DoesNotExist:
                error_msg = f'User uuid {uuid} does not exist.'
                logger.error(error_msg)
                return Response(
                    data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
                )
            except APIException as error:
                error_msg = f'Unable to create DoseSpot patient for user uuid {uuid}.'
                logger.error(error_msg)
                return Response(
                    data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(
        methods=('post',),
        detail=True,
        url_name='generate_dosespot_sso_patient_query_url',
    )
    def generate_dosespot_sso_patient_query_url(self, request, uuid):
        try:
            patient = User.objects.get(uuid=uuid)
            url = DoseSpotService().generate_dosespot_sso_patient_query_url(
                request=request, patient=patient
            )
            return Response(data=url, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            error_msg = f'User uuid {uuid} does not exist.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )
        except APIException as error:
            error_msg = f'Unable to generate DoseSpot patient query sso url for user uuid {uuid}.'
            logger.error(error_msg)
            return Response(
                data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        methods=('get',), detail=True, url_name='get_dosespot_patients_prescriptions'
    )
    def get_dosespot_patients_prescriptions(self, request, uuid):
        try:
            patient = User.objects.get(uuid=uuid)
            prescriptions = DoseSpotService().get_patients_prescriptions(
                request=request, dosespot_id=patient.dosespot_id
            )
            return Response(data=prescriptions, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            error_msg = f'User uuid {uuid} does not exist.'
            logger.error(error_msg)
            return Response(
                data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST
            )
        except APIException as error:
            error_msg = f'Unable to get DoseSpot prescriptions for user uuid {uuid}.'
            logger.error(error_msg)
            return Response(
                data={'detail': error.detail}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(methods=('post',), detail=False)
    def remove_user_data(self, request):
        UserService().remove_user_data(request)
        return Response(status=status.HTTP_200_OK)

    @action(methods=('post',), detail=False)
    def deactivate_user_account(self, request):
        user_id = request.data.get('user_id')
        user = get_object_or_404(User, id=user_id)
        UserService().deactivate_user_account(user)
        return Response(status=status.HTTP_200_OK)

    # Used for testing
    @action(methods=('post',), detail=False)
    def set_new_user_as_pending_yearly_visit(self, request):
        user_id = request.data.get('user_id')
        user = get_object_or_404(User, id=user_id)
        UserService().set_new_user_as_pending_yearly_visit(user)
        return Response(data={'success': True}, status=status.HTTP_200_OK)

    def _export(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=customers.csv'
        writer = csv.writer(response, csv.excel)
        response.write(u'\ufeff'.encode('utf8'))
        writer.writerow(
            [
                smart_str(u'ID'),
                smart_str(u'Date Joined'),
                smart_str(u'Customer Email'),
                smart_str(u'Customer First Name'),
                smart_str(u'Customer Last Name'),
                smart_str(u'Address'),
                smart_str(u'City'),
                smart_str(u'State'),
                smart_str(u'Zip'),
                smart_str(u'Phone'),
                smart_str(u'Date of Birth'),
                smart_str(u'Rx Status'),
                smart_str(u'Orders'),
                smart_str(u'Visits'),
            ]
        )
        for obj in queryset:

            shipping_address_line = (
                obj.shipping_details.get_address_line() if obj.shipping_details else ''
            )
            shipping_address_city = (
                obj.shipping_details.city if obj.shipping_details else ''
            )
            shipping_address_state = (
                obj.shipping_details.state if obj.shipping_details else ''
            )
            shipping_address_zip = (
                obj.shipping_details.postal_code if obj.shipping_details else ''
            )
            shipping_address_phone = (
                obj.shipping_details.phone if obj.shipping_details else ''
            )

            writer.writerow(
                [
                    smart_str(obj.id),
                    smart_str(obj.date_joined),
                    smart_str(obj.email),
                    smart_str(obj.first_name),
                    smart_str(obj.last_name),
                    smart_str(shipping_address_line),
                    smart_str(shipping_address_city),
                    smart_str(shipping_address_state),
                    smart_str(shipping_address_zip),
                    smart_str(shipping_address_phone),
                    smart_str(obj.dob),
                    smart_str(obj.rx_status),
                    smart_str(obj.get_orders_list()),
                    smart_str(obj.get_medical_visits_list()),
                ]
            )
        return response

class VacationDaysViewset(viewsets.ModelViewSet):
    permission_classes = [Dear_Brightly_API_Key_Auth]
    serializer_class = VacationDaysSerializer
    queryset = VacationDays.objects.all()
    filter_backends = [filters.DjangoFilterBackend]
    filter_class = VacationDaysFilter

class MedicalProviderStatesUpdateViewset(
    mixins.UpdateModelMixin, 
    mixins.ListModelMixin, 
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet,
):
    permission_classes = [Dear_Brightly_API_Key_Auth]
    serializer_class = MedicalProviderUserStatesSerializer
    queryset = MedicalProviderUser.objects.all()
