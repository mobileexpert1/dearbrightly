# Generated by Django 2.0.5 on 2018-08-28 07:14

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_auto_20180825_1821'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
