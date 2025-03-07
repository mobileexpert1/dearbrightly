from utils.aws_s3_utils import send_text_sms
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from users.validators.phone_number_validators import validate_phone_number_format
from mail.services import MailService

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    def send_upcoming_order(order):
        message = (f"""We wanted to let you know that your Dear Brightly order will be shipping soon. To make any updates to your plan, visit: https://www.dearbrightly.com/user-dashboard/my-plan. You can make changes anytime to your plan within 5 days of receiving this message. We'll send you the tracking number when your order has shipped! Reply STOP to opt out of SMS updates.""")
        phone_number = SMSService._get_e164_formatted_phone_number(order)
        logger.debug(f'[SMSService][send_upcoming_order] '
                     f'Sending text message to: {phone_number}. Message: {message}.'
                    )
        try:
            #send_text_sms(phone_number, message)
            return Response(status=status.HTTP_200_OK)
        except APIException as e:
            return Response(data={'detail': e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def send_order_shipped(order, tracking_uri):
        message = (f"""Your Dear Brightly order has been shipped! You can track your shipment here: {tracking_uri}. Reply STOP to opt out of SMS updates.""")

        phone_number = SMSService._get_e164_formatted_phone_number(order)

        logger.debug(f'[SMSService][send_order_shipped] '
                     f'sending text message to: {phone_number}. Message: {message}.'
                    )
        try:
            #send_text_sms(phone_number, message)
            return Response(status=status.HTTP_200_OK)
        except APIException as e:
            return Response(data={'detail': e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def send_order_tracking_updated(order, tracking_uri):
        message = (f"""Your Dear Brightly order tracking number have been updated. Please track your shipment here: {tracking_uri}.""")

        phone_number = SMSService._get_e164_formatted_phone_number(order)

        logger.debug(f'[SMSService][send_order_tracking_updated] '
                     f'sending text message to: {phone_number}. Message: {message}.'
                    )
        try:
            #send_text_sms(phone_number, message)
            return Response(status=status.HTTP_200_OK)
        except APIException as e:
            return Response(data={'detail': e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def send_order_delivered(order):
        message = (f"""Your Dear Brightly order has been delivered. We can’t wait for you to try it out!""")
        phone_number = SMSService._get_e164_formatted_phone_number(order)
        logger.debug(f'[SMSService][send_order_delivered] '
                     f'Sending text message to: {phone_number}. Message: {message}.'
                    )
        try:
            #send_text_sms(phone_number, message)
            return Response(status=status.HTTP_200_OK)
        except APIException as e:
            return Response(data={'detail': e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def _get_e164_formatted_phone_number(order):
        phone_number = None
        customer = order.customer

        if order.shipping_details and order.shipping_details.phone:
            phone_number = order.shipping_details.phone
        else:
            if customer.shipping_details and customer.shipping_details.phone:
                phone_number = customer.shipping_details.phone

        try:
            #logger.debug(f'[SMSService][_get_e164_formatted_phone_number] Validating phone number: {phone_number}.')
            validate_phone_number_format(phone_number)
        except ValidationError as error:
            notes = f'Invalid US phone number: {phone_number}. Error: {error}.'
            logger.debug(f'[SMSService][_get_e164_formatted_phone_number] {notes}')
            MailService.send_user_notification_email(customer,
                                                     notification='INVALID PHONE NUMBER',
                                                     data=notes)
            phone_number = None


        # TODO: country code by default to the US and Canada right now
        formatted_phone_number = f'+1{phone_number}' if phone_number else None
        return formatted_phone_number