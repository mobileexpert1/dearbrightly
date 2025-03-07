# Generated by Django 2.0.5 on 2020-03-27 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0049_auto_20200325_2200'),
    ]

    operations = [
        migrations.AddField(
            model_name='visit',
            name='skin_profile_status',
            field=models.CharField(choices=[('Not Started', 'not started'), ('Pending Questionnaire', 'pending questionnaire'), ('Pending Photos', 'pending photos'), ('Complete', 'complete'), ('No Changes User Specified', 'no changes user specified'), ('No Changes No User Response', 'no changes no user response')], default='Not Started', max_length=32, verbose_name='Skin Profile Status'),
        ),
        migrations.AlterField(
            model_name='visit',
            name='status',
            field=models.CharField(choices=[('Pending', 'pending'), ('Skin Profile Pending', 'skin profile pending'), ('Skin Profile Complete', 'skin profile complete'), ('Provider Pending Action', 'provider pending'), ('Pending Prescription', 'pending prescription'), ('Provider Awaiting User Input', 'provider awaiting user input'), ('Provider Signed', 'provider signed'), ('Provider Rx Submitted', 'provider rx submitted'), ('Provider Rx Denied', 'provider rx denied'), ('Provider Cancelled', 'provider cancelled')], default='Pending', max_length=32, verbose_name='Medical visit status'),
        ),
    ]
