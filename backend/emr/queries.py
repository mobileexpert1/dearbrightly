from graphene import relay
import graphene
from graphene_django.filter import DjangoFilterConnectionField

from emr.models import ServiceChoices, Visit
from emr.types import ChatMessageType, FlagType, PatientSearchResult, PharmacyType, \
    PhotoType, PatientPrescriptionType, QuestionnaireType, ServiceChoiceConnection, \
    SnippetType, UserType, VisitSearchResult, VisitStatusConnection, VisitType, MedicalProviderUserType
from emr.filters import ChatMessageFilterSet, FlagFilterSet, NoteFilterSet, \
    PatientPrescriptionFilterSet, QuestionnaireFilterSet, VisitFilterSet, MedicalProviderUserFilterSet

from emr.models import Visit
from users.models import User

from django.db.models import Q

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class Query(object):
    search_visits = relay.ConnectionField(VisitSearchResult, search=graphene.String())
    search_patients = relay.ConnectionField(PatientSearchResult, search=graphene.String())

    visit = relay.Node.Field(VisitType)
    all_visits = DjangoFilterConnectionField(VisitType, filterset_class=VisitFilterSet)
    all_questionnaires = DjangoFilterConnectionField(QuestionnaireType, filterset_class=QuestionnaireFilterSet)
    all_pharmacies = DjangoFilterConnectionField(PharmacyType)
    all_patients = DjangoFilterConnectionField(UserType)
    all_photos = DjangoFilterConnectionField(PhotoType)
    patient = relay.Node.Field(UserType)
    all_messages = DjangoFilterConnectionField(ChatMessageType, filterset_class=ChatMessageFilterSet)
    all_prescriptions = DjangoFilterConnectionField(PatientPrescriptionType, filterset_class=PatientPrescriptionFilterSet)
    all_snippets = DjangoFilterConnectionField(SnippetType)
    all_flags = DjangoFilterConnectionField(FlagType, filterset_class=FlagFilterSet)
    all_medical_providers = DjangoFilterConnectionField(MedicalProviderUserType, filterset_class=MedicalProviderUserFilterSet)

    def resolve_search_visits(self, info, search=None, **kwargs):
        logger.debug(f'[resolve_search_visits] Visit search: {search}')
        if search:
            visit_filter = (
                    Q(id__icontains=search)|
                    Q(patient__first_name__icontains=search)|
                    Q(patient__last_name__icontains=search)|
                    Q(patient__email__icontains=search)
            )
            visits = Visit.objects.filter(visit_filter)

            return visits
        return Visit.objects.none()

    def resolve_search_patients(self, info, search=None, **kwargs):
        logger.debug(f'[resolve_search_patients] Patient search: {search}')
        if search:
            patient_filter = (
                    (Q(first_name__icontains=search) |
                     Q(last_name__icontains=search) |
                     Q(email__icontains=search) |
                     Q(id__icontains=search)) &
                    Q(is_staff=False)
            )
            patients = User.objects.filter(patient_filter)

            return patients
        return Visit.objects.none()

    all_service_choices = relay.ConnectionField(ServiceChoiceConnection)
    all_visit_status_choices = relay.ConnectionField(VisitStatusConnection)

    def resolve_all_service_choices(root, info, **kwargs):
        return ServiceChoices.choices

    def resolve_all_visit_status_choices(root, info, **kwargs):
        return Visit.Status.choices

    def resolve_all_visits(self, info, **kwargs):
       return VisitFilterSet(kwargs).qs

    def resolve_all_medical_providers(self, info, **kwargs):
       return MedicalProviderUserFilterSet(kwargs).qs
