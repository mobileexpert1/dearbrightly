from mail.permissions import Dear_Brightly_API_Key_Auth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from mail.services import MailService
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.permissions import IsAuthenticated

from mail.constants import \
    USER_EMAIL_INFO_EMPTY_CART, \
    USER_EMAIL_INFO_ABANDONED_CART, \
    USER_EMAIL_INFO_INCOMPLETE_SKIN_PROFILE, \
    USER_EMAIL_INFO_INCOMPLETE_PHOTOS, \
    USER_EMAIL_INFO_INCOMPLETE_PHOTO_ID, \
    USER_EMAIL_INFO_CHECK_IN, \
    USER_EMAIL_INFO_ANNUAL_VISIT, \
    USER_EMAIL_INFO_ORDER_CANCELATION_SKIN_PROFILE_EXPIRED, \
    USER_EMAIL_SHARING_PROGRAM,\
    USER_EMAIL_INFO_TERMS_OF_USE_UPDATE
import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def send_sharing_email(request):
    referrer = request.user
    referee_email = request.data.get('referee_email', None)
    entry_point = request.data.get('entry_point', None)
    email_type = request.data.get('email_type', None)
    email_reminder_interval_in_days = request.data.get('email_reminder_interval_in_days', None)

    kwargs = {'referrer': referrer, 'referee_email': referee_email,
              'opt_out_tag': 'sharing', 'entry_point': entry_point,
              'email_type': email_type, 'email_reminder_interval_in_days': email_reminder_interval_in_days}

    MailService.send_sharing_program_email(request=request, email_info=USER_EMAIL_SHARING_PROGRAM,
                                           **kwargs)
    return Response(data={}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes((Dear_Brightly_API_Key_Auth, ))
def test_send_user_email(request):
    from users.models import User

    email_type = request.data.get('email_type')
    user_email = request.data.get('user_email')

    user = get_object_or_404(User, email=user_email) if user_email else None
    order = user.orders.latest('purchased_datetime') if user and user.orders.all() else None
    subscription = user.subscriptions.all().first() if user else None

    if email_type.lower() == 'sign up':
        MailService.send_user_email_sign_up(user)

    if email_type.lower() == 'empty cart':
        kwargs = {'opt_out_tag': 'empty_cart'}
        MailService.test_send_user_email(user, USER_EMAIL_INFO_EMPTY_CART, **kwargs)

    if email_type.lower() == 'abandoned cart':
        kwargs = {'opt_out_tag': 'abandoned_cart'}
        MailService.test_send_user_email(user, USER_EMAIL_INFO_ABANDONED_CART, **kwargs)

    if email_type.lower() == 'incomplete questionnaire':
        MailService.test_send_user_email(user, USER_EMAIL_INFO_INCOMPLETE_SKIN_PROFILE)

    if email_type.lower() == 'incomplete photos':
        MailService.test_send_user_email(user, USER_EMAIL_INFO_INCOMPLETE_PHOTOS)

    if email_type.lower() == 'incomplete photo id':
        MailService.test_send_user_email(user, USER_EMAIL_INFO_INCOMPLETE_PHOTO_ID)

    if email_type.lower() == 'order canceled skin profile expire':
        MailService.test_send_user_email(user, USER_EMAIL_INFO_ORDER_CANCELATION_SKIN_PROFILE_EXPIRED)

    if email_type.lower() == 'skin profile completion new user':
        MailService.send_user_email_skin_profile_completion_new_user(user)

    if email_type.lower() == 'skin profile completion returning user':
        MailService.send_user_email_skin_profile_completion_returning_user(user)

    if email_type.lower() == 'skin profile completion returning user no change':
        MailService.send_user_email_skin_profile_completion_returning_user_no_change(user)

    if email_type.lower() == 'skin profile completion returning user no change no response':
        MailService.send_user_email_skin_profile_completion_returning_user_no_change_no_response(user)

    if email_type.lower() == 'skin profile completion returning user incomplete response':
        MailService.send_user_email_skin_profile_completion_returning_user_incomplete_response(user)

    tracking_number = '123456789'
    tracking_uri = settings.USPS_TRACKING_URL.format(tracking_number=tracking_number)
    if email_type.lower() == 'order shipped trial':
        MailService.send_user_email_order_shipped_trial(order, tracking_number, tracking_uri)

    if email_type.lower() == 'order shipped':
        MailService.send_user_email_order_shipped(order, tracking_number, tracking_uri)

    if email_type.lower() == 'order tracking update':
        MailService.send_user_email_order_tracking_update(order, tracking_number, tracking_uri)

    if email_type.lower() == 'order arrived':
        MailService.send_user_email_order_arrived(user)

    if email_type.lower() == 'provider message':
        MailService.send_user_email_provider_message(user)

    if email_type.lower() == 'user check in':
        kwargs = {'opt_out_tag': 'check_in'}
        MailService.test_send_user_email(user, USER_EMAIL_INFO_CHECK_IN, **kwargs)

    if email_type.lower() == 'upcoming subscription order rx updated new user':
        MailService.send_user_email_upcoming_subscription_order_rx_updated_new_user(user, subscription)

    if email_type.lower() == 'upcoming subscription order rx unchanged new user':
        MailService.send_user_email_upcoming_subscription_order_rx_unchanged_new_user(user, subscription)

    if email_type.lower() == 'upcoming subscription order rx updated returning user':
        MailService.send_user_email_upcoming_subscription_order_rx_updated_returning_user(user, subscription)

    if email_type.lower() == 'upcoming subscription order rx unchanged returning user':
        MailService.send_user_email_upcoming_subscription_order_rx_unchanged_returning_user(user, subscription)

    if email_type.lower() == 'user annual visit':
        MailService.test_send_user_email(user, USER_EMAIL_INFO_ANNUAL_VISIT)

    if email_type.lower() == 'user annual visit order payment complete':
        users = User.objects.filter(id=user.id)
        MailService.send_user_emails_annual_visit_order_payment_complete(users)

    if email_type.lower() == 'payment failure':
        MailService.send_user_email_payment_failure(user)

    if email_type.lower() == 'subscription payment failure':
        MailService.send_user_email_subscription_payment_failure(user)

    if email_type.lower() == 'subscription cancel payment failure':
        MailService.send_user_email_subscription_cancel_payment_failure(user)

    if email_type.lower() == 'order confirmation ship now':
        MailService.send_user_email_order_confirmation_ship_now(user, subscription)

    if email_type.lower() == 'order confirmation resume':
        MailService.send_user_email_order_confirmation_resume(user, subscription)

    if email_type.lower() == 'order confirmation payment detail updated':
        MailService.send_user_email_order_confirmation_payment_detail_updated(user)

    if email_type.lower() == 'order confirmation':
        MailService.send_user_email_order_confirmation(user)

    if email_type.lower() == 'upcoming order payment detail updated':
        MailService.send_user_email_upcoming_order_payment_detail_updated(user)

    if email_type.lower() == 'terms of use':
        if user:
            MailService.send_user_email_terms_of_use_update(user)
        else:
            all_active_users = User.objects.filter(is_active=True)
            for active_user in all_active_users:
                MailService.send_user_email_terms_of_use_update(active_user)

    if email_type.lower() == 'privacy policy':
        all_active_users = User.objects.filter(is_active=True)
        for active_user in all_active_users:
            MailService.send_user_email_privacy_policy_update(active_user)

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def send_email(request):

    message_body = request.data.get('message_body')
    topic = request.data.get('topic')
    to_email = request.data.get('to_email')

    if topic == 'Feedback':
        message_body = f'User {request.user.id}: {message_body}'

    MailService.send_email(message_body, topic, to_email)

    return Response({message_body}, status=status.HTTP_200_OK)
