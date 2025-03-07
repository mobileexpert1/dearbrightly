from django.apps import apps
from rest_framework import serializers
from rest_framework.exceptions import APIException, NotAuthenticated
from sharing.models import Sharing
from users.serializers import UserSerializer
from orders.serializers import OrderSerializer
from django.core.exceptions import ValidationError

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

User = apps.get_model('users', 'User')

class SharingSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    code = serializers.CharField(write_only=True)

    class Meta:
        model = Sharing
        fields = (
            'id', 'code', 'entry_point', 'communication_method', 'email_type', 'created_datetime', 'modified_datetime',
            'email_reminder_interval_in_days'
        )

    def create(self, validated_data, context=None):
        logger.debug(f'[SharingSerializer][create] validated_data: {validated_data}. context: {self.context}.')
        code = validated_data.get('code')
        referee = self.context.get('referee')

        if not code:
            raise ValidationError('Code missing.')

        if len(code) < 6:
            raise ValidationError('Invalid code.')

        if not referee:
            raise ValidationError('Referee missing.')

        referrer = Sharing.get_referrer_from_code(code)
        entry_point = Sharing.get_entry_point_from_code(code)
        communication_method = Sharing.get_communication_method_from_code(code)
        email_type = Sharing.get_email_type_from_code(code)
        email_reminder_interval_in_days = Sharing.get_email_reminder_interval_in_days_from_code(code)

        logger.debug(f'[SharingSerializer][create] validated_data: {validated_data}. '
                     f'code: {code}. referee: {referee}. referrer: {referrer}. entry_point: {entry_point}. '
                     f'communication_method: {communication_method}. '
                     f'email_type: {email_type}. email_reminder_interval_in_days:{email_reminder_interval_in_days}.')

        share = Sharing.objects.create(referrer=referrer,
                                       referee=referee,
                                       entry_point=entry_point,
                                       communication_method=communication_method,
                                       email_type=email_type,
                                       email_reminder_interval_in_days=email_reminder_interval_in_days)
        share.save()
        logger.debug(f'[SharingSerializer][create] New share object created: {share}')
        return share

    def update(self, instance, validated_data):
        from orders.models import Order
        from users.models import User

        referrer_uuid = validated_data.pop('referrer_uuid') if validated_data.get('referrer_uuid') else None
        referee_uuid = validated_data.pop('referee_uuid') if validated_data.get('referee_uuid') else None
        order_uuid = validated_data.pop('order_uuid') if validated_data.get('order_uuid') else None

        if referrer_uuid:
            try:
                referrer = User.objects.get(uuid=referrer_uuid)
                instance.referrer = referrer
            except User.DoesNotExist:
                error_msg = f'[SharingSerializer][create] Referrer {referrer_uuid} does not exist'
                logger.error(error_msg)

        if referee_uuid:
            try:
                referee = User.objects.get(uuid=referee_uuid)
                instance.referee = referee
            except User.DoesNotExist:
                error_msg = f'[SharingSerializer][create] Referee {referee_uuid} does not exist'
                logger.error(error_msg)

        if order_uuid:
            try:
                order = Order.objects.get(uuid=order_uuid)
                instance.order = order
            except Order.DoesNotExist:
                error_msg = f'[SharingSerializer][create] Order {order_uuid} does not exist'
                logger.error(error_msg)

        updated_instance = super().update(instance, validated_data)
        logger.debug(f'[SharingSerializer][create] Share object updated: {updated_instance}')

        return updated_instance
