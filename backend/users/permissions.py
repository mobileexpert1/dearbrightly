from rest_framework.permissions import BasePermission
from utils.logger_utils import logger
from django.conf import settings
import uuid

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# logger = logging.getLogger(__name__)


class IsAdminOrUserWithUuidCheck(BasePermission):
    def has_permission(self, request, view):
        kwargs = view.kwargs
        kwargs_user_uuid = kwargs.get('uuid', None) if kwargs else None

        if not kwargs_user_uuid:
            return False

        if request.user and request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            # logger.debug(
            #     f'[user][IsAdminOrUser][has_permission] kwargs: {kwargs}. uuid: {kwargs_user_uuid}. request uuid: {request.user.uuid}.')
            return uuid.UUID(kwargs_user_uuid) == request.user.uuid if isinstance(kwargs_user_uuid,str) else kwargs_user_uuid == request.user.uuid
        else:
            return False

    # called at retrieve, destroy, partial_update, update
    def has_object_permission(self, request, view, obj):
        # logger.debug(f'[user][IsAdminOrUser][has_object_permission] request: {request.user.uuid}. obj: {obj.uuid}.')
        return request.user.uuid == obj.uuid or \
               request.user.is_superuser


class IsAuthenticatedAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class Dear_Brightly_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        # logger.debug(f'[user][Dear_Brightly_API_Key_Auth][has_permission] api_key_secret: {api_key_secret}.')
        return api_key_secret == settings.DEARBRIGHTLY_API_KEY


class IsAdminOrDearBrightlyAPIKey(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user:
            return user.is_authenticated and user.is_superuser

        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        if api_key_secret:
            return api_key_secret == settings.DEARBRIGHTLY_API_KEY

        return False