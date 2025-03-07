import logging
from rest_framework.exceptions import APIException
from graphql import GraphQLError
from django.utils import timezone
import graphene
from django.apps import apps
from django.shortcuts import get_object_or_404
from graphene import relay
from graphql_relay import from_global_id
import datetime

from emr.models import ChatMessage, Flag, Note, PatientPrescription, Photo, Questionnaire, ServiceChoices, Snippet, Visit
from emr.services import PhotoService
from emr.types import ChatMessageType, FlagType, NoteType, PatientPrescriptionType, PhotoType, SnippetType, UserType, VisitType
from users.models import MedicalProviderUser, User
from utils.phi_utils import PhiRelayClientIdMutation

from payment.services.services import Service

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

User = apps.get_model('users', 'User')
ShippingDetails = apps.get_model('orders', 'Order')
MedicalProviderUser = apps.get_model('users', 'MedicalProviderUser')

# The REST API medical visit creation is used now
class CreateMedicalVisit(PhiRelayClientIdMutation):
    class Input:
        user_uuid = graphene.String(required=True)
        # order_id = graphene.ID(required=False)

    visit = graphene.Field(VisitType)
    phi_model = "visit"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        user_uuid = input.get('user_uuid')
        # order_id = input.get('order_id')

        user = User.objects.get(uuid=user_uuid)

        logger.debug(f'User created: {user.email}')
        # order = None
        # if order_id:
        #     order = Order.objects.get(id=order_id)

        # TODO (Alda) - Revisit logic for how the quetionnaires are retrieved
        questionnaire = Questionnaire.objects.get(id=1)

        medical_provider = user.get_medical_provider()

        # TODO (Alda) - revisit logic when there are more visit types
        visit_code = ServiceChoices.initial_visit
        if user.rx_status == User.RxStatus.expired:
            visit_code = ServiceChoices.repeat_visit

        new_visit = Visit.objects.create(
            patient=user, medical_provider=medical_provider, service=visit_code, questionnaire=questionnaire
        )

        new_visit.save()

        logging.debug(f'New Visit: {new_visit}')

        return CreateMedicalVisit(visit=new_visit)

class UpdateMedicalVisitMutation(PhiRelayClientIdMutation):
    class Input:
        id = graphene.String(required=True)
        status = graphene.String(required=False)
        medical_provider_id = graphene.String(required=False)

    visit = graphene.Field(VisitType)
    phi_model = "visit"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        visit = get_object_or_404(Visit, id=input.get('id'))

        logger.debug(f'[UpdateMedicalVisitMutation][mutate_and_get_payload] Visit {visit.id}. '
                     f'Input: {input}')

        status = input.get('status', None)
        if status is not None and status in visit.get_visit_statuses():
            visit.status = status
            visit.save(update_fields=['status'])
            logger.debug(f'[UpdateMedicalVisitMutation][mutate_and_get_payload] Visit {visit.id} updated. '
                         f'New status: {status}')

        medical_provider_id = input.get('medical_provider_id', None)
        if medical_provider_id:
            medical_provider = get_object_or_404(MedicalProviderUser, id=medical_provider_id)
            visit.medical_provider = medical_provider
            visit.save(update_fields=['medical_provider'])
            UpdateMedicalVisitMutation._transfer_fees_to_new_provider(visit)
            logger.debug(f'[UpdateMedicalVisitMutation][mutate_and_get_payload] Visit {visit.id} updated. '
                         f'New medical provider: {medical_provider}')
        return UpdateMedicalVisitMutation(visit=visit)

    @classmethod
    def _transfer_fees_to_new_provider(self, visit):
        try:
            Service().reverse_transfer_fees(visit=visit)
            order = visit.orders.latest('payment_captured_datetime')
            if order:
                Service().transfer_fees(order=order)
        except APIException as error:
            logger.error(f'[UpdateMedicalVisitMutation][_transfer_fees_to_new_provider] '
                         f'Visit {visit.id} failed with error: {error}.')
            raise GraphQLError(f'Medical visit fee transfer failed with error: {error}')

class CreateNoteMutation(PhiRelayClientIdMutation):
    class Input:
        patient_uuid = graphene.String(required=True)
        body = graphene.String(required=True)

    note = graphene.Field(NoteType)
    phi_model = "note"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        patient = User.objects.get(uuid=input['patient_uuid'])
        new_note = Note(patient=patient, creator=info.context.user, body=input['body'])
        new_note.save()
        return CreateNoteMutation(note=new_note)


class InitiatePrescriptionMutation(relay.ClientIDMutation):
    class Input:
        patient_uuid = graphene.String(required=True)

    prescription_url = graphene.Field(graphene.String)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        from emr.services import DoseSpotService
        patient = User.objects.get(uuid=input['patient_uuid'])

        # Push patient data to DoseSpot
        url = DoseSpotService().generate_dosespot_sso_patient_query_url(request=info.context, patient=patient)
        logger.debug(f'[InitiatePrescriptionMutation] url: {url}')

        latest_visit = patient.medical_visit
        if latest_visit:
            latest_visit.status = Visit.Status.pending_prescription
            latest_visit.save(update_fields=['status'])

        return InitiatePrescriptionMutation(prescription_url=url)


class CreateChatMessageMutation(PhiRelayClientIdMutation):
    class Input:
        receiver_uuid = graphene.String(required=True)
        sender_uuid = graphene.String(required=True)
        body = graphene.String(required=True)

    chat_message = graphene.Field(ChatMessageType)
    phi_model = "chat_message"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        receiver_uuid = input.get('receiver_uuid')
        receiver = User.objects.get(uuid=receiver_uuid)
        sender = info.context.user
        body = input.get('body')
        new_chat_message = ChatMessage(receiver=receiver, sender=sender, body=body)
        new_chat_message.save()
        logger.debug(f'[CreateChatMessageMutation][mutate_and_get_payload] Receiver: {receiver.email}. Sender: {sender.email}. Body: {body}.')
        return CreateChatMessageMutation(chat_message=new_chat_message)


class CreateSnippetMutation(PhiRelayClientIdMutation):
    class Input:
        name = graphene.String(required=True)
        body = graphene.String(required=True)

    snippet = graphene.Field(SnippetType)
    phi_model = "snippet"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        new_snippet = Snippet(name=kwargs['name'], body=kwargs['body'])
        new_snippet.save()
        return CreateSnippetMutation(snippet=new_snippet)

class UpdateSnippetMutation(PhiRelayClientIdMutation):
    class Input:
        id = graphene.ID(required=True)
        name = graphene.String()
        body = graphene.String()

    snippet = graphene.Field(SnippetType)
    phi_model = "snippet"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        updated_snippet = Snippet.objects.get(id=from_global_id(kwargs['id'])[1])

        name = kwargs.get('name') or updated_snippet.name
        updated_snippet.name = name

        body = kwargs.get('body') or updated_snippet.body
        updated_snippet.body = body

        updated_snippet.save()
        return UpdateSnippetMutation(snippet=updated_snippet)


class UploadPhoto(relay.ClientIDMutation):
    class Input:
        photo_data = graphene.String()
        photo_type = graphene.String()
        visit = graphene.ID()
        patient = graphene.ID()

    photo = graphene.Field(PhotoType)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):

        visit = get_object_or_404(Visit, uuid=input.get('visit'))
        patient = get_object_or_404(User, pk=input.get('patient'))
        photo_type = input.get('photo_type')
        image_b64 = input.get('photo_file')

        photo = PhotoService().create_photo(image_b64, photo_type, patient, visit)

        return UploadPhoto(photo=photo)


class UpdatePhotoMutation(PhiRelayClientIdMutation):
    class Input:
        id = graphene.String(required=True)
        photo_rejected = graphene.Boolean(required=False)

    photo = graphene.Field(PhotoType)
    phi_model = "photo"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        photo = get_object_or_404(Photo, id=input.get('id'))

        photo_rejected = input.get('photo_rejected')
        if photo_rejected is not None:
            photo.photo_rejected = photo_rejected
            if photo_rejected:
                photo.visit.status = Visit.Status.provider_awaiting_user_input
                photo.visit.save(update_fields=['status'])
            photo.save(update_fields=['photo_rejected'])

        logger.debug(f'[RejectPhotoMutation][mutate_and_get_payload] Photo {photo.id} updated. photo_rejected: {photo_rejected}')
        return UpdatePhotoMutation(photo=photo)


class CreatePrescription(PhiRelayClientIdMutation):
    class Input:
        visit = graphene.ID()
        patient = graphene.ID()

    prescription = graphene.Field(PatientPrescriptionType)
    phi_model = "patient_prescription"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        visit = get_object_or_404(Visit, uuid=input.get('visit'))
        patient = get_object_or_404(User, pk=input.get('patient'))

        pending_patient_prescription = PatientPrescription.objects.filter(status=PatientPrescription.status.initiated)
        patient_prescription = PatientPrescription(patient=patient, medical_provider=visit.medical_provider, visit=visit)

        return CreatePrescription(patient_prescription=patient_prescription)


class CreateFlagMutation(PhiRelayClientIdMutation):
    class Input:
        visit_uuid = graphene.String(required=True)
        body = graphene.String(required=True)

    flag = graphene.Field(FlagType)
    phi_model = "flag"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        creator = info.context.user
        visit = get_object_or_404(Visit, uuid=input.get('visit_uuid'))
        body = input.get('body')
        category = Flag.Category.medical_admin_attention if creator.is_medical_provider else Flag.Category.medical_provider_attention
        new_flag = Flag(creator=creator, visit=visit, body=body, category=category)
        new_flag.save()
        logger.debug(f'[CreateFlagMutation][mutate_and_get_payload] Creator: {creator.email}. Visit: {visit.id}. Body: {body}.')
        return CreateFlagMutation(flag=new_flag)

class UpdateFlagMutation(PhiRelayClientIdMutation):
    class Input:
        id = graphene.String(required=True)

    flag = graphene.Field(FlagType)
    phi_model = "flag"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        flag = get_object_or_404(Flag, id=input.get('id'))
        flag.acknowledged_datetime = timezone.now()
        flag.save(update_fields=['acknowledged_datetime'])
        logger.debug(f'[UpdateFlagMutation][mutate_and_get_payload] acknowledged_datetime: {flag.acknowledged_datetime}.')
        return UpdateFlagMutation(flag=flag)

class UpdateUserDOBMutation(PhiRelayClientIdMutation):
    class Input:
        id = graphene.String(required=True)
        dob = graphene.String(required=True)

    user = graphene.Field(UserType)
    phi_model = "user"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        user = get_object_or_404(User, id=input.get('id'))
        dob = input.get('dob')
        user.dob = datetime.datetime.strptime(dob, "%Y-%m-%d")
        user.save(update_fields=['dob'])
        #logger.debug(f'[UpdateUserDOBMutation][mutate_and_get_payload] dob: {dob}. dob_iso: {user.dob}.')
        return UpdateUserDOBMutation(user=user)


class Mutation(graphene.ObjectType):
    initiate_prescription = InitiatePrescriptionMutation.Field()
    create_chat_message = CreateChatMessageMutation.Field()
    create_flag = CreateFlagMutation.Field()
    create_visit = CreateMedicalVisit.Field()
    create_note = CreateNoteMutation.Field()
    create_snippet = CreateSnippetMutation.Field()
    upload_photo = UploadPhoto.Field()
    update_photo = UpdatePhotoMutation.Field()
    update_flag = UpdateFlagMutation.Field()
    update_snippet = UpdateSnippetMutation.Field()
    update_visit = UpdateMedicalVisitMutation.Field()
    update_user_dob = UpdateUserDOBMutation.Field()