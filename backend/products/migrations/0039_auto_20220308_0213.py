# Generated by Django 2.0.5 on 2022-03-08 02:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0038_auto_20220223_1143'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='product_type',
            field=models.CharField(choices=[('None', 'none'), ('Rx', 'rx'), ('OTC', 'otc')], default='Rx', max_length=32, verbose_name='Type'),
        ),
    ]
