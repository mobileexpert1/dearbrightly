# Generated by Django 2.0.5 on 2021-03-14 01:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0029_auto_20201231_0851'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='refill_sku',
            field=models.CharField(blank=True, max_length=32, verbose_name='Refill SKU'),
        ),
    ]
