# Generated by Django 2.0.5 on 2018-08-23 15:07

from django.db import migrations
import django_countries.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_auto_20180823_1505'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shippingdetails',
            name='country',
            field=django_countries.fields.CountryField(blank=True, default='US', max_length=2),
        ),
    ]
