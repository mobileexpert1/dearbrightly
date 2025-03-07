import logging
from collections import OrderedDict
import re
from rest_framework import serializers
from rest_framework.fields import SkipField
from rest_framework.relations import PKOnlyObject
from dearbrightly.constants import DEFAULT_PHARMACY_DOSESPOT_ID
from django.db.models import Q

from emr.models import (
    ChatMessage,
    Pharmacy,
    Photo,
    Prescription,
    PatientPrescription,
    Questionnaire,
    QuestionnaireAnswers,
    Visit,
)
from emr.models import ServiceChoices
from orders.models import Order, OrderProduct
import pytz, datetime
from dateutil.relativedelta import relativedelta
from django.core.exceptions import ValidationError
from users.models import User, MedicalProviderUser

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

# try:
#     import http.client as http_client
# except ImportError:
#     # Python 2
#     import httplib as http_client
# http_client.HTTPConnection.debuglevel = 1

class QuestionnaireAnswersSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionnaireAnswers
        fields = ('uuid', 'patient', 'questionnaire', 'answers')

    # TODO (Alda) - Enable answer validation
    # Strip return or empty strings from the answers (e.g.,{"value": [], "question_id": "1342"})
    def validate_answers(self, answers):
        logger.debug(f'answers: {answers}.')
        #
        # questionnaire_id = self.data.get('questionnaire')
        # if questionnaire_id is None:
        #     raise serializers.ValidationError()
        #
        # questionnaire = Questionnaire.objects.filter(pk=questionnaire_id).first()
        # if questionnaire is None:
        #     raise serializers.ValidationError()
        #
        # # TODO - Update validator
        # questions = questionnaire.questions
        # if len(questions) != len(answers):
        #     raise serializers.ValidationError('Not all questions are answered.')

        # For each answer, we need to assert that it maps to a question and that
        # its associated choice (and optionally children) map to proper choices.
        # for answer in answers:
        # question = questionnaire.get_question(answer['id'])
        # if question is None:
        #     raise serializers.ValidationError()
        # if question['type'] == 'radio' or question['type'] == 'checkbox':
        #     selected_choices = answer.get('choices') or []
        #     if not selected_choices:
        #         raise serializers.ValidationError('A choice must be made.')
        #     if question['type'] == 'radio' and len(selected_choices) != 1:
        #         raise serializers.ValidationError('Only 1 answer can be selected.')
        #
        #     for choice in selected_choices:
        #         stored_choice = questionnaire.get_choice(choice['id'], question)
        #         if stored_choice is None:
        #             raise serializers.ValidationError(f"{choice['id']} is not a valid choice.")
        #         if stored_choice.get('exclusive') is True and len(selected_choices) != 1:
        #             raise serializers.ValidationError('This choice is exclusive!')
        #         stored_children = stored_choice.get('children') or []
        #         provided_children = choice.get('children') or []
        #         if len(stored_children) != len(provided_children):
        #             raise serializers.ValidationError('Please answer all the follow-up questions.')
        #
        #         for child in provided_children:
        #             stored_child = questionnaire.get_choice_child(child['id'], question, choice)
        #             if stored_child is None:
        #                 raise serializers.ValidationError('Not a valid child.')
        #             provided_value = child.get('value')
        #             if provided_value is None:
        #                 raise serializers.ValidationError('Must answer follow-up form.')
        return answers


class QuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = ('id', 'service', 'questions')


class VisitSerializer(serializers.ModelSerializer):
    patient_uuid = serializers.UUIDField(write_only=True, required=False)
    #patient =  UserSerializer(required=False)
    #provider = UserSerializer(required=False)
    questionnaire = QuestionnaireSerializer(required=False)
    questionnaire_answers = QuestionnaireAnswersSerializer(required=False)

    photo_front_face = serializers.SerializerMethodField()
    photo_right_face = serializers.SerializerMethodField()
    photo_left_face = serializers.SerializerMethodField()
    photo_id = serializers.SerializerMethodField()
    completed_questionnaire = serializers.SerializerMethodField()
    completed_questionnaire_answers = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            'completed_questionnaire',
            'completed_questionnaire_answers',
            'consent_to_telehealth',
            'created_datetime',
            'id',
            'is_all_photos_uploaded',
            'patient_uuid',
            'photo_front_face',
            'photo_id',
            'photo_left_face',
            'photo_right_face',
            'medical_provider',
            'questionnaire',
            'questionnaire_answers',
            'service',
            'skin_profile_status',
            'status',
            'uuid',
            'notes'
        ]

    # Not all visits have a completed questionnaire
    # For returning user visits, the same answers are assumed from previously completed questionnaire
    def get_completed_questionnaire(self, instance):
        from emr.serializers import QuestionnaireSerializer

        latest_completed_questionnaire = instance.questionnaire

        if latest_completed_questionnaire:
            return QuestionnaireSerializer(latest_completed_questionnaire).data

        completed_questionnaire_answers = instance.patient.questionnaire_answers.all()
        if len(completed_questionnaire_answers) > 0:
            latest_completed_questionnaire_answer = completed_questionnaire_answers.order_by(
                '-created_datetime').first()
            latest_completed_questionnaire = latest_completed_questionnaire_answer.questionnaire
        return QuestionnaireSerializer(latest_completed_questionnaire).data

    def get_completed_questionnaire_answers(self, instance):
        from emr.serializers import QuestionnaireAnswersSerializer

        latest_completed_questionnaire_answer = instance.questionnaire_answers

        if latest_completed_questionnaire_answer:
            return QuestionnaireAnswersSerializer(latest_completed_questionnaire_answer).data

        completed_questionnaire_answers = instance.patient.questionnaire_answers.all()
        if len(completed_questionnaire_answers) > 0:
            latest_completed_questionnaire_answer = completed_questionnaire_answers.order_by(
            '-created_datetime').first()
        return QuestionnaireAnswersSerializer(latest_completed_questionnaire_answer).data

    def get_photo_front_face(self, instance):
        from emr.serializers import PhotoSerializer
        front_face_photos = instance.photos.filter(photo_type=Photo.PhotoType.front_face)
        if front_face_photos:
            latest_front_face_photo = front_face_photos.latest('created_datetime')
            return PhotoSerializer(latest_front_face_photo).data
        return None

    def get_photo_left_face(self, instance):
        from emr.serializers import PhotoSerializer
        left_face_photos = instance.photos.filter(photo_type=Photo.PhotoType.left_face)
        if left_face_photos:
            latest_left_face_photo = left_face_photos.latest('created_datetime')
            return PhotoSerializer(latest_left_face_photo).data
        return None

    def get_photo_right_face(self, instance):
        from emr.serializers import PhotoSerializer
        right_face_photos = instance.photos.filter(photo_type=Photo.PhotoType.right_face)
        if right_face_photos:
            latest_right_face_photo = right_face_photos.latest('created_datetime')
            return PhotoSerializer(latest_right_face_photo).data
        return None

    def get_photo_id(self, instance):
        from emr.serializers import PhotoSerializer
        id_photos = instance.patient.photos.filter(Q(photo_type=Photo.PhotoType.photo_id))
        if id_photos:
            latest_id_photo = id_photos.latest('created_datetime')
            return PhotoSerializer(latest_id_photo).data
        return None

    def create(self, validated_data, context=None):
        from users.models import User

        patient_uuid = validated_data.pop('patient_uuid') if validated_data.get('patient_uuid') else None
        logger.debug (f'[VisitSerializer][create] Patient: {patient_uuid}. Validated data: {validated_data}')

        try:
            patient = User.objects.get(uuid=patient_uuid)
            visit = Visit.objects.create(patient=patient, **validated_data)
            return visit
        except User.DoesNotExist:
            raise serializers.ValidationError(f'Unable to find user with uuid {patient_uuid}')

    def update(self, instance, validated_data):
        from users.models import User

        # logger.debug(
        #     f"Update visit: {instance.id}. "
        #     f"Validated data: {validated_data}"
        # )

        questionnaire_answers = (
            validated_data.pop('questionnaire_answers') if validated_data.get('questionnaire_answers') else None
        )
        questionnaire_answers['questionnaire'] = instance.questionnaire.pk
        questionnaire_answers['patient'] = instance.patient.pk

        if questionnaire_answers:
            serializer = QuestionnaireAnswersSerializer(data=questionnaire_answers)
            serializer.is_valid(raise_exception=True)
            questionnaire_answers_obj = serializer.save()

            instance.questionnaire_answers = questionnaire_answers_obj

            # update gender
            gender = questionnaire_answers_obj.get_gender_response()
            if gender:
                instance.patient.gender = User.Gender.female if gender == 'female' else User.Gender.male
                instance.patient.save(update_fields=['gender'])
                logger.debug(
                    f'[QuestionnaireAnswers][update] patient: {instance.patient.id}. gender: {gender}.')

            # check if user is pregnant, nursing, or ttc (the user should have been stopped from completing questionnaire)
            is_pregnant_nursing_ttc = False
            if instance.patient.gender == User.Gender.female:
                pregnant_nursing_ttc_answer = questionnaire_answers_obj.get_pregnant_nursing_ttc_response()
                is_pregnant_nursing_ttc = pregnant_nursing_ttc_answer == 'pregnant' or \
                                          pregnant_nursing_ttc_answer == 'nursing' or \
                                          pregnant_nursing_ttc_answer == 'trying to conceive'

            if not is_pregnant_nursing_ttc:
                instance.skin_profile_status = Visit.SkinProfileStatus.pending_photos

                # Yearly visit status have be handled differently as photos are optional and depend on user's response to a question
                if instance.service == ServiceChoices.short_repeat_visit_female or \
                        instance.service == ServiceChoices.short_repeat_visit_male:
                    changes_to_skin = questionnaire_answers_obj.get_changes_to_skin_response()

                    all_photos_uploaded = instance.patient.all_photo_types_uploaded()

                    if changes_to_skin is not None and changes_to_skin == False and all_photos_uploaded:
                        instance.skin_profile_status = Visit.SkinProfileStatus.complete
            instance.save()

        updated_instance = super().update(instance, validated_data)
        #logger.debug(f'[emr serializers] Updated Instance: {updated_instance.__dict__}. Validated data: {validated_data}')
        return updated_instance


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = (
            'id',
            'uuid',
            'photo_type',
            'photo_file',
            'photo_rejected'
        )

class PrescriptionSerializer(serializers.ModelSerializer):
    dispense_unit = serializers.ReadOnlyField()
    resource_type = serializers.ReadOnlyField()
    prescription_type = serializers.ReadOnlyField()

    class Meta:
        model = Prescription
        fields = [
            'uuid',
            'id',
            'created_datetime',
            'last_modified_datetime',
            'display_name',
            'prescription_type',
            'rxcui',
            'days_supply',
            'refills',
            'quantity',
            'directions',
            'pharmacy_notes',
            'dispense_unit',
            'resource_type',
            'prescription_type',
        ]


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = [
            'uuid',
            'id',
            'created_datetime',
            'last_modified_datetime',
            'name',
            'store_name',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'primary_phone',
            'primary_fax',
        ]


class PatientPrescriptionSerializer(serializers.ModelSerializer):
    from users.serializers import UserSerializer, MedicalProviderUserSerializer

    prescription = PrescriptionSerializer(required=True)
    patient = UserSerializer(required=True)
    medical_provider = MedicalProviderUserSerializer(required=True)
    pharmacy = PharmacySerializer(required=True)
    visit = VisitSerializer(required=True)

    class Meta:
        model = PatientPrescription
        fields = [
            'uuid',
            'id',
            'prescribed_datetime',
            'prescription',
            'patient',
            'medical_provider',
            'pharmacy',
            'visit',
            'dosespot_id',
        ]

    # TODO - Update visit status at creation
    # visit.status = Visit.Status.provider_rx_submitted
    # visit.save(update_fields=['status'])
    # def create(self, validated_data, context=None):
    #     return super().create(self, validated_data, context)


class PatientPrescriptionDisplaySerializer(serializers.ModelSerializer):
    exact_name = serializers.SerializerMethodField()
    tretinoin_strength = serializers.SerializerMethodField()
    medical_provider_name = serializers.SerializerMethodField()
    pharmacy_name = serializers.SerializerMethodField()
    directions = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    days_supply = serializers.SerializerMethodField()

    def get_exact_name(self, obj):
        exact_name = obj.prescription.exact_name
        return exact_name

    def get_tretinoin_strength(self, obj):
        return obj.get_tretinoin_strength()

    def get_medical_provider_name(self, obj):
        medical_provider_name = obj.medical_provider.get_full_name()
        return medical_provider_name

    def get_pharmacy_name(self, obj):
        pharmacy_name = obj.pharmacy.name.lower().capitalize()
        return pharmacy_name

    def get_directions(self, obj):
        directions = obj.prescription.directions
        return directions

    def get_quantity(self, obj):
        quantity = obj.prescription.quantity
        return quantity

    def get_days_supply(self, obj):
        days_supply = obj.prescription.days_supply
        return days_supply

    class Meta:
        model = PatientPrescription
        fields = [
            'uuid',
            'id',
            'prescribed_datetime',
            'exact_name',
            'tretinoin_strength',
            'medical_provider_name',
            'pharmacy_name',
            'directions',
            'quantity',
            'days_supply',
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    from users.serializers import UserSerializer

    sender = UserSerializer(required=True)
    receiver = UserSerializer(required=True)

    class Meta:
        model = ChatMessage
        fields = [
            'uuid',
            'id',
            'created_datetime',
            'last_modified_datetime',
            'body',
            'sender',
            'receiver',
            'read_datetime',
        ]

    def create(self, validated_data, context=None):
        logger.debug(f'[ChatMessageSerializer] Chat message created:{validated_data}')
        return super().create(self, validated_data, context)


class DoseSpotPatientSerializer(serializers.ModelSerializer):
    Prefix = serializers.SerializerMethodField()
    FirstName = serializers.ReadOnlyField(source='first_name')
    MiddleName = serializers.SerializerMethodField()
    LastName = serializers.ReadOnlyField(source='last_name')
    Suffix = serializers.SerializerMethodField()
    DateOfBirth = serializers.SerializerMethodField()
    Gender = serializers.SerializerMethodField()
    Email = serializers.SerializerMethodField()
    Address1 = serializers.ReadOnlyField(source='shipping_details.address_line1')
    Address2 = serializers.ReadOnlyField(source='shipping_details.address_line2')
    City = serializers.ReadOnlyField(source='shipping_details.city')
    State = serializers.ReadOnlyField(source='shipping_details.state')
    ZipCode = serializers.ReadOnlyField(source='shipping_details.postal_code')
    PrimaryPhone = serializers.ReadOnlyField(source='shipping_details.phone')
    PrimaryPhoneType = serializers.SerializerMethodField()
    Active = serializers.ReadOnlyField(source='is_active')
    PatientID = serializers.ReadOnlyField(source='dosespot_id')

    def get_Prefix(self, obj):
        return ''

    def get_MiddleName(self, obj):
        return ''

    def get_Suffix(self, obj):
        return ''

    def get_DateOfBirth(self, obj):
        return obj.dob.strftime('%m/%d/%Y')

    def get_Gender(self, obj):
        if obj.gender == User.Gender.male:
            return 'Male'  # 1
        if obj.gender == User.Gender.female:
            return 'Female'  # 2
        return 'Unknown'  # 3

    def get_Email(self, obj):
        # Most test accounts have '+' symbols, so need to handle
        if '+' in obj.email:
            email = re.sub('[+]', '_plus_', obj.email)
            logger.error(f'[DoseSpotPatientSerializer] Invalid email format: {email}')
            return email
        return obj.email

    def get_PrimaryPhoneType(self, obj):
        return getattr(obj, 'PrimaryPhoneType', 'Primary')

    class Meta:
        model = User
        fields = [
            'Prefix',
            'FirstName',
            'MiddleName',
            'LastName',
            'Suffix',
            'DateOfBirth',
            'Gender',
            'Email',
            'Address1',
            'Address2',
            'City',
            'State',
            'ZipCode',
            'PrimaryPhone',
            'PrimaryPhoneType',
            'Active',
            'PatientID',
        ]

    def create(self, validated_data, context=None):
        logger.debug(f'[DoseSpotPatientSerializer] DoseSpot patient created:{validated_data}')
        return super().create(self, validated_data, context)


# class DoseSpotPrescriptionSerializer(serializers.ModelSerializer):
#     DaysSupply = serializers.ReadOnlyField(source='days_supply')
#     Directions = serializers.ReadOnlyField(source='directions')
#     DispenseUnitId = serializers.ReadOnlyField(source='quantity')
#     DisplayName = serializers.ReadOnlyField(source='exact_name')
#     EffectiveDate = serializers.ReadOnlyField(source="created_datetime")
#     NonDoseSpotPrescriptionId = serializers.ReadOnlyField(source='id')
#     Quantity = serializers.ReadOnlyField(source='quantity')
#     Refills = serializers.ReadOnlyField(source='refills')
#     Status = serializers.SerializerMethodField()
#     Type = serializers.SerializerMethodField()
#
#     def get_Status(self, obj):
#         return 1    # Active
#
#     def get_Type(self, obj):
#         return 3    # Compound
#
#     class Meta:
#         model = Prescription
#         fields = ['DaysSupply', 'Directions', 'DispenseUnitId', 'DisplayName', 'EffectiveDate',
#                   'NonDoseSpotPrescriptionId', 'Quantity', 'Refills', 'Status', 'Type']
#
#     def create(self, validated_data, context=None):
#         logger.debug(f'[DoseSpotPrescriptionSerializer] DoseSpot prescription created:{validated_data}')
#         return super().create(self, validated_data, context)


class DoseSpotPrescriptionSerializer(serializers.ModelSerializer):
    dosespot_id = serializers.IntegerField(required=True)
    prescription = serializers.PrimaryKeyRelatedField(read_only=True)
    patient = serializers.PrimaryKeyRelatedField(read_only=True)
    medical_provider = serializers.PrimaryKeyRelatedField(read_only=True)
    pharmacy = serializers.PrimaryKeyRelatedField(read_only=True)
    visit = serializers.PrimaryKeyRelatedField(read_only=True)
    prescribed_datetime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%SZ", read_only=True)
    pharmacy_notes = serializers.CharField(required=False, allow_blank=True, max_length=210)
    status = serializers.CharField(max_length=32, read_only=True)

    DOSESPOT_STATUS_MAPPING = {
        1 : PatientPrescription.Status.initiated,
        4 : PatientPrescription.Status.erx_sent,
        6 : PatientPrescription.Status.error,
        7 : PatientPrescription.Status.deleted,
        9 : PatientPrescription.Status.edited,
        13: PatientPrescription.Status.pharmacy_verified
    }

    class Meta:
        model = PatientPrescription
        fields = ['dosespot_id', 'prescription', 'patient', 'medical_provider', 'pharmacy', 'visit', 'prescribed_datetime', 'pharmacy_notes', 'status' ]

    def update(self, instance, validated_data):
        updated_instance = super().update(instance, validated_data)
        logger.debug(f'[DoseSpotPrescriptionSerializer] Updated Instance: {updated_instance}. Validated data: {validated_data}')
        return updated_instance

    def create(self, validated_data):
        patient_prescription = PatientPrescription.objects.create(**validated_data)
        logger.debug(f'[DoseSpotPrescriptionSerializer] Created Instance: {patient_prescription}. Validated data: {validated_data}')
        return patient_prescription

    def to_internal_value(self, data):
        logger.debug(f'[DoseSpotPrescriptionSerializer] Data: {data}')

        patient = self.context.get('patient')
        status = self.DOSESPOT_STATUS_MAPPING[data.get('Status')]
        dosespot_id = data.get('PatientMedicationId')
        # TODO (Alda) - Use prescription ID to identify the prescription instead of using the generic product name, refill, and size?
        # dosespot_prescription_id = data.get('PrescriptionId')
        display_name_raw = data.get('DisplayName')
        display_name = display_name_raw.strip()
        quantity = data.get('Quantity', None)
        days_supply = data.get('DaysSupply', None)
        #refills = int(data.get('Refills'))
        try:
            if days_supply:
                if quantity:
                    prescription = Prescription.objects.get(Q(exact_name=display_name) & Q(quantity=int(quantity)) & Q(days_supply=int(days_supply)))
                else:
                    prescription = Prescription.objects.get(Q(exact_name=display_name) & Q(days_supply=int(days_supply)))
            else:
                if quantity:
                    prescription = Prescription.objects.get(Q(exact_name=display_name) & Q(quantity=int(quantity)))
                else:
                    prescription = Prescription.objects.get(exact_name=display_name)
        except Prescription.DoesNotExist:
            raise ValidationError(f'Prescription: {display_name} [{quantity}, {days_supply}] does not exist for patient: {patient.id}.')
        except Prescription.MultipleObjectsReturned:
            raise ValidationError(f'Multiple prescriptions exist for: {display_name} [{quantity}, {days_supply}].')

        prescribed_datetime_str = data.get('WrittenDate')

        try:
            unaware_prescribed_datetime = datetime.datetime.strptime(prescribed_datetime_str, '%Y-%m-%dT%H:%M:%S.%f')
        except ValueError:
            unaware_prescribed_datetime = datetime.datetime.strptime(prescribed_datetime_str, '%Y-%m-%dT%H:%M:%S')
        prescribed_datetime_utc = pytz.utc.localize(unaware_prescribed_datetime)
        logger.debug(f'[DoseSpotPrescriptionSerializer] prescribed_datetime_utc: {prescribed_datetime_utc}')
        # Convert EST to UTC timestamp
        # est_timezone = pytz.timezone("America/New_York")
        # aware_prescribed_datetime = est_timezone.localize(unaware_prescribed_datetime)
        # prescribed_datetime_utc = aware_prescribed_datetime.astimezone(pytz.utc)

        # Pharmacy
        pharmacy_id = data.get('PharmacyId')
        pharmacy = None
        try:
            pharmacy = Pharmacy.objects.get(dosespot_id=DEFAULT_PHARMACY_DOSESPOT_ID)
            if pharmacy_id is not None:
                pharmacy = Pharmacy.objects.get(dosespot_id=pharmacy_id)
        except Pharmacy.DoesNotExist:
            error_msg = f'[DoseSpotPrescriptionSerializer][to_internal_value] Patient: {patient.id}. ' \
                f'DoseSpot prescription ID: {dosespot_id}. ' \
                f'Pharmacy with id {pharmacy_id} does not exist.'
            logger.error(error_msg)
            #raise ValidationError(error_msg)

        pharmacy_notes = data.get('PharmacyNotes')
        prescriber_id = data.get('PrescriberId')
        try:
            medical_provider = MedicalProviderUser.objects.get(dosespot_id=prescriber_id)
        except MedicalProviderUser.DoesNotExist:
            raise ValidationError(f'Patient: {patient.id}. '
                                  f'DoseSpot prescription ID: {dosespot_id}. '
                                  f'Provider with id {prescriber_id} does not exist.')

        visit = self.context.get('visit')
        if not visit:
            raise ValidationError(f'Patient: {patient.id}. '
                                  f'DoseSpot prescription ID: {dosespot_id}. '
                                  f'Pending provider visit with id {pharmacy_id} does not exist.')

        patient_prescription_dict = {
            'dosespot_id': dosespot_id,
            'patient': patient,
            'pharmacy': pharmacy,
            'pharmacy_notes': pharmacy_notes,
            'prescription': prescription,
            'prescribed_datetime': prescribed_datetime_utc,
            'medical_provider': medical_provider,
            'visit': visit,
            'status': status,
        }

        logger.info(
            f'[DoseSpotPrescriptionSerializer] Patient prescription dictionary: {patient_prescription_dict}')

        return patient_prescription_dict


# TODO (Alda) - Parse the allergies and medications from the latest questionnaire answers
class CurexaOrderSerializer(serializers.ModelSerializer):
    order_id = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField()
    patient_first_name = serializers.ReadOnlyField(source='customer.first_name')
    patient_last_name = serializers.ReadOnlyField(source='customer.last_name')
    patient_dob = serializers.SerializerMethodField()
    patient_gender = serializers.SerializerMethodField()
    shipping_method = serializers.SerializerMethodField()
    address_to_name = serializers.SerializerMethodField()
    address_to_street1 = serializers.ReadOnlyField(source='shipping_details.address_line1')
    address_to_street2 = serializers.ReadOnlyField(source='shipping_details.address_line2')
    address_to_city = serializers.ReadOnlyField(source='shipping_details.city')
    address_to_state = serializers.ReadOnlyField(source='shipping_details.state')
    address_to_zip = serializers.ReadOnlyField(source='shipping_details.postal_code')
    address_to_country = serializers.ReadOnlyField(source='shipping_details.country.code')
    address_to_phone = serializers.ReadOnlyField(source='shipping_details.phone')
    patient_known_allergies = serializers.SerializerMethodField()
    patient_other_medications = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    # rx_items = CurexaPrescriptionSerializer(required=True)
    # otc_items = CurexaOTCSerializer(required=True)

    def get_order_id(self, obj):
        return str(obj.id)

    def get_patient_id(self, obj):
        return str(obj.customer.id)

    def get_patient_gender(self, obj):
        if obj.customer.gender == User.Gender.none:
            return None
        else:
            return obj.customer.gender

    # Options: usps_priority, usps_first, usps_priority_express, fedex_ground,
    #   fedex_standard_overnight, fedex_priority_overnight
    def get_shipping_method(self, obj):
        return 'usps_first'

    def get_address_to_name(self, obj):
        return obj.shipping_details.get_full_name()

    def get_patient_dob(self, obj):
        return obj.customer.dob.strftime('%Y%m%d')

    def get_patient_known_allergies(self, obj):
        allergies = None
        if obj.emr_medical_visit.questionnaire_answers:
            allergies = obj.emr_medical_visit.questionnaire_answers.get_allergies_response()
        else:
            # Get latest answers if the current visit questions have not been completed
            questionnaire_answers = obj.customer.questionnaire_answers.all()
            if questionnaire_answers:
                latest_questionnaire_answers = questionnaire_answers.latest('created_datetime')
                if latest_questionnaire_answers:
                    allergies = latest_questionnaire_answers.get_allergies_response()
        return allergies

    def get_patient_other_medications(self, obj):
        medication_response = None
        if obj.emr_medical_visit.questionnaire_answers:
            medication_response = obj.emr_medical_visit.questionnaire_answers.get_medication_response()
        else:
            # Get latest answers if the current visit questions have not been completed
            questionnaire_answers = obj.customer.questionnaire_answers.all()
            if questionnaire_answers:
                latest_questionnaire_answers = questionnaire_answers.latest('created_datetime')
                if latest_questionnaire_answers:
                    medication_response = latest_questionnaire_answers.get_medication_response()
        return medication_response

        # skincare_medication_response = obj.emr_medical_visit.questionnaire_answers.get_skincare_medication_response()
        # medications = None
        # if medication_response:
        #     medications = medication_response
        # if skincare_medication_response:
        #     if medications:
        #         medications += f', {skincare_medication_response}'
        #     else:
        #         medications = skincare_medication_response
        # return medications

    def get_notes(self, obj):
        # Requested by the pharmacy
        return 'Dear Brightly'

    class Meta:
        model = Order
        fields = [
            'order_id',
            'patient_id',
            'patient_first_name',
            'patient_last_name',
            'patient_dob',
            'patient_gender',
            'shipping_method',
            'address_to_name',
            'address_to_street1',
            'address_to_street2',
            'address_to_city',
            'address_to_state',
            'address_to_zip',
            'address_to_country',
            'address_to_phone',
            'notes',
            'patient_known_allergies',
            'patient_other_medications'
        ]

    # This removes empty fields from the serialized output
    def to_representation(self, instance):
        """
        Object instance -> Dict of primitive datatypes.
        """
        ret = OrderedDict()
        fields = self._readable_fields

        for field in fields:
            try:
                attribute = field.get_attribute(instance)
            except SkipField:
                continue

            # KEY IS HERE:
            if attribute in [None, '']:
                continue

            # We skip `to_representation` for `None` values so that fields do
            # not have to explicitly deal with that case.
            #
            # For related fields with `use_pk_only_optimization` we need to
            # resolve the pk value.
            check_for_none = attribute.pk if isinstance(attribute, PKOnlyObject) else attribute
            if check_for_none is None:
                ret[field.field_name] = None
            else:
                ret[field.field_name] = field.to_representation(attribute)

        """ Exclude properties when reading """
        # ret = super().to_representation(instance)
        if ret.get('patient_gender') == None:
            ret.pop('patient_gender')

        return ret

class CurexaPrescriptionSerializer(serializers.ModelSerializer):
    rx_id = serializers.ReadOnlyField(source='dosespot_id')
    medication_name = serializers.ReadOnlyField(source='prescription.exact_name')
    quantity_dispensed = serializers.ReadOnlyField(source='prescription.quantity')
    days_supply = serializers.ReadOnlyField(source='prescription.days_supply')
    prescribing_doctor = serializers.SerializerMethodField()
    medication_sig = serializers.ReadOnlyField(source='prescription.directions')
    non_child_resistant_acknowledgment = serializers.SerializerMethodField()
    is_refill = serializers.SerializerMethodField()

    def get_prescribing_doctor(self, obj):
        return obj.medical_provider.get_full_name()

    def get_is_refill(self, obj):
        return self.context.get('is_refill')

    # TODO (Alda) - Ask users if they want this?
    def get_non_child_resistant_acknowledgment(self, obj):
        return True

    class Meta:
        model = PatientPrescription
        fields = [
            'rx_id',
            'medication_name',
            'quantity_dispensed',
            'days_supply',
            'prescribing_doctor',
            'medication_sig',
            'non_child_resistant_acknowledgment',
            'is_refill',
        ]


class CurexaOTCSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source='product.name')
    weight = serializers.SerializerMethodField()

    # Hard code for now since the only OTC item we have is the Moisturizer
    def get_weight(self, obj):
        return [{'value': obj.product.weight, 'units': "ounces"}]

    class Meta:
        model = OrderProduct
        fields = ['name', 'quantity', 'weight']
