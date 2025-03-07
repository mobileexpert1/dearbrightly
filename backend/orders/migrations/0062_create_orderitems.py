from django.db import migrations
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)


def calculate_subtotal(order):
    order_items = order.order_items.all()
    subtotal = 0
    for order_item in order_items:
        subtotal += order_item.price
    logger.debug(f'[calculate_subtotal] Subtotal: {subtotal}')
    return subtotal

def get_order_item_subscription(apps, order_product_subscriptions, product):
    return order_product_subscriptions.order_item_subscriptions.filter(product=product).first()

def get_all_products(apps, product):
    SetProduct = apps.get_model('products', 'SetProduct')
    products_in_set = []
    if product.is_set:
        product_sets = SetProduct.objects.filter(set_product=product)
        for product_set in product_sets:
            products_in_set.append(product_set.product_in_set)
    if len(products_in_set) > 0:
        return products_in_set

    return [product]

def create_order_item(apps, order, order_product):
    OrderItem = apps.get_model('orders', 'OrderItem')
    Order = apps.get_model('orders', 'Order')

    products = get_all_products(apps, order_product.product)
    for product in products:
        logger.info(f'[create_order_item] Product: {product.name}')
        order_item = OrderItem.objects.create(order=order,
                                              order_product=order_product,
                                              product=product)
        if product.product_type == 'OTC':
            order_item.tax = order.tax
            order_item.tax_rate = round((order.tax/product.price), 4)
            logger.info(f'[create_order_product] Tax for order_item: {order_item}. '
                        f'Tax: {order_item.tax}. Tax Rate: {order_item.tax_rate}')

        medical_visit_fee = 2900
        is_refill = False
        if product.product_type == 'Rx':

            order_purchased_datetime = order.purchased_datetime
            if not order.purchased_datetime:
                order_purchased_datetime = timezone.now()

            previous_shipped_rx_orders = order.customer.orders.filter(Q(status=6) & Q(purchased_datetime__lt=order_purchased_datetime))
            if len(previous_shipped_rx_orders) > 0:
                is_refill = True
                medical_visit_fee = 0

        order_item.is_refill = is_refill

        order_item.price = product.price * order_product.quantity

        order.medical_visit_fee = medical_visit_fee

        order.subscription_discount = 0
        if order_product.frequency == 3:
            order.subscription_discount = 2900

        order.save(update_fields=["medical_visit_fee", "subscription_discount"])

        if order.discount:
            order_item.discount = round((product.price / order.subtotal * order.discount), 2)

        order_item.created_datetime = order_product.created_datetime

        if order_product.payment_processor_subscription_id:
            order_item.payment_processor_subscription_id = order_product.payment_processor_subscription_id

        if int(order.status) == 6 or int(order.status) == 5 or int(order.status) == 4 or int(order.status) == 3 or int(order.status) == 2 or int(order.status) == 1:
            order_item.is_invoice_created = True
            order_item.is_charged = True

        logger.info(f'[create_order_product] Order: {order.id}. '
                    f'Order Item: {order_item.__dict__}')
        order_item.save()

def create_order_items(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    logger.info(f'[create_order_items]')
    for order in Order.objects.all():
        logger.info(f'[create_order_items] Order: {order.id}')
        for order_product in order.order_products.all():
            # The migrated order_product created_datetime are off
            order_product.created_datetime = order.created_datetime
            order_product.save()
            logger.info(f'[create_order_items] '
                        f'Customer: {order.customer.email}[{order.customer.id}]. Order: {order.id}. ' 
                        f'Order product: {order_product.id}')
            create_order_item(apps, order, order_product)

        # update subtotal
        order.subtotal = calculate_subtotal(order)

        # update total_amount
        total = order.subtotal + order.tax + order.shipping_fee - order.discount
        if total > 0:
            order.total_amount = total
        order.total_amount = 0

        # update total_paid
        if int(order.status) == 6 or int(order.status) == 5 or int(order.status) == 4 or int(order.status) == 3 or int(order.status) == 2 or int(order.status) == 1:
            order.total_paid = order.total_amount
        else:
            order.total_paid = 0

        # Update the newly added payment_captured field
        if order.purchased_datetime:
            order.payment_captured_datetime = order.purchased_datetime
        else:
            order.purchased_datetime = None

        order.save()


class Migration(migrations.Migration):
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('subscriptions', '0002_auto_20190304_2313'),
        ('products', '0023_auto_20190218_0930'),
        ('orders', '0061_orderitem'),
    ]

    operations = [
        #migrations.RunPython(create_order_items, reverse_code=migrations.RunPython.noop),
    ]


