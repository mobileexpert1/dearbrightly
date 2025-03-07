from django.db import migrations
from django.conf import settings
import datetime
import logging
logger = logging.getLogger(__name__)

# This migration is manually generated to update the order subtotals of the orders
# migrated from BigCommerce (i.e., orders that were created before 10/26/18

def calculate_subtotal(order):
    subtotal = 0
    for product in order.products.all():
        subtotal += product.price
        logger.info(f'[calculate_subtotal] Order: {order.id}. '
                    f'Product [{product.id}]: {product.price}. Subtotal: {subtotal}')
    return subtotal

def update_subtotal_big_commerce_orders(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    big_commerce_end_date = datetime.datetime(2018, 10, 26, tzinfo=datetime.timezone.utc)
    big_commerce_orders = Order.objects.filter(created_datetime__lte=big_commerce_end_date)
    for big_commerce_order in big_commerce_orders:
        big_commerce_order.subtotal = calculate_subtotal(big_commerce_order)
        logger.info(f'[update_subtotal_big_commerce_orders] Subtotal '
                    f'[{big_commerce_order.id}]: {big_commerce_order.subtotal}')
        big_commerce_order.save()

class Migration(migrations.Migration):
    
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('orders', '0056_migrated_big_commerce_order_product_price'),
    ]

    operations = [
        migrations.RunPython(update_subtotal_big_commerce_orders),
    ]


