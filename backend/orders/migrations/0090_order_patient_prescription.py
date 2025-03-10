# Generated by Django 2.0.5 on 2020-01-05 23:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('emr', '0045_questionids_gender_question_id'),
        ('orders', '0089_remove_order_is_trial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='patient_prescription',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='emr.PatientPrescription'),
        ),
    ]
