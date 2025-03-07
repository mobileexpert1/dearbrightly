from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from utils.aws_s3_utils import send_text_sms
from sms.services import SMSService
from sms.permissions import Dear_Brightly_API_Key_Auth
from users.models import User
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes((Dear_Brightly_API_Key_Auth,))
def send_sms(request):
    message = request.data.get('message')
    type = request.data.get('type')
    user_email = request.data.get('user_email')

    customer = get_object_or_404(User, email=user_email) if user_email else None
    order = customer.orders.latest('purchased_datetime') if customer and customer.orders else None

    test_sms_number = settings.TEST_SMS_NUMBER
    if message:
        response = send_text_sms(f'+1{test_sms_number}', message)
    
    if type == 'upcoming order':
        response = SMSService.send_upcoming_order(order)
        
    if type == 'order shipped':
        tracking_number = '123456789'
        tracking_uri = settings.USPS_TRACKING_URL.format(tracking_number=tracking_number)
        response = SMSService.send_order_shipped(order, tracking_uri)

    if type == 'order tracking updated':
        tracking_number = '8888888888'
        tracking_uri = settings.USPS_TRACKING_URL.format(tracking_number=tracking_number)
        response = SMSService.send_order_tracking_updated(order, tracking_uri)

    if type == 'order delivered':
        response = SMSService.send_order_delivered(order)
    
    return response
