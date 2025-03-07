from users.models import ShippingDetails
from mail.services import MailService
from payment.services.stripe_services import StripeService
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class UserService:

    def update_or_create_shipping_details(self, user, shipping_details_data):
        from users.serializers import ShippingDetailsSerializerNoId
        from users.models import User

        serializer = ShippingDetailsSerializerNoId(data=shipping_details_data)
        serializer.is_valid(raise_exception=True)
        user_serializer = ShippingDetailsSerializerNoId(user.shipping_details)

        if not user.shipping_details:
            user.shipping_details = ShippingDetails.objects.create(**shipping_details_data)
            logger.debug(f'[UserService][update_or_create_shipping_details] '
                         f'Newly created shipping details: {user.shipping_details}')

            phone_number = shipping_details_data.get('phone', None)
            users_with_same_phone_number = User.objects.filter(Q(shipping_details__phone=phone_number) & ~Q(id=user.id))
            if users_with_same_phone_number:
                users_with_same_phone_number_ids = list(users_with_same_phone_number.values_list("id", flat=True))
                error_msg = f'User with phone number already exists. ' \
                    f'Users with same phone number: {users_with_same_phone_number_ids}.'
                if not settings.DEBUG:
                    MailService.send_user_notification_email(user,
                                                             notification='DUPLICATE PHONE NUMBER',
                                                             data=error_msg)
                logger.debug(f'[UserService][update_or_create_shipping_details] '
                             f'Existing phone number: {phone_number}. Customer: {user.id}. '
                             f'Users with same phone number: {users_with_same_phone_number_ids}.')
        else:
            if serializer.data != user_serializer.data:
                user_notification_notes = f'Shipping Details: {user_serializer.data}. Updated Shipping Details: {serializer.data} '

                ShippingDetails.objects.filter(pk=user.shipping_details_id).update(**shipping_details_data)
                # need to get the shipping details update the user with the newest shipping details (filter updates don't trigger signals)
                user.shipping_details = ShippingDetails.objects.get(pk=user.shipping_details_id)
                logger.debug(f'[UserService][update_or_create_shipping_details] '
                             f'Updated shipping details: {user.shipping_details}')

        user.shipping_details.save()

        # A bit redundant, but keep the user's first and last name in sync with shipping details first and last names
        if not user.first_name or not user.last_name:
            user.first_name = shipping_details_data.get('first_name', None)
            user.last_name = shipping_details_data.get('last_name', None)
            user.save(update_fields=['first_name', 'last_name'])

    # Clean all user's shipping details, orders, visits, photos, prescriptions, and subscriptions
    def remove_user_data(self, request):
        from users.models import User

        email = request.data.get('email', None)
        user = get_object_or_404(User, email=email)
        orders = user.orders.all()
        visits = user.patient_visits.all()
        prescriptions = user.prescriptions.all()
        photos = user.photos.all()
        questionnaire_answers = user.questionnaire_answers.all()
        subscriptions = user.subscriptions.all()
        notes = user.medical_notes.all()
        chat_messages_sent = user.chat_messages_sent.all()
        chat_messages_received = user.chat_messages_received.all()

        logger.debug(f'**** Cleaning user {email} [{user.pk}]')

        # delete shipping details
        if user.shipping_details:
            logger.debug(f'Deleting shipping details {user.shipping_details.pk}')
            user.shipping_details.delete()

        # delete prescriptions
        for prescription in prescriptions:
            logger.debug(f'Deleting prescription {prescription.id}')
            # try:
            #     user.prescriptions.remove(prescription)
            # except AttributeError as e:
            #     logger.error(f'No prescriptions prescribed to user {user.id}')
            prescription.patient = None
            prescription.prescription = None
            prescription.medical_provider = None
            prescription.visit = None
            prescription.delete()

        # delete photos
        for photo in photos:
            logger.debug(f'Deleting photo {photo.id}')
            user.photos.remove(photo)
            photo.patient = None
            photo.visit.photos.remove(photo)
            photo.visit = None
            #photo.photo_file.delete()

        # delete notes
        for note in notes:
            logger.debug(f'Deleting note {note.id}')
            user.medical_notes.remove(note)
            note.patient = None
            note.delete()

        # delete chat messages
        for chat_message in chat_messages_sent | chat_messages_received:
            logger.debug(f'Deleting chat message {chat_message.id}')
            chat_message.sender.chat_messages_sent.remove(chat_message)
            chat_message.sender = None
            chat_message.receiver.chat_messages_received.remove(chat_message)
            chat_message.receiver = None
            chat_message.delete()

        # delete visits
        for visit in visits:
            logger.debug(f'Deleting visit {visit.id}')
            user.patient_visits.remove(visit)
            visit.user = None
            visit.questionnaire_answer = None
            visit.delete()

        # delete questionnaire answers
        for questionnaire_answer in questionnaire_answers:
            logger.debug(f'Deleting questionnaire answer {questionnaire_answer.id}')
            user.questionnaire_answers.remove(questionnaire_answer)
            questionnaire_answer.patient = None
            questionnaire_answer.questionnaire = None
            questionnaire_answer.delete()

        # delete orders
        for order in orders:
            logger.debug(f'Deleting order {order.id}')
            user.orders.remove(order)
            if order.shipping_details:
                logger.debug(f'Deleting order shipping details {order.shipping_details.pk}')
                order.shipping_details.delete()
            for order_product in order.order_products.all():
                logger.debug(f'Deleting order product {order_product.pk}')
                order_product.delete()
            order.shipping_details = None
            order.customer = None
            order.delete()

        # delete subscriptions
        for subscription in subscriptions:
            logger.debug(f'Deleting subscription {subscription.id}')
            user.subscriptions.remove(subscription)
            subscription.customer = None
            subscription.delete()

        # delete stripe user
        StripeService().remove_customer(user)

        user.groups.clear()
        user.delete()

    def deactivate_user_account(self, user):
        user.is_active = False
        logger.debug(f'[user services][deactivate_user_account] {user.id}')
        user.save()

    def set_new_user_as_pending_yearly_visit(self, user):
        from emr.models import Visit

        # get subscription
        subscription = user.subscriptions.first()
        subscription.open_invoice = None
        subscription.current_period_end_datetime = timezone.now()
        subscription.upcoming_order_email_sent_datetime = timezone.now() - timedelta(days=6)
        subscription.save()

        # get order
        order = user.orders.latest('created_datetime')
        order.payment_captured_datetime = timezone.now() - timedelta(days=2*30)
        order.purchased_captured_datetime = timezone.now() - timedelta(days=2*30)
        order.save()

        # get visit
        visit = order.emr_medical_visit
        created_datetime_expired = visit.created_datetime - timedelta(days=400)
        Visit.objects.filter(id=visit.id).update(created_datetime=created_datetime_expired)