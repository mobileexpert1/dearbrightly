from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from emr.permissions import Dear_Brightly_API_Key_Auth
from emr_new.serializers import (
    SendReplacementOrderSerializer, 
    UserAllergySearchSerializer,
)
from emr_new.services.curexa_service import CurexaService
from orders.models import Order
from emr_new.tasks import find_users_potentially_allergic_to_ingredient
from emr.models import QuestionnaireAnswers

class UserAllergySearchView(GenericAPIView):
    permission_classes = (Dear_Brightly_API_Key_Auth,)
    serializer_class = UserAllergySearchSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        find_users_potentially_allergic_to_ingredient.delay(
            serializer.validated_data["ingredient"],
            serializer.validated_data["exact_match_only"],
            serializer.validated_data["email"]
        )
        return Response(status=status.HTTP_200_OK)

class CurexaSendReplacementOrder(GenericAPIView):
    permission_classes = (Dear_Brightly_API_Key_Auth,)
    serializer_class = SendReplacementOrderSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        CurexaService().create_curexa_order(
            order=get_object_or_404(
                Order, id=serializer.validated_data.get("order_id")
            ),
            replacement_data={
                "replacement_reason": serializer.validated_data.get(
                    "replacement_reason"
                ),
                "replacement_responsible_party": serializer.validated_data.get(
                    "replacement_responsible_party"
                ),
            },
        )
        return Response(data={"status": "success"}, status=status.HTTP_200_OK)
        