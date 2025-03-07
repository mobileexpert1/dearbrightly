from rest_framework import permissions
from django.conf import settings
from rest_framework.permissions import BasePermission


class Dear_Brightly_API_Key_Auth(BasePermission):
    def has_permission(self, request, view):
        # API_KEY should be in request headers to authenticate requests
        api_key_secret = request.META.get('HTTP_API_KEY')
        return api_key_secret == settings.DEARBRIGHTLY_API_KEY
