import logging

import graphene
from django.apps import apps
from django.db.models import Q
from django.db.models import Count
from django.utils import timezone
from graphene import Connection
from graphene import String
from graphene import relay
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType

from emr.filters import ChatMessageFilterSet, FlagFilterSet, NoteFilterSet, VisitFilterSet, PatientVisitFilterSet
from emr.models import ChatMessage
from emr.models import Flag
from emr.models import Note
from emr.models import PatientPrescription
from emr.models import Pharmacy
from emr.models import Prescription
from emr.models import Questionnaire
from emr.models import QuestionnaireAnswers
from emr.models import Snippet
from emr.models import Photo


import logging
from emr.models import Visit
from utils.phi_utils import PhiObjectMixin, phi_data_resolver, phi_data_logger

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

User = apps.get_model('users', 'User')
MedicalProviderUser = apps.get_model('users', 'MedicalProviderUser')
ShippingDetails = apps.get_model('users', 'ShippingDetails')


class PhotoType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['patient', 'photo_file', 'visit']
    photo_data = String()
    photo_id = String()

    class Meta:
        model = Photo
        default_resolver = phi_data_resolver
        filter_fields = ('id',)
        interfaces = (relay.Node,)

    @phi_data_logger
    def resolve_photo_file(self, info):
        return self.photo_file.url

    def resolve_photo_id(parent, info):
        return str(parent.id)


class PhotoConnection(Connection):
    class Meta:
        node = PhotoType


class PaginatedConnection(Connection):
    class Meta:
        abstract = True

    total_count = graphene.Int()
    edge_count = graphene.Int()

    def resolve_total_count(root, info, **kwargs):
        return root.length

    def resolve_edge_count(root, info, **kwargs):
        return len(root.edges)


class ServiceChoiceType(graphene.ObjectType):
    value = graphene.String()

    def resolve_value(parent, info):
        return parent[0]


class ServiceChoiceConnection(Connection):
    class Meta:
        node = ServiceChoiceType


class VisitStatusChoiceType(graphene.ObjectType):
    value = graphene.String()

    def resolve_value(parent, info):
        return parent[0]


class VisitStatusConnection(Connection):
    class Meta:
        node = VisitStatusChoiceType


class ShippingDetailsType(DjangoObjectType):
    class Meta:
        model = ShippingDetails
        exclude_fields = ('first_name', 'last_name')
        interfaces = (relay.Node,)

class FlagType(DjangoObjectType):
    phi_fields = ['creator', 'created_datetime', 'body', 'visit', 'acknowledged_datetime', 'category']
    flag_id = String()

    class Meta:
        model = Flag
        default_resolver = phi_data_resolver
        filter_fields = ('creator', 'visit')
        interfaces = (relay.Node,)

    def resolve_flag_id(parent, info):
        return str(parent.id)


class FlagConnection(Connection):
    class Meta:
        node = FlagType

    # @classmethod
    # def get_query(cls, model, info, sort=None, **args):
    #     query = get_query(model, info.context)
    #     query.filter(acknowledged_datetime__isnull=True).order_by('created_datetime')
    #     return query

class VisitType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['patient', 'medical_provider', 'skin_profile_status', 'status', 'questionnaire', 'questionnaire_answers', 'photos']

    visit_photos = relay.ConnectionField(PhotoConnection)
    visit_id = String()

    #all_flags = DjangoFilterConnectionField(FlagType, filterset_class=FlagFilterSet)
    all_flags = relay.ConnectionField(FlagConnection)

    class Meta:
        model = Visit
        default_resolver = phi_data_resolver
        only_fields = (
            'id',
            'uuid',
            'service',
            'skin_profile_status',
            'status',
            'patient',
            'created_datetime',
            'questionnaire',
            'questionnaire_answers',
            'photos',
            'medical_provider'
        )
        interfaces = (relay.Node,)
        connection_class = PaginatedConnection

    def resolve_visit_id(parent, info):
        return str(parent.id)

    def resolve_visit_photos(parent, info):
        front_face_photos = Photo.objects.filter(Q(visit=parent) & Q(photo_type=Photo.PhotoType.front_face))
        right_face_photos = Photo.objects.filter(Q(visit=parent) & Q(photo_type=Photo.PhotoType.right_face))
        left_face_photos = Photo.objects.filter(Q(visit=parent) & Q(photo_type=Photo.PhotoType.left_face))
        id_photos = Photo.objects.filter(Q(visit=parent) & Q(photo_type=Photo.PhotoType.photo_id))


        photo_pks = set()
        latest_front_face_photo = front_face_photos.latest('created_datetime') if front_face_photos else None
        if latest_front_face_photo:
            photo_pks.add(latest_front_face_photo.id)
        latest_right_face_photo = right_face_photos.latest('created_datetime') if right_face_photos else None
        if latest_right_face_photo:
            photo_pks.add(latest_right_face_photo.id)
        latest_left_face_photo = left_face_photos.latest('created_datetime') if left_face_photos else None
        if latest_left_face_photo:
            photo_pks.add(latest_left_face_photo.id)
        latest_id_photo = id_photos.latest('created_datetime') if id_photos else None
        if latest_id_photo:
            photo_pks.add(latest_id_photo.id)

        all_photos = Photo.objects.none()
        if len(photo_pks) > 0:
            all_photos = Photo.objects.filter(pk__in=photo_pks)

        logger.debug(f'[resolve_visit_photos] all_photos: {all_photos}')

        return all_photos

    def resolve_all_flags(parent, info):
        if info.context.user.is_medical_provider:
            all_flags = parent.flags.filter(Q(acknowledged_datetime__isnull=True) &
                                            ~Q(category=Flag.Category.require_medical_admin_update)).order_by('created_datetime')
        else:
            all_flags = parent.flags.filter(acknowledged_datetime__isnull=True).order_by('created_datetime')
        return all_flags


class QuestionnaireType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['questions', 'description', 'name']

    class Meta:
        model = Questionnaire
        default_resolver = phi_data_resolver
        interfaces = (relay.Node,)


class QuestionnaireAnswersType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['patient', 'questionnaire', 'answers', 'created_datetime', 'last_modified_datetime']

    class Meta:
        model = QuestionnaireAnswers
        default_resolver = phi_data_resolver
        interfaces = (relay.Node,)


class PharmacyType(DjangoObjectType, PhiObjectMixin):
    class Meta:
        model = Pharmacy
        filter_fields = ('id',)
        interfaces = (relay.Node,)
        default_resolver = phi_data_resolver


class PrescriptionType(DjangoObjectType):

    dispense_unit = String()
    resource_type = String()
    prescription_type = String()

    class Meta:
        model = Prescription
        filter_fields = ('id',)
        interfaces = (relay.Node,)

    def resolve_dispense_unit(parent, info):
        return parent.dispense_unit

    def resolve_resource_type(parent, info):
        return parent.resource_type

    def resolve_prescription_type(parent, info):
        return parent.prescription_type


class PatientPrescriptionType(DjangoObjectType, PhiObjectMixin):
    phi_fields = [
        'patient',
        'prescription',
        'medical_provider',
        'pharmacy',
        'visit',
        'prescribed_datetime',
        'dosespot_id',
        'pharmacy_notes',
        'status'
    ]

    class Meta:
        model = PatientPrescription
        default_resolver = phi_data_resolver
        interfaces = (relay.Node,)


class PatientPrescriptionConnection(Connection):
    class Meta:
        node = PatientPrescriptionType


class NoteType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['patient', 'created_datetime', 'last_modified_datetime', 'creator', 'body']

    class Meta:
        model = Note
        default_resolver = phi_data_resolver
        interfaces = (relay.Node,)


class ChatMessageType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ['sender', 'created_datetime', 'last_modified_datetime', 'body', 'receiver', 'read_datetime']

    class Meta:
        model = ChatMessage
        default_resolver = phi_data_resolver
        filter_fields = ('sender',)
        interfaces = (relay.Node,)


class ChatMessagesConnection(Connection):
    class Meta:
        node = ChatMessageType


class SnippetType(DjangoObjectType):
    class Meta:
        model = Snippet
        filter_fields = ('id',)
        interfaces = (relay.Node,)

# TODO: Move to users app?
class UserType(DjangoObjectType, PhiObjectMixin):
    phi_fields = [
        'email',
        'dob',
        'first_name',
        'last_name',
        'full_name',
        'gender',
        'shipping_details',
        'prescriptions',
        'medical_notes',
        'medical_messages',
        'patient_visits',
    ]

    medical_notes = DjangoFilterConnectionField(NoteType, filterset_class=NoteFilterSet)
    medical_messages = DjangoFilterConnectionField(ChatMessageType, filterset_class=ChatMessageFilterSet)
    patient_visits = DjangoFilterConnectionField(VisitType, filterset_class=PatientVisitFilterSet)

    full_name = String()
    user_id = String()
    profile_photo_file = String()

    all_chat_messages = relay.ConnectionField(ChatMessagesConnection)
    all_prescriptions = relay.ConnectionField(PatientPrescriptionConnection)

    #dosespot_sso_query_url = String()

    class Meta:
        model = User
        default_resolver = phi_data_resolver
        only_fields = (
            'id',
            'uuid',
            'email',
            'dob',
            'first_name',
            'last_name',
            'gender',
            'shipping_details',
            'prescriptions',
            'medical_notes',
            'medical_messages',
            'patient_visits',
        )
        filter_fields = ('id', 'uuid', 'email', 'first_name', 'last_name')
        interfaces = (relay.Node,)

    def resolve_user_id(parent, info):
        return str(parent.id)

    @phi_data_logger
    def resolve_full_name(parent, info):
        return parent.get_full_name()

    def resolve_profile_photo_file(parent, info):
        profile_photo_file = None
        if parent.is_medical_provider:
            medical_provider = MedicalProviderUser.objects.get(id=parent.pk)
            profile_photo_file = medical_provider.profile_photo_file
        return profile_photo_file

    def resolve_all_chat_messages(parent, info):
        all_messages = ChatMessage.objects.filter(Q(sender=parent) | Q(receiver=parent)).order_by('created_datetime')
        # update read datetime
        all_messages.filter(Q(read_datetime__isnull=True) & Q(receiver=info.context.user)).update(
            read_datetime=timezone.now()
        )
        #logger.debug(f'[resolve_all_chat_messages] all_messages: {all_messages}.')
        return all_messages

    @phi_data_logger
    def resolve_all_prescriptions(parent, info):
        prescriptions = PatientPrescription.objects.filter(Q(patient=parent) & ~Q(status=PatientPrescription.Status.deleted)).order_by('-prescribed_datetime')
        #logger.debug(f'[resolve_all_prescriptions] Parent: {parent.id}. Prescriptions: {prescriptions}')
        return prescriptions

    # def resolve_dosespot_sso_query_url(parent, info):
    #     from emr.services import DoseSpotService
    #     return DoseSpotService().generate_dosespot_sso_patient_query_url(request=info.context,
    #                                                                      patient=parent)

    # Need to annotate this to avoid query bug when viewing patient details
    # graphql.error.located_error.GraphQLLocatedError: Cannot resolve keyword 'flag_count' into field
    def resolve_patient_visits(self, info, **kwargs):
        flag_count = Count('flags', filter=Q(flags__acknowledged_datetime__isnull=True))
        annotated_qs = self.patient_visits.annotate(flag_count=flag_count)
        sorted_annotated_qs = annotated_qs.order_by('-flag_count', 'created_datetime')

        logger.debug(f'[resolve_patient_visits] visits: {sorted_annotated_qs}')

        return sorted_annotated_qs

class MedicalProviderUserType(DjangoObjectType, PhiObjectMixin):
    phi_fields = [
        'email',
        'dob',
        'first_name',
        'last_name',
        'full_name',
        'gender',
        'shipping_details',
    ]
    id = graphene.ID(source='pk', required=True)
    full_name = String()
    profile_photo_file = String()

    class Meta:
        model = MedicalProviderUser
        only_fields = (
            'id',
            'uuid',
            'email',
            'dob',
            'first_name',
            'last_name',
            'gender',
            'shipping_details',
            'full_name'
        )
        interfaces = (relay.Node,)

    @phi_data_logger
    def resolve_full_name(parent, info):
        return parent.get_full_name()

    def resolve_profile_photo_file(parent, info):
        return parent.profile_photo_file


class VisitSearchResult(graphene.Connection):
    class Meta:
        node = VisitType

class PatientSearchResult(graphene.Connection):
    class Meta:
        node = UserType

