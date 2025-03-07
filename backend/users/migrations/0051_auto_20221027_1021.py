# Generated by Django 2.0.5 on 2022-10-27 10:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0050_user_allow_sending_user_info_to_advertisers'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='allow_sending_user_info_to_advertisers',
            field=models.BooleanField(default=False, verbose_name='Allow sending hashed user info to third-party advertisers per our updated Privacy Policy'),
        ),
    ]
