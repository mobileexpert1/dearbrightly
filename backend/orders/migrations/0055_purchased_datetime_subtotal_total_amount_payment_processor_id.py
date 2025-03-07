from django.db import migrations, models, transaction
from django.db.models import Q
from django.conf import settings
import logging
logger = logging.getLogger(__name__)


def calculate_price(apps, order_product):
    Product = apps.get_model('products', 'Product')
    total = order_product.product.price
    return total

def calculate_subtotal(order):
    subtotal = 0
    for product in order.products.all():
        subtotal += product.price
    logger.info(f'[calculate_subtotal] Subtotal: {subtotal}')
    return subtotal

def is_subscription(apps, order):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.all():
        for order_product in order.products.all():
            if order_product.frequency > 0:
                return True
    return False

def is_refill(apps, order):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.all():
        for order_product in order.products.all():
            if order_product.is_refill:
                return True
    return False

# update the purchased_datetime field with the created datetime
def update_purchased_datetime(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.all():
        order.purchased_datetime = order.created_datetime
        order.save()

# update the user payment_processor_id
def update_payment_processor_id(apps, schema_editor):
    User = apps.get_model('users', 'User')

    for user in User.objects.all():
        for user_order in user.orders.all():
            if user_order.payment_processor_customer_id and not user.payment_processor_customer_id:
                user.payment_processor_customer_id = user_order.payment_processor_customer_id
                user.save()

# update subscription_discount
def update_subscription_discount(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.filter(subscription_discount=0):
        if is_subscription(apps, order) and not is_refill(apps, order):
            order.subscription_discount = 2900
            order.save()

# update product price
def update_product_price(apps, schema_editor):
    OrderProduct = apps.get_model('orders', 'OrderProduct')
    for order_product in OrderProduct.objects.all():
        order_product.price = calculate_price(apps, order_product)
        order_product.save()

#subtotal = total_amount - tax - shipping_fee + discount
def update_subtotal(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.filter(subtotal=0):
        order.subtotal = calculate_subtotal(order)
        order.save()

# update total_amount
def update_total_amount(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    for order in Order.objects.filter(total_amount=0):
        if order.total_amount >= order.discount:
            order.total_amount = order.subtotal + order.tax + order.shipping_fee - order.discount
            order.save()


class Migration(migrations.Migration):
    
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('users', '0020_user_payment_processor_customer_id'),
        ('orders', '0054_auto_20190108_2137'),
    ]

    operations = [
        migrations.RunPython(update_purchased_datetime),
        migrations.RunPython(update_payment_processor_id),
        migrations.RunPython(update_subscription_discount),
        migrations.RunPython(update_product_price),
        migrations.RunPython(update_subtotal),
        migrations.RunPython(update_total_amount),
    ]


