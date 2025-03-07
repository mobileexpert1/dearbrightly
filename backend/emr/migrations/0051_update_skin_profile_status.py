from django.db import migrations, models, transaction
from django.db.models import Q
from django.conf import settings
import logging
from djchoices import DjangoChoices, ChoiceItem

logger = logging.getLogger(__name__)


class PhotoType(DjangoChoices):
    front_face = ChoiceItem('Front of face')
    right_face = ChoiceItem('Right side of face')
    left_face = ChoiceItem('Left side of face')
    photo_id = ChoiceItem('Government-issued ID')

class SkinProfileStatus(DjangoChoices):
    not_started = ChoiceItem('Not Started')
    pending_questionnaire = ChoiceItem('Pending Questionnaire')
    pending_photos = ChoiceItem('Pending Photos')
    complete = ChoiceItem('Complete')
    no_changes_user_specified = ChoiceItem('No Changes User Specified')
    no_changes_no_user_response = ChoiceItem('No Changes No User Response')

def get_photo_types(apps):
    photo_types = set()
    for choice in PhotoType.choices:
        photo_types.add(choice[0])
    # logger.debug(f'[get_photo_types] photo_types: {photo_types}')
    return photo_types

def get_photo_uploaded_types(apps, visit):
    photos_uploaded_types = set(visit.photos.filter(photo_rejected=False).values_list('photo_type', flat=True).distinct())
    #logger.debug(f'[get_photo_uploaded_types] visit_photos_uploaded_types: {photos_uploaded_types}.')
    return photos_uploaded_types

def is_all_photos_uploaded(apps, visit):
    all_photos_uploaded = get_photo_types(apps) == get_photo_uploaded_types(apps, visit)
    # logger.debug(f'[is_all_photos_uploaded] all_photos_uploaded: {all_photos_uploaded}.')
    return all_photos_uploaded

# update skin profile status
def update_skin_profile_status(apps, schema_editor):
    Visit = apps.get_model('emr', 'Visit')
    for visit in Visit.objects.all():
        if visit.consent_to_telehealth == False:
            visit.skin_profile_status = SkinProfileStatus.not_started
        elif not visit.questionnaire_answers:
            visit.skin_profile_status = SkinProfileStatus.pending_questionnaire
        elif not is_all_photos_uploaded(apps, visit):
            visit.skin_profile_status = SkinProfileStatus.pending_photos
        else:
            visit.skin_profile_status = SkinProfileStatus.complete
        visit.save()


class Migration(migrations.Migration):
    logger.setLevel(logging.INFO)
    settings.LOGGING['loggers']['django'] = {'level': 'INFO', 'handlers': ['console']}

    dependencies = [
        ('emr', '0050_auto_20200327_0605'),
    ]

    operations = [
        migrations.RunPython(update_skin_profile_status, reverse_code=migrations.RunPython.noop),
    ]


