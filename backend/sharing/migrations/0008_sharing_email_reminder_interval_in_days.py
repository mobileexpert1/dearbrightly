# Generated by Django 2.0.5 on 2020-03-06 05:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sharing', '0007_auto_20200305_0239'),
    ]

    operations = [
        migrations.AddField(
            model_name='sharing',
            name='email_reminder_interval_in_days',
            field=models.IntegerField(default=0, verbose_name='email reminder interval in days'),
        ),
    ]
