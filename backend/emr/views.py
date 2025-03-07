import base64
import requests
import json
import re
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from utils import uri_utils

from requests.auth import HTTPBasicAuth
from rest_framework import viewsets, mixins, views, status
from rest_framework.parsers import FileUploadParser, FormParser, MultiPartParser, JSONParser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.viewsets import ModelViewSet

from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.views.generic.edit import CreateView
from django.core.files.base import ContentFile

from users.models import User
from emr.models import PatientPrescription, Photo, Visit, Questionnaire, QuestionnaireAnswers, Visit
from emr.services import VisitService, PhotoService, DoseSpotService, CurexaService
from emr_new.services.curexa_service import CurexaService as NewCurexaService
from emr.serializers import PatientPrescriptionDisplaySerializer, PhotoSerializer, QuestionnaireAnswersSerializer, QuestionnaireSerializer, VisitSerializer
from emr.permissions import IsMedicalAdminOrMedicalProviderOrPatient, Curexa_API_Key_Auth, Dear_Brightly_API_Key_Auth, IsAdminOrPatientWithVisitUuidCheck, IsPatientWithVisitUuidCheck
from db_analytics.services import OptimizelyService, FacebookConversionServices
import logging
from utils.phi_utils import PHIViewSetLoggingMixin
from django.utils import timezone
import dateutil.parser

optimizely_service = OptimizelyService(settings.OPTIMIZELY_PROJECT_ID)

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([Curexa_API_Key_Auth])
def webhook_handler(request):
    CurexaService().webhook_handler(request)
    return Response(data={'status': 'success'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def create_curexa_order(request):
    from orders.models import Order

    order_id = request.data.get('order_id')
    prescription_data = request.data.get('prescription_data')

    order = get_object_or_404(Order, id=order_id)
    response = NewCurexaService().create_curexa_order(order, prescription_data)

    if response.status_code == status.HTTP_200_OK:
        response_data = json.loads(response.content)
        return Response(data=response_data,
                        status=status.HTTP_200_OK)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def generate_dosespot_access_token(request):
    access_token = DoseSpotService().get_access_token(request)
    return Response(data=access_token,
                    status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def encrypt_keys(request):
    encrypted_clinic_key, encrypted_user_id = DoseSpotService().encrypt_keys(clinician_id=request.user.dosespot_id)
    return Response(data={"encrypted_clinic_key" : encrypted_clinic_key,
                          "encrypted_user_id" : encrypted_user_id},
                    status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def notifications_counts(request):
    refill_requests_count, transaction_errors_count, pending_prescriptions_count = DoseSpotService().get_notifications_count(request)
    return Response(data={'refill_requests_count' : refill_requests_count,
                          'transaction_errors_count' : transaction_errors_count,
                          'pending_prescriptions_count': pending_prescriptions_count},
                    status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def update_patients_prescriptions(request):
    DoseSpotService().update_patients_prescriptions(request)
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def update_patients_prescriptions_no_payment_trigger(request):
    DoseSpotService().update_patients_prescriptions_no_payment_trigger(request)
    return Response(status=status.HTTP_200_OK)

# Wipe the visit object, along with all objects that reference visit - photos, questionnaire_answers, and orders
@api_view(['POST'])
@permission_classes((Dear_Brightly_API_Key_Auth,))
def remove_visit_data(request, visit_uuid):
    return VisitService().remove_visit_data(request, visit_uuid)

@api_view(['GET'])
@permission_classes([IsAdminOrPatientWithVisitUuidCheck])
def get_pending(request, user_uuid):
    user = get_object_or_404(User, uuid=user_uuid)
    return VisitService().get_pending(request, user)

@api_view(['POST'])
@permission_classes([IsAdminOrPatientWithVisitUuidCheck])
def get_pending_or_create(request, user_uuid):
    user = get_object_or_404(User, uuid=user_uuid)
    return VisitService().get_pending_or_create(request, user)

@api_view(['POST'])
@permission_classes([Dear_Brightly_API_Key_Auth])
def patch_medical_provider_messages(request):
    from emr.services import ChatMessageService
    from emr.models import ChatMessage, Snippet
    from django.db.models import Q

    emails = request.data.get('emails')
    disable_notification = request.data.get('disable_notification', False)
    created_datetime_str = request.data.get('created_datetime', None)
    created_datetime = dateutil.parser.parse(created_datetime_str) if created_datetime_str else timezone.now()
    visit_id = request.data.get('visit_id', None)

    if emails:
        for email in emails:
            user = get_object_or_404(User, email=email)
            if visit_id:
                visit = get_object_or_404(Visit, id=visit_id)
            else:
                visit = user.medical_visit
            try:
                ChatMessageService().send_medical_provider_rx_created_message(visit=visit,
                                                                              disable_notification=disable_notification,
                                                                              created_datetime=created_datetime)
            except ObjectDoesNotExist:
                logger.error (f'[patch_medical_provider_messages] Prescriptions for user {email} does not exist.')
                pass
    else:
        # Delete blank rx % messages
        blank_rx_messages = ChatMessage.objects.filter(body__icontains="I've put you on a strength of <strong>%</strong> tretinoin")
        logger.debug(f'[patch_medical_provider_messages] blank_rx_messages: {blank_rx_messages}.')
        for blank_rx_message in blank_rx_messages:
            patient = blank_rx_message.receiver
            logger.debug(f'[patch_medical_provider_messages] Delete message: {blank_rx_message.id}. '
                         f'patient: {patient.id}. message body: {blank_rx_message.body}.')
            blank_rx_message.delete()

        # Update increased strength message with one blank strength to the single strength message
        blank_rx_increase_messages = ChatMessage.objects.filter(Q(body__icontains="I've started you off on a lower strength of <strong>%</strong> tretinoin") |
                                                                Q(body__icontains="You should be receiving your highest strength of <strong>%</strong> tretinoin"))
        logger.debug(f'[patch_medical_provider_messages] blank_rx_increase_messages: {blank_rx_increase_messages}.')

        treatment_url = uri_utils.generate_absolute_url(request=None, path='user-dashboard/treatment-plan')
        for blank_rx_increase_message in blank_rx_increase_messages:
            tretinoin_strength_search_results = re.findall(r'0\.\d+', blank_rx_increase_message.body)
            tretinoin_strength = tretinoin_strength_search_results[0]
            patient = blank_rx_increase_message.receiver
            prescription_submitted_snippet = Snippet.objects.get(
                name='Prescription Submitted') if patient.gender == User.Gender.female else Snippet.objects.get(
                name='Prescription Submitted Male')
            body = prescription_submitted_snippet.body.format(first_name=patient.first_name,
                                                              current_tretinoin_strength=tretinoin_strength,
                                                              treatment_url=treatment_url)
            logger.debug(f'[patch_medical_provider_messages] Replacing message body for chat message: {blank_rx_increase_message.id}. '
                         f'patient: {patient.id}. '
                         f'tretinoin_strength_search_results: {tretinoin_strength_search_results}. '
                         f'tretinoin_strength: {tretinoin_strength}. '
                         f'**** original message body: {blank_rx_increase_message.body}. '
                         f'#### new message body: {body}')
            ChatMessage.objects.filter(id=blank_rx_increase_message.id).update(body=body)

    return Response(status=status.HTTP_200_OK)


# ---- Endpoint not used; Visit serializer handles updates to the Questionnaire Answers entity ----
# Poses some security risk as any authenticated user can create a QuestionnaireAnswer entity
# class QuestionnaireAnswersViewSet(PHIViewSetLoggingMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
#     queryset = QuestionnaireAnswers.objects.all()
#     serializer_class = QuestionnaireAnswersSerializer
#     permission_classes = (IsMedicalAdminOrMedicalProviderOrPatient,)
#
#     def perform_create(self, serializer):
#         serializer.save(
#             patient=self.request.user
#         )

class QuestionnaireViewSet(PHIViewSetLoggingMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = QuestionnaireSerializer
    queryset = Questionnaire.objects.all()
    permission_classes = (IsAuthenticated,)
    lookup_field = 'id'
    ordering = ['-version', '-created_datetime']

    def retrieve(self, request, id=None):
        queryset = self.get_queryset()
        questionnaire = get_object_or_404(queryset, id=id)
        serializer = QuestionnaireSerializer(questionnaire)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

# ---- Endpoint not used; Visit serializer handles updates to the Photos entity ----
# class PhotoViewSet(PHIViewSetLoggingMixin,
#                    viewsets.GenericViewSet):
#
#     # parser_classes = (FileUploadParser, )
#     lookup_field = 'uuid'
#     serializer_class = PhotoSerializer
#     permission_classes = (Dear_Brightly_API_Key_Auth,)
#

class VisitViewSet(PHIViewSetLoggingMixin,
                   mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    serializer_class = VisitSerializer
    lookup_field = 'uuid'


    def get_permissions(self):
        if self.action in ['confirm_eligibility',
                           'create_photo',
                           'submit_consent'
                           ]:
            permission_classes = [IsPatientWithVisitUuidCheck]
        else: #['create', 'update', 'partial_update', 'retrieve', 'list']
            permission_classes = [IsMedicalAdminOrMedicalProviderOrPatient]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        status = self.request.query_params.get('status', None)
        visit_uuid = self.kwargs.get('uuid', None)

        if visit_uuid:
            return Visit.objects.filter(uuid=visit_uuid)

        if user.is_medical_provider or user.is_medical_admin:
            queryset = Visit.objects.all()
        else:
            queryset = user.patient_visits.all()

        if status == 'pending':
            queryset = queryset.filter(Q(status=Visit.Status.pending) |
                                       Q(status=Visit.Status.skin_profile_pending) |
                                       Q(status=Visit.Status.skin_profile_complete) |
                                       Q(status=Visit.Status.provider_pending) |
                                       Q(status=Visit.Status.pending_prescription) |
                                       Q(status=Visit.Status.provider_awaiting_user_input))

        if status == 'completed':
            queryset = queryset.filter(Q(status=Visit.Status.provider_signed) |
                                       Q(status=Visit.Status.provider_rx_submitted) |
                                       Q(status=Visit.Status.provider_rx_denied) |
                                       Q(status=Visit.Status.provider_cancelled))

        if status == 'prescribed':
            queryset = queryset.objects.filter(status=Visit.Status.provider_rx_submitted)

        # TODO (Alda) - A little awkward refactor
        if status == "most_recent":
            try:
                most_recent_visit = queryset.filter(~Q(status=Visit.Status.provider_cancelled) &
                                                    ~Q(status=Visit.Status.provider_rx_denied)).latest('created_datetime')
                queryset = Visit.objects.filter(pk=most_recent_visit.id)
            except Visit.DoesNotExist:
                queryset = Visit.objects.none()

        logger.debug(f'[VisitViewSet] [get_queryset] Visit uuid: {visit_uuid}. '
                     f'Query parameter visit status:{status}. Queryset: {queryset}')

        return queryset


    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        visit = get_object_or_404(queryset, pk=pk)
        serializer = VisitSerializer(visit)
        return Response(serializer.data)


    def partial_update(self, request, *args, **kwargs):
        response_with_updated_instance = super(VisitViewSet, self).partial_update(request, *args, **kwargs)
        #logger.debug(f'[VisitViewSet][partial_update] updated instance: {response_with_updated_instance.__dict__}')
        return response_with_updated_instance


    @action(methods=('post',), detail=True)
    def confirm_eligibility(self, request, uuid):
        return VisitService().confirm_eligibility(request, uuid)


    @action(methods=('post',), detail=True)
    def create_photo(self, request, uuid):
        if uuid is None or request.data.get('photo_type') is None or request.data.get('photo_file') is None:
            return Response(status=400)

        visit = get_object_or_404(Visit, uuid=uuid)
        patient = get_object_or_404(User, pk=visit.patient_id)

        photo_type = request.data.get('photo_type')
        image_b64 = request.data.get('photo_file')

        photo = PhotoService().create_photo(image_b64, photo_type, patient, visit)

        if visit.is_all_photos_uploaded:
            logger.debug(f'[VisitViewSet][create_photo] All visit {visit.id} photos uploaded. '
                         f'Visit paid: {visit.is_paid}. skin_profile_status: {visit.skin_profile_status}. '
                         f'status: {visit.status}.')
            if visit.skin_profile_status != Visit.SkinProfileStatus.complete:
                visit.skin_profile_status = Visit.SkinProfileStatus.complete
                visit.save()
            # workaround to queue a visit again if the user is uploading new photos (this is not handled in the case above)
            elif visit.status == Visit.Status.provider_awaiting_user_input and visit.is_paid:
                Visit.objects.filter(id=visit.id).update(status=Visit.Status.provider_pending)

            optimizely_service.track('questionnaire_photos_uploaded', request)
            first_time_rx_orders = visit.orders.filter(autogenerated=False)
            order = first_time_rx_orders.first() if first_time_rx_orders else None
            if order:
                FacebookConversionServices().track_purchase_event(request, patient, order)

        return Response(data=VisitSerializer(visit).data, status=200)


    @action(methods=('post',), detail=True)
    def submit_consent(self, request, uuid):
        return VisitService().submit_consent(request, uuid)


# ---- Endpoint not used; Visit serializer handles updates to the PatientPrescription entity ----
# Poses some unecessary security risk to expose an endpoint with all the users prescriptions
# class PatientPrescriptionViewSet(PHIViewSetLoggingMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
#     serializer_class = PatientPrescriptionDisplaySerializer
#     permission_classes = (IsMedicalAdminOrMedicalProviderOrPatient,)
#     lookup_field = 'uuid'
#     ordering = ['-prescribed_datetime']
#
#     def get_queryset(self):
#         user = self.request.user
#         patient_prescription_uuid = self.kwargs.get('uuid', None)
#
#         if patient_prescription_uuid:
#             return PatientPrescription.objects.filter(uuid=patient_prescription_uuid)
#
#         if user.is_medical_provider or user.is_medical_admin:
#             queryset = PatientPrescription.objects.all()
#         else:
#             queryset = user.prescriptions.all()
#
#         logger.debug(f'[VisitPatientPrescriptionViewSetViewSet] [get_queryset] '
#                      f'Patient prescription uuid: {patient_prescription_uuid}. '
#                      f'Queryset: {queryset}')
#
#         return queryset
