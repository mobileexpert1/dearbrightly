# Generated by Django 2.0.5 on 2019-05-24 12:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0006_plan_product'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plan',
            name='interval',
        ),
        migrations.AddField(
            model_name='plan',
            name='frequency',
            field=models.IntegerField(default=0, verbose_name='Frequency in months'),
        ),
    ]
