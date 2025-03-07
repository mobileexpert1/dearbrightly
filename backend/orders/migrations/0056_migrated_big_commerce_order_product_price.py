from django.db import migrations
from django.conf import settings
import datetime
import logging
logger = logging.getLogger(__name__)

# This migration is manually generated to update the product pricing of the orders
# migrated from BigCommerce (i.e., orders that were created before 10/26/18

def calculate_price(apps, order_product):
    total = order_product.product.base_price
    if order_product.quantity > 1:
        total *= order_product.quantity
        logger.info(f'[calculate_price] Total after x quantity: {total} [{order_product.quantity}]')

    return total

def update_product_price_big_commerce_orders(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    OrderProduct = apps.get_model('orders', 'OrderProduct')
    big_commerce_end_date = datetime.datetime(2018, 10, 26, tzinfo=datetime.timezone.utc)
    big_commerce_orders = Order.objects.filter(created_datetime__lte=big_commerce_end_date)
    logger.info(f'[update_product_price_big_commerce_orders] big commerce end date: {big_commerce_end_date}')
    for big_commerce_order in big_commerce_orders:
        for order_product in big_commerce_order.products.all():
            calculated_price = calculate_price(apps, order_product)
            OrderProduct.objects.filter(pk=order_product.id).update(price=calculated_price)
            logger.info(f'[update_product_price_big_commerce_orders] '
                        f'Updated product price [{order_product.id}]: {calculated_price} for order {big_commerce_order.id}')

class Migration(migrations.Migration):
    
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('orders', '0055_purchased_datetime_subtotal_total_amount_payment_processor_id'),
    ]

    operations = [
        migrations.RunPython(update_product_price_big_commerce_orders),
    ]


