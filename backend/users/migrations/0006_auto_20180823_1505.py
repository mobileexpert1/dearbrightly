# Generated by Django 2.0.5 on 2018-08-23 15:05

from django.db import migrations, models
import django_countries.fields
import localflavor.us.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_auto_20180823_1034'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shippingdetails',
            name='address_line1',
            field=models.CharField(blank=True, max_length=128, null=True, verbose_name='Address Line 1'),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='address_line2',
            field=models.CharField(blank=True, max_length=128, null=True, verbose_name='Address Line 2'),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='city',
            field=models.CharField(blank=True, max_length=64, null=True, verbose_name='City'),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='country',
            field=django_countries.fields.CountryField(blank=True, default='US', max_length=2, null=True),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='first_name',
            field=models.CharField(blank=True, max_length=30, null=True, verbose_name='first name'),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='last_name',
            field=models.CharField(blank=True, max_length=30, null=True, verbose_name='last name'),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='phone',
            field=localflavor.us.models.PhoneNumberField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='postal_code',
            field=localflavor.us.models.USZipCodeField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='shippingdetails',
            name='state',
            field=localflavor.us.models.USStateField(blank=True, max_length=2, null=True),
        ),
    ]
