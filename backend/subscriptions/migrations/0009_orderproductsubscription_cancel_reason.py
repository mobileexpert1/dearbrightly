# Generated by Django 2.0.5 on 2019-08-12 03:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0008_orderproductsubscription_delay_in_days'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderproductsubscription',
            name='cancel_reason',
            field=models.CharField(choices=[('Not Applicable', 'not applicable'), ('None Specified', 'none'), ('Rx Expired', 'rx expired'), ('Pregnant or Nursing', 'pregnant nursing'), ('Commercial Retinoid', 'commercial retinoid'), ('Dislike', 'dislike'), ('Ineffective', 'ineffective'), ('Causes Irritation', 'causes irritation'), ('Cost', 'cost')], default='Not Applicable', max_length=32, verbose_name='Cancellation Reason'),
        ),
    ]
