# Generated by Django 2.0.5 on 2019-08-07 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0023_auto_20190805_0855'),
    ]

    operations = [
        migrations.AlterField(
            model_name='visit',
            name='last_modified_datetime',
            field=models.DateTimeField(null=True),
        ),
    ]
