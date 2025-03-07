import logging
import uuid
import re
import hashids
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.utils.translation import ugettext_lazy as _
from djchoices import DjangoChoices, ChoiceItem
from localflavor.us.models import USZipCodeField, PhoneNumberField
from django.db.models import Q
from dearbrightly import constants
from dearbrightly.storage_backends import PrivateMediaStorage


logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class ServiceChoices(DjangoChoices):
    initial_visit = ChoiceItem('Initial Visit')
    repeat_visit = ChoiceItem('Repeat Visit')
    short_repeat_visit_female = ChoiceItem('Short Repeat Visit Female')
    short_repeat_visit_male = ChoiceItem('Short Repeat Visit Male')


# Create your models here.
class Visit(models.Model):

    class Status(DjangoChoices):
        pending = ChoiceItem('Pending')
        skin_profile_pending = ChoiceItem('Skin Profile Pending')
        skin_profile_complete = ChoiceItem('Skin Profile Complete')
        provider_pending = ChoiceItem('Provider Pending Action')  # Task completed / Ready to process
        pending_prescription = ChoiceItem('Pending Prescription')
        provider_awaiting_user_input = ChoiceItem('Provider Awaiting User Input')  # Awaiting new photos
        provider_signed = ChoiceItem('Provider Signed')
        provider_rx_submitted = ChoiceItem('Provider Rx Submitted')
        provider_rx_denied = ChoiceItem('Provider Rx Denied')
        provider_cancelled = ChoiceItem('Provider Cancelled') # TODO - Change spelling to American style, with one l (also remove provider_)

    class SkinProfileStatus(DjangoChoices):
        not_started = ChoiceItem('Not Started')
        pending_questionnaire = ChoiceItem('Pending Questionnaire')
        pending_photos = ChoiceItem('Pending Photos')
        complete = ChoiceItem('Complete')
        no_changes_user_specified = ChoiceItem('No Changes User Specified')
        no_changes_no_user_response = ChoiceItem('No Changes No User Response')
        incomplete_user_response = ChoiceItem('Incomplete User Response')

    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    # Patients will have `patient_visits`.
    patient = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='patient_visits', null=True)
    # Providers will have `provider_visits`.
    # TODO: Add additional validation here so that a patient cannot be assigned as a provider (and vice versa).
    # When a `Visit` is initially created, the doctor is not assigned to it. Once they decide to start working on it,
    # then there's a specific provider attached to the visit.
    medical_provider = models.ForeignKey('users.MedicalProviderUser', on_delete=models.PROTECT,
                                         related_name='medical_provider_visits', null=True)

    status = models.CharField(_('Medical visit status'), max_length=32, default=Status.pending, choices=Status.choices)
    skin_profile_status = models.CharField(_('Skin Profile Status'), max_length=32, default=SkinProfileStatus.not_started, choices=SkinProfileStatus.choices)
    service = models.CharField(max_length=32, choices=ServiceChoices.choices, default=ServiceChoices.initial_visit)
    questionnaire = models.ForeignKey('emr.Questionnaire', on_delete=models.PROTECT, null=True)
    questionnaire_answers = models.ForeignKey('emr.QuestionnaireAnswers', on_delete=models.PROTECT, null=True)
    consent_to_telehealth = models.BooleanField(default=False)
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    rx_prescribed_message_sent = models.BooleanField(default=False)
    medical_visit_fee_transfer_id = models.CharField(_('Stripe Transfer ID for the medical visit fee'), max_length=64, blank=True, null=True)
    platform_service_fee_transfer_id = models.CharField(_('Stripe Transfer ID for the Dear Brightly platform service fee'),
                                                                            max_length=64, blank=True, null=True)
    notes = models.CharField(_('Admin notes'), max_length=128, blank=True)

    __original_skin_profile_status = None
    __original_status = None

    def __init__(self, *args, **kwargs):
        super(Visit, self).__init__(*args, **kwargs)
        self.__original_skin_profile_status = self.skin_profile_status
        self.__original_status = self.status

    def get_photo_types(self):
        photo_types = set()
        for choice in Photo.PhotoType.choices:
            photo_types.add(choice[0])
        has_photo_id = self.patient.photos.filter(photo_type=Photo.PhotoType.photo_id)
        if 'repeat' in self.service.lower() and has_photo_id:
            photo_types.remove('Photo ID')
        #logger.debug(f'[get_photo_types] photo_types: {photo_types}')
        return photo_types

    def get_photo_uploaded_types(self):
        photos_uploaded_types = set(self.photos.filter(photo_rejected=False).values_list('photo_type', flat=True).distinct())
        #logger.debug(f'[get_photo_uploaded_types] visit_photos_uploaded_types: {photos_uploaded_types}.')
        return photos_uploaded_types

    def get_visit_statuses(self):
        visit_statuses = set()
        for choice in Visit.Status.choices:
            visit_statuses.add(choice[0])
        #logger.debug(f'[get_visit_statuses] visit statuses: {visit_statuses}')
        return visit_statuses

    def get_latest_trial_prescription(self):
        latest_trial_prescription = None
        prescriptions = self.prescriptions.filter(
            (Q(status=PatientPrescription.Status.erx_sent) |
             Q(status=PatientPrescription.Status.edited) |
             Q(status=PatientPrescription.Status.pharmacy_verified))
            & Q(prescription__refills=0) & Q(prescription__quantity__lte=15))
        if prescriptions:
            latest_trial_prescription = prescriptions.latest('prescribed_datetime')
        logger.debug(f'[Visit][get_latest_trial_prescription] All prescriptions: {self.prescriptions.all()}. '
                     f'Prescription: {latest_trial_prescription}')
        return latest_trial_prescription

    def get_latest_refill_prescription(self):
        latest_refill_prescription = None
        prescriptions = self.prescriptions.filter(
            (Q(status=PatientPrescription.Status.erx_sent) |
             Q(status=PatientPrescription.Status.edited) |
             Q(status=PatientPrescription.Status.pharmacy_verified)) &
            Q(prescription__refills__gt=0) &
            Q(prescription__quantity__gt=15))
        if prescriptions:
            latest_refill_prescription = prescriptions.latest('prescribed_datetime')
        logger.debug(f'[Visit][get_latest_refill_prescription] Prescription: {latest_refill_prescription}')
        return latest_refill_prescription

    def get_latest_refill_prescription_containing_base(self, base):
        latest_refill_prescription = None
        prescriptions = self.prescriptions.filter(
            (Q(status=PatientPrescription.Status.erx_sent) |
             Q(status=PatientPrescription.Status.edited) |
             Q(status=PatientPrescription.Status.pharmacy_verified)) &
            Q(prescription__refills__gt=0) &
            Q(prescription__quantity__gt=15) &
            Q(prescription__exact_name__icontains=base))
        if prescriptions:
            latest_refill_prescription = prescriptions.latest('prescribed_datetime')
        logger.debug(f'[Visit][get_latest_refill_prescription_containing_base] Prescription: {latest_refill_prescription}')
        return latest_refill_prescription

    def get_pending_order(self):
        from orders.models import Order

        pending_visit_orders = self.orders.filter(
            ~Q(status=Order.Status.shipped) &
            ~Q(status=Order.Status.awaiting_fulfillment) &
            ~Q(status=Order.Status.cancelled) &
            ~Q(status=Order.Status.refunded))

        pending_visit_order = pending_visit_orders.latest('created_datetime') if pending_visit_orders else None
        return pending_visit_order

    def get_original_skin_profile_status(self):
        return self.__original_skin_profile_status

    def get_original_status(self):
        return self.__original_status

    def expire_before_date(self, date=timezone.now()):
        logger.debug(f'[visit][expire_before_date] visit: {self.id}. expire before date: {date}.')
        delta = date - self.created_datetime
        if delta < timedelta(days=365):
            return False
        return True

    @property
    def is_all_photos_uploaded(self):
        photo_types_set = set(self.get_photo_types())
        photo_upload_types_set = set(self.get_photo_uploaded_types())
        all_photos_uploaded = photo_types_set.issubset(photo_upload_types_set)
        #logger.debug(f'[is_all_photos_uploaded] all_photos_uploaded: {all_photos_uploaded}.')
        return all_photos_uploaded

    @property
    def is_expired(self):
        is_expired = True
        if timezone.now() - self.created_datetime < timedelta(days=365):
            is_expired = False
        #logger.debug(f'[is_expired] visit: {self.id}. is_expired: {is_expired}.')
        return is_expired

    @property
    def is_paid(self):
        # TODO (Alda) - Capture the visit payment; create a field in the visit to track if the visit has been paid?
        visit_orders = self.orders.all().filter(payment_captured_datetime__isnull=False)
        # logger.debug(f'[is_paid] visit_orders: {visit_orders}.')
        return len(visit_orders) > 0

    @property
    def is_yearly_visit(self):
        return "repeat" in self.service.lower()

    @property
    def is_initial_visit(self):
        return "initial" in self.service.lower()

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        from users.models import User

        logger.debug(f'[visit save] Saving visit {self.pk}. update_fields: {update_fields}.')
        if not self.pk:
            # TODO (Alda) - revisit logic when there are more visit types
            service_code = ServiceChoices.initial_visit

            # check if the patient has a previous visit
            latest_medical_visit_in_progress = self.patient.get_latest_medical_visit_in_progress()
            latest_medical_visit_completed = self.patient.get_latest_medical_visit_completed()
            if latest_medical_visit_in_progress or latest_medical_visit_completed:
                if self.patient.gender == User.Gender.male:
                    service_code = ServiceChoices.short_repeat_visit_male
                else:
                    service_code = ServiceChoices.short_repeat_visit_female
            self.service = service_code

            # Get most recent visit questionnaire with service code
            questionnaires_with_service_code = Questionnaire.objects.filter(service=service_code)
            if questionnaires_with_service_code:
                questionnaire = questionnaires_with_service_code.latest('created_datetime')
            else:
                raise ValidationError('Unable to retrieve questionnaire for visit.')
            self.questionnaire = questionnaire

            self.medical_provider = self.patient.medical_provider

        # don't overwrite status updates
        update_status_field = 'status' in update_fields if update_fields else False

        if not update_status_field:
            updated_status = self._get_visit_status_based_on_skin_profile_status(self.skin_profile_status, self)
            if updated_status:
                self.status = updated_status
                logger.debug(f'[visit save] '
                             f'original_skin_profile_status: {self.__original_skin_profile_status}. '
                             f'skin_profile_status: {self.skin_profile_status}. '
                             f'original_status: {self.__original_status}. '
                             f'updated_status: {updated_status}')

        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)

        self.__original_skin_profile_status = self.skin_profile_status
        self.__original_status = self.status


    def _get_visit_status_based_on_skin_profile_status(self, skin_profile_status, instance=None):
        updated_status = None

        if skin_profile_status == Visit.SkinProfileStatus.not_started:
            updated_status = Visit.Status.pending
        elif skin_profile_status == Visit.SkinProfileStatus.pending_questionnaire:
            updated_status = Visit.Status.skin_profile_pending
        elif skin_profile_status == Visit.SkinProfileStatus.pending_photos:
            updated_status = Visit.Status.skin_profile_pending
        elif skin_profile_status == Visit.SkinProfileStatus.complete or \
                instance.skin_profile_status == Visit.SkinProfileStatus.no_changes_user_specified or \
                instance.skin_profile_status == Visit.SkinProfileStatus.no_changes_no_user_response or \
                instance.skin_profile_status == Visit.SkinProfileStatus.incomplete_user_response:
            updated_status = Visit.Status.skin_profile_complete
            if instance.status == Visit.Status.provider_pending or \
                    instance.status == Visit.Status.skin_profile_complete and instance.is_paid or \
                    instance.status == Visit.Status.provider_awaiting_user_input and instance.is_paid:
                updated_status = Visit.Status.provider_pending

        return updated_status


class QuestionIds(models.Model):
    # Question ID numbers of specific types of questions
    gender_question_id = models.PositiveIntegerField(null=True, blank=True)
    allergies_question_id = models.PositiveIntegerField(null=True, blank=True)
    medication_question_id = models.PositiveIntegerField(null=True, blank=True)
    skincare_medication_question_id = models.PositiveIntegerField(null=True, blank=True)
    prescription_skincare_topicals_question_id = models.PositiveIntegerField(null=True, blank=True)
    skin_type_question_id = models.PositiveIntegerField(null=True, blank=True)
    how_did_you_hear_about_us_question_id = models.PositiveIntegerField(null=True, blank=True)
    skincare_concerns_question_id = models.PositiveIntegerField(null=True, blank=True)
    pregnant_or_nursing_question_id = models.PositiveIntegerField(null=True, blank=True)
    skincare_topicals_question_id = models.PositiveIntegerField(null=True, blank=True)
    medical_conditions_question_id = models.PositiveIntegerField(null=True, blank=True)
    additional_info_for_doctor_question_id = models.PositiveIntegerField(null=True, blank=True)
    changes_to_skin_question_id = models.PositiveIntegerField(null=True, blank=True)
    influencer_question_id = models.PositiveIntegerField(null=True, blank=True)

class Questionnaire(models.Model):
    """Set of questions to collect PHI data from users."""

    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    version = models.IntegerField(default=1)
    name = models.CharField(max_length=64)
    description = models.TextField()
    created_datetime = models.DateTimeField(default=timezone.now)
    service = models.CharField(max_length=32, choices=ServiceChoices.choices)

    # lookup table of ID numbers to specific types of questions
    question_ids = models.ForeignKey('emr.QuestionIds', on_delete=models.PROTECT, related_name='question_ids', null=True)

    # This defines what the questions are, how to render them, the type of question, and the children questions.
    # They are asked in order, so you can reference a question by `Questionnaire-ID:index` as `questions` is a list.
    questions = JSONField()

    class Meta:
        # We have to make sure we only ever have 1 questionnaire per service and a version.
        unique_together = [['service', 'version']]

    def add_ids_to_questions(self):
        """Goes through each question and their possible children to provide unique identifiers within the set.

            We create globally unique identiiers by using hashids with the salt being tied to the version
             of the Questionnaire.

            We need to use the version because the PK is not available before we save.
            
            The order of the encoded hashid is as follows:
                (question_index, choice_index, child_index)

            If there are no choices for a question or no children, those values are left off.
        """
        hasher = hashids.Hashids(salt=f'Questionnaire:Version:{self.version}')
        for index, question in enumerate(self.questions):
            question['id'] = hasher.encode(index)
            choices = question.get('choices') or []
            for choice_index, choice in enumerate(choices):
                choice['id'] = hasher.encode(index, choice_index)
                children = choice.get('children') or []
                for child_index, child in enumerate(children):
                    child['id'] = hasher.encode(index, choice_index, child_index)

    def get_question(self, hashid):
        hasher = hashids.Hashids(salt=f'Questionnaire:Version:{self.version}')
        indicies = hasher.decode(hashid)
        if not indicies:
            return None
        if len(indicies) != 1:
            return None
        return self.questions[indicies[0]]

    def get_choice(self, hashid, question):
        hasher = hashids.Hashids(salt=f'Questionnaire:Version:{self.version}')
        indicies = hasher.decode(hashid)
        if not indicies:
            return None
        if len(indicies) != 2:
            return None
        question_index = hasher.decode(question['id'])
        if question_index[0] != indicies[0]:
            return None
        return self.questions[indicies[0]]['choices'][indicies[1]]

    def get_choice_child(self, hashid, question, choice):
        hasher = hashids.Hashids(salt=f'Questionnaire:Version:{self.version}')
        indicies = hasher.decode(hashid)
        if not indicies:
            return None
        if len(indicies) != 3:
            return None
        question_index = hasher.decode(question['id'])
        if question_index[0] != indicies[0]:
            return None
        question_index, choice_index = hasher.decode(choice['id'])
        if question_index != indicies[0]:
            return None
        if choice_index != indicies[1]:
            return None
        return self.questions[indicies[0]]['choices'][indicies[1]]['children'][indicies[2]]

    def get_choice_answer_value(self, question_id, answer_id):
        try:
            question = next(item for item in self.questions if int(item["id"]) == int(question_id))
            choices = question.get('choices')
            try:
                #logger.debug(f'[get_choice_answer_value] question: {question_id}. choices: {choices}. answer_id: {answer_id}.')
                value = next(item for item in choices if int(item["id"]) == int(answer_id))
                return value.get('label')
            except StopIteration:
                logger.error(f'[get_choice_answer_value] {answer_id} not found in {choices}')
            except TypeError:
                return None
        except StopIteration:
            logger.error(f'[get_choice_answer_value] {question_id} not found in {self.questions}')
        return None

    def save(self, **kwargs):
        """A bit of a hack to call clean before we save that way we get the right data ahead pre-save."""
        if self.pk is not None:
            raise ValidationError('Updating a Questionnaire is forbidden.')
        self.clean()
        super().save(**kwargs)

    def clean(self):
        """To have a valid questionnaire, two things must be true:
            1. There must be a `service` provided.
            2. The `version` must be greater than the last version for the service.

            To implement (2), we look at the most recent questionnaire and increment the version by 1.
        """
        if not self.service:
            raise ValidationError(f"Service must be one of: {', '.join([t[0] for t in ServiceChoices.choices])}")

        last_questionnaire = Questionnaire.objects.filter(service=self.service).order_by('-created_datetime').first()
        self.version = getattr(last_questionnaire, 'version', 0) + 1
        self.add_ids_to_questions()


class QuestionnaireAnswers(models.Model):

    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.PROTECT, related_name='questionnaire_answers')
    patient = models.ForeignKey(
        'users.User', on_delete=models.PROTECT, related_name='questionnaire_answers', null=True
    )

    # This will map 1-1 to a Questionnaire's question JSON,
    # i.e. the indices align so you can know the question for the answer.
    answers = JSONField()

    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    sappira_question_id = models.PositiveIntegerField(null=True, blank=True)

    def get_pregnant_nursing_ttc_response(self):
        pregnant_nursing_ttc_question_id = self.questionnaire.question_ids.pregnant_or_nursing_question_id
        return self._get_choices_response(pregnant_nursing_ttc_question_id)

    def get_how_did_you_hear_about_us_response(self):
        how_did_you_hear_about_us_answer_value = None
        how_did_you_hear_about_us_question_id = self.questionnaire.question_ids.how_did_you_hear_about_us_question_id
        try:
            if how_did_you_hear_about_us_question_id:
                how_did_you_hear_about_us_key_value_pair = next(item for item in self.answers if int(item["question_id"]) == how_did_you_hear_about_us_question_id)
                how_did_you_hear_about_us_answer_id = how_did_you_hear_about_us_key_value_pair.get('value')

                # logger.debug(f'[get_how_did_you_hear_about_us_response] '
                #              f'how_did_you_hear_about_us_key_value_pair: {how_did_you_hear_about_us_key_value_pair}. '
                #              f'how_did_you_hear_about_us_answer_id: {how_did_you_hear_about_us_answer_id}')

                if how_did_you_hear_about_us_key_value_pair and how_did_you_hear_about_us_answer_id:
                    how_did_you_hear_about_us_answer_value = self.questionnaire.get_choice_answer_value(
                        how_did_you_hear_about_us_question_id,
                        how_did_you_hear_about_us_answer_id)
                    logger.debug(f'[get_how_did_you_hear_about_us_response] {how_did_you_hear_about_us_question_id} : '
                                 f'{how_did_you_hear_about_us_answer_value} [{how_did_you_hear_about_us_answer_id}]')
        except StopIteration:
            logger.error(f'[get_how_did_you_hear_about_us_response] {how_did_you_hear_about_us_question_id} not found in {self.answers}')

        return how_did_you_hear_about_us_answer_value

    def get_gender_response(self):
        gender_question_id = self.questionnaire.question_ids.gender_question_id
        return self._get_choices_response(gender_question_id)

    def get_changes_to_skin_response(self):
        changes_to_skin_question_id = self.questionnaire.question_ids.changes_to_skin_question_id
        changes_to_skin_label = self._get_choices_response(changes_to_skin_question_id)
        changes_to_skin = True if changes_to_skin_label == 'yes' else False
        return changes_to_skin

    def get_allergies_response(self):
        allergies_question_id = self.questionnaire.question_ids.allergies_question_id
        return self._get_value_response(allergies_question_id)

    def get_medication_response(self):
        medication_question_id = self.questionnaire.question_ids.medication_question_id
        return self._get_value_response(medication_question_id)

    def get_skincare_medication_response(self):
        skincare_medication_question_id = self.questionnaire.question_ids.skincare_medication_question_id
        return self._get_value_response(skincare_medication_question_id)

    def get_influencer_response(self):
        influencer_question_id = self.questionnaire.question_ids.influencer_question_id
        return self._get_value_response(influencer_question_id)

    def _get_value_response(self, question_id):
        if not question_id:
            logger.error(f'[QuestionnaireAnswers][_get_value_response] Question id paramater missing.')
            return

        answer_value = None
        try:
            question_key_value_pair = next(item for item in self.answers if int(item["question_id"]) == question_id)
            answer_value = question_key_value_pair.get('value')
            if answer_value:
                answer_value = answer_value.replace('\n', ' ').replace('\r', '').strip()
                logger.debug(f'[QuestionnaireAnswers][_get_value_response] question_id: {question_id}. '
                             f'question_key_value_pair: {question_key_value_pair}. answer_value: {answer_value}')
        except StopIteration:
            logger.error(f'[QuestionnaireAnswers][_get_value_response] {question_id} not found in {self.answers}')
        return answer_value
    
    def _get_choices_response(self, question_id):
        if not question_id:
            logger.error(f'[QuestionnaireAnswers][_get_choices_response] Question id paramater missing.')
            return

        answer = None
        try:
            key_value_pair = next(item for item in self.answers if int(item["question_id"]) == question_id)
            answer_choice_value = key_value_pair.get('value') if key_value_pair.get('value') else None
            question = next(item for item in self.questionnaire.questions if int(item["id"]) == question_id)
            question_choices = question.get('choices', None)
            answer_choice_item = next(item for item in question_choices if int(item["id"]) == (answer_choice_value and int(answer_choice_value)))
            answer = answer_choice_item.get('label', None).lower()
            logger.debug(f'[QuestionnaireAnswers][_get_choices_response] question_id: {question_id}. key_value_pair: {key_value_pair}. answer: {answer}')
        except StopIteration:
            logger.error(f'[QuestionnaireAnswers][_get_choices_response] Question not found in {self.answers}')
        return answer


class Pharmacy(models.Model):
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=64)
    store_name = models.CharField(max_length=64)
    address_line1 = models.CharField(_('Address Line 1'), max_length=128, blank=True, null=True)
    address_line2 = models.CharField(_('Address Line 2'), max_length=128, blank=True, null=True)
    city = models.CharField(_('City'), max_length=64, blank=True, null=True)
    state = models.CharField(choices=constants.STATE_CHOICES, max_length=128, null=True)
    postal_code = USZipCodeField(blank=True, null=True)
    primary_phone = PhoneNumberField(blank=True, null=True)
    primary_fax = PhoneNumberField(blank=True, null=True)
    npi = models.PositiveIntegerField(null=True)
    dosespot_id = models.BigIntegerField(null=True)

class Prescription(models.Model):
    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)

    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='prescriptions', null=True)

    display_name = models.CharField(_('Display Name'), max_length=128, blank=True, null=True)
    exact_name = models.CharField(_('Exact Name'), max_length=128, blank=True, null=True)

    prescription_type = models.TextField(null=True)

    # This is a RxNorm concept unique identifier.
    rxcui = models.CharField(max_length=128)
    days_supply = models.IntegerField()
    refills = models.IntegerField()
    quantity = models.IntegerField()
    directions = models.TextField()
    pharmacy_notes = models.TextField()
    dosespot_id = models.BigIntegerField(null=True)

    # Hard-coding these for now as Lydia says that we only use
    # these values.
    @property
    def dispense_unit(self):
        return _('Grams')

    @property
    def resource_type(self):
        return _('Free Text')

    @property
    def prescription_type(self):
        return _('Compound')


class PatientPrescription(models.Model):
    """Tracks which patients are prescribed which medications by provider."""

    class Status(DjangoChoices):
        initiated = ChoiceItem('Initiated')
        erx_sent = ChoiceItem('eRxSent')
        deleted = ChoiceItem('Deleted')
        error = ChoiceItem('Error')
        edited = ChoiceItem('Edited')
        disable = ChoiceItem('Disable')     # disable using rx per customer request
        pharmacy_verified = ChoiceItem('PharmacyVerified')

    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    prescription = models.ForeignKey(Prescription, on_delete=models.PROTECT)
    patient = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='prescriptions')
    medical_provider = models.ForeignKey('users.MedicalProviderUser', on_delete=models.PROTECT,
                                         related_name='medical_provider_prescriptions', null=True)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.PROTECT, related_name='prescriptions')
    visit = models.ForeignKey(Visit, on_delete=models.PROTECT, related_name='prescriptions')
    prescribed_datetime = models.DateTimeField(default=timezone.now)
    dosespot_id = models.BigIntegerField(null=True)
    status = models.CharField(
        _('Patient prescription status'), max_length=32, default=Status.initiated, choices=Status.choices
    )
    pharmacy_notes = models.CharField(_('Pharmacy Notes'), max_length=210, blank=True, null=True)

    def __str__(self):
        return f'{self.uuid}, {self.id}, {self.dosespot_id}, {self.prescription.exact_name}, ' \
            f'{self.patient.id}, {self.medical_provider.id}, {self.pharmacy.id}, {self.visit.id}, ' \
            f'{self.prescribed_datetime}, {self.pharmacy_notes}'

    @property
    def is_expired(self):
        if timezone.now() - self.prescribed_datetime < timedelta(days=365):
            return False
        return True

    def expire_before_date(self, date=timezone.now()):
        delta = date - self.prescribed_datetime
        if delta < timedelta(days=365):
            return False
        return True

    def get_tretinoin_strength(self):
        # example: Tretinoin 0.015%/Hyaluronic Acid 0.5% in Pracasil
        tretinoin_strength_search = re.search('Tretinoin (.*)%/', self.prescription.exact_name, re.IGNORECASE)
        if tretinoin_strength_search:
            tretinoin_strength = tretinoin_strength_search.group(1)
            if tretinoin_strength:
                return tretinoin_strength.strip()
        return None

    def contains_ingredient(self, ingredient: str):
        try:
            if ingredient and self.prescription and self.prescription.exact_name:
                if ingredient.lower() in self.prescription.exact_name.lower():
                    return True
        except AttributeError:
            return False
        return False

# TODO (Alda) - Rename to MedicalNote?
class Note(models.Model):
    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    patient = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='medical_notes', null=True)
    creator = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='+', null=False)
    body = models.TextField(blank=True, null=True)


class ChatMessage(models.Model):
    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4, editable=False)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    body = models.TextField()

    sender = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='chat_messages_sent', null=True)
    receiver = models.ForeignKey(
        'users.User', on_delete=models.PROTECT, related_name='chat_messages_received', null=True
    )

    # When was this message read by the receiver?
    read_datetime = models.DateTimeField(null=True)


class Photo(models.Model):
    uuid = models.UUIDField(blank=False, unique=True, default=uuid.uuid4)
    patient = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='photos', null=True)
    visit = models.ForeignKey('emr.Visit', on_delete=models.PROTECT, related_name='photos', null=True)
    sappira_id = models.PositiveIntegerField(null=True, blank=True)

    photo_file = models.FileField(storage=PrivateMediaStorage())

    class PhotoType(DjangoChoices):
        front_face = ChoiceItem('Front of face')
        right_face = ChoiceItem('Right side of face')
        left_face = ChoiceItem('Left side of face')
        photo_id = ChoiceItem('Photo ID')

    photo_type = models.CharField(
        _('Photo type'), max_length=32, default=PhotoType.front_face, choices=PhotoType.choices
    )
    photo_rejected = models.BooleanField(null=False, default=False)

    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    def get_s3_file_name(self, format):
        return f'{self.uuid}.{format}'

class Snippet(models.Model):
    """Saved replies for Notes and Chat Messages."""

    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=128, unique=True)
    body = models.TextField()

class Flag(models.Model):
    class Category(DjangoChoices):
        medical_admin_attention = ChoiceItem('Medical Admin Attention')
        medical_provider_attention = ChoiceItem('Medical Provider Attention')
        require_prescription_update = ChoiceItem('Require Prescription Update')
        require_patient_photos_update = ChoiceItem('Require Patient Photos Update')
        patient_photos_updated = ChoiceItem('Patient Photos Updated')
        require_medical_admin_update = ChoiceItem('Require Medical Admin Update')
        patient_message = ChoiceItem('Patient Message')

    created_datetime = models.DateTimeField(default=timezone.now)
    acknowledged_datetime = models.DateTimeField(null=True)
    creator = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='flags', null=False)
    visit = models.ForeignKey('emr.Visit', on_delete=models.PROTECT, related_name='flags', null=True)
    category = models.CharField(
        _('Flag Category'), max_length=32, default=Category.medical_admin_attention, choices=Category.choices
    )
    body = models.TextField()

