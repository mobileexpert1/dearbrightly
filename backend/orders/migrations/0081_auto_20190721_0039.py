# Generated by Django 2.0.5 on 2019-07-21 00:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0080_auto_20190716_2343'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='discount_code',
            field=models.CharField(blank=True, max_length=64, null=True, verbose_name='Discount code'),
        ),
    ]
