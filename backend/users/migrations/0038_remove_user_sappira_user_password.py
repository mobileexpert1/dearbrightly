# Generated by Django 2.0.5 on 2020-02-05 06:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0037_auto_20200204_1017'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='sappira_user_password',
        ),
    ]
