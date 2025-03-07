from django.conf import settings
from mail.services import MailService
from sms.services import SMSService
import dateutil.parser
import shippo
from rest_framework.exceptions import APIException
import logging
from shipping.serializers import ShippoShippingSerializer, ShippoParcelSerializer
import requests
import json
from rest_framework import status

shippo.config.api_key = settings.SHIPPO_API_KEY
shippo.config.api_version = "2018-02-08"
shippo.config.verify_ssl_certs = True
shippo.config.rates_req_timeout = 30.0

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class ShippingService:
    def webhook_handler(self, request):
        logger.debug(f'[ShippingService][webhook_handler] Request: {request}')
        shippo_webhook_json = request.data

        shippo_event = shippo_webhook_json.get('event')
        logger.debug(f'[ShippingService][webhook_handler] '
                     f'Event Type: {shippo_event}.')
        
        if shippo_event == 'transaction_created':
            pass
        elif shippo_event == 'transaction_updated':
            pass
        elif shippo_event == 'track_updated':
            self.track_updated_webhook_handler(request)
        elif shippo_event == 'batch_created':
            pass
        elif shippo_event == 'batch_purchased':
            pass

    def track_updated_webhook_handler(self, request):
        from orders.models import Order, OrderItem
        shippo_webhook_json = request.data
        shippo_event = shippo_webhook_json.get('event') if shippo_webhook_json else None
        shippo_data = shippo_webhook_json.get('data') if shippo_webhook_json else None
        shippo_tracking_number = int(shippo_data.get('tracking_number')) if shippo_data else None
        shippo_tracking = shippo_data.get('tracking_status') if shippo_data else None
        shippo_tracking_status = shippo_tracking.get('status') if shippo_tracking else None
        #shippo_tracking_sub_status = shippo_tracking.get('substatus')
        shippo_tracking_status_date = shippo_tracking.get('status_date') if shippo_tracking else None

        logger.debug(f'[ShippingService][track_updated_webhook_handler] '
                     f'Event Type: {shippo_event}. '
                     f'Tracking Number: {shippo_tracking_number}. '
                     f'Tracking Status: {shippo_tracking_status}. '
                     f'Tracking Status Date: {shippo_tracking_status_date}. '
                     f'shippo_tracking_number: {shippo_tracking_number}.')

        if shippo_tracking_number:
            try:
                #TODO: add object id tracking separate from Curexa in the future
                order_items_with_tracking_number = OrderItem.objects.filter(tracking_number=shippo_tracking_number)
                order = order_items_with_tracking_number.latest('created_datetime').order if order_items_with_tracking_number else None
                if not order:
                    logger.error(f'[ShippingService][track_updated_webhook_handler] '
                                 f'No order exists with tracking number: {shippo_tracking_number}.')
                    return
                logger.debug(f'[ShippingService][track_updated_webhook_handler] order: {order.id}.')

                if shippo_tracking_status == 'PRE_TRANSIT':
                    pass
                elif shippo_tracking_status == 'TRANSIT':
                    if int(order.status) == Order.Status.awaiting_fulfillment:
                        if order.is_all_items_shipped:
                            order.status = Order.Status.shipped
                            order.save(update_fields=["status"])

                        MailService.send_user_shipment_notification(order=order,
                                                                    tracking_number=order.tracking_number,
                                                                    tracking_uri=order.tracking_uri,
                                                                    is_update=False)

                elif shippo_tracking_status == 'DELIVERED':
                    order_item_delivered = False
                    for order_item in order_items_with_tracking_number:
                        if not order_item.delivered_datetime:
                            order_item.delivered_datetime = dateutil.parser.parse(shippo_tracking_status_date)
                            order_item.save(update_fields=['delivered_datetime'])
                            order_item_delivered = True
                    if order_item_delivered:
                        # in UTC time
                        MailService.send_user_email_order_arrived(order.customer)
                        SMSService.send_order_delivered(order)
                    else:
                        logger.debug(f'[ShippingService][track_updated_webhook_handler] Not sending notification for order {order.id}.'
                                     f' Notification already sent.')
                elif shippo_tracking_status == 'RETURNED':
                    notes = f'Tracking URI: {order.tracking_uri}.'
                    MailService.send_order_notification_email(order=order,
                                                              notification_type='ORDER DELIVERY RETURNED',
                                                              data=notes)
                elif shippo_tracking_status == 'FAILURE':
                    notes = f'Tracking URI: {order.tracking_uri}.'
                    MailService.send_order_notification_email(order=order,
                                                              notification_type='ORDER DELIVERY FAILURE',
                                                              data=notes)
            except APIException as e:
                error_msg = f'Error handling tracking updates for order: {order}. Tracking #: {shippo_tracking_number}. Error: {e}.'
                logger.error(f'[ShippingService][track_updated_webhook_handler] {error_msg}')
            
    def email_shipment_error(self, tracking_number):
        notes = f'Shippo Tracking Number: {tracking_number}.'
        MailService.send_error_notification_email(notification='SHIPPING ERROR',
                                                  data=notes)

    # only supports shipping one product at a time
    def create_shipping_label(self, order, order_product):

        # create Shippo order
        shippo_order_id = None
        # try:
        #     shippo_order_id = self.create_order(order, order_product)
        # except APIException as error:
        #     logger.debug(f'[ShippingService][create_shipping_label] '
        #                  f'Shippo order error: {error}')
        #     shippo_order_id = None

        address_from = {
            "name": "Dear Brightly",
            "street1": "PO Box 3781",
            "city": "Oakland",
            "state": "CA",
            "zip": "94609",
            "country": "US"
        }

        serializer = ShippoShippingSerializer(order.shipping_details)
        address_to = serializer.data
        address_to["validate"] =True

        validated_address_to = shippo.Address.create(**address_to)

        logger.debug(f'[ShippingService][create_shipping_label] '
                     f'validated_address_to: {validated_address_to}')

        validation_is_valid = validated_address_to.validation_results.is_valid if validated_address_to.validation_results else False
        if not validation_is_valid:
            validation_error_message = validated_address_to.validation_results.messages[0].text
            raise APIException(validation_error_message)

        serializer = ShippoParcelSerializer(order_product)
        parcel = serializer.data

        shipment = {
            "address_from": address_from,
            "address_to": validated_address_to,
            "parcels": [parcel]
        }

        if shippo_order_id:
            shipment["order"] = shippo_order_id

        logger.debug(f'[ShippingService][create_shipping_label] '
                     f'shipment: {shipment}. parcel: {parcel}.')

        transaction = shippo.Transaction.create(
            shipment=shipment,
            servicelevel_token="usps_first",
            label_file_type="PDF_4x6",
            metadata={"order_id" : order.id},
            carrier_account=settings.SHIPPO_USPS_CARRIER_ACCOUNT
        )

        order.notes = f'Shippo Transaction ID: {transaction.object_id}.'
        order.tracking_number = transaction.tracking_number
        order.save(update_fields=['notes', 'tracking_number'])

        logger.debug(f'[ShippingService][create_shipping_label] transaction: {transaction}. shipment: {shipment}.')


    def create_order(self, order, order_product):
        serializer = ShippoShippingSerializer(order.shipping_details)
        address_to = serializer.data

        serializer = ShippoParcelSerializer(order_product)
        parcel = serializer.data

        url = "https://api.goshippo.com/orders"
        data = {
            "to_address": address_to,
            "order_number": f"{order.id}",
            "placed_at": order.payment_captured_datetime.strftime("%Y-%m-%d %H:%M:%SZ"),
            "weight": parcel.get("weight", 0),
            "weight_unit": parcel.get("mass_unit", None)
        }

        headers = {
            "Content-type": "application/json",
            "Authorization": f"ShippoToken {settings.SHIPPO_API_KEY}"
        }

        logger.debug(f'[ShippingService][create_order] data: {data}.')

        response = requests.post(url,
                                 data=json.dumps(data),
                                 headers=headers)
        order_object_id = json.loads(response.text).get('object_id', None)

        logger.debug(f'[ShippingService][create_order] response: {response.text}. order_object_id: {order_object_id}')

        if response.status_code != status.HTTP_200_OK and response.status_code != status.HTTP_201_CREATED:
            raise APIException(response)

        return order_object_id
