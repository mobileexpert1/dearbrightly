# Generated by Django 2.0.5 on 2021-07-02 19:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0048_auto_20210125_2135'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='chart_mogul_user_uuid',
        ),
    ]
