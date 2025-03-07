# Generated by Django 2.0.5 on 2021-08-03 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0062_auto_20210724_0817'),
    ]

    operations = [
        migrations.RenameField(
            model_name='visit',
            old_name='payment_processor_transfer_id',
            new_name='medical_visit_fee_transfer_id',
        ),
        migrations.AddField(
            model_name='visit',
            name='platform_service_fee_transfer_id',
            field=models.CharField(blank=True, max_length=64, null=True,
                                   verbose_name='Stripe Transfer ID for the Dear Brightly platform service fee'),
        ),
        migrations.AlterField(
            model_name='visit',
            name='medical_visit_fee_transfer_id',
            field=models.CharField(blank=True, max_length=64, null=True, verbose_name='Stripe Transfer ID for the medical visit fee'),
        ),
    ]
