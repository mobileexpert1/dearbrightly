# Generated by Django 2.0.5 on 2019-10-28 07:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0038_flag'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='flag',
            name='status',
        ),
        migrations.AddField(
            model_name='flag',
            name='category',
            field=models.CharField(choices=[('Medical Admin Attention', 'medical admin attention'), ('Medical Provider Attention', 'medical provider attention'), ('Require Prescription Update', 'require prescription update'), ('Require Patient Photos Update', 'require patient photos update'), ('Patient Photos Updated', 'patient photos updated'), ('Patient Message', 'patient message')], default='Medical Admin Attention', max_length=32, verbose_name='Flag Category'),
        ),
    ]
