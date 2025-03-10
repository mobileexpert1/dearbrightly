# Generated by Django 2.0.5 on 2019-11-11 03:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0087_auto_20191001_2352'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[(0, 'Account Created'), (1, 'Pending Questionnaire'), (2, 'Pending Photos'), (3, 'Pending Medical Provider Review'), (4, 'Pending Pharmacy'), (5, 'Awaiting Fulfillment'), (6, 'Shipped'), (7, 'Refill Submitted'), (8, 'Refunded'), (9, 'Cancelled'), (10, 'Manual Verification Required'), (11, 'Subscription Order Autogenerated'), (12, 'Partially Refunded'), (13, 'Payment Complete'), (14, 'Payment Override')], default=0, max_length=32, verbose_name='Order status'),
        ),
    ]
