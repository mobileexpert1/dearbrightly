# Generated by Django 2.0.5 on 2021-07-02 02:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0105_auto_20210424_0733'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='shipped_datetime',
            field=models.DateTimeField(null=True),
        ),
    ]
