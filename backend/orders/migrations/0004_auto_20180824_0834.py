# Generated by Django 2.0.5 on 2018-08-24 08:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_auto_20180824_0819'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderproduct',
            name='frequency',
            field=models.CharField(choices=[('Once', 'once'), ('Every 3 months', 'every three months')], default='Once', max_length=255, verbose_name='Subscription frequency in months'),
        ),
    ]
