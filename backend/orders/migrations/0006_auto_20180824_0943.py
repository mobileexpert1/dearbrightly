# Generated by Django 2.0.5 on 2018-08-24 09:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_remove_order_tracking_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderproduct',
            name='frequency',
            field=models.IntegerField(default=0, verbose_name='Subscription frequency in months'),
        ),
    ]
