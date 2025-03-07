from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import viewsets, status
from mixins.bulk_delete_mixin import ListDestroyMixin
from rest_framework.permissions import AllowAny, IsAuthenticated
from sharing.serializers import SharingSerializer
from sharing.models import Sharing
from rest_framework.exceptions import APIException, ValidationError

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class SharingViewSet(viewsets.ModelViewSet, ListDestroyMixin):
    queryset = Sharing.objects.all()
    serializer_class = SharingSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = 'code'

    @action(detail=False, methods=['post'], permission_classes=(AllowAny,))
    def get_referral_code(self, request):
        from users.models import User
        try:
            entry_point = request.data.get('entry_point', None)
            communication_method = request.data.get('communication_method', None)
            email_type = request.data.get('email_type', None)
            email_reminder_interval_in_days = request.data.get('email_reminder_interval_in_days', None)
            email = request.data.get('referrer_email', None)
            referrer = request.user if not request.user.is_anonymous else None
            if not referrer and email:
                try:
                    referrer = User.objects.get(email=email)
                except User.DoesNotExist:
                    logger.error(f'[get_referral_code] User with email {email} does not exist.')


            logger.debug(f'[SharingViewSet][referral_code] request: {request.data}. referrer: {referrer}. entry_point: {entry_point}. '
                         f'communication_method: {communication_method}. email_type: {email_type}. '
                         f'email_reminder_interval_in_days: {email_reminder_interval_in_days}.')

            code = Sharing.get_code(referrer=referrer,
                                    entry_point=entry_point,
                                    communication_method=communication_method,
                                    email_type=email_type,
                                    email_reminder_interval_in_days=email_reminder_interval_in_days)

            return Response(data={'communication_method': communication_method, 'code': code},
                            status=status.HTTP_200_OK)
        except ValidationError as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)
        except APIException as error:
            return Response(data={'detail': error.detail},
                            status=status.HTTP_400_BAD_REQUEST)