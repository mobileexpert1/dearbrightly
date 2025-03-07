# Generated by Django 2.0.5 on 2018-09-20 11:48

from django.db import migrations, models
import django_countries.fields
import localflavor.us.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_auto_20180912_1225'),
    ]

    operations = [
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
            name='state',
            field=models.CharField(choices=[('AL', 'Alabama'), ('AZ', 'Arizona'), ('AR', 'Arkansas'), ('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'), ('DC', 'District of Columbia'), ('FL', 'Florida'), ('GA', 'Georgia'), ('ID', 'Idaho'), ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'), ('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'), ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'), ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'), ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'), ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'), ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'), ('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'), ('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'), ('WI', 'Wisconsin'), ('WY', 'Wyoming'), ('AK', 'Alaska'), ('HI', 'Hawaii'), ('AS', 'American Samoa'), ('GU', 'Guam'), ('MP', 'Northern Mariana Islands'), ('PR', 'Puerto Rico'), ('VI', 'Virgin Islands'), ('AA', 'Armed Forces Americas'), ('AE', 'Armed Forces Europe'), ('AP', 'Armed Forces Pacific')], max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='address_line1',
            field=models.CharField(max_length=128, null=True, verbose_name='Address Line 1'),
        ),
        migrations.AlterField(
            model_name='user',
            name='address_line2',
            field=models.CharField(blank=True, max_length=128, null=True, verbose_name='Address Line 2'),
        ),
        migrations.AlterField(
            model_name='user',
            name='city',
            field=models.CharField(max_length=64, null=True, verbose_name='City'),
        ),
        migrations.AlterField(
            model_name='user',
            name='country',
            field=django_countries.fields.CountryField(default='US', max_length=2, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=localflavor.us.models.PhoneNumberField(max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='postal_code',
            field=localflavor.us.models.USZipCodeField(max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='state',
            field=models.CharField(choices=[('AL', 'Alabama'), ('AZ', 'Arizona'), ('AR', 'Arkansas'), ('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'), ('DC', 'District of Columbia'), ('FL', 'Florida'), ('GA', 'Georgia'), ('ID', 'Idaho'), ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'), ('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'), ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'), ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'), ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'), ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'), ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'), ('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'), ('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'), ('WI', 'Wisconsin'), ('WY', 'Wyoming'), ('AK', 'Alaska'), ('HI', 'Hawaii'), ('AS', 'American Samoa'), ('GU', 'Guam'), ('MP', 'Northern Mariana Islands'), ('PR', 'Puerto Rico'), ('VI', 'Virgin Islands'), ('AA', 'Armed Forces Americas'), ('AE', 'Armed Forces Europe'), ('AP', 'Armed Forces Pacific')], max_length=128, null=True),
        ),
    ]
