from calendar import timegm
from datetime import timedelta, datetime

import jwt
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from rest_framework_jwt.settings import api_settings
from django.http import JsonResponse
from utils.logger_utils import logger
from db_analytics.services import OptimizelyService

optimizely_service = OptimizelyService(settings.OPTIMIZELY_PROJECT_ID)

class RefreshTokenMiddleware(MiddlewareMixin):
    refreshed_token = None

    def process_response(self, request, response):
        logger.debug(f'[RefreshTokenMiddleware] Processing request: {request}. Response: {response}')

        #if request.path.startswith('/api/v1'):
            # ---- Remove after 'new_lp' (new landing page) Optimizely experiment is complete ----
            # lp_variation = optimizely_service.activate_and_get_variation(request, 'new_lp')
            #
            # if lp_variation:
            #     response.set_cookie('lp_new', lp_variation)
            #     logger.debug(f'[RefreshTokenMiddleware] Setting cookie lp_new to variation: '
            #                 f'{lp_variation}')

        token = request.COOKIES.get(settings.JWT_AUTH_COOKIE)
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY)
            except jwt.exceptions.ExpiredSignatureError:
                logger.debug(f'[RefreshTokenMiddleware] ExpiredSignatureError.')
                return self._clear_storage(request)
            except jwt.exceptions.DecodeError:
                logger.debug(f'[RefreshTokenMiddleware] DecodeError.')
                return self._clear_storage(request)

            orig_iat = payload.get('orig_iat')
            if orig_iat:
                if self._is_token_refresh_limit_expired(request, orig_iat):
                    return self._clear_storage(request)

            refreshed_token = self._create_new_token(request, orig_iat)
            response.set_cookie(
                key=settings.JWT_AUTH_COOKIE, value=refreshed_token,
                expires=settings.JWT_EXPIRATION_DELTA.total_seconds(),
                httponly=True, secure=not settings.DEBUG
            )
            logger.debug(f'[RefreshTokenMiddleware] Response: {response}.')
            return response
        return response

    @staticmethod
    def _clear_storage(request):
        request.session.flush()
        response = JsonResponse({'detail': 'Refresh has expired.'}, status=401)
        response.delete_cookie(settings.JWT_AUTH_COOKIE)
        logger.debug('[RefreshTokenMiddleware] Clearing storage.')
        return response

    def _is_token_refresh_limit_expired(self, request, orig_iat):
        refresh_limit = settings.JWT_REFRESH_EXPIRATION_DELTA

        if isinstance(refresh_limit, timedelta):
            refresh_limit = (refresh_limit.days * 24 * 3600 + refresh_limit.seconds)

        expiration_timestamp = orig_iat + int(refresh_limit)
        now_timestamp = timegm(datetime.utcnow().utctimetuple())

        if now_timestamp > expiration_timestamp:
            logger.debug('[RefreshTokenMiddleware] Token has expired and has exceeded the max refresh limit.')
            return True

        return False

    def _create_new_token(self, request, orig_iat):
        payload = api_settings.JWT_PAYLOAD_HANDLER(request.user)
        payload['orig_iat'] = orig_iat
        logger.debug(f'[RefreshTokenMiddleware] Creating new token.')
        return api_settings.JWT_ENCODE_HANDLER(payload)
