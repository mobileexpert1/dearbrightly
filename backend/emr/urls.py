from django.urls import include, path
from django.conf import settings

from rest_framework.routers import DefaultRouter

from emr.views import (
    get_pending,
    get_pending_or_create,
    QuestionnaireViewSet,
    VisitViewSet,
    generate_dosespot_access_token,
    encrypt_keys,
    notifications_counts,
    webhook_handler,
    create_curexa_order,
    remove_visit_data,
    update_patients_prescriptions,
    update_patients_prescriptions_no_payment_trigger,
    patch_medical_provider_messages
)

app_name = 'emr'

router = DefaultRouter(trailing_slash=False)
#router.register('emr/questionnaire-answers', QuestionnaireAnswersViewSet, base_name='questionnaire_answers')
router.register('emr/questionnaire', QuestionnaireViewSet, base_name='questionnaire')
router.register('emr/visits', VisitViewSet, base_name='visits')
#router.register('emr/photos', PhotoViewSet, base_name='photo')
#router.register('emr/patient-prescriptions', PatientPrescriptionViewSet, base_name='patient_prescription')

urlpatterns = [
    path('emr/curexa/webhook_handler', webhook_handler, name='curexa_webhook_handler'),
    path('emr/curexa/test_order_creation', create_curexa_order, name='create_curexa_order'),
    path('emr/visits/<uuid:visit_uuid>/remove_visit_data', remove_visit_data, name='remove_visit_data'),
    path('emr/dosespot/update_patients_prescriptions', update_patients_prescriptions, name='update_patients_prescriptions'),
    path('emr/dosespot/update_patients_prescriptions_no_payment_trigger', update_patients_prescriptions_no_payment_trigger, name='update_patients_prescriptions_no_payment_trigger'),
    path('customers/<uuid:user_uuid>/visits/get_pending', get_pending, name='get_pending'),
    path('customers/<uuid:user_uuid>/visits/get_pending_or_create', get_pending_or_create, name='get_pending_or_create'),
    path('emr/patch_medical_provider_messages', patch_medical_provider_messages,
                       name='patch_medical_provider_messages'),

] + router.urls

if settings.DEBUG:
    # Need these endpoints for debugging only
    debug_urlpatterns = [
        path('emr/dosespot/access_token', generate_dosespot_access_token, name='dosespot_access_token'),
        path('emr/dosespot/encrypt_keys', encrypt_keys, name='encrypt_keys'),
        path('emr/dosespot/notifications_counts', notifications_counts, name='notifications_counts'),
    ]
    urlpatterns = urlpatterns + debug_urlpatterns
