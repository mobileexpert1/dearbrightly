# Generated by Django 2.0.5 on 2018-08-31 07:32

from django.db import migrations, models
import rest_framework.compat


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_auto_20180828_1135'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='tax_currency',
        ),
        migrations.AlterField(
            model_name='order',
            name='tax',
            field=models.PositiveIntegerField(default=10, validators=[rest_framework.compat.MaxValueValidator(100)]),
        ),
    ]
