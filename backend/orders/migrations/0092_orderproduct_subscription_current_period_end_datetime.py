# Generated by Django 2.0.5 on 2020-01-29 02:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0091_order_patient_prescription_user_most_recent_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderproduct',
            name='subscription_current_period_end_datetime',
            field=models.DateTimeField(null=True),
        ),
    ]
