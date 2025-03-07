from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from shipping.services import ShippingService
from shipping.permissions import Dear_Brightly_API_Key_Auth
from django.shortcuts import get_object_or_404
from orders.models import Order, OrderProduct

import logging

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes((AllowAny,))
def shippo_webhook_handler(request):
    # logger.debug(f'[shippo_webhook_handler] Getting a Shippo webhook {request.data}.')
    ShippingService().webhook_handler(request)
    return Response(data={'success': True}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((Dear_Brightly_API_Key_Auth,))
def create_shipping_label(request):
    order_id = request.data.get('order_id', None)
    order_product_id = request.data.get('order_product_id', None)
    order = get_object_or_404(Order, id=order_id)
    order_product = get_object_or_404(OrderProduct, id=order_product_id)
    ShippingService().create_shipping_label(order, order_product)
    return Response(data={'success': True}, status=status.HTTP_200_OK)