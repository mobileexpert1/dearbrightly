# Generated by Django 2.0.5 on 2018-08-24 08:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderproduct',
            name='subscription_frequency',
            field=models.CharField(choices=[('Once', 'once'), ('Every 3 months', 'every three months')], default='Once', max_length=255, null=True, verbose_name='Subscriptionfrequency in months'),
        ),
    ]
