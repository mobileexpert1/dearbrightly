# Generated by Django 2.0.5 on 2019-08-05 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0022_patientprescription_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='patientprescription',
            name='pharmacy_notes',
            field=models.CharField(blank=True, max_length=210, null=True, verbose_name='Pharmacy Notes'),
        ),
        migrations.AddField(
            model_name='pharmacy',
            name='dosespot_id',
            field=models.BigIntegerField(null=True),
        ),
    ]
