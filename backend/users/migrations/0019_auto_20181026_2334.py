# Generated by Django 2.0.5 on 2018-10-26 23:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_auto_20181026_2248'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='address_line1',
        ),
        migrations.RemoveField(
            model_name='user',
            name='address_line2',
        ),
        migrations.RemoveField(
            model_name='user',
            name='city',
        ),
        migrations.RemoveField(
            model_name='user',
            name='company',
        ),
        migrations.RemoveField(
            model_name='user',
            name='country',
        ),
        migrations.RemoveField(
            model_name='user',
            name='phone',
        ),
        migrations.RemoveField(
            model_name='user',
            name='postal_code',
        ),
        migrations.RemoveField(
            model_name='user',
            name='state',
        ),
    ]
