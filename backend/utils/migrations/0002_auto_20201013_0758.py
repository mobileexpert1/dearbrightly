# Generated by Django 2.0.5 on 2020-10-13 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('utils', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='log',
            name='fields',
            field=models.CharField(max_length=512),
        ),
    ]
