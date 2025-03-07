import django_filters

from django.db.models import Q
from django.db.models import Count

from emr.models import ChatMessage
from emr.models import Flag
from emr.models import Note
from emr.models import Photo
from emr.models import Questionnaire
from emr.models import Visit
from emr.models import PatientPrescription
from users.models import MedicalProviderUser

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class PatientPrescriptionFilterSet(django_filters.FilterSet):
    class Meta:
        model = PatientPrescription
        fields = ['prescribed_datetime']

    order_by = django_filters.OrderingFilter(fields=(('-prescribed_datetime'),))

    @property
    def qs(self):
        parent = super(PatientPrescriptionFilterSet, self).qs.\
            filter(~Q(status=PatientPrescription.Status.deleted)).\
            order_by('-prescribed_datetime')
        #logger.debug(f'[PatientPrescriptionFilterSet] qs: {PatientPrescriptionFilterSet}')
        return parent

class ChatMessageFilterSet(django_filters.FilterSet):
    class Meta:
        model = ChatMessage
        fields = ['created_datetime', 'sender', 'receiver']

    order_by = django_filters.OrderingFilter(fields=(('created_datetime'),))


class NoteFilterSet(django_filters.FilterSet):
    class Meta:
        model = Note
        fields = ['created_datetime']

    order_by = django_filters.OrderingFilter(fields=(('-created_datetime'),))

    @property
    def qs(self):
        parent = super(NoteFilterSet, self).qs.order_by('-created_datetime')
        return parent

class QuestionnaireFilterSet(django_filters.FilterSet):
    class Meta:
        model = Questionnaire
        fields = ['created_datetime']

    order_by = django_filters.OrderingFilter(fields=(('created_datetime')))


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class VisitFilterSet(django_filters.FilterSet):

    created = django_filters.DateFromToRangeFilter(field_name='created_datetime')

    patient_uuid = django_filters.UUIDFilter(field_name='patient__uuid', lookup_expr='exact')
    patient_email = django_filters.CharFilter(field_name='patient__email', lookup_expr='icontains')
    patient_first_name = django_filters.CharFilter(field_name='patient__first_name', lookup_expr='icontains')
    patient_last_name = django_filters.CharFilter(field_name='patient__last_name', lookup_expr='icontains')
    state = CharInFilter(field_name='patient__shipping_details__state', lookup_expr='in')

    provider_uuid = django_filters.UUIDFilter(field_name='provider__uuid', lookup_expr='exact')

    service = CharInFilter(field_name='service', lookup_expr='in')
    status = CharInFilter(field_name='status', lookup_expr='in')

    class Meta:
        model = Visit
        fields = [
            'patient_uuid',
            'patient_email',
            'patient_id',
            'patient_first_name',
            'patient_last_name',
            'medical_provider_id',
            'provider_uuid',
            'state',
            'service',
            'status',
        ]

    order_by = django_filters.OrderingFilter(fields=(('created_datetime'),))

    @property
    def qs(self):
        parent = super(VisitFilterSet, self).qs
        user = getattr(self.request, 'user', None)

        if not user:
            return None

        if user.is_medical_provider:
            visits_assigned_to_medical_provider = parent.filter(medical_provider=user)
            flagged_visits = Visit.objects.filter(Q(flags__isnull=False) &
                                                  Q(flags__acknowledged_datetime__isnull=True) &
                                                  Q(medical_provider=user) &
                                                  ~Q(flags__category=Flag.Category.medical_admin_attention) &
                                                  ~Q(flags__category=Flag.Category.require_medical_admin_update))

            logger.debug(f'[VisitFilterSet] '
                         f'visits_assigned_to_medical_provider: {visits_assigned_to_medical_provider}. '
                         f'flagged_visits: {flagged_visits}.')
        elif user.is_medical_admin:
            visits_assigned_to_medical_provider = parent
            flagged_visits = Visit.objects.filter(Q(flags__isnull=False) & Q(flags__acknowledged_datetime__isnull=True))
        else:
            visits_assigned_to_medical_provider = parent.filter(patient=user)
            flagged_visits = Visit.objects.filter(Q(flags__isnull=False) & Q(flags__acknowledged_datetime__isnull=True) & Q(patient=user))

        flagged_filtered_visits_qs = (flagged_visits | visits_assigned_to_medical_provider).distinct()

        if user.is_medical_provider:
            flag_count = Count('flags', filter=(Q(flags__acknowledged_datetime__isnull=True) &
                                                ~Q(flags__category=Flag.Category.medical_admin_attention) &
                                                ~Q(flags__category=Flag.Category.require_medical_admin_update)
                                                ))
        else:
            flag_count = Count('flags', filter=Q(flags__acknowledged_datetime__isnull=True))
        annotated_qs = flagged_filtered_visits_qs.annotate(flag_count=flag_count)
        sorted_annotated_qs = annotated_qs.order_by('-flag_count', 'created_datetime')

        logger.debug(
            f'[visit qs] flagged & filtered visits: {sorted_annotated_qs}')

        return sorted_annotated_qs

class PatientVisitFilterSet(django_filters.FilterSet):

    created = django_filters.DateFromToRangeFilter(field_name='created_datetime')

    patient_uuid = django_filters.UUIDFilter(field_name='patient__uuid', lookup_expr='exact')
    patient_email = django_filters.CharFilter(field_name='patient__email', lookup_expr='icontains')
    patient_first_name = django_filters.CharFilter(field_name='patient__first_name', lookup_expr='icontains')
    patient_last_name = django_filters.CharFilter(field_name='patient__last_name', lookup_expr='icontains')

    class Meta:
        model = Visit
        fields = [
            'patient_uuid',
            'patient_email',
            'patient_id',
            'patient_first_name',
            'patient_last_name',
        ]

    order_by = django_filters.OrderingFilter(fields=(('created_datetime'),))


class PhotoFilterSet(django_filters.FilterSet):
    patient_uuid = django_filters.UUIDFilter(field_name='patient__uuid', lookup_expr='exact')
    visit_uuid = django_filters.UUIDFilter(field_name='visit__uuid', lookup_expr='exact')

    class Meta:
        model = Photo
        fields = ['patient__id', 'patient__uuid', 'visit__id', 'visit__uuid']


class FlagFilterSet(django_filters.FilterSet):
    class Meta:
        model = Flag
        fields = ['creator', 'created_datetime', 'visit']

    order_by = django_filters.OrderingFilter(fields=(('created_datetime'),))

    @property
    def qs(self):
        parent = super(FlagFilterSet, self).qs.filter(acknowledged_datetime__isnull=True).order_by('created_datetime')
        return parent

class MedicalProviderUserFilterSet(django_filters.FilterSet):
    class Meta:
        model = MedicalProviderUser
        fields = ['id', 'email', 'first_name', 'last_name']

    @property
    def qs(self):
        parent = super(MedicalProviderUserFilterSet, self).qs.filter(is_active=True).order_by('last_name')
        logger.debug(f'[MedicalProviderUserFilterSet] parent: {parent}')
        return parent