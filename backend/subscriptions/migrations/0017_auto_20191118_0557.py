# Generated by Django 2.0.5 on 2019-11-18 05:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0016_orderproductsubscription_current_period_end_datetime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderproductsubscription',
            name='cancel_reason',
            field=models.CharField(choices=[('Not Applicable', 'not applicable'), ('None Specified', 'none'), ('Rx Expired', 'rx expired'), ('Attempting Pregnancy', 'attempting pregnancy'), ('Pregnant', 'pregnant'), ('Nursing', 'nursing'), ('Using Commercial Retinoid', 'commercial retinoid'), ('Dislike Product', 'dislike product'), ('Ineffective', 'ineffective'), ('Causes Irritation', 'causes irritation'), ('Cost', 'cost'), ('Dislike Subscription', 'dislike subscription'), ('Using Other Skincare Products', 'other skincare products'), ('Payment Failure', 'payment failure'), ('Unaware of Subscription', 'unaware subscription'), ('Mistake', 'mistake'), ('Moved', 'moved'), ('Health Issues', 'health issues'), ('Have Not Used', 'have not used'), ('Traveling', 'traveling'), ('Allergic', 'allergic')], default='Not Applicable', max_length=32, verbose_name='Cancellation Reason'),
        ),
    ]
