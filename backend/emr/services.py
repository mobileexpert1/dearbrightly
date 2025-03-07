import json
import random
import string
import hashlib
import requests
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from mail.services import MailService
from requests.auth import HTTPBasicAuth
from django.utils.http import urlencode
from emr.serializers import DoseSpotPatientSerializer, CurexaOrderSerializer, \
    CurexaPrescriptionSerializer, CurexaOTCSerializer, PatientPrescriptionSerializer
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from utils.logger_utils import logger
from emr.serializers import VisitSerializer
from emr.models import Flag, Questionnaire, Visit, Photo, Snippet, PatientPrescription
from dearbrightly.models import FeatureFlag
from rest_framework.exceptions import APIException
import base64
from django.core.files.base import ContentFile
from django.conf import settings
import logging
from orders.models import Order
from users.models import User
from emr.models import ChatMessage
from utils import uri_utils
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.core.exceptions import ValidationError
from dearbrightly.constants import DEFAULT_PHARMACY_DOSESPOT_ID
from db_analytics.services import KlaviyoService
from emr_new.services.curexa_service import CurexaService as NewCurexaService
from sms.services import SMSService
from products.models import Product
from utils.utils import skip_signal

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

# try:
#     import http.client as http_client
# except ImportError:
#     # Python 2
#     import httplib as http_client
# http_client.HTTPConnection.debuglevel = 1

class ChatMessageService:

    def send_new_nourisil_089_formula(self, patient):
        try:
            new_nourisil_089_formula_snippet = Snippet.objects.get(
                name='New Nourisil 0.089% Formula')

            support_user = User.objects.get(email='support@dearbrightly.com')

            prescription_submitted_chat_message = ChatMessage.objects.create(receiver=patient,
                                                                             sender=support_user,
                                                                             body=new_nourisil_089_formula_snippet.body)
        except Snippet.DoesNotExist as e:
            logger.error(f'[ChatMessageService][send_new_nourisil_089_formula] '
                         f'Snippet does not exist. ')
        except User.DoesNotExist as e:
            logger.error(f'[ChatMessageService][send_new_nourisil_089_formula] '
                         f'User does not exist. ')




    def send_medical_provider_rx_created_message(self, visit, disable_notification=False, created_datetime=timezone.now()):
        try:
            latest_trial_prescription = visit.get_latest_trial_prescription()
            current_tretinoin_strength = latest_trial_prescription.get_tretinoin_strength() if latest_trial_prescription else None
            latest_refill_prescription = visit.get_latest_refill_prescription()
            upcoming_tretinoin_strength = latest_refill_prescription.get_tretinoin_strength() if latest_refill_prescription else None

            patient = visit.patient
            treatment_url = uri_utils.generate_absolute_url(request=None, path='user-dashboard/treatment-plan')
            prescription_submitted_snippet = None
            body = None

            if current_tretinoin_strength and upcoming_tretinoin_strength:
                if current_tretinoin_strength != upcoming_tretinoin_strength:
                    if patient.gender == User.Gender.male:
                        prescription_submitted_snippet = Snippet.objects.get(
                            name='Prescription Submitted Rx Increase Male')
                    else:
                        prescription_submitted_snippet = Snippet.objects.get(name='Prescription Submitted Rx Increase')
                    body = prescription_submitted_snippet.body.format(first_name=visit.patient.first_name,
                                                                      current_tretinoin_strength=current_tretinoin_strength,
                                                                      upcoming_tretinoin_strength=upcoming_tretinoin_strength,
                                                                      treatment_url=treatment_url)

            if current_tretinoin_strength and not upcoming_tretinoin_strength or \
                    not current_tretinoin_strength and upcoming_tretinoin_strength or \
                    current_tretinoin_strength and upcoming_tretinoin_strength and current_tretinoin_strength == upcoming_tretinoin_strength:
                    prescription_submitted_snippet = Snippet.objects.get(
                        name='Prescription Submitted') if patient.gender == User.Gender.female else Snippet.objects.get(
                        name='Prescription Submitted Male')
                    tretinoin_strength = current_tretinoin_strength if current_tretinoin_strength else upcoming_tretinoin_strength
                    body = prescription_submitted_snippet.body.format(first_name=visit.patient.first_name,
                                                                      current_tretinoin_strength=tretinoin_strength,
                                                                      treatment_url=treatment_url)

            if body:
                if disable_notification:
                    prescription_submitted_chat_message = ChatMessage.objects.create()
                    prescription_submitted_chat_message.created_datetime = created_datetime
                    prescription_submitted_chat_message.body = body
                    prescription_submitted_chat_message.receiver = visit.patient
                    prescription_submitted_chat_message.sender = visit.medical_provider
                    logger.debug(
                        f'[ChatMessageService][send_medical_provider_rx_created_message] '
                        f'Patched chat message: {prescription_submitted_chat_message}. created_datetime: {created_datetime}.')
                else:
                    prescription_submitted_chat_message = ChatMessage(receiver=visit.patient,
                                                                      sender=visit.medical_provider,
                                                                      body=body)
                visit.rx_prescribed_message_sent = True
                visit.save(update_fields=['rx_prescribed_message_sent'])
                prescription_submitted_chat_message.save()
                logger.debug(f'[ChatMessageService][send_medical_provider_rx_created_message] New Rx chat message sent to patient.'
                             f'current_tretinoin_strength: {current_tretinoin_strength}. '
                             f'upcoming_tretinoin_strength: {upcoming_tretinoin_strength}. '
                             f'patient: {visit.patient.id}. '
                             f'snippet_body: {prescription_submitted_snippet.body}.'
                             f'body: {body}.')
            else:
                logger.error(f'[ChatMessageService][send_medical_provider_rx_created_message] No Rx chat message sent to patient. '
                             f'current_tretinoin_strength: {current_tretinoin_strength}. '
                             f'upcoming_tretinoin_strength: {upcoming_tretinoin_strength}. '
                             f'patient: {visit.patient.id}. '
                             f'snippet_body: {prescription_submitted_snippet.body}.'
                             f'body: {body}.')

        except Snippet.DoesNotExist as e:
            logger.error(f'[ChatMessageService][send_medical_provider_rx_created_message] '
                         f'Snippet does not exist. ')


    @receiver(post_save, sender=ChatMessage)
    def message_created_update_handler(sender, instance, **kwargs):

        if kwargs.get('raw', True):
            return

        created = kwargs.get('created', True)

        # check for these fields to distinguish from message patch with no user notificatiion
        if created and instance.sender:
            if instance.sender.is_medical_provider or instance.sender.is_medical_admin:
                new_message_uri = uri_utils.generate_absolute_url(None, 'user-dashboard/messages')
                MailService.send_user_email_provider_message(instance.receiver)
                logger.debug(f'[message_created_update_handler] Sending new message from medical provider '
                             f'email to: {instance.receiver.email}. URI: {new_message_uri}')
            elif instance.sender.is_patient:
                # Create a flag for that visit
                creator = instance.sender
                visit = creator.medical_visit
                body = f'New message: {instance.body}'
                category = Flag.Category.patient_message
                new_flag = Flag(creator=instance.sender, visit=visit, body=body, category=category)
                new_flag.save()
                logger.debug(f'[message_created_update_handler] Patient {instance.sender} '
                             f'sent message to provider. New flag created: {new_flag.id}')


class VisitService:

    @receiver(post_save, sender=Order)
    @skip_signal()
    def order_status_update_handler(sender, instance, **kwargs):

        if kwargs.get('raw', True):
            return

        logger.debug(f'[VisitService][order_status_update_handler] Order: {instance}.')

        if instance.id:
            original_status = instance.get_original_status()
            logger.debug(f'[VisitService][order_status_update_handler] Order: {instance.id}. '
                         f'Purchased datetime: {instance.purchased_datetime}. '
                         f'Medical visit: {instance.emr_medical_visit}. '
                         f'original order status: {original_status}. status: {instance.status}.')

            if int(instance.status) == Order.Status.cancelled:
                if int(original_status) == Order.Status.pending_pharmacy:
                    CurexaService().cancel_curexa_order(instance)
                KlaviyoService().track_canceled_order_event(instance)

            # After payment is complete:
            # - visits with completed skin profile should be queued for the doctor
            # - orders with valid visits should be pushed to Curexa
            # - users with expired visits should update order status to pending questionnaire
            if int(instance.status) == Order.Status.payment_complete and int(original_status) != Order.Status.payment_complete:
                if instance.emr_medical_visit:
                    if instance.emr_medical_visit.is_expired:
                        Order.objects.filter(pk=instance.id).update(status=Order.Status.pending_questionnaire)
                    else:
                        if instance.emr_medical_visit.status == Visit.Status.skin_profile_complete:
                            instance.emr_medical_visit.status = Visit.Status.provider_pending
                            instance.emr_medical_visit.save(update_fields=['status'])
                            logger.debug(f'[VisitService][order_status_update_handler] Medical visit queued. '
                                         f'Order: {instance.id}. '
                                         f'Order status: {instance.status}.'
                                         f'Visit {instance.emr_medical_visit.id}.')
                        elif instance.emr_medical_visit.status == Visit.Status.provider_rx_submitted or \
                                instance.emr_medical_visit.status == Visit.Status.provider_signed:
                            CurexaService().create_curexa_order(instance)
                            logger.debug(f'[VisitService][order_status_update_handler] Curexa order created. '
                                         f'Order: {instance.id}. '
                                         f'instance.emr_medical_visit: {instance.emr_medical_visit}.')
                else:
                    Order.objects.filter(pk=instance.id).update(status=Order.Status.pending_questionnaire)

    def get_pending(self, request, user):
        return self._get_pending_or_create(request=request, user=user, create=False)

    def get_pending_or_create(self, request, user):
        return self._get_pending_or_create(request=request, user=user, create=True)

    def _get_pending_or_create(self, request, user, create):
        latest_medical_visit_in_progress = user.get_latest_medical_visit_in_progress()
        latest_medical_visit_in_progress_status = latest_medical_visit_in_progress.status if latest_medical_visit_in_progress else None

        request_skin_profile_status = request.data.get('skin_profile_status', None)
        consent_to_telehealth = request.data.get('consent_to_telehealth', None)

        logger.debug(f'[_get_pending_or_create] Request data: {request.data}. '
                     f'request_skin_profile_status: {request_skin_profile_status}. '
                     f'latest_medical_visit_in_progress: {latest_medical_visit_in_progress}. '
                     f'status: {latest_medical_visit_in_progress_status}.')

        if latest_medical_visit_in_progress:
            visit = latest_medical_visit_in_progress
            if request_skin_profile_status:
                visit.skin_profile_status = request_skin_profile_status
                visit.save()
            if consent_to_telehealth is not None:
                visit.consent_to_telehealth = consent_to_telehealth
                visit.save(update_fields=['consent_to_telehealth'])
            logger.debug(f'[_get_pending_or_create] Most recent medical visit in progress: {visit}')
            serializer = VisitSerializer(visit)
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        elif create:
            try:
                skin_profile_status = Visit.SkinProfileStatus.pending_questionnaire
                if request_skin_profile_status:
                    skin_profile_status = request_skin_profile_status

                if consent_to_telehealth is not None:
                    visit = Visit.objects.create(patient=user,
                                                 skin_profile_status=skin_profile_status,
                                                 consent_to_telehealth=consent_to_telehealth)
                else:
                    visit = Visit.objects.create(patient=user,
                                                 skin_profile_status=skin_profile_status)
                logger.debug(
                    f'[_get_pending_or_create] Creating new visit for returning user {user.email}. '
                    f'visit: {visit}. skin_profile_status: {skin_profile_status}.')

                serializer = VisitSerializer(visit)
                return Response(data=serializer.data, status=status.HTTP_200_OK)

            except ValidationError as e:
                logger.debug(f'[_get_pending_or_create] Error creating visit: {e}')

        error_msg = f'Unable to get most recent pending medical visit for user {user.email}.'
        logger.error(error_msg)
        return Response(data={'detail': error_msg},
                        status=status.HTTP_400_BAD_REQUEST)


    def submit_consent(self, request, visit_uuid):
        try:
            visit = Visit.objects.get(uuid=visit_uuid)
            visit.consent_to_telehealth = True
            visit.save(update_fields=['consent_to_telehealth'])
        except Visit.DoesNotExist as error:
            error_msg = f'Unable to update consent signed status for visit {visit.id}'
            logger.error(error_msg)
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data=VisitSerializer(visit).data, status=status.HTTP_200_OK)

    def confirm_eligibility(self, request, visit_uuid):
        try:
            visit = Visit.objects.get(uuid=visit_uuid)
            logger.debug(f'Eligibility Confirmed for {visit_uuid}')
            return Response(data=VisitSerializer(visit).data, status=status.HTTP_200_OK)
        except APIException as error:
            error_msg = f'Unable to confirm eligibility: {error}'
            logger.error(error_msg)
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

    def remove_visit_data(self, request, uuid):
        try:
            visit = Visit.objects.get(uuid=uuid)

            for photo in visit.photos.all():
                photo.delete()

            questionnaire_answers = visit.questionnaire_answers
            visit.questionnaire_answers = None
            visit.save(update_fields=['questionnaire_answers'])
            if questionnaire_answers:
                questionnaire_answers.delete()

            visit.delete()

            logger.debug(f'[delete_visit] Deleting visit for {uuid}')
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            error_msg = f'Unable to delete visit: {error}'
            logger.error(error_msg)
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)


    # check if prescriptions are valid and create flag for invalid prescriptions
    # messages to user shouldn't be sent until the Rxs are corrected by the medical provider
    def is_visit_prescriptions_valid(self, visit):
        try:
            if settings.DEBUG or settings.TEST_MODE:
                admin_user = User.objects.get(email='dearbrightly.test+admin@gmail.com')
            else:
                admin_user = User.objects.get(email='admin@dearbrightly.com')

            latest_trial_prescription = visit.get_latest_trial_prescription()
            latest_refill_prescription = visit.get_latest_refill_prescription()

            if visit.is_yearly_visit:
                if not latest_refill_prescription:
                    body = f'Invalid prescription: Refill order does not have a refill Rx.'
                    new_flag = Flag(creator=admin_user, visit=visit, body=body,
                                    category=Flag.Category.medical_provider_attention)
                    new_flag.save()
                    logger.debug(
                        f'[Visit Service][is_visit_prescriptions_valid] '
                        f'Invalid Rx flag created for refill order: {new_flag.id}')
                    return False
            else:
                if not latest_trial_prescription or not latest_refill_prescription:
                    body = 'Invalid prescription: '
                    if not latest_trial_prescription:
                        body += 'First-time visit does not have a trial Rx. '
                    if not latest_refill_prescription:
                        body += 'Returning visit does not have a refill Rx. '
                    new_flag = Flag(creator=admin_user, visit=visit, body=body,
                                    category=Flag.Category.medical_provider_attention)
                    new_flag.save()
                    logger.debug(
                        f'[Visit Service][is_visit_prescriptions_valid] '
                        f'Invalid Rx flag created for trial visit: {visit.id}')
                    return False
            return True
        except User.DoesNotExist as e:
            error_msg = f'Unable to create flag for invalid prescriptions. Patient: {visit.patient.id}. Visit: {visit.id}. Error: {e}.'
            logger.error(f'[Visit Service][is_visit_prescriptions_valid] {error_msg}')
            MailService.send_error_notification_email(notification='PRESCRIPTION ERROR', data=error_msg)
            return False

class PhotoService:
    def create_photo(self, photo_data, photo_type, patient, visit):
        try:
            photo = Photo.objects.create(patient=patient, visit=visit, photo_type=photo_type)
            photo_format = photo_data.split(';base64,')[0].split('/')[1]
            photo_file = ContentFile(base64.b64decode(photo_data.split(';base64,')[1]), name=photo.get_s3_file_name(photo_format))
            photo.photo_file.save(photo.get_s3_file_name(photo_format), photo_file)
            return Response(data=VisitSerializer(visit).data, status=status.HTTP_200_OK)
        except APIException as error:
            error_msg = f"Unable to create new photo: {error}"
            logger.error(error_msg)
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

class DoseSpotService:
    access_token = None

    # Update prescriptions from DoseSpot without triggering payment
    # This disables payment triggers by not updating the visit status to "Provider Rx Submitted"
    def update_patients_prescriptions_no_payment_trigger(self, request):
        from emr.models import Visit
        visits = Visit.objects.filter(status=Visit.Status.pending_prescription)
        for visit in visits:
            logger.debug(f'[update_patients_prescriptions_no_payment_trigger] '
                         f'Updating prescription for patient {visit.patient.email}. '
                         f'Visit: {visit.id}.')
            try:
                self.update_patient_prescriptions(request, visit, visit.patient)
            except ValidationError as error:
                logger.debug(f'[update_patients_prescriptions_no_payment_trigger] Unable to create all prescriptions '
                             f'Prescription serializer error {error}.')


    # Run this job daily for all users with pending visits
    def update_patients_prescriptions(self, request):
        from emr.models import Visit
        visits = Visit.objects.filter(status=Visit.Status.pending_prescription)
        for visit in visits:
            logger.debug(f'[update_patients_prescriptions] '
                         f'Updating prescription for patient {visit.patient.email}. '
                         f'Visit: {visit.id}.')
            try:
                self.update_patient_prescriptions(request, visit, visit.patient)
            except ValidationError as error:
                logger.debug(f'[update_patients_prescriptions] Unable to create all prescriptions '
                             f'Prescription serializer error {error}.')

    def update_patient_prescriptions(self, request, visit, patient):
        from emr.serializers import DoseSpotPrescriptionSerializer

        self.access_token = self.get_access_token(request)
        if not patient.dosespot_id:
            MailService.send_user_notification_email(user=patient,
                                                     notification='DOSESPOT PRESCRIPTION CREATION FAILURE',
                                                     data=f'Dosespot ID unavailable for user')
            return

        try:
            existing_prescriptions = len(visit.prescriptions.filter(Q(status=PatientPrescription.Status.erx_sent) |
                                                                    Q(status=PatientPrescription.Status.edited) |
                                                                    Q(status=PatientPrescription.Status.pharmacy_verified))) > 0
            prescriptions_data = self.get_patients_prescriptions(request, dosespot_id=patient.dosespot_id)
        except APIException as error:
            logger.error(f'[update_patients_prescriptions] Unable to create patient prescription. Prescriptions unavailable: {error.detail}')
            MailService.send_user_notification_email(user=patient,
                                                     notification='DOSESPOT PRESCRIPTION CREATION FAILURE',
                                                     data=f'Prescription data unavailable for user. DoseSpot error: {error.detail}.')
            return

        logger.debug(f'[update_patient_prescriptions] '
                     f'Prescriptions data {prescriptions_data}.')

        new_prescription_created = False

        for prescription_data in prescriptions_data:
            status = prescription_data.get('Status')
            rx_cui = prescription_data.get('RxCUI')
            dosespot_id = prescription_data.get('PatientMedicationId')

            logger.debug(f'[update_patient_prescriptions] '
                         f'Prescription data {prescription_data}.')
            # 6 - Error
            if status == 6:
                logger.error(
                    f'[update_patient_prescriptions] Error sending Rx for patient: {patient.id}.')
                MailService.send_user_notification_email(user=patient,
                                                         notification='DOSESPOT PRESCRIPTION CREATION FAILURE',
                                                         data=f'DoseSpot Transmission Error. '
                                                         f'DoseSpot ID: {dosespot_id}. '
                                                         f'Rxcui: {rx_cui}')
                body = f'Invalid prescription: Dosespot transmission error.'
                self._create_flag_for_medical_provider(visit, body)

            # 4 - eRxSent; 7 - Deleted; 9 - Edited; 13 - PharmacyVerified (follow eRxSent, immediately or a few hours after)
            if status == 4 or status == 7 or status == 9 or status == 13:
                try:
                    patient_prescription = PatientPrescription.objects.filter(dosespot_id=dosespot_id).first()
                    if patient_prescription:
                        if patient_prescription.visit == visit:
                            prescription_serializer = DoseSpotPrescriptionSerializer(instance=patient_prescription,
                                                                                     data=prescription_data,
                                                                                     partial=True,
                                                                                     context={'patient': patient,
                                                                                              'visit' : patient_prescription.visit})
                            prescription_serializer.is_valid(raise_exception=False)
                            prescription = prescription_serializer.save()
                            logger.debug(
                                f'[update_patient_prescriptions] Prescription {prescription.id} updated. '
                                f'Prescription serializer {prescription_serializer.validated_data}.')

                        else:
                            logger.debug(
                                f'[update_patient_prescriptions] Prescription: {patient_prescription.id}. '
                                f'Prescription visit: {patient_prescription.visit.id}. '
                                f'Patient: {patient.id}. '
                                f'Prescription does not belong to current visit: {visit.id}.')
                    else:
                        prescription_serializer = DoseSpotPrescriptionSerializer(data=prescription_data,
                                                                                 context={'patient': patient,
                                                                                          'visit': visit})
                        prescription_serializer.is_valid(raise_exception=False)
                        prescription = prescription_serializer.save()
                        if status != 7:
                            new_prescription_created = True
                        logger.debug(
                            f'[update_patient_prescriptions] Prescription {prescription.id} created. '
                            f'Prescription serializer {prescription_serializer.validated_data}.')

                except ValidationError as error:
                    MailService.send_user_notification_email(user=patient,
                                                             notification='DOSESPOT PRESCRIPTION CREATION FAILURE',
                                                             data=f'Dosespot serializer error: {error}')
                    body = f'Dosespot prescription serialization failure: {error}.'
                    self._create_flag_for_medical_provider(visit, body)
                    #raise ValidationError(error)

        # Check if prescriptions created are valid
        is_valid = VisitService().is_visit_prescriptions_valid(visit)
        if is_valid:
            if not visit.rx_prescribed_message_sent:
                ChatMessageService().send_medical_provider_rx_created_message(visit)

            if existing_prescriptions:
                if self.is_valid_refill_nourisil_tretinoin_strength(visit=visit):
                    visit.status = Visit.Status.provider_signed
                    visit.save(update_fields=['status'])
            else:
                if new_prescription_created:
                    visit.status = Visit.Status.provider_rx_submitted
                    visit.save(update_fields=['status'])
        else:
            visit.status = Visit.Status.provider_pending
            visit.save(update_fields=['status'])

    def is_valid_refill_nourisil_tretinoin_strength(self, visit: Visit):
        if FeatureFlag.is_enabled('Nourisil Formula'):
            latest_refill_prescription_containing_pracasil = visit.get_latest_refill_prescription_containing_base(
                base='Pracasil',
            )
            latest_refill_prescription_containing_nourisil = visit.get_latest_refill_prescription_containing_base(
                base='Nourisil',
            )
            if latest_refill_prescription_containing_pracasil and latest_refill_prescription_containing_nourisil:
                pracasil_tretinoin_strength = latest_refill_prescription_containing_pracasil.get_tretinoin_strength()
                nourisil_tretinoin_strength = latest_refill_prescription_containing_nourisil.get_tretinoin_strength()
                # logger.debug(f'[is_valid_refill_nourisil_tretinoin_strength] '
                #              f'pracasil_tretinoin_strength: {pracasil_tretinoin_strength} '
                #              f'nourisil_tretinoin_strength: {nourisil_tretinoin_strength}')
                if pracasil_tretinoin_strength == nourisil_tretinoin_strength:
                    return True
                elif pracasil_tretinoin_strength == "0.1" and nourisil_tretinoin_strength == "0.089":
                    ChatMessageService().send_new_nourisil_089_formula(visit.patient)
                    return True
                else:
                    rx_mismatch_body = f'Tretinoin % for updated Nourisil Rx [{nourisil_tretinoin_strength}] ' \
                                       f'does not match previous Pracasil Rx [{pracasil_tretinoin_strength}].'
                    body = rx_mismatch_body + ' Dismiss this message if the new Rx was intended.'
                    existing_flags = Flag.objects.filter(body__icontains=rx_mismatch_body)
                    existing_flags_not_acknowledged = existing_flags.filter(acknowledged_datetime__isnull=True)

                    # allow the mismatched rx to pass through if the medical provider acknowledged all the flags
                    if existing_flags:
                        if existing_flags_not_acknowledged:
                            return False
                        else:
                            return True
                    else:
                        self._create_flag_for_medical_provider(visit=visit, body=body)

                    return False
        return True

    def _create_flag_for_medical_provider(self, visit, body):
        try:
            admin_user = User.objects.get(
                email='dearbrightly.test+admin@gmail.com') if settings.DEBUG else User.objects.get(
                email='admin@dearbrightly.com')
            new_flag = Flag(creator=admin_user, visit=visit, body=body,
                            category=Flag.Category.medical_provider_attention)
            new_flag.save()
        except User.DoesNotExist:
            logger.error(
                f'[DoseSpotService][_create_flag_for_medical_provider] Admin user for Flag creation does not exist.')

    def get_patients_prescriptions(self, request, dosespot_id, date=None):
        if not date:
            # est = pytz.timezone('America/New_York')
            # date = datetime.datetime.now(tz=est)
            date = timezone.now()

        start_date = '2019-09-01'                                          # Official first day using Dosespot is 10/01/19 (add buffer)
        end_date = (date + relativedelta(days=5)).strftime('%Y-%m-%d')     # Add some buffer from today's date

        logger.debug(f'[get_patients_prescriptions] Start date: {start_date}. End date: {end_date}')
        response = self._dosespot_get_request(request,
                                              settings.DOSESPOT_PATIENT_PRESCRIPTIONS_URI.format(user_id=dosespot_id,
                                                                                                 start_date=start_date,
                                                                                                 end_date=end_date))

        logger.debug(f'[get_patients_prescriptions] {response}')

        json_response = json.loads(response.content)
        result = json_response.get('Result', None)

        if result:
            result_code = result.get('ResultCode', None)

            if result_code == 'ERROR':
                raise APIException(result.get('ResultDescription'))

            if result_code == 'OK':
                return json_response.get('Items')

        error_msg = json_response.get('Message', f'Unable to get patient {dosespot_id} prescriptions.')
        raise APIException(error_msg)

    def get_notifications_count(self, request):
        response = self._dosespot_get_request(request, settings.DOSESPOT_NOTIFICATIONS_COUNT_URI)

        logger.debug(f'[get_notification_count] Notification count response: {response}')

        json_response = json.loads(response.content)
        result = json_response.get('Result', None)

        if result:
            result_code = result.get('ResultCode', None)

            if result_code == 'ERROR':
                raise APIException(result.get('ResultDescription'))

            if result_code == 'OK':
                refill_requests_count = json_response.get('RefillRequestsCount')
                transaction_errors_count = json_response.get('TransactionErrorsCount')
                pending_prescriptions_count = json_response.get('PendingPrescriptionsCount')

                logger.debug(f'[get_notification_count] '
                             f'refill_requests_count {refill_requests_count}. '
                             f'transaction_errors_count: {transaction_errors_count}. '
                             f'pending_prescriptions_count: {pending_prescriptions_count}')

                return refill_requests_count, transaction_errors_count, pending_prescriptions_count

        error_msg = json_response.get('Message', 'Unable to get notification count.')
        raise APIException(error_msg)

    def generate_dosespot_sso_notifications_url(self, request):
        clinician_id = request.user.dosespot_id
        sso_url = self._generate_sso_url(clinician_id)
        sso_notifications_url = f'{settings.DOSESPOT_BASE_SSO_URI}?' \
            f'b=2&{sso_url}&RefillsErrors=1'

        logger.debug(f'[generate_dosespot_sso_notifications_url] SSO Notifications URL: {sso_notifications_url}')

        return sso_notifications_url

    def generate_dosespot_sso_patient_query_url(self, request, patient):
        from emr.models import Visit

        if not patient.dosespot_id:
            patient.dosespot_id = self.create_patient(request, patient)
            patient.save(update_fields=['dosespot_id'])

        # Set default pharmacy
        self._set_patient_default_pharmacy(request, patient)

        serializer = DoseSpotPatientSerializer(patient)
        urlencoded_patient_data = urlencode(serializer.data)

        clinician_id = request.user.dosespot_id
        sso_url = self._generate_sso_url(clinician_id)

        # TODO - Once we get Surescripts approval, use sso_query_url instead of the standalone_patient_url
        #sso_query_url = f'{settings.DOSESPOT_BASE_SSO_URI}?{sso_url}&{urlencoded_patient_data}&PharmacyId={DEFAULT_PHARMACY_DOSESPOT_ID}'
        standalone_patient_url = settings.DOSESPOT_STANDALONE_DASHBOARD_PATIENT_URI.format(user_id=patient.dosespot_id)

        logger.debug(f'[generate_dosespot_sso_patient_query_url] Patient data: {serializer.data}\n'
                     f'URL encoded patient data: {urlencoded_patient_data}\n'
                     f'Prescription URL: {standalone_patient_url} *****')

        return standalone_patient_url

    def _set_patient_default_pharmacy(self, request, patient):
        patient_pharmacy_uri = settings.DOSESPOT_PATIENTS_PHARMACY_URI.format(user_id=patient.dosespot_id,
                                                                              pharmacy_id=DEFAULT_PHARMACY_DOSESPOT_ID)

        response = self._dosespot_post_request(request, patient_pharmacy_uri, {'SetAsPrimary': True})
        json_response = json.loads(response.content)
        result = json_response.get('Result', None)
        logger.debug(f'Response status code: {response.status_code}. Response: {json_response}')

        if result:
            result_code = result.get('ResultCode', None)
            if result_code == 'ERROR':
                error_msg = f'Unable to set default pharmacy for user: {patient.id}.'
                logger.error(f'[generate_dosespot_sso_patient_query_url] {error_msg}')
                MailService.send_user_notification_email(user=patient,
                                                         notification='DOSESPOT ERROR',
                                                         data=error_msg)

    def _generate_sso_url(self, clinician_id):
        encrypted_clinic_key, encrypted_user_id = self.encrypt_keys(clinician_id)
        sso_url = urlencode({
            'SingleSignOnClinicId': settings.DOSESPOT_CLINIC_ID,
            'SingleSignOnUserId': str(clinician_id),
            'SingleSignOnPhraseLength': 32,
            'SingleSignOnCode': encrypted_clinic_key,
            'SingleSignOnUserIdVerify': encrypted_user_id
        })
        return sso_url

    def get_access_token(self, request):
        clinician_id = request.user.dosespot_id if request.user and request.user.is_authenticated else settings.DOSESPOT_CLINICIAN_ID
        encrypted_clinic_key, encrypted_user_id = self.encrypt_keys(clinician_id)

        username = settings.DOSESPOT_CLINIC_ID
        password = encrypted_clinic_key

        data = {
            'grant_type' : 'password',
            'Username' : str(clinician_id),
            'Password' : encrypted_user_id
        }

        response = requests.post(url=settings.DOSESPOT_ACCESS_TOKEN_URI,
                                 auth=HTTPBasicAuth(username, password),
                                 data=data)

        logger.debug(f'[DoseSpotService][get_access_token] '
                     f'Response: {response}. URI: {settings.DOSESPOT_ACCESS_TOKEN_URI}')

        json_response = json.loads(response.content)
        logger.debug(f'[DoseSpotService][get_access_token] '
                     f'Response Status Code: {response.status_code}. '
                     f'Response: {json_response}')

        if response.status_code == status.HTTP_200_OK:
            self.access_token = json_response.get('access_token', None)

        return self.access_token


    def encrypt_keys(self, clinician_id):
        encrypted_clinic_key, random_phrase_32 = self._encrypt_clinic_key()
        encrypted_user_id = self._encrypt_user_id(clinician_id, random_phrase_32)
        return encrypted_clinic_key, encrypted_user_id

    def _encrypt_clinic_key(self):
        # 1. You have been provided a ClinicKey in UTF8
        clinic_key = settings.DOSESPOT_CLINIC_KEY

        # 2. Create a random phrase 32 characters long in UTF8
        random_phrase_32 = self._generate_random_string_with_letter_digits(32)

        # 3. Append the ClinicKey to the random phrase (random phrase THEN ClinicKey)
        new_word = random_phrase_32 + clinic_key

        # 4. Get the Byte value from UTF8 String
        new_word_bytes = new_word.encode('utf-8')

        # 5. Use SHA512 to hash the byte value you received in step 4
        hashed_new_word = hashlib.sha512(new_word_bytes).digest()   # bytes

        # 6. Get a Base64String out of the hash that you created
        hashed_new_word_base64 = base64.b64encode(hashed_new_word)      # bytes
        hashed_new_word_base64_string = hashed_new_word_base64.decode("utf-8")

        # 6a. If there are two ‘=’ signs at the end, remove them.
        hashed_new_word_base64_string_trimmed = hashed_new_word_base64_string.rstrip('=')
        hashed_new_word_base64_string_trimmed = hashed_new_word_base64_string_trimmed.rstrip('=')

        # 7. Prepend the same random phrase from step 2 to your code from step 6 (random phrase THEN Step 6
        # result)
        encrypted_clinic_key = random_phrase_32 + hashed_new_word_base64_string_trimmed

        logger.debug(f'[encrypt_clinic_key]\n'
                     f'clinic_key: {clinic_key}\n'
                     f'random_phrase_32: {random_phrase_32}\n'
                     f'new_word: {new_word}\n'
                     f'new_word_bytes: {new_word_bytes} {new_word_bytes.__class__}\n'
                     f'hashed_new_word: {hashed_new_word} {hashed_new_word.__class__}\n'
                     f'hashed_new_word_base64: {hashed_new_word_base64} {hashed_new_word_base64.__class__}\n'
                     f'hashed_new_word_base64_string: {hashed_new_word_base64_string} {hashed_new_word_base64_string.__class__}\n'
                     f'hashed_new_word_base64_string_trimmed: {hashed_new_word_base64_string_trimmed}\n'
                     f'**** encrypted_clinic_key: {encrypted_clinic_key} ****')

        return encrypted_clinic_key, random_phrase_32

    def _encrypt_user_id(self, clinician_id, random_phrase_32):
        user_id = str(clinician_id)
        clinic_key = settings.DOSESPOT_CLINIC_KEY

        # 1. Take the first 22 characters of the phrase from step 2 of ‘Creating the Encrypted ClinicId’
        random_phrase_22 = random_phrase_32[0:22]

        # 2. Append the 22 character phrase to the UserId string (UserId THEN random phrase)
        new_word = user_id + random_phrase_22

        # 3. Append the ClinicKey to the string (Step 2 THEN ClinicKey)
        new_word_clinic_key = new_word + clinic_key

        # 4. Get the Byte value of the string
        new_word_clinic_key_bytes = new_word_clinic_key.encode('utf-8')

        # 5. Use SHA512 to hash the byte value you received in step 4
        hashed_new_word_clinic_key = hashlib.sha512(new_word_clinic_key_bytes).digest()   # bytes

        # 6. Get a Base64String out of the hash that you created
        hashed_new_word_clinic_key_base64 = base64.b64encode(hashed_new_word_clinic_key)      # bytes
        hashed_new_word_clinic_key_base64_string = hashed_new_word_clinic_key_base64.decode("utf-8")

        # 6a. If there are two ‘=’ signs at the end, remove them.
        hashed_new_word_clinic_key_base64_string_trimmed = hashed_new_word_clinic_key_base64_string.rstrip('=')
        encrypted_user_id = hashed_new_word_clinic_key_base64_string_trimmed.rstrip('=')

        # logger.debug(f'[_encrypt_user_id]\n'
        #              f'user_id: {user_id}\n'
        #              f'random_phrase_22: {random_phrase_22}\n'
        #              f'new_word: {new_word}\n'
        #              f'new_word_clinic_key: {new_word_clinic_key}\n'
        #              f'new_word_clinic_key_bytes: {new_word_clinic_key_bytes} {new_word_clinic_key_bytes.__class__}\n'
        #              f'hashed_new_word_clinic_key: {hashed_new_word_clinic_key} {hashed_new_word_clinic_key.__class__}\n'
        #              f'hashed_new_word_clinic_key_base64: {hashed_new_word_clinic_key_base64} {hashed_new_word_clinic_key_base64.__class__}\n'
        #              f'hashed_new_word_clinic_key_base64_string: {hashed_new_word_clinic_key_base64_string} {hashed_new_word_clinic_key_base64_string.__class__}\n'
        #              f'**** encrypted_user_id: {encrypted_user_id} ****\n')

        return encrypted_user_id


    def _generate_random_string_with_letter_digits(self, string_length):
        """Generate a random string of letters, digits and special characters """
        password_characters = string.ascii_letters + string.digits
        return ''.join(random.choice(password_characters) for i in range(string_length))

    def update_patient(self, request, patient):
        patient_update_uri = f'{settings.DOSESPOT_PATIENTS_URI}/{patient.dosespot_id}'
        return self._post_patient_data(request, patient, patient_update_uri)

    def create_patient(self, request, patient):
        patient_create_uri = settings.DOSESPOT_PATIENTS_URI
        return self._post_patient_data(request, patient, patient_create_uri)

    def _post_patient_data(self, request, patient, url):
        serializer = DoseSpotPatientSerializer(patient)
        logger.debug(f'Patient data: {serializer.data}.')

        response = self._dosespot_post_request(request, url, serializer.data)
        json_response = json.loads(response.content)
        result = json_response.get('Result', None)

        logger.debug(f'Response status code: {response.status_code}. Response: {json_response}')

        if result:
            result_code = result.get('ResultCode', None)

            if result_code == 'ERROR':
                raise APIException(result.get('ResultDescription'))

            if result_code == 'OK':
                dosespot_id = json_response.get('Id')
                logger.debug(f'dosespot_id: {dosespot_id}')
                return dosespot_id

        error_msg = json_response.get('Message', 'Unable to create patient.')
        raise APIException(error_msg)

    def _dosespot_post_request(self, request, url, body=None):
        if not self.access_token:
            self.get_access_token(request)

        headers = {'Authorization': f'Bearer {self.access_token}'}

        logger.debug(f'[POST Request] Headers: {headers}. Access token: {self.access_token}')

        response = requests.post(url=url,
                                 headers=headers,
                                 json=body)

        logger.debug(f'[_dosespot_post_request] Response: {response.content}')

        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            logger.debug(f'User is unauthorized. Starting new session.')
            self.get_access_token(request)
            refreshed_headers = {'Authorization': f'Bearer {self.access_token}'}
            response = requests.post(url=url,
                                     headers=refreshed_headers,
                                     json=body)
        return response

    def _dosespot_get_request(self, request, url):
        if not self.access_token:
            self.get_access_token(request)

        headers = {'Authorization': f'Bearer {self.access_token}'}

        logger.debug(f'[GET Request] Headers: {headers}. Access token: {self.access_token}')

        response = requests.get(url=url,
                                headers=headers)

        logger.debug(f'[_dosespot_get_request] Response: {response.content}')

        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            logger.debug(f'User is unauthorized. Starting new session.')
            self.get_access_token(request)
            refreshed_headers = {'Authorization': f'Bearer {self.access_token}'}
            response = requests.get(url=url,
                                    headers=refreshed_headers)

        return response

class CurexaService:

    # Create Curexa order after the prescription is created and payment has been captured
    # Occurs in the following cases:
    #   1. A new rx is written for a new or returning user.
    #   2. An updated rx is created to replace an invalid rx (the user's order has not been pushed).
    #   3. An updated rx is created to update the existing rx (the user's order may have been pushed).
    @receiver(pre_save, sender=Visit)
    def prescription_created_handler(sender, instance, **kwargs):

        if kwargs.get('raw', True):
            return

        if instance.id:
            try:
                pre_save_visit = Visit.objects.get(pk=instance.id)

                logger.debug(f'[CurexaService][prescription_created_handler] Visit {instance.id}. '
                             f'Old status: {pre_save_visit.status}. '
                             f'New status: {instance.status}.')

                if pre_save_visit.status == Visit.Status.pending_prescription:
                    if instance.status == Visit.Status.provider_rx_submitted or instance.status == Visit.Status.provider_signed:
                        orders = instance.orders.filter(
                            Q(status=Order.Status.pending_medical_provider_review) |
                            Q(status=Order.Status.payment_complete) |
                            Q(status=Order.Status.pending_pharmacy))
                        logger.error(f'[CurexaService][prescription_created_handler] '
                                     f'Orders: {orders}. Visit: {instance.id}.')
                        if orders:
                            order = orders.latest('payment_captured_datetime')
                            NewCurexaService().create_curexa_order(order=order)

            except Visit.DoesNotExist as e:
                logger.error(f'[CurexaService][prescription_created_handler] '
                             f'Visit {instance.id} does not exist. '
                             f'Unable to create prescription submitted message to patient.')

    # TODO - Remove
    # Replaced with emr_new implementation
    def create_curexa_order(self, order, prescription_data=None, include_otc_products=False):
        return self._create_curexa_order(order=order,
                                         prescription_data=prescription_data,
                                         include_otc_products=include_otc_products)

    # TODO - Remove
    # Replaced with emr_new implementation
    def _create_curexa_order(self, order, prescription_data=None, include_otc_products=False):
        from products.models import Product
        from orders.models import Order, Inventory

        if not order.customer.has_valid_rx:
            error_msg = f'{order.customer.email} does not have a valid Rx.'
            logger.error(f'[_create_curexa_order] {error_msg}')
            return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

        curexa_order_serializer = CurexaOrderSerializer(order)
        rx_items = []
        medical_visit = order.emr_medical_visit

        if not medical_visit:
            error_msg = 'Unable to get medical visit for order.'
            logger.error(f'[_create_curexa_order] {error_msg}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CREATION FAILURE',
                                                      data=error_msg)
            return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

        if not prescription_data:
            if order.is_refill:
                prescription = medical_visit.get_latest_refill_prescription()
            else:
                prescription = medical_visit.get_latest_trial_prescription()

            if not prescription:
                error_msg = 'Unable to get prescription for order.'
                logger.error(f'[_create_curexa_order] {error_msg}')
                MailService.send_order_notification_email(order,
                                                          notification_type='CUREXA ORDER CREATION FAILURE',
                                                          data=error_msg)
                return Response(data=error_msg, status=status.HTTP_400_BAD_REQUEST)

            if FeatureFlag.is_enabled('Nourisil Formula') and not prescription.contains_ingredient('nourisil'):
                medical_visit.status = Visit.Status.provider_pending
                medical_visit.save(update_fields=['status'])
                order.status = Order.Status.pending_medical_provider_review
                order.save(update_fields=['status'])
                body = f'Patient needs updated Nourisil formula.'
                self._create_flag_for_medical_provider(visit=medical_visit, body=body)

                logger.error(f'[_create_curexa_order] {body}')
                MailService.send_order_notification_email(
                    order,
                    notification_type='CUREXA ORDER CREATION FAILURE',
                    data=body,
                )
                return Response(data=body, status=status.HTTP_400_BAD_REQUEST)

            serializer = CurexaPrescriptionSerializer(prescription, context={'is_refill': order.is_refill})
            logger.debug(f'[_create_curexa_order] Visit: {medical_visit}. Prescription: {prescription}. Rx item: {serializer.data}')
            rx_items.append(serializer.data)

        else:
            medical_provider_name = prescription_data.get('medical_provider')
            # TODO (Alda) - change this to DoseSpot ID when we've swapped out Sappira
            rx_id = prescription_data.get('rxcui')
            medication_name = prescription_data.get('exact_name') or prescription_data.get('exactName')
            quantity_dispensed = prescription_data.get('quantity')
            days_supply = prescription_data.get('days_supply') or prescription_data.get('daysSupply')
            medication_sig = prescription_data.get('directions')
            non_child_resistant_acknowledgment = True
            is_refill = order.is_refill

            patient_prescription = {
                "rx_id": str(rx_id), # Need to check if this is an integer or string?
                "medication_name": medication_name,
                "quantity_dispensed": int(quantity_dispensed),
                "days_supply": int(days_supply),
                "prescribing_doctor": medical_provider_name,
                "medication_sig": medication_sig,
                "non_child_resistant_acknowledgment": non_child_resistant_acknowledgment,
                "is_refill": is_refill
            }

            logger.debug(f'[_create_curexa_order] Prescription data: {prescription_data}. '
                         f'Patient prescription {patient_prescription}')

            rx_items.append(patient_prescription)

        retinoid_items = order.order_items.filter(product__product_type=Product.Type.rx)
        retinoid_item = retinoid_items.latest('created_datetime') if retinoid_items else None
        if order.is_refill and retinoid_item and retinoid_item.bottle_type == Inventory.BottleType.refill:
            rx_items[0]['pref_packaging'] = 'refill'

        logger.debug(f'[_create_curexa_order] retinoid_item.bottle_type: {retinoid_item.bottle_type}. rx_items: {rx_items}.')

        try:
            body = curexa_order_serializer.data
        except AttributeError as error:
            logger.error(f'[_create_curexa_order] Error: {error}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CREATION FAILURE',
                                                      data=error)
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

        body['rx_items'] = rx_items

        if include_otc_products:
            otc_items = []
            for otc_item in order.order_items.filter(product__product_type=Product.Type.otc):
                serializer = CurexaOTCSerializer(otc_item)
                logger.debug(f'[_create_curexa_order] OTC item: {serializer.data}')
                otc_items.append(serializer.data)

            if len(otc_items) > 0:
                body['otc_items'] = otc_items

        curexa_response = self._curexa_post_request(settings.CUREXA_ORDERS_URI, body)
        response_data = json.loads(curexa_response.content)

        try:
            curexa_status = response_data.get('status')
            curexa_message = response_data.get('message')

            if curexa_status == 'success':
                order.status = Order.Status.pending_pharmacy
                order.save(update_fields=['status'])

                # This needs to come after status save to prevent recursive call of order_status_update_handler
                order.patient_prescription = prescription
                order.save(update_fields=['patient_prescription'])

                # TODO - Enable this when we hide the Curexa message body
                # curexa_order_data = response_data.copy()
                #
                # rx_id_str = ''
                # for rx_item in rx_items:
                #     rx_id_str += f"{rx_item.get('rx_id')} "
                # curexa_order_data['rx_id'] = rx_id_str
                #
                # otc_name_str = ''
                # for otc_item in otc_items:
                #     otc_name_str += f"{otc_item.get('name')} "
                # curexa_order_data['otc_names'] = otc_name_str

                if curexa_message == 'An existing order was updated successfully.':
                    MailService.send_order_notification_email(order,
                                                              notification_type='CUREXA ORDER UPDATE SUCCESS')
                    logger.debug(
                        f'[_create_curexa_order] CUREXA ORDER UPDATE SUCCESS. Body: {body}')
                else:
                    MailService.send_order_notification_email(order,
                                                              notification_type='CUREXA ORDER CREATION SUCCESS')
                    logger.debug(
                        f'[_create_curexa_order] CUREXA ORDER CREATION SUCCESS. Body: {body}')
                return Response(data=curexa_message, status=status.HTTP_200_OK)
            else:
                MailService.send_order_notification_email(order,
                                                          notification_type='CUREXA ORDER CREATION FAILURE')
                logger.debug(
                    f'[_create_curexa_order] CUREXA ORDER CREATION FAILURE. Body: {body}')
                return Response(data=curexa_message, status=status.HTTP_400_BAD_REQUEST)
        except json.decoder.JSONDecodeError as error:
            logger.error(f'[_create_curexa_order] JSON Decode Error: {error}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CREATION FAILURE',
                                                      data=error)
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.ConnectionError as error:
            logger.error(f'[_create_curexa_order] Connection Error: {error}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CREATION FAILURE',
                                                      data=error)
            return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

    def cancel_curexa_order(self, order):
        logger.debug(f'[cancel_curexa_order] Cancelling order: {order.id}')
        curexa_response = self._curexa_post_request(settings.CUREXA_CANCEL_ORDER_URI, {"order_id": order.id})
        try:
            response_data = json.loads(curexa_response.content)

            curexa_status = response_data.get('status')
            curexa_message = response_data.get('message')

            if curexa_status == 'success':
                MailService.send_order_notification_email(order,
                                                          notification_type='CUREXA ORDER CANCEL SUCCESS')
            else:
                MailService.send_order_notification_email(order,
                                                          notification_type='CUREXA ORDER CANCEL FAILURE',
                                                          data=curexa_message)
        except json.decoder.JSONDecodeError as error:
            logger.error(f'[cancel_curexa_order] Error: {error}')
            MailService.send_order_notification_email(order,
                                                      notification_type='CUREXA ORDER CANCEL FAILURE',
                                                      data=error)

        return curexa_response

    def _curexa_post_request(self, url, body):
        credentials = f'{settings.CUREXA_API_KEY}:{settings.CUREXA_SECRET_KEY}'
        encrypted_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
        headers = {'Authorization': f'Basic {encrypted_credentials}'}

        response = requests.post(url=url,
                                 headers=headers,
                                 json=body)

        logger.debug(f'[_curexa_post_request] Response: {response.content}')

        return response

    def webhook_handler(self, request):
        from orders.models import Order

        logger.debug(f'[CurexaService][webhook_handler] Request: {request}. ')

        status_update_json = json.loads(request.body)
        order_id = status_update_json.get('order_id')
        status = status_update_json.get('status')
        status_details = status_update_json.get('status_details')
        carrier = status_update_json.get('carrier')
        tracking_number = status_update_json.get('tracking_number')
        error = status_update_json.get('error')

        logger.debug(f'[CurexaService][webhook_handler] '
                     f'Status update data: {status_update_json}. '
                     f'order_id: {order_id}. '
                     f'status: {status}. '
                     f'status_details: {status_details}. '
                     f'carrier: {carrier}. '
                     f'tracking_number: {tracking_number}. '
                     f'error: {error}.')

        notification = f'CUREXA STATUS UPDATE: {status}'

        data = ''
        if status_details:
            data = f'Status Details: {status_details} '
        if carrier:
            data += f'Carrier: {carrier} '
        if tracking_number:
            data += f'Tracking Number: {tracking_number}'

        try:
            order = Order.objects.get(id=order_id)

            if tracking_number and status == 'out_for_delivery':
                tracking_uri = settings.USPS_TRACKING_URL.format(tracking_number=tracking_number)
                # TODO (Alda) - Once Smart Warehouse APIs are stable, check that all Order Items are shipped before setting order status as shipped
                existing_tracking_number = True if order.tracking_number else False
                same_tracking_number = True if order.tracking_number == tracking_number else False
                current_time = timezone.now()

                if not order.shipped_datetime:
                    order.shipped_datetime = current_time
                    order.save(update_fields=['shipped_datetime'])

                logger.debug(f'[CurexaService][webhook_handler] '
                             f'order id: {order.id}. '
                             f'current tracking number: {order.tracking_number}. '
                             f'existing_tracking_number: {existing_tracking_number}. '
                             f'same_tracking_number: {same_tracking_number}. '
                             f'shipped datetime: {order.shipped_datetime}.')

                if same_tracking_number:
                    logger.debug(f'[CurexaService][webhook_handler] Same tracking number received: {tracking_number}. '
                                 f'No email to user will be sent: {order.customer.email}')
                    return
                order.tracking_number = tracking_number
                order.shipping_carrier = carrier
                order.save(update_fields=['tracking_number', 'shipping_carrier', 'status'])
                # TODO (Alda) - Remove order's tracking number, shipping carrier, shipped datetime, etc. when we
                #  have better designs to reflect all the shipment statuses for the different items in an order
                order.order_items.filter(product__product_type=Product.Type.rx).update(shipping_carrier=carrier,
                                                                                       shipped_datetime=current_time,
                                                                                       tracking_number=tracking_number)
                otc_items_not_shipped = order.order_items.filter(Q(product__product_type=Product.Type.otc) & Q(tracking_number__isnull=True))
                logger.debug(f'[CurexaService][webhook_handler] otc_items_not_shipped: {otc_items_not_shipped}')
                if otc_items_not_shipped:
                    order.status = Order.Status.partially_shipped
                else:
                    order.status = Order.Status.shipped
                order.save(update_fields=["status"])

                MailService.send_user_shipment_notification(order=order,
                                                            tracking_number=tracking_number,
                                                            tracking_uri=tracking_uri,
                                                            is_update=existing_tracking_number)
                if existing_tracking_number:
                    SMSService.send_order_tracking_updated(order, tracking_uri)
                else:
                    SMSService.send_order_shipped(order, tracking_uri)

        except Order.DoesNotExist as e:
            notes = f'Order not found for order ID: {int(order_id)}.'
            logger.error(f'[CurexaService][webhook_handler] {notes}')
        return


