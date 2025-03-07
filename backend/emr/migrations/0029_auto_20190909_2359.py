# Generated by Django 2.0.5 on 2019-09-09 23:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0028_auto_20190819_1201'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pharmacy',
            name='dosespot_id',
        ),
        migrations.AddField(
            model_name='pharmacy',
            name='npi',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
