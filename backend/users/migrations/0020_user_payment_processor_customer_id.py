# Generated by Django 2.0.5 on 2019-01-08 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_auto_20181026_2334'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='payment_processor_customer_id',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Payment Processor Customer ID'),
        ),
    ]
