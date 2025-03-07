from rest_framework import status
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings

from django.conf import settings
from users.serializers import UserSerializer


def jwt_response_payload_handler(token, user=None, request=None):
    return {
        'token': token,
        'user': UserSerializer(user, context={'request': request}).data
    }


class JWTService:
    @staticmethod
    def generate_token(user):
        payload = api_settings.JWT_PAYLOAD_HANDLER(user)
        return api_settings.JWT_ENCODE_HANDLER(payload)

    def obtain_and_set_to_cookie_jwt_token(self, request, user):
        user_data = UserSerializer(user).data

        token = self.generate_token(user)
        response = Response(data=user_data, status=status.HTTP_200_OK)
        response.set_cookie(
            key=settings.JWT_AUTH_COOKIE, value=token, expires=settings.JWT_EXPIRATION_DELTA.total_seconds(),
            httponly=True, secure=not settings.DEBUG
        )

        if request.resolver_match.func.__name__ == 'register_user':
            request.session['user_token'] = token

        return response