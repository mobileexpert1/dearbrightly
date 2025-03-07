import taxjar
from utils.logger_utils import logger
from django.conf import settings
from rest_framework.exceptions import APIException
import requests

# Tax codes (specific to TaxJar)
RX_ITEM_TAX_CODE = '51020'

class TaxJarService:

    def update_order_with_tax(self, order):
        from orders.models import OrderItem

        # Disable this in devel since TaxJar does not offer a staging environment
        # if settings.DEBUG or settings.TEST_MODE:
        #     return order

        # # Since our Nexus is in CA, only CA orders are taxable
        # if not order.shipping_details.state == 'CA':
        #     return order

        client = taxjar.Client(api_key=settings.TAX_JAR_API_KEY)

        request_body = self._generate_request_body(order)
        logger.debug(f'[TaxJarService][update_order_with_tax] Request body: {request_body}')

        try:
            response = client.tax_for_order(request_body)
            logger.debug(f'[TaxJarService][update_order_with_tax] Response: {response}')

            amount = response.amount_to_collect*100
            order.tax = int(amount)

            # different products can have different tax rates, so need to store this in each orderProduct
            for line_item_response in response.breakdown.line_items:
                order_item_id = line_item_response.id
                order_item = OrderItem.objects.get(id=order_item_id)
                order_item.tax = (line_item_response.tax_collectable * 100)/order_item.quantity
                order_item.tax_rate = line_item_response.combined_tax_rate
                logger.debug(f'[TaxJarService][update_order_with_tax] line_item_response: '
                             f'{line_item_response}')
                order_item.save()

            order.save()
            return order
        except (requests.exceptions.ReadTimeout, taxjar.exceptions.TaxJarResponseError, taxjar.exceptions.TaxJarConnectionError) as e:
            error_message = e.full_response
            logger.error(f'[TaxJarService][update_order_with_tax] Error: {error_message}')
            raise APIException(error_message)

    def create_transaction(self, order):
        # Disable this in devel since TaxJar does not offer a staging environment
        if settings.DEBUG or settings.TEST_MODE:
            return

        try:
            client = taxjar.Client(api_key=settings.TAX_JAR_API_KEY)
            request_body = self._generate_order_request_body(order)
            logger.debug(f'[TaxJarService][create_transaction] Order: {order.id}. Request body: {request_body}')
            response = client.create_order(request_body)
            logger.debug(f'[TaxJarService][create_transaction] Order: {order.id}. Response: {response}')
        except taxjar.exceptions.TaxJarResponseError as e:
            error_message = e.full_response
            logger.error(f'[TaxJarService][create_transaction] Error response: {error_message}')
            # TODO (Alda) - Email this error?
            # raise APIException(error_message)
        except taxjar.exceptions.TaxJarConnectionError as e:
            error_message = e.full_response
            logger.error(f'[TaxJarService][create_transaction] Error response: {error_message}')

    def get_subscription_item_tax_rate(self, order_item_subscription):
        from products.models import Product

        # Disable this in devel since TaxJar does not offer a staging environment
        # Also to save on endpoint requests, assume all rx don't have tax
        if settings.DEBUG or order_item_subscription.product.product_type == Product.Type.rx:
            return 0

        tax_rate = 0
        client = taxjar.Client(api_key=settings.TAX_JAR_API_KEY)

        request_body = self._generate_request_body_subscription_item(order_item_subscription)
        logger.debug(f'[TaxJarService][get_subscription_item_tax_rate] Request body: {request_body}')

        try:
            response = client.tax_for_order(request_body)
            logger.debug(f'[TaxJarService][get_subscription_item_tax_rate] Response: {response}')

            if len(response.breakdown.line_items) > 0:
                line_item_response = response.breakdown.line_items[0]
                tax_rate = line_item_response.combined_tax_rate
                logger.debug(f'[TaxJarService][get_subscription_item_tax_rate] Tax rate: '
                         f'{tax_rate}')

            return tax_rate
        except (taxjar.exceptions.TaxJarResponseError, taxjar.exceptions.TaxJarConnectionError) as e:
            error_message = e.full_response
            logger.error(f'[TaxJarService][get_subscription_item_tax_rate] Error: {error_message}')
            raise APIException(error_message)

    def _generate_request_body(self, order):
        request_body = {
            'shipping': order.shipping_fee / 100
        }

        line_items = self._generate_line_items(order)
        request_body['line_items'] = line_items

        to_ship_body = self._generate_to_ship_body(order.shipping_details)
        request_body.update(to_ship_body)

        logger.debug(f'[TaxJarService][_generate_request_body] '
                     f'Request body: {request_body}. '
                     f'Ship body: {to_ship_body}')
        return request_body

    def _generate_order_request_body(self, order):
        request_body = self._generate_request_body(order)
        request_body['transaction_id'] = str(order.uuid)
        request_body['transaction_date'] = order.purchased_datetime.isoformat()
        request_body['amount'] = (order.subtotal + order.shipping_fee - order.discount) / 100
        request_body['sales_tax'] = order.tax / 100
        return request_body

    def _generate_to_ship_body(self, shipping_details):
        return {
            'to_country': shipping_details.country.code,
            'to_state': shipping_details.state,
            'to_zip': shipping_details.postal_code
        }

    def _generate_line_items(self, order):
        line_items = []

        for order_item in order.order_items.all():

            subscription_description = ' '
            if order_item.is_subscription:
                subscription_description = f', {order_item.frequency}-month Subscription '
            item_description = f'{order_item.product.name}{subscription_description}({order_item.product.sku})'

            line_item = {
                'id': order_item.id,
                'quantity': order_item.quantity,
                'unit_price': order_item.price/100,
                'discount': (order_item.discount*order_item.quantity)/100,
                'product_identifier': order_item.product.sku,
                'description': item_description
            }

            if order_item.tax:
                line_item['sales_tax'] = order_item.tax/100

            # Rx items are exempt in almost all states
            if order_item.product.product_type == 'Rx':
                line_item['product_tax_code'] = RX_ITEM_TAX_CODE

            line_items.append(line_item)

        return line_items

    def _generate_request_body_subscription_item(self, order_item_subscription):
        request_body = {
            'shipping': 0
        }
        line_items = self._generate_line_items_subscription_item(order_item_subscription)
        request_body['line_items'] = line_items
        to_ship_body = self._generate_to_ship_body(order_item_subscription.customer.shipping_details)
        request_body.update(to_ship_body)
        logger.debug(f'[TaxJarService][_generate_request_body_subscription_item] '
                     f'Request body: {request_body}. '
                     f'Ship body: {to_ship_body}')
        return request_body

    def _generate_line_items_subscription_item(self, order_item_subscription):
        product = order_item_subscription.product
        line_items = []

        line_item = {
            'id': order_item_subscription.id,
            'quantity': 1,
            'unit_price': product.refill_product.price,
            'product_identifier': product.sku
        }

        # Rx items are exempt in almost all states
        if product.product_type == 'Rx':
            line_item['product_tax_code'] = RX_ITEM_TAX_CODE

        line_items.append(line_item)

        return line_items