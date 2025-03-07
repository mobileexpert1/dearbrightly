from django.conf import settings
from rest_framework.permissions import BasePermission


class DearBrightlyAPIKeyAuth(BasePermission):
    def has_permission(self, request, view):
        return request.META.get("HTTP_API_KEY") == settings.DEARBRIGHTLY_API_KEY
