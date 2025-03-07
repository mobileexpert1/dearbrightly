from rest_framework import permissions
from django.conf import settings
from rest_framework.permissions import BasePermission
from utils.logger_utils import logger
from orders.models import Order

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# logger = logging.getLogger(__name__)

class Dear_Brightly_API_Key_Auth(permissions.BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        return api_key_secret == settings.DEARBRIGHTLY_API_KEY


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        customer_id = request.GET.get('customer_id', None) if request.GET else None

        if request.user and request.user.is_authenticated:
            # logger.debug(f'[checkout][IsOwnerOrAdmin][has_permission] request.user: {request.user}. customer_id: {customer_id}.')
            if request.user.is_superuser:
                return True
            if customer_id:
                return request.user.payment_processor_customer_id == customer_id
        else:
            return False


class IsUserCheckingOut(permissions.BasePermission):
    def has_permission(self, request, view):
        order_uuid = view.kwargs.get('order_uuid', None) if view.kwargs else None

        if order_uuid:
            try:
                order = Order.objects.get(uuid=order_uuid)
            except Order.DoesNotExist:
                return False
        else:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(f'[checkout][IsUserCheckingOut][has_permission] request.user: {request.user}. order_uuid: {order_uuid}.')
            return request.user.uuid == order.customer.uuid if order.customer else False
        else:
            return False