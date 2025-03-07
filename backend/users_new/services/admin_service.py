from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response

from authentication.services.jwt_service import JWTService
from users.models import User
from utils.logger_utils import logger


class AdminService:
    @classmethod
    def login_as_user(cls, request: Request, email: str) -> Response:
        user = get_object_or_404(User, email=email)
        login(
            request=request,
            user=user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        logger.debug(f"[AdminService][login_as_user] Admin logged in as user: {email}")
        return JWTService().obtain_and_set_to_cookie_jwt_token(
            request=request, user=user
        )
