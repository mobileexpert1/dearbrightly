# Generated by Django 2.0.5 on 2022-11-18 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0004_coupon_existing_purchase'),
    ]

    operations = [
        migrations.AddField(
            model_name='coupon',
            name='require_all_products',
            field=models.BooleanField(default=False),
        ),
    ]
