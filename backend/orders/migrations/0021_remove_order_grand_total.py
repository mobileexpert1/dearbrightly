# Generated by Django 2.0.5 on 2018-10-07 23:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0020_auto_20181007_0804'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='grand_total',
        ),
    ]
