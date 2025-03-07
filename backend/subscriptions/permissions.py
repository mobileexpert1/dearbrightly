from rest_framework.permissions import BasePermission
from django.conf import settings

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# logger = logging.getLogger(__name__)

class IsAdminOrUser(BasePermission):
    def has_permission(self, request, view):
        #logger.debug(f'[subscription][IsAdminOrUser][has_permission] request: {request.user}.')
        return request.user and request.user.is_authenticated

    # called at retrieve, destroy, partial_update, update
    def has_object_permission(self, request, view, obj):
        #logger.debug(f'[subscription][IsAdminOrUser][has_object_permission] request: {request.user.uuid}. obj: {obj.customer.uuid}.')
        return request.user.uuid == obj.customer.uuid or request.user.is_superuser


class IsAdminOrUserWithUserUuidCheck(BasePermission):
    def has_permission(self, request, view):
        kwargs_user_uuid = view.kwargs['user_uuid']

        if not kwargs_user_uuid:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(
            #     f'[subscription][IsAdminOrUserWithUserUuidCheck][has_permission] request.user.uuid: {request.user.uuid}. kwargs_user_uuid: {kwargs_user_uuid}.')
            return request.user.uuid == kwargs_user_uuid or request.user.is_superuser


class Dear_Brightly_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        return api_key_secret == settings.DEARBRIGHTLY_API_KEY