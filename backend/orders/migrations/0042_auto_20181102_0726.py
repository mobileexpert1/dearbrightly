# Generated by Django 2.0.5 on 2018-11-02 07:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0041_auto_20181031_1159'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='refund_amount',
            field=models.PositiveIntegerField(default=0, verbose_name='Amount refunded.'),
        ),
    ]
