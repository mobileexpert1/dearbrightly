# Generated by Django 2.0.5 on 2018-08-23 10:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_auto_20180823_0909'),
    ]

    operations = [
        migrations.AddField(
            model_name='address',
            name='first_name',
            field=models.CharField(blank=True, max_length=30, verbose_name='first name'),
        ),
        migrations.AddField(
            model_name='address',
            name='last_name',
            field=models.CharField(blank=True, max_length=30, verbose_name='last name'),
        ),
    ]
