# Generated by Django 2.0.5 on 2020-03-04 01:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sharing', '0005_auto_20200227_0206'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sharing',
            name='code',
        ),
    ]
