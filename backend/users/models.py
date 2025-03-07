from django.db import IntegrityError
from django.contrib.postgres.fields import ArrayField
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from uuid import uuid1, uuid5
from django.conf import settings
from datetime import timedelta
from django.db.models import Q
from djchoices import DjangoChoices, ChoiceItem
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.mail import send_mail
from django.db import models
from django.utils import timezone
from datetime import date
from django.utils.translation import ugettext_lazy as _
from django_countries.fields import CountryField
from localflavor.us.models import USZipCodeField, PhoneNumberField
from rest_framework.authtoken.models import Token
from utils.logger_utils import logger
from users.manager import UserManager, PasswordResetManager
from utils import formatter_utils
from dearbrightly import constants
import random, string
from orders.models import Order, Inventory
from functools import reduce
from emr.models import Visit

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class ShippingDetails(models.Model):
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True, null=True)
    address_line1 = models.CharField(_('Address Line 1'), max_length=128, blank=True, null=True)
    address_line2 = models.CharField(_('Address Line 2'), max_length=128, blank=True, null=True)
    city = models.CharField(_('City'), max_length=64, blank=True, null=True)
    state = models.CharField(choices=constants.STATE_CHOICES, max_length=128, null=True)
    postal_code = USZipCodeField(blank=True, null=True)
    country = CountryField(default='US', blank=True, null=True)
    phone = PhoneNumberField(blank=True, null=True)

    def get_full_name(self):
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'
        if self.first_name:
            return self.first_name
        if self.last_name:
            return self.last_name
        return None


    def get_address_line(self):
        return f'{self.address_line1} {self.address_line2}'

    def __str__(self):
        return f'{self.pk} {self.first_name} {self.last_name}, {self.address_line1}, {self.address_line2}, ' \
            f'{self.city}, {self.state}, {self.postal_code}, {self.country}, {self.phone}'

    def save(self, *args, **kwargs):
        if self.first_name:
            self.first_name = self.first_name.capitalize()
        if self.last_name:
            self.last_name = self.last_name.capitalize()
        if self.address_line1:
            self.address_line1 = formatter_utils.capitalize_sentence(self.address_line1)
        if self.address_line2:
            self.address_line2 = formatter_utils.capitalize_sentence(self.address_line2)
        if self.city:
            self.city = formatter_utils.capitalize_sentence(self.city)
        return super().save(*args, **kwargs)

class UserOTPSettings(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, primary_key=True, related_name='otp_settings')
    code = models.CharField(_('Code used to generate the OTP pass codes'), max_length=32, unique=True, null=False)
    session_expire_datetime = models.DateTimeField(null=True)
    two_factor_enabled = models.BooleanField(_('User enabled 2FA authentication'), blank=False, default=False)


class User(AbstractBaseUser, PermissionsMixin):
    class RxStatus(DjangoChoices):
        none = ChoiceItem('None')
        active = ChoiceItem('Active')
        expired = ChoiceItem('Expired')

    class Gender(DjangoChoices):
        none = ChoiceItem('none specified')
        female = ChoiceItem('female')
        male = ChoiceItem('male')

    password = models.CharField(_('password'), max_length=128, blank=True, null=True)
    uuid = models.UUIDField(blank=False, unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True, null=True)
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    dob = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=30, default=Gender.none, choices=Gender.choices)
    is_staff = models.BooleanField(_('staff status'), default=False,
                                   help_text=_('Designates whether the user can log into this admin '
                                               'site.'))
    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Designates whether this user should be treated as '
                                                'active. Unselect this instead of deleting accounts.'))
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    last_modified_datetime = models.DateTimeField(_('last modified'), auto_now=True)
    sappira_user_id = models.CharField(_('Sappira User ID'), blank=True, null=True, max_length=512)
    shipping_details = models.ForeignKey(ShippingDetails, on_delete=models.SET_NULL, related_name='users',
                                         null=True, blank=True)
    payment_processor_customer_id = models.CharField(_('Payment Processor Customer ID'), max_length=256,
                                                     blank=True, null=True)
    facebook_user_id = models.BigIntegerField(_('Facebook User ID'), null=True, blank=True)
    dosespot_id = models.PositiveIntegerField(null=True, blank=True)
    shopify_user_id = models.CharField(_('Shopify User ID'), blank=True, null=True, max_length=512)
    recharge_user_id = models.CharField(_('Recharge User ID'), blank=True, null=True, max_length=256)
    opt_out_marketing_emails = models.BooleanField(_('Marketing emails opt out'), default=False,
                                   help_text=_('Opts out users from any marketing emails'))
    is_klaviyo_migrated = models.BooleanField(_('Migrated over to Klaviyo'), default=False)
    sharing_code = models.CharField(_('share code'), max_length=40, blank=False, null=True, unique=True)
    allow_sending_user_info_to_advertisers = models.BooleanField(_('Allow sending hashed user info to third-party advertisers per our updated Privacy Policy'), default=False)
    opt_in_sms_app_notifications = models.BooleanField(_('App event notifications opt-in'), default=False)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # TODO - Update this to valid visit; rx_status should reflect the prescription status
    @property
    def rx_status(self):
        from emr.models import Visit

        status = User.RxStatus.none

        completed_visits = self.patient_visits.filter(Q(status=Visit.Status.provider_signed) | Q(status=Visit.Status.provider_rx_submitted))
        latest_medical_visit_completed = completed_visits.latest('created_datetime') if completed_visits else None

        if latest_medical_visit_completed:
            if latest_medical_visit_completed.is_expired:
                status = User.RxStatus.expired
            else:
                status = User.RxStatus.active


        logger.debug(f'[User][rx_status] user: {self.id}. status: {status}')

        return status

    @property
    def is_returning_user(self):
        from orders.models import Order

        return len(self.orders.filter(status=Order.Status.shipped)) > 0

    @property
    def has_subscription(self):
        return len(self.subscriptions.all()) > 0

    @property
    def has_rx_subscription(self):
        return len(self.subscriptions.filter(product__product_type='Rx')) > 0

    @property
    def has_active_subscriptions(self):
        return len(self.subscriptions.filter(is_active=True)) > 0

    @property
    def has_active_rx_subscriptions(self):
        return len(self.subscriptions.filter(Q(is_active=True) & Q(product__product_type='Rx'))) > 0

    @property
    def has_paused_subscriptions(self):
        paused_subscriptions = self.subscriptions.all().filter(is_active=False)
        return len(paused_subscriptions) > 0

    @property
    def has_paused_rx_subscriptions(self):
        paused_rx_subscriptions = self.subscriptions.all().filter(Q(is_active=True) & Q(product__product_type='Rx'))
        return len(paused_rx_subscriptions) > 0

    @property
    def has_valid_rx(self):
        from emr.models import PatientPrescription
        valid_rx = False
        prescriptions = self.prescriptions.filter(Q(status=PatientPrescription.Status.erx_sent) |
                                                  Q(status=PatientPrescription.Status.edited) |
                                                  Q(status=PatientPrescription.Status.pharmacy_verified))
        latest_rx = prescriptions.latest('prescribed_datetime') if prescriptions else None

        if latest_rx and not latest_rx.is_expired:
            valid_rx = True

        return valid_rx

    @property
    def age(self):
        if self.dob:
            timedelta = date.today() - self.dob
            return int(timedelta.days/365)
        return None

    @property
    def is_patient(self):
        return self.groups.filter(name='Customers').exists()

    @property
    def is_medical_provider(self):
        return self.groups.filter(name='Medical Provider').exists()

    @property
    def is_medical_admin(self):
        return self.groups.filter(name='Medical Admin').exists()

    @property
    def is_admin(self):
        return self.groups.filter(name='Admin').exists()

    @property
    def is_skip_checkout_payment(self):
        return self.groups.filter(name='Skip Checkout Payment').exists()

    @property
    def medical_provider(self):
        if self.is_patient:
            return self.get_medical_provider()
        else:
            return MedicalProviderUser.objects.get(id=self.pk)
        return None

    @property
    def require_payment_detail_update(self):
        from orders.models import Order
        from subscriptions.models import Subscription

        subscription_orders_failed_payment = self.orders.filter(status=Order.Status.payment_failure)
        subscriptions_pending_invoice = self.subscriptions.filter(Q(is_active=True) & Q(open_invoice_id__isnull=False))
        subscriptions_failed_payment_cancellation = self.subscriptions.filter(
            Q(cancel_reason=Subscription.CancelReason.payment_failure) &
            Q(is_active=False))
        no_payment_method_saved = self.has_subscription and (not self.payment_processor_customer_id and not self.shopify_user_id)
        is_payment_detail_update_required = len(subscription_orders_failed_payment) > 0 or \
                                            len(subscriptions_pending_invoice) > 0 or \
                                            len(subscriptions_failed_payment_cancellation) > 0 or \
                                            no_payment_method_saved
        logger.debug(f'[require_payment_detail_update] '
                     f'subscription_orders_failed_payment: {subscription_orders_failed_payment}. '
                     f'subscriptions_failed_payment_cancellation: {subscriptions_failed_payment_cancellation}. '
                     f'is_payment_detail_update_required: {is_payment_detail_update_required}. '
                     f'length of orders failed payment: {len(subscription_orders_failed_payment)}. '
                     f'length of failed subscription payment: {len(subscriptions_failed_payment_cancellation)}.')
        return is_payment_detail_update_required

    @property
    def require_yearly_medical_visit_update(self):
        from emr.models import Visit

        active_subscriptions = self.subscriptions.filter(is_active=True)
        active_subscription = active_subscriptions.latest('created_datetime') if active_subscriptions else None
        # check completed visits
        completed_medical_visits = self.patient_visits.filter(Q(skin_profile_status=Visit.SkinProfileStatus.complete) |
                                                              Q(skin_profile_status=Visit.SkinProfileStatus.no_changes_user_specified) |
                                                              Q(skin_profile_status=Visit.SkinProfileStatus.no_changes_no_user_response) |
                                                              Q(skin_profile_status=Visit.SkinProfileStatus.incomplete_user_response))
        completed_medical_visit = completed_medical_visits.latest('created_datetime') if completed_medical_visits else None
        completed_medical_visit_expired = completed_medical_visit.expire_before_date(date=active_subscription.current_period_end_datetime) if completed_medical_visit else False
        logger.debug(f'[user][require_yearly_medical_visit_update] active_subscription: {active_subscription}. '
                     f'completed_medical_visit_expired: {completed_medical_visit_expired}. '
                     f'completed_medical_visit: {completed_medical_visit}.')

        return completed_medical_visit_expired

    @property
    def has_unread_messages(self):
        unread_messages = self.chat_messages_received.filter(read_datetime__isnull=True)
        return len(unread_messages) > 0

    @property
    def medical_visit(self):
        from emr.models import Visit
        visits = self.patient_visits.filter(~Q(status=Visit.Status.provider_cancelled))
        if visits:
            latest_visit = visits.latest('created_datetime')
            #logger.debug(f'[medical_visit] Latest visit: {latest_visit}')
            return latest_visit
        return None

    # <= 1 rx order only
    @property
    def is_on_trial_period(self):
        from orders.models import Order

        number_rx_orders = 0
        orders  = self.orders.filter(Q(payment_captured_datetime__isnull=False) &
                                     ~Q(status=Order.Status.cancelled) &
                                     ~Q(status=Order.Status.refunded))
        for order in orders:
            if order.is_rx_order():
                number_rx_orders += 1
            if number_rx_orders > 1:
                logger.debug(f'[is_on_trial_period] User: {self.id}. is_on_trial_period: False')
                return False
        logger.debug(f'[is_on_trial_period] User: {self.id}. is_on_trial_period: True')
        return True

    # order has not been shipped or fulfilled
    def get_pending_orders(self):
        from orders.models import Order
        return self.orders.filter(
            ~Q(status=Order.Status.shipped) &
            ~Q(status=Order.Status.awaiting_fulfillment) &
            ~Q(status=Order.Status.cancelled) &
            ~Q(status=Order.Status.refunded))


    def get_latest_medical_visit_before_prescription(self):
        from emr.models import Visit

        pending_visits = self.patient_visits.filter(Q(status=Visit.Status.pending) |
                                                    Q(status=Visit.Status.skin_profile_pending) |
                                                    Q(status=Visit.Status.skin_profile_complete) |
                                                    Q(status=Visit.Status.provider_pending))

        return pending_visits.latest('created_datetime') if pending_visits else None

    def get_latest_medical_visit_in_progress(self):
        from emr.models import Visit
        # TODO (Alda) - consolidate query with VisitViewSet
        pending_visits = self.patient_visits.filter(Q(status=Visit.Status.pending) |
                                                    Q(status=Visit.Status.skin_profile_pending) |
                                                    Q(status=Visit.Status.skin_profile_complete) |
                                                    Q(status=Visit.Status.provider_pending) |
                                                    Q(status=Visit.Status.pending_prescription) |
                                                    Q(status=Visit.Status.provider_awaiting_user_input))

        if len(pending_visits) == 0:
            logger.debug(f'[get_latest_medical_visit_in_progress] No pending visit. '
                         f'User: {self.email}.')
            return None

        if len(pending_visits) > 1:
            logger.error(f'[get_latest_medical_visit_in_progress] More than one pending visit. '
                         f'User: {self.email}.')

        logger.debug(f'[get_latest_medical_visit_in_progress] Pending visits: {pending_visits}')
        return pending_visits.latest('created_datetime')


    def get_latest_medical_visit_completed(self):
        from emr.models import Visit

        completed_visits = self.patient_visits.filter(Q(status=Visit.Status.provider_signed) | Q(status=Visit.Status.provider_rx_submitted))
        latest_medical_visit_completed = completed_visits.latest('created_datetime') if completed_visits else None

        logger.debug(f'[get_latest_medical_visit_completed] latest_medical_visit_completed: {latest_medical_visit_completed}')
        return latest_medical_visit_completed

    def get_latest_valid_medical_visit_completed(self):
        latest_medical_visit_completed = self.get_latest_medical_visit_completed()
        latest_valid_medical_visit_completed = latest_medical_visit_completed \
            if latest_medical_visit_completed and not latest_medical_visit_completed.is_expired else None

        logger.debug(f'[get_latest_valid_medical_visit_completed] latest_valid_medical_visit_completed: {latest_valid_medical_visit_completed}')
        return latest_valid_medical_visit_completed

    def visit_will_expire_before_date(self, date):
        visit = self.get_latest_medical_visit_completed()
        will_expire = False
        if visit:
            will_expire = True if visit.expire_before_date(date=date) else False
        logger.debug(f'[user][visit_will_expire_before_date] email: {self.email} [{self.id}]. visit: {visit}. date: {date}. will expire: {will_expire}.')
        return will_expire

    def all_photo_types_uploaded(self):
        from emr.models import Photo

        photo_types_set = set()
        for choice in Photo.PhotoType.choices:
            photo_types_set.add(choice[0])
        photos_uploaded_types_set = set(self.photos.filter(photo_rejected=False).values_list('photo_type', flat=True).distinct())
        all_photos_uploaded = photo_types_set.issubset(photos_uploaded_types_set)

        # logger.debug(
        #     f'[all_photo_types_uploaded] all_photos_uploaded: {all_photos_uploaded}. '
        #     f'photo_types_set: {photo_types_set}. '
        #     f'photos_uploaded_types_set: {photos_uploaded_types_set}. '
        #     f'all photos: {self.photos.all()}.')

        return all_photos_uploaded

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        abstract = False

    def get_full_name(self):
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'
        if self.first_name:
            return self.first_name
        if self.last_name:
            return self.last_name
        return None

    def get_short_name(self):
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_orders_list(self):
        orders_list = ''
        for order in self.orders.filter(purchased_datetime__isnull=False):
            orders_list += f'{order.id}, '
        if len(orders_list) > 0:
            orders_list = orders_list[:-2]
        return orders_list

    def get_medical_visits_list(self):
        visits_list = ''
        for visit in self.patient_visits.all():
            visits_list += f'{visit.id}, '
        if len(visits_list) > 0:
            visits_list = visits_list[:-2]
        return visits_list

    def get_plan_names(self):
        subscriptions_plans = self.subscriptions.all()
        subscription_plan_names = list(subscriptions_plans.values_list('product__name', flat=True)) if subscriptions_plans else None
        return subscription_plan_names

    def get_subscription(self, product):
        subscriptions = self.subscriptions.all().filter(product=product)
        if not subscriptions:
            logger.error(f'[User][get_order_product_subscription] '
                         f'No subscription. '
                         f'User: {self.id}. '
                         f'Product: {product.name}.')
            return None

        return subscriptions.latest('created_datetime')

    def get_number_fulfilled_orders(self):
        return len(self.orders.filter(payment_captured_datetime__isnull=False))

    def is_plan_active(self):
        active_subscriptions_plans = self.subscriptions.filter(is_active=True)
        is_active = len(active_subscriptions_plans) > 0
        #logger.debug(f'[is_plan_active] customer: {self.id}. is_active: {is_active}.')
        return is_active

    def get_plan_cancelation_reasons(self):
        inactive_subscriptions_plans = self.subscriptions.filter(is_active=False)
        cancelation_reasons = list(inactive_subscriptions_plans.values_list('cancel_reason',
                                                                            flat=True)) if inactive_subscriptions_plans else None
        return cancelation_reasons

    def is_in_customer_group(self):
        return self.groups.filter(name='Customers').exists()

    def get_medical_provider(self, shipping_details=None):
        if not self.shipping_details and not shipping_details:
            return None

        state = shipping_details.state if shipping_details else self.shipping_details.state
        medical_providers = MedicalProviderUser.objects.filter(
            is_active=True,
            states__contains=[state],
        )

        if medical_providers.count() > 1:
            provider = None
            todays_date = timezone.now()
            available_medical_providers = list(
                filter(
                    lambda medical_provider: not medical_provider.vacation_days.filter(
                        start_date__lte=todays_date,
                        end_date__gte=todays_date,
                    ).exists(),
                    medical_providers,
                ),
            )
            # To equally distribute visits to medical providers select a provider from available_medical_providers
            # with a priority:
            #   i. Medical providers that have not had a visit assigned yet (a case of a new active medical_provider account)
            #   ii. Medical provider with the earliest(“created_datetime”) visit
            medical_providers_latest_visits = []
            for medical_provider in available_medical_providers:
                try:
                    medical_providers_latest_visits.append(
                        medical_provider.medical_provider_visits.latest("created_datetime"),
                    )
                except Visit.DoesNotExist:
                    provider = medical_provider
                    break
            if not provider and medical_providers_latest_visits:
                provider = Visit.objects.filter(
                    id__in=[visit.id for visit in medical_providers_latest_visits],
                ).earliest("created_datetime").medical_provider
            # In the case that all medical_providers assigned to a state are currently on vacation/off days
            # assign the provider as the medical_provider with the earliest vacation_days.end_date
            elif not provider and medical_providers:
                provider = VacationDays.objects.filter(
                    medical_provider__id__in=[medical_provider.id for medical_provider in medical_providers],
                    end_date__gte=todays_date,
                ).earliest("end_date").medical_provider
        else:
            provider = medical_providers.first()

        if provider:
            logger.debug(f'[get_medical_provider] Provider {provider.id} for user {self.id}.')
        else:
            if settings.DEBUG:
                provider = MedicalProviderUser.objects.get(email='dearbrightly.test+medical_provider@gmail.com')
            else:
                provider = MedicalProviderUser.objects.get(id=1654)
            logger.error(f'[get_medical_provider] No provider available for user {self.id}. Assigning default provider: {provider.id}')
        return provider

    def unsubscribe_token(self):
        email, token = TimestampSigner().sign(self.email).split(":", 1)
        #logger.debug(f'[unsubscribe_link] email: {email}. token: {token}.')
        return token

    def check_token(self, token):
        try:
            key = '%s:%s' % (self.email, token)
            TimestampSigner().unsign(key, max_age=60 * 60 * 240)  # Valid for 10 days
        except (BadSignature, SignatureExpired):
            logger.debug(f'[check_token] bad or expired signature. user: {self.email}. token: {token}')
            return False
        logger.debug(f'[check_token] valid signature. user: {self.email}. token: {token}')
        return True

    def set_sharing_code(self, digits=0, retry=1):
        MAX_RETRY = 10
        MAX_DIGITS_SUFFIX = 9

        if retry == 0:
            retry = MAX_RETRY
            digits += 1

        logger.debug(f'[User][set_sharing_code] Attempting to set sharing code for user: {self.email}. '
                     f'Digits: {digits}. Retry: {retry}.')

        if digits == MAX_DIGITS_SUFFIX:
            logger.error(f'[User][set_sharing_code] Unable to create a new sharing code for user: {self.email}.')
            return None

        try:
            generated_digit_code = ''.join(random.choices(string.digits, k=digits))

            if self.first_name:
                first_name_characters = ''.join(x for x in self.first_name if x.isalpha())
                first_name_characters_lower_case = first_name_characters.lower()

                last_name_initial_lower_case = ''
                if self.last_name:
                    last_name_characters = ''.join(x for x in self.last_name if x.isalpha())
                    last_name_characters_lower_case = last_name_characters.lower()
                    last_name_initial_lower_case = last_name_characters_lower_case[0]

                code = f'{first_name_characters_lower_case}{last_name_initial_lower_case}{generated_digit_code}'
            else:
                email_no_domain = self.email.split("@")[0]
                email_no_domain_characters = ''.join(x for x in email_no_domain if x.isalpha())
                email_no_domain_characters_lower_case = email_no_domain_characters.lower()
                code = f'{email_no_domain_characters_lower_case}{generated_digit_code}'

            self.sharing_code = code
            logger.debug(f'[User][set_sharing_code] User: {self.email}. Generated sharing code: {code}.')
            self.save(update_fields=['sharing_code'])
        except IntegrityError as e:
            if 'unique constraint' in str(e.__cause__):
                self.set_sharing_code(digits=digits, retry=retry-1)

    def get_next_ship_date(self):
        subscriptions = self.subscriptions.filter(is_active=True)
        if subscriptions:
            return subscriptions.latest('created_datetime').current_period_end_datetime
        return None

    def has_received_refillable_bottle(self, product):
        # Check if the user had received a refillable bottle in past orders
        all_shipped_customer_orders = self.orders.filter(
            Q(status=Order.Status.shipped) | Q(status=Order.Status.pending_pharmacy))
        order_items_with_refillable_bottles = list(
            map(lambda x: x.order_items.filter(Q(bottle_type=Inventory.BottleType.refillable_bottle) &
                                               (Q(product__product_category=product.product_category))),
                all_shipped_customer_orders))

        logger.debug(f'[User][has_received_refillable_bottle] all_shipped_customer_orders: {all_shipped_customer_orders}. '
                     f'order_items_with_refillable_bottles: {order_items_with_refillable_bottles}.')

        if order_items_with_refillable_bottles:
            # consolidate the list of qs
            order_items_with_refillable_bottles_qs = reduce((lambda x, y: x | y),
                                                            order_items_with_refillable_bottles)
            if order_items_with_refillable_bottles_qs:
                return True

        return False

    def save(self, *args, **kwargs):
        if not self.pk:
            self.allow_sending_user_info_to_advertisers = True
        if not self.uuid:
            self.uuid = uuid5(uuid1(), self.email)
        if self.first_name:
            self.first_name = self.first_name.capitalize()
        if self.last_name:
            self.last_name = self.last_name.capitalize()
        self.email = self.email.lower()

        return super().save(*args, **kwargs)


class PasswordResetToken(Token):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='password_reset_token')
    objects = PasswordResetManager()


class MedicalProviderUser(User):
    stripe_connect_id = models.CharField(_('Stripe Connect ID'), max_length=256, blank=True, null=True)
    platform_service_fee = models.PositiveIntegerField(_('Platform Service Fee'), null=True, default=0)
    states = ArrayField(models.CharField(max_length=2), blank=True, default=list())
    profile_photo_file = models.CharField(_('Profile Photo File URL'), max_length=200, blank=True, null=True)

class VacationDays(models.Model):
    created_datetime = models.DateTimeField(default=timezone.now)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    title = models.CharField(_('Title'), max_length=32, default='Vacation')
    medical_provider = models.ForeignKey(MedicalProviderUser, on_delete=models.CASCADE, related_name='vacation_days')
    start_date = models.DateField()
    end_date = models.DateField()
