# Generated by Django 2.0.5 on 2020-01-02 00:39

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0043_auto_20191230_0108'),
    ]

    operations = [
        migrations.RenameField(
            model_name='note',
            old_name='provider',
            new_name='creator',
        )
    ]
