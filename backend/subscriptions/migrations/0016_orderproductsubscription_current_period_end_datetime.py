# Generated by Django 2.0.5 on 2019-11-14 02:54

from django.db import migrations, models
from dateutil.relativedelta import relativedelta
import logging
logger = logging.getLogger(__name__)


def get_current_period_end_datetime(apps, subscription):
    if subscription.current_period_start_datetime:
        delta_in_days = subscription.frequency * 30 + subscription.delay_in_days
        if subscription.customer.on_trial_period:
            delta_in_days -= 30
        end_date = subscription.current_period_start_datetime + relativedelta(days=+delta_in_days)
        logger.debug(f'[get_current_period_end_datetime] end date: {end_date} ')
        return end_date
    return None

# update total_amount
def update_current_period_end_datetime(apps, schema_editor):
    OrderProductSubscription = apps.get_model('subscriptions', 'OrderProductSubscription')
    for subscription in OrderProductSubscription.objects.all():
        if not subscription.current_period_end_datetime:
            subscription.current_period_end_datetime = get_current_period_end_datetime(apps, subscription)
            subscription.save(update_fields=['current_period_end_datetime']) # saves will update
            logger.info(f'[update_current_period_end_datetime] Subscription saved: {subscription.id}')

class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0015_auto_20191113_2333'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderproductsubscription',
            name='current_period_end_datetime',
            field=models.DateTimeField(null=True),
        ),
        migrations.RunPython(update_current_period_end_datetime),
    ]
