# Generated by Django 2.0.5 on 2018-11-22 22:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0044_auto_20181110_0041'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_processor_charge_id',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Payment Processor Charge/Payment Method ID'),
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_processor_customer_id',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Payment Processor Customer ID'),
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_processor_order_id',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Payment Processor Order/Transaction ID'),
        ),
    ]
