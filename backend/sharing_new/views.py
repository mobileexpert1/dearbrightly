from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from sharing_new.serializers import SharingSerializer
from sharing_new.services import SharingService


class SharingAPIView(APIView):
    serializer_class = SharingSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        data = SharingService().get_referral_code(serializer, request.user)
        return Response(
            data=data,
            status=status.HTTP_200_OK,
        )
