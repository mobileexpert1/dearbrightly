from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAdminUser

from users_new.serializers import LoginAsUserSerializer
from users_new.services.admin_service import AdminService


class LoginAsUserAPIView(GenericAPIView):
    permission_classes = (IsAdminUser,)
    serializer_class = LoginAsUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return AdminService.login_as_user(
            request=request, email=serializer.validated_data.get("email")
        )
