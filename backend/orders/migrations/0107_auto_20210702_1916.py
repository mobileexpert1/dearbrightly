# Generated by Django 2.0.5 on 2021-07-02 19:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0106_order_shipped_datetime'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='chart_mogul_invoice_uuid',
        ),
        migrations.RemoveField(
            model_name='order',
            name='checkout_status',
        ),
    ]
