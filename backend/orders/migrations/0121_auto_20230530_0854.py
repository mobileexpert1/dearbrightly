# Generated by Django 2.0.5 on 2023-05-30 08:54

from django.db import migrations
from django.db.models import Q
from utils.logger_utils import logger
from orders.models import Order


def update_order_item_subscription(apps, schema_editor):
    OrderItem = apps.get_model('orders', 'OrderItem')
    User = apps.get_model('users', 'User')
    customers_with_subscriptions = User.objects.filter(subscriptions__isnull=False).distinct()
    for customer in customers_with_subscriptions:
        for subscription in customer.subscriptions.all():
            order_items = OrderItem.objects.filter(
                Q(order__customer=customer) &
                Q(product__product_category=subscription.product.product_category) &
                Q(order_product__frequency__gt=0) &
                Q(subscription__isnull=True)
            )
            for order_item in order_items:
                order_item.subscription = subscription
                order_item.save(update_fields=["subscription"])
                logger.debug(
                    f"[update_order_item_subscription] "
                    f"Subscriptions ID: {subscription.pk} attached to Order Item ID: {order_item.pk} "
                    f"Customer ID: {order_item.order.customer.pk} "
                    f"Order ID: {order_item.order.pk}"
                )
                
class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0120_auto_20230612_0651'),
    ]

    operations = [
        migrations.RunPython(update_order_item_subscription, reverse_code=migrations.RunPython.noop),
    ]
