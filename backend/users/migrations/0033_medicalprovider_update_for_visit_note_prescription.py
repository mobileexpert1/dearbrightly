from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db import migrations, models, transaction
from django.db.models import Q
from django.conf import settings
import logging
logger = logging.getLogger(__name__)


def update_visits_medical_provider(apps, schema_editor):
    Visit = apps.get_model('emr', 'Visit')
    MedicalProviderUser = apps.get_model('users', 'MedicalProviderUser')
    for visit in Visit.objects.all():
        if not visit.medical_provider and visit.provider:
            try:
                visit.medical_provider = MedicalProviderUser.objects.get(id=visit.provider.id)
                visit.save()
            except MedicalProviderUser.DoesNotExist:
                logger.debug(f'[update_visits_medical_provider] Medical provider {visit.provider.email} '
                       f'does not exist for visit {visit.id}')
                return

def update_patient_prescription_medical_provider(apps, schema_editor):
    PatientPrescription = apps.get_model('emr', 'PatientPrescription')
    MedicalProviderUser = apps.get_model('users', 'MedicalProviderUser')
    for patient_prescription in PatientPrescription.objects.all():
        if not patient_prescription.medical_provider and patient_prescription.provider:
            try:
                patient_prescription.medical_provider = MedicalProviderUser.objects.get(id=patient_prescription.provider.id)
                patient_prescription.save()
            except MedicalProviderUser.DoesNotExist:
                logger.debug(f'[update_patient_prescription_medical_provider] Medical provider {patient_prescription.provider.email} '
                       f'does not exist for prescription {patient_prescription.id}')
                return


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0032_medicalprovideruser'),
        ('emr', '0042_auto_20191229_1048')
    ]

    operations = [
        migrations.RunPython(update_visits_medical_provider),
        migrations.RunPython(update_patient_prescription_medical_provider),
    ]