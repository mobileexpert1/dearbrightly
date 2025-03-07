from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ViewSet

from authentication.services.authentication_service import AuthenticationService

class AuthenticationViewSet(ViewSet):
    permission_classes = (AllowAny,)

    @action(methods=('post',), detail=False)
    def register(self, request):
        return AuthenticationService().register_user(request)

    @action(methods=('post',), detail=False)
    def login(self, request):
        return AuthenticationService().login_user(request)

    @action(methods=('post',), detail=False)
    def logout(self, request):
        return AuthenticationService().logout_user(request)

    @action(methods=('post',), detail=False)
    def facebook(self, request):
        return AuthenticationService().facebook_authentication(request)

    @action(methods=('post',), detail=False, permission_classes=(IsAuthenticated,))
    def validate_otp(self, request):
        return AuthenticationService().validate_otp(request)

    @action(methods=('get',), detail=False, permission_classes=(IsAuthenticated,))
    def get_2fa_setup_code(self, request):
        return AuthenticationService().get_2fa_setup_code(request)

    @action(methods=('post',), detail=False, permission_classes=(IsAuthenticated,))
    def confirm_2fa(self, request):
        return AuthenticationService().confirm_2fa_activation(request)

    @action(methods=('post',), detail=False, permission_classes=(IsAuthenticated,))
    def disable_2fa(self, request):
        return AuthenticationService().disable_2fa(request)

    @action(methods=('post',), detail=False, permission_classes=(IsAuthenticated,))
    def toggle_otp_timeout(self, request):
        return AuthenticationService().toggle_otp_timeout(request)

    @action(methods=('get',), detail=False)
    def open_browser(self, request):
        return AuthenticationService().open_browser(request)
