# Generated by Django 2.0.5 on 2018-08-23 12:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='type',
            new_name='product_type',
        ),
    ]
