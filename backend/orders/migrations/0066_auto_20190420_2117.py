# Generated by Django 2.0.5 on 2019-04-20 21:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0065_auto_20190420_2007'),
    ]

    operations = [
        migrations.RenameField(
            model_name='orderitem',
            old_name='is_charged',
            new_name='is_invoice_payment_success',
        ),
    ]
