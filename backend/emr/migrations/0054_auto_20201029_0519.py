# Generated by Django 2.0.5 on 2020-10-29 05:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0053_auto_20201013_0758'),
    ]

    operations = [
        migrations.AlterField(
            model_name='visit',
            name='skin_profile_status',
            field=models.CharField(choices=[('Not Started', 'not started'), ('Pending Questionnaire', 'pending questionnaire'), ('Pending Photos', 'pending photos'), ('Complete', 'complete'), ('No Changes User Specified', 'no changes user specified'), ('No Changes No User Response', 'no changes no user response'), ('Incomplete User Response', 'incomplete user response')], default='Not Started', max_length=32, verbose_name='Skin Profile Status'),
        ),
    ]
