from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from db_shopify.services.services import ShopifyService
from db_shopify.services.subscription_service import RechargeSubscriptionService
from db_shopify.permissions import Dear_Brightly_API_Key_Auth
from users.models import User
from django.shortcuts import get_object_or_404
from utils.logger_utils import logger
from payment_new.serializers import DiscountOutputSerializer
from db_shopify.serializers import ShopifyDiscountInputSerializer
from orders.models import Order

@api_view(['POST'])
@permission_classes((Dear_Brightly_API_Key_Auth,))
def authenticate(request):
    ShopifyService.authenticate(request)
    return Response(data={'success': True}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((AllowAny,))
def oauth_callback_handler(request):
    ShopifyService().oauth_callback_handler(request)
    return Response(data={'success': True}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes((Dear_Brightly_API_Key_Auth,))
def get_orders(request):
    ShopifyService().get_orders(request)
    return Response(data={'success': True}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((AllowAny,))
def order_created_webhook_handler(request):
    ShopifyService().order_created_webhook_handler(request)
    return Response(data={'success': True}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((AllowAny,))
def get_discount(request):
    serializer = ShopifyDiscountInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        order = Order.objects.get(uuid=serializer.validated_data.get("order_id"))
    except Order.DoesNotExist:
        detail="Order not found"
        logger.error(f"[get_discount] {detail} for request data: {request.data}")
        return Response(data=detail, status=status.HTTP_400_BAD_REQUEST)
    data = ShopifyService.get_discount(
        discount_code=serializer.validated_data.get("discount_code"),
        order=order,
        customer=order.customer,
    )
    output_serializer = DiscountOutputSerializer(data=data)
    output_serializer.is_valid(raise_exception=True)
    logger.debug(f"[get_discount] data: {output_serializer.validated_data}")
    return Response(data=output_serializer.validated_data, status=status.HTTP_200_OK)
