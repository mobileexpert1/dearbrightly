# Generated by Django 2.0.5 on 2020-12-15 17:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0027_remove_product_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='product_type',
            field=models.CharField(choices=[('Rx', 'rx'), ('OTC', 'otc')], default='Rx', max_length=32, verbose_name='Type'),
        ),
    ]
