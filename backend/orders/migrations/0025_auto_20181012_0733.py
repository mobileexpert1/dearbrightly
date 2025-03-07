# Generated by Django 2.0.5 on 2018-10-12 07:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0024_remove_orderproduct_is_subscription'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_processor_charge_id',
            field=models.CharField(blank=True, max_length=256, verbose_name='Payment Processor Charge/Payment Method ID'),
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_processor_order_id',
            field=models.CharField(blank=True, max_length=256, verbose_name='Payment Processor Order/Transaction ID'),
        ),
    ]
