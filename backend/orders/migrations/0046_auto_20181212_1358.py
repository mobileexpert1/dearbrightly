# Generated by Django 2.0.5 on 2018-12-12 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0045_auto_20181122_2239'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='discount_code',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='Discount code'),
        ),
    ]
