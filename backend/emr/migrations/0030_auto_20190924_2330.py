# Generated by Django 2.0.5 on 2019-09-24 23:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0029_auto_20190909_2359'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patientprescription',
            name='status',
            field=models.CharField(choices=[('Initiated', 'initiated'), ('eRxSent', 'erx sent'), ('Deleted', 'deleted'), ('Error', 'error'), ('Edited', 'edited')], default='Initiated', max_length=32, verbose_name='Patient prescription status'),
        ),
    ]
