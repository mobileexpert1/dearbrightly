# Generated by Django 2.0.5 on 2020-02-04 10:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0093_auto_20200130_0254'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='medical_visit_fee',
        ),
        migrations.RemoveField(
            model_name='order',
            name='service_fee',
        ),
        migrations.RemoveField(
            model_name='order',
            name='subscription_discount',
        ),
    ]
