# Generated by Django 2.0.5 on 2018-10-24 07:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0038_remove_order_is_refill'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='questionnaire_type',
        ),
    ]
