from django.apps import apps
from django.db import models
from mail.constants import EmailType
from django.utils.translation import ugettext_lazy as _
from djchoices import DjangoChoices, ChoiceItem
from datetime import datetime
from django.utils import timezone

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class Sharing(models.Model):

    # Entry Point from which referrer clicked to open the Sharing Page View
    class EntryPoint(DjangoChoices):
        unknown = ChoiceItem(0, 'unknown')
        order_confirmation = ChoiceItem(1, 'order confirmation')
        navigation_bar = ChoiceItem(2, 'navigation bar')
        email = ChoiceItem(3, 'email')

    # Method which the referrer sent the share to the referee
    class CommunicationMethod(DjangoChoices):
        unknown = ChoiceItem(0, 'unknown')
        fb_messenger = ChoiceItem(1, 'fb messenger')
        email = ChoiceItem(2, 'email')
        copy_text = ChoiceItem(3, 'copy')
        whatsapp = ChoiceItem(4, 'whatsapp')
        more = ChoiceItem(5, 'more')

    referrer = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='referrer_sharings', null=True, blank=True)
    referee = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='referee_sharings', null=True, blank=True)
    order = models.ForeignKey('orders.Order', on_delete=models.PROTECT, related_name='sharings', null=True, blank=True)

    communication_method = models.IntegerField(_('communication method'), default=CommunicationMethod.unknown, choices=CommunicationMethod.choices)
    entry_point = models.IntegerField(_('entry_point'), default=EntryPoint.unknown, choices=EntryPoint.choices)
    email_type = models.IntegerField(_('email type'), default=EmailType.none, choices=EmailType.choices)
    email_reminder_interval_in_days = models.IntegerField(_('email reminder interval in days'), default=0)

    created_datetime = models.DateTimeField(_('created datetime'), default=timezone.now)
    modified_datetime = models.DateTimeField(_('modified datetime'), default=timezone.now)

    def save(self, *args, **kwargs):
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'Referrer: {self.referrer}. Referee: {self.referee}. Order: {self.order}. Communication Method: {self.communication_method}. ' \
            f'Entry Point: {self.entry_point}. Email Type: {self.email_type}. Email Reminder Interval in Days: {self.email_reminder_interval_in_days}. ' \
            f'Created datetime: {self.created_datetime}. Last modified datetime: {self.modified_datetime}'

    @staticmethod
    def get_code(referrer, entry_point=None, communication_method=None, email_type=None, email_reminder_interval_in_days=None):
        # Sharing Code [max 40] | Entry point [1] | Communication Method [1] | Email Type [2] | Interval in Days [2]

        entry_point = entry_point if entry_point else '0'
        communication_method = communication_method if communication_method else '0'
        email_type = email_type if email_type else '00'
        email_reminder_interval_in_days = email_reminder_interval_in_days if email_reminder_interval_in_days else '00'

        logger.debug(f'[Sharing][get_code] referrer: {referrer}. entry_point: {entry_point}. '
                     f'communication_method: {communication_method}. email_type: {email_type}. '
                     f'email_reminder_interval_in_days: {email_reminder_interval_in_days}.')

        referrer_sharing_code = ''
        if referrer:
            if not referrer.sharing_code:
                referrer.set_sharing_code()
            referrer_sharing_code = referrer.sharing_code

        sharing_code = f'{referrer_sharing_code}{entry_point}{communication_method}{email_type}{email_reminder_interval_in_days}'
        logger.debug(f'[Sharing][get_code] Sharing code: {sharing_code}.')
        return sharing_code

    @staticmethod
    def get_referrer_from_code(code):
        from users.models import User
        referrer_sharing_code = code[:-6]
        logger.debug(f'[Sharing][get_referrer_from_code] referrer_sharing_code: {referrer_sharing_code}.')
        try:
            referrer = User.objects.get(sharing_code=referrer_sharing_code)
            logger.debug(f'[Sharing][get_referrer_from_code] Referrer: {referrer.email}.')
        except User.DoesNotExist:
            referrer = None
        return referrer

    @staticmethod
    def get_entry_point_from_code(code):
        entry_point = int(code[-6]) if code else '0'
        logger.debug(f'[Sharing][get_entry_point_from_code] entry point: {entry_point}.')
        return entry_point

    @staticmethod
    def get_communication_method_from_code(code):
        communication_method = int(code[-5]) if code else '0'
        logger.debug(f'[Sharing][get_communication_method_from_code] communication_method: {communication_method}.')
        return communication_method

    @staticmethod
    def get_email_type_from_code(code):
        email_type = int(code[-4:-2]) if code else '00'
        logger.debug(f'[Sharing][email_type] email_type: {email_type}.')
        return email_type

    @staticmethod
    def get_email_reminder_interval_in_days_from_code(code):
        email_reminder_interval_in_days = int(code[-2:]) if code else '00'
        logger.debug(f'[Sharing][email_reminder_intervals_in_day] email_reminder_interval_in_days: {email_reminder_interval_in_days}.')
        return email_reminder_interval_in_days
