from django.db import migrations, models
from django.conf import settings
import logging
logger = logging.getLogger(__name__)
# This migration fixes an old tech debt in which we had one product for both trial and refill orders


def update_trial_order_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    OrderItem = apps.get_model('orders', 'OrderItem')

    legacy_trial_retinoid_product = Product.objects.get(sku='RX-RET-0001-13')  # 4
    legacy_refill_retinoid_product = Product.objects.get(sku='RX-RET-0001-20')  # 2
    legacy_trial_retinoid_set = Product.objects.get(sku='RX-SET-0001-13')  # 5
    legacy_refill_retinoid_set = Product.objects.get(sku='RX-SET-0001-20')  # 3

    trial_retinoid_product = Product.objects.get(sku='RX-RET-0001-15')  # 11
    refill_retinoid_product = Product.objects.get(sku='RX-RET-0001-25')  # 9
    trial_retinoid_set = Product.objects.get(sku='RX-SET-0001-15')  # 12
    refill_retinoid_set = Product.objects.get(sku='RX-SET-0001-25')  # 10

    # logger.info(f'[update_trial_order_products] trial '
    #             f'legacy_trial_retinoid_product: {legacy_trial_retinoid_product.id}. '
    #             f'legacy_refill_retinoid_product: {legacy_refill_retinoid_product.id}. '
    #             f'legacy_trial_retinoid_set: {legacy_trial_retinoid_set.id}. '
    #             f'legacy_refill_retinoid_set: {legacy_refill_retinoid_set.id}. '
    #             f'trial_retinoid_product: {trial_retinoid_product.id}. '
    #             f'refill_retinoid_product: {refill_retinoid_product.id}. '
    #             f'trial_retinoid_set: {trial_retinoid_set.id}. '
    #             f'refill_retinoid_set: {refill_retinoid_set.id}.')

    # loop through all trial order items
    for order_item in OrderItem.objects.filter(is_refill=False):
        # logger.info(f'[update_trial_order_products] trial order_item: {order_item.id}. '
        #             f'order_item.product: {order_item.product}. '
        #             f'order_item.order_product.product: {order_item.order_product.product}.')

        original_order_item_product = order_item.product
        original_order_product_product = order_item.order_product.product

        # replace all trial order with trial products
        if order_item.product == refill_retinoid_product:
            order_item.product = trial_retinoid_product
        if order_item.product == legacy_refill_retinoid_product:
            order_item.product = legacy_trial_retinoid_product
        order_item.save()

        if original_order_item_product != order_item.product:
            logger.info(f'[update_trial_order_products] '
                        f'*** updated trial order_item: {order_item.id}. '
                        f'original_order_item product: {original_order_item_product.id}. '
                        f'updated order_item product: {order_item.product.id}.')
            if order_item.order_product.product == refill_retinoid_product:
                order_item.order_product.product = trial_retinoid_product
            if order_item.order_product.product == refill_retinoid_set:
                order_item.order_product.product = trial_retinoid_set
            if order_item.order_product.product == legacy_refill_retinoid_product:
                order_item.order_product.product = legacy_trial_retinoid_product
            if order_item.order_product.product == legacy_refill_retinoid_set:
                order_item.order_product.product = legacy_trial_retinoid_set
            order_item.order_product.save()

            if original_order_product_product != order_item.order_product.product:
                logger.info(f'[update_trial_order_products] '
                            f'*** updated trial order_product: {order_item.order_product.id}. '
                            f'original_order_product product: {original_order_product_product.id}. '
                            f'updated order_product product: {order_item.order_product.product.id}.')


    # loop through all refill order items
    for order_item in OrderItem.objects.filter(is_refill=True):
        # logger.info(f'[update_trial_order_products] refill order_item: {order_item.id}. '
        #             f'order_item.product: {order_item.product}. '
        #             f'order_item.order_product.product: {order_item.order_product.product}.')

        original_order_item_product = order_item.product
        original_order_product_product = order_item.order_product.product

        # replace all refill order with refill products
        if order_item.product == trial_retinoid_product:
            order_item.product = refill_retinoid_product
        if order_item.product == legacy_trial_retinoid_product:
            order_item.product = legacy_refill_retinoid_product
        order_item.save()

        if original_order_item_product != order_item.product:
            logger.info(f'[update_trial_order_products] '
                        f'*** updated refill order_item: {order_item.id}. '
                        f'original_order_item product: {original_order_item_product.id}. '
                        f'updated order_item product: {order_item.product.id}.')

            if order_item.order_product.product == trial_retinoid_product:
                order_item.order_product.product = refill_retinoid_product
            if order_item.order_product.product == trial_retinoid_set:
                order_item.order_product.product = refill_retinoid_set
            if order_item.order_product.product == legacy_trial_retinoid_product:
                order_item.order_product.product = legacy_refill_retinoid_product
            if order_item.order_product.product == legacy_trial_retinoid_set:
                order_item.order_product.product = legacy_refill_retinoid_set
            order_item.order_product.save()

            if original_order_product_product != order_item.order_product.product:
                logger.info(f'[update_trial_order_products] '
                            f'*** updated refill order_product: {order_item.order_product.id}. '
                            f'original_order_product product: {original_order_product_product.id}. '
                            f'updated order_product product: {order_item.order_product.product.id}.')

class Migration(migrations.Migration):
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('orders', '0100_auto_20210312_2331'),
    ]

    operations = [
        #migrations.RunPython(update_trial_order_products, reverse_code=migrations.RunPython.noop),
    ]