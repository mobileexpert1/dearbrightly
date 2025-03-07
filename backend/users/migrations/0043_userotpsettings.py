# Generated by Django 2.0.5 on 2020-12-18 01:10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0042_user_otp_required'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserOTPSettings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=16, unique=True, verbose_name='Code used to generate the OTP pass codes')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_otp_settings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
