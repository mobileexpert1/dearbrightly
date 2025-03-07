from django.conf import settings
from rest_framework.permissions import BasePermission
import uuid
#from django.shortcuts import get_object_or_404
from orders.models import Order

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# logger = logging.getLogger(__name__)


class IsAdminOrUser(BasePermission):
    def has_permission(self, request, view):
        #logger.debug(f'[orders][IsAdminOrUser][has_permission] request: {request}.')
        return request.user and request.user.is_authenticated

    # called at retrieve, destroy, partial_update, update
    def has_object_permission(self, request, view, obj):
        #logger.debug(f'[orders][IsAdminOrUser][has_object_permission] action: {view.action}. request: {request}. obj: {obj}.')
        return request.user.uuid == obj.customer.uuid or request.user.is_superuser

class IsCustomerUpdatingOrCreatingOrder(BasePermission):
    def has_permission(self, request, view):
        customer_data = request.data.get('customer', None)
        uuid_str = customer_data.get('id', None) if customer_data else None

        if not uuid_str:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(
            #     f'[orders][IsCustomerUpdatingOrCreatingOrder][has_permission] request user uuid: {request.user.uuid}. uuid_str: {uuid_str}.')
            return uuid.UUID(uuid_str) == request.user.uuid

class IsAdminOrUserWithUserUuidCheck(BasePermission):
    def has_permission(self, request, view):
        kwargs_user_uuid = view.kwargs['user_uuid']

        if not kwargs_user_uuid:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(
            #     f'[orders][IsAdminOrUserWithUserUuidCheck][has_permission] request.user.uuid: {request.user.uuid}. kwargs_user_uuid: {kwargs_user_uuid}.')
            return request.user.uuid == kwargs_user_uuid or request.user.is_superuser

class Dear_Brightly_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
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