# Generated by Django 2.0.5 on 2020-03-25 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0048_questionids_changes_to_skin_question_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='visit',
            name='status',
            field=models.CharField(choices=[('Pending', 'pending'), ('Eligibility Verified', 'eligibility verified'), ('Ineligible', 'ineligible'), ('Consent Accepted', 'consent accepted'), ('Questionnaire Completed', 'questionnaire completed'), ('Photos Uploaded', 'photos uploaded'), ('Skin Profile Completed', 'skin profile completed'), ('Provider Pending Action', 'provider pending'), ('Pending Prescription', 'pending prescription'), ('Provider Awaiting User Input', 'provider awaiting user input'), ('Provider Signed', 'provider signed'), ('Provider Rx Submitted', 'provider rx submitted'), ('Provider Rx Denied', 'provider rx denied'), ('Provider Cancelled', 'provider cancelled'), ('No Changes User Specified', 'no changes user specified'), ('No Changes No User Response', 'no changes no user response')], default='Pending', max_length=32, verbose_name='Medical visit status'),
        ),
    ]
