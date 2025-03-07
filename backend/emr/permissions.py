from django.conf import settings
from rest_framework.permissions import BasePermission
from emr.models import Visit
from django.shortcuts import get_object_or_404
import uuid

# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.DEBUG)
# logger = logging.getLogger(__name__)


class IsMedicalAdminOrMedicalProviderOrPatient(BasePermission):
    def has_permission(self, request, view):
        #logger.debug(f'[emr][IsMedicalAdminOrMedicalProviderOrPatient][has_permission] request: {request.user}.')
        return request.user and request.user.is_authenticated

    # called at retrieve, destroy, partial_update, update
    def has_object_permission(self, request, view, obj):
        #logger.debug(f'[emr][IsMedicalAdminOrMedicalProviderOrPatient][has_object_permission] request: {request.user.uuid}. obj: {obj.patient.uuid}.')
        return (
            request.user.uuid == obj.patient.uuid or request.user.is_medical_provider or request.user.is_medical_admin
        )

class IsPatientWithVisitUuidCheck(BasePermission):
    def has_permission(self, request, view):
        kwargs = view.kwargs
        kwargs_visit_uuid = kwargs.get('uuid') if kwargs else None

        if not kwargs_visit_uuid:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(
            #     f'[emr][IsPatientWithVisitUuidCheck][has_permission] request: {request.user}. kwargs: {kwargs}. kwargs_visit_uuid: {kwargs_visit_uuid.__class__}.')
            visit = get_object_or_404(Visit, uuid=uuid.UUID(kwargs_visit_uuid))
            # logger.debug(
            #     f'[emr][IsPatientWithVisitUuidCheck][has_permission] visit patient: {visit.patient}.')
            return visit.patient == request.user

        else:
            return False

class IsAdminOrPatientWithVisitUuidCheck(BasePermission):
    def has_permission(self, request, view):
        kwargs = view.kwargs
        kwargs_uuid = kwargs.get('user_uuid') if kwargs else None

        if not kwargs_uuid:
            return False

        if request.user and request.user.is_authenticated:
            # logger.debug(
            #     f'[emr][IsAdminOrPatientWithVisitUuidCheck][has_permission] request: {request.user.uuid}. kwargs: {kwargs}. kwargs_uuid: {kwargs_uuid}.')
            if request.user.is_superuser:
                return True
            return kwargs_uuid == request.user.uuid
        else:
            return False

class Curexa_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        return api_key_secret == settings.DEARBRIGHTLY_CUREXA_API_KEY

class Dear_Brightly_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        return api_key_secret == settings.DEARBRIGHTLY_API_KEY