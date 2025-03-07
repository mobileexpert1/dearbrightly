from uuid import uuid4
from django.db import models
from django.utils.translation import ugettext_lazy as _
from dateutil.relativedelta import relativedelta
from utils.logger_utils import logger
from django.db.models import Q
from djchoices import DjangoChoices, ChoiceItem
from django.utils import timezone
from datetime import timedelta

# Tracks Stripe subscriptions canceled for the Stripe refactor
class StripeSubscriptionCancellation(models.Model):
    user = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)
    subscription_id = models.CharField(null=True, blank=True, max_length=50)
    current_period_end = models.DateTimeField(null=True, blank=True)
    status = models.CharField(null=True, blank=True, max_length=50)
    plan_id = models.CharField(null=True, blank=True, max_length=200)
    customer_id = models.CharField(null=True, blank=True, max_length=200)


class Edit(models.Model):

    class Type(DjangoChoices):
        frequency_update = ChoiceItem('frequency update')
        restart = ChoiceItem('restart')
        pause = ChoiceItem('pause')
        cancel = ChoiceItem('cancel')
        early_ship = ChoiceItem('early ship')
        product_update = ChoiceItem('product update')
        quantity_update = ChoiceItem('quantity update')

    customer = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL,
                                 related_name='subscription_edits')
    subscription_old = models.ForeignKey('subscriptions.OrderProductSubscription', null=True, blank=True, on_delete=models.SET_NULL,
                                         related_name='subscription_edits')
    subscription = models.ForeignKey('subscriptions.Subscription', null=True, blank=True, on_delete=models.SET_NULL,
                                     related_name='subscription_edits')
    created_datetime = models.DateTimeField(auto_now_add=True)
    delay_in_days = models.IntegerField(_('Delay of subscription in days'), default=0)
    frequency_delta = models.IntegerField(_('Frequency delta in days'), default=0)
    original_quantity = models.IntegerField(_('Original quantity value'), default=0)
    updated_quantity = models.IntegerField(_('New quantity value'), default=0)
    original_frequency = models.IntegerField(_('Original frequency value'), default=0)
    updated_frequency = models.IntegerField(_('New frequency value'), default=0)
    original_ship_datetime = models.DateTimeField(null=True)
    updated_ship_datetime = models.DateTimeField(null=True)
    reason = models.CharField(_('Reason'), max_length=200, null=True, blank=False)
    type = models.CharField(_('Type'), max_length=32, null=False, blank=True, choices=Type.choices)


class Plan(models.Model):
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    name = models.CharField(_('Name'), max_length=64, blank=True)
    stripe_id = models.CharField(_('Stripe ID'), blank=True, null=True, max_length=128)
    frequency = models.IntegerField(_('Frequency in months'), default=0)
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL,
                                related_name='plans')

class Subscription(models.Model):
    class CancelReason(DjangoChoices):
        not_applicable = ChoiceItem('Not Applicable')
        none = ChoiceItem('None Specified')
        rx_expired = ChoiceItem('Rx Expired')
        attempting_pregnancy = ChoiceItem('Attempting Pregnancy')
        pregnant = ChoiceItem('Pregnant')
        nursing = ChoiceItem('Nursing')
        commercial_retinoid = ChoiceItem('Using Commercial Retinoid')
        dislike_product = ChoiceItem('Dislike Product')
        ineffective = ChoiceItem('Ineffective')
        causes_irritation = ChoiceItem('Causes Irritation')
        cost = ChoiceItem('Cost')
        dislike_subscription = ChoiceItem('Dislike Subscription')
        other_skincare_products = ChoiceItem('Using Other Skincare Products')
        payment_failure = ChoiceItem('Payment Failure')
        unaware_subscription = ChoiceItem('Unaware of Subscription')
        mistake = ChoiceItem('Mistake')
        moved = ChoiceItem('Moved')
        health_issues = ChoiceItem('Health Issues')
        have_not_used = ChoiceItem('Have Not Used')
        traveling = ChoiceItem('Traveling')
        allergic = ChoiceItem('Allergic')
        formula_strength_high = ChoiceItem('Formula strength is too high')
        formula_strength_low = ChoiceItem('Formula strength is too low')
        no_results = ChoiceItem('I’m not seeing a difference')
        financial_reason = ChoiceItem('Financial reasons')
        shipments_frequent = ChoiceItem('Shipments are too frequent, I need to catch up')
        free_customer = ChoiceItem('Free customer')

    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    uuid = models.UUIDField(blank=False, default=uuid4, unique=True)
    customer = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.CASCADE,
                                 related_name='subscriptions')
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL,
                                related_name='subscriptions')
    current_period_start_datetime = models.DateTimeField(auto_now=False, null=True)
    current_period_end_datetime = models.DateTimeField(auto_now=False, null=True)
    cancel_datetime = models.DateTimeField(auto_now=False, null=True)
    cancel_reason = models.CharField(_('Cancellation Reason'), max_length=200, null=True, blank=True)
    frequency = models.IntegerField(_('Subscription frequency in months'), default=0)
    delay_in_days = models.IntegerField(_('Delay of subscription in days'), default=0)
    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Indicates if this subscription plan is active.'))
    discount_code = models.CharField(_('Invoice Subscription ID'), max_length=32, null=True, blank=True)
    upcoming_order_email_sent_datetime = models.DateTimeField(auto_now=False, null=True)
    open_invoice_id = models.CharField(_('Unpaid invoice ID'), max_length=32, null=True, blank=True)
    quantity = models.PositiveIntegerField(_('Quantity'), default=1)
    recharge_subscription_id = models.CharField(_('Recharge Subscription ID'), blank=True, null=True, unique=True, max_length=256)
    recharge_address_id = models.CharField(_('Recharge Subscription Address ID'), blank=True, null=True, max_length=256)
    shipping_details = models.ForeignKey('users.ShippingDetails', on_delete=models.SET_NULL,
                                         related_name='subscriptions', null=True, blank=True)
    recharge_payment_method_id = models.CharField(_('Recharge Payment Method ID'), blank=True, null=True, max_length=256)
    payment_processor_card_id = models.CharField(_('Payment Processor Card ID'), max_length=256, blank=True, null=True)
    
    def get_latest_plan_order(self):
        from orders.models import OrderItem
        from orders.models import Order

        latest_plan_order = None
        order_items = OrderItem.objects.filter(
            Q(order__customer=self.customer) &
            Q(subscription=self) &
            Q(order__payment_captured_datetime__isnull=False) &
            ~Q(order__status=Order.Status.cancelled)
        )
        logger.debug(f'[Subscription][get_latest_plan_order] customer: {self.customer.id}. subscription: {self.id}. product: {self.product}.order_items: {order_items}.')
        if order_items:
            latest_plan_order = order_items.latest('created_datetime').order
        if latest_plan_order:
            logger.debug(f'[Subscription][get_latest_plan_order] Latest plan order: {latest_plan_order.id}. Plan: {self.id}. Customer: {self.customer.email}.')
        return latest_plan_order

    def get_open_order(self):
        from orders.models import OrderItem
        from orders.models import Order

        open_order = None
        order_items = OrderItem.objects.filter(
            Q(order__customer=self.customer) &
            Q(subscription=self) &
            Q(order__autogenerated=True) &
            Q(order__payment_captured_datetime__isnull=True) &
            ~Q(order__status=Order.Status.cancelled) &
            ~Q(order__status=Order.Status.pending_payment)
        )
        logger.debug(f'[Subscription][get_open_order] customer: {self.customer.id}. order_items: {order_items}.')
        if order_items:
            open_order = order_items.latest('created_datetime').order
            logger.debug(f'[Subscription][get_open_order] Latest open order: {open_order.id}. Plan: {self.id}. Customer: {self.customer.email}.')
        return open_order

    def reset_subscription_start_and_end_times(self):
        self.current_period_start_datetime = timezone.now()

        delta = self.frequency * 30
        if self.customer.is_on_trial_period:
            delta -= 30

        self.current_period_end_datetime = self.current_period_start_datetime + relativedelta(
            days=+delta)

        self.current_period_end_datetime = self.current_period_end_datetime
        self.current_period_start_datetime = self.current_period_start_datetime
        self.save(update_fields=['current_period_end_datetime', 'current_period_start_datetime'])

        logger.debug(f'[Subscription][reset_subscription_start_and_end_times]. subscription: {self.id}. '
                     f'current_period_start_datetime: {self.current_period_start_datetime}. '
                     f'current_period_end_datetime: {self.current_period_end_datetime}.')

    def deactivate(self, reason):
        self.is_active = False
        self.cancel_datetime = timezone.now()
        self.cancel_reason = reason if reason else Subscription.CancelReason.not_applicable
        self.save(update_fields=["cancel_datetime", "cancel_reason", "is_active"])
        subscription_edit = Edit.objects.create(customer=self.customer,
                                                reason=self.cancel_reason,
                                                subscription=self,
                                                type=Edit.Type.cancel)

    @property
    def is_shopify_subscription(self):
        if self.recharge_subscription_id:
            return True
        return False

    @property
    def is_upcoming_order_email_sent(self):
        if Subscription.is_email_sent_recently(self.current_period_end_datetime, self.upcoming_order_email_sent_datetime):
            return True

        logger.debug(f'[Subscription][is_upcoming_order_email_sent] Subscription: {self.id}. False.')
        return False

    @staticmethod
    def is_email_sent_recently(current_period_end_datetime, upcoming_order_email_sent_datetime):
        if not upcoming_order_email_sent_datetime:
            logger.debug(f'[Subscription][is_email_sent_recently] Upcoming order email not sent. '
                         f'No email sent timestamp.')
            return False

        fourteen_days_before_ship_date = current_period_end_datetime - timedelta(days=14)
        five_days_before_ship_date = current_period_end_datetime - timedelta(days=5)
        logger.debug(f'[Subscription][is_email_sent_recently] '
                     f'next_ship_date: {current_period_end_datetime}. '
                     f'upcoming_order_email_sent_datetime: {upcoming_order_email_sent_datetime}. '
                     f'fourteen_days_before_ship_date: {fourteen_days_before_ship_date}. '
                     f'five_days_before_ship_date: {five_days_before_ship_date}')
        if fourteen_days_before_ship_date <= upcoming_order_email_sent_datetime <= five_days_before_ship_date:
            logger.debug(f'[Subscription][is_email_sent_recently] True')
            return True

        logger.debug(f'[Subscription][is_email_sent_recently] False.')
        return False

    @property
    def require_upcoming_order_email(self):
        ship_now_subscription_edits = self.subscription_edits.filter(type=Edit.Type.early_ship)
        logger.debug(f'[Subscription][require_upcoming_order_email] '
                     f'customer: {self.customer.id}. ship_now_subscription_edits: {ship_now_subscription_edits}.')
        if ship_now_subscription_edits:
            ship_now_subscription_edit = ship_now_subscription_edits.latest('created_datetime')
            # if Ship Now was requested 8 days or less from the next ship date, then skip the upcoming order email
            if ship_now_subscription_edit.created_datetime > self.current_period_end_datetime - timedelta(days=8):
                return False
        resume_subscription_edits = self.subscription_edits.filter(type=Edit.Type.restart)
        logger.debug(
            f'[Subscription][require_upcoming_order_email] '
            f'customer: {self.customer.id}. resume_subscription_edits: {resume_subscription_edits}.')

        if resume_subscription_edits:
            resume_subscription_edit = resume_subscription_edits.latest('created_datetime')
            # if subscription restart was requested 8 days or less from the next ship date, then skip the upcoming order email
            if resume_subscription_edit.created_datetime > self.current_period_end_datetime - timedelta(days=8):
                return False

        # Sometimes user add plans on the day of another shipment, but that plan has been invoiced already
        five_days_ago = timezone.now() - timedelta(days=5)
        if self.created_datetime > five_days_ago:
            logger.debug(
                f'[Subscription][require_upcoming_order_email] '
                f'Customer: {self.customer.id}. Subscription: {self.id}. Plan created less than 5 days ago.')
            return False

        # upcoming order created
        upcoming_order = self.get_open_order()
        logger.debug(
            f'[Subscription][require_upcoming_order_email] '
            f'customer: {self.customer.id}. upcoming_order: {upcoming_order}.')
        if upcoming_order:
            return False

        return True


    def __str__(self):
        return f'uuid: {self.uuid}, ' \
               f'customer: {self.customer.email}, ' \
               f'frequency: {self.frequency}, ' \
               f'is active: {self.is_active} ' \
               f'product: {self.product.name}, ' \
               f'start time: {self.current_period_start_datetime}, ' \
               f'end time: {self.current_period_end_datetime}, ' \
               f'delay_in_days: {self.delay_in_days}, ' \
               f'cancel_datetime: {self.cancel_datetime}, ' \
               f'cancel_reason: {self.cancel_reason}. ' \
               f'upcoming_order_email_sent_datetime: {self.upcoming_order_email_sent_datetime}.'

    def save(self, **kwargs):
        if not self.pk:
            if self.current_period_start_datetime and not self.current_period_end_datetime:
                delta_in_days = self.frequency * 30 + self.delay_in_days
                if not self.recharge_subscription_id and self.customer.is_on_trial_period:
                    delta_in_days -= 30
                    logger.debug(
                        f'[Subscription][current_period_end_datetime] subscription: {self.id}. ')
                self.current_period_end_datetime = self.current_period_start_datetime + relativedelta(days=+delta_in_days)
                logger.debug(f'[Subscription][current_period_end_datetime] subscription: {self.id}. end date: {self.current_period_end_datetime} ')
        super().save(**kwargs)

# TODO: Remove
class OrderProductSubscription(models.Model):
    class CancelReason(DjangoChoices):
        not_applicable = ChoiceItem('Not Applicable')
        none = ChoiceItem('None Specified')
        rx_expired = ChoiceItem('Rx Expired')
        attempting_pregnancy = ChoiceItem('Attempting Pregnancy')
        pregnant = ChoiceItem('Pregnant')
        nursing = ChoiceItem('Nursing')
        commercial_retinoid = ChoiceItem('Using Commercial Retinoid')
        dislike_product = ChoiceItem('Dislike Product')
        ineffective = ChoiceItem('Ineffective')
        causes_irritation = ChoiceItem('Causes Irritation')
        cost = ChoiceItem('Cost')
        dislike_subscription = ChoiceItem('Dislike Subscription')
        other_skincare_products = ChoiceItem('Using Other Skincare Products')
        payment_failure = ChoiceItem('Payment Failure')
        unaware_subscription = ChoiceItem('Unaware of Subscription')
        mistake = ChoiceItem('Mistake')
        moved = ChoiceItem('Moved')
        health_issues = ChoiceItem('Health Issues')
        have_not_used = ChoiceItem('Have Not Used')
        traveling = ChoiceItem('Traveling')
        allergic = ChoiceItem('Allergic')
        formula_strength_high = ChoiceItem('Formula strength is too high')
        formula_strength_low = ChoiceItem('Formula strength is too low')
        no_results = ChoiceItem('I’m not seeing a difference')
        financial_reason = ChoiceItem('Financial reasons')
        shipments_frequent = ChoiceItem('Shipments are too frequent, I need to catch up')

    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)

    uuid = models.UUIDField(blank=False, default=uuid4, unique=True)
    customer = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.CASCADE,
                                 related_name='order_product_subscriptions')
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL,
                                related_name='order_product_subscriptions')
    current_period_start_datetime = models.DateTimeField(auto_now=False, null=True)
    current_period_end_datetime = models.DateTimeField(auto_now=False, null=True)
    cancel_datetime = models.DateTimeField(auto_now=False, null=True)
    cancel_reason = models.CharField(_('Cancellation Reason'), max_length=200, null=True, blank=True)
    frequency = models.IntegerField(_('Subscription frequency in months'), default=0)
    delay_in_days = models.IntegerField(_('Delay of subscription in days'), default=0)
    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Indicates if this subscription plan is active.'))
    discount_code = models.CharField(_('Invoice Subscription ID'), max_length=32, null=True, blank=True)
    upcoming_order_email_sent_datetime = models.DateTimeField(auto_now=False, null=True)
    open_invoice_id = models.CharField(_('Unpaid invoice ID'), max_length=32, null=True, blank=True)

    def get_order_item_subscription(self, product):
        return self.order_item_subscriptions.filter(product=product).first()

    def get_latest_plan_order(self):
        from orders.models import OrderItem
        from orders.models import Order

        latest_plan_order = None
        order_items = OrderItem.objects.filter(Q(order__customer=self.customer) &
                                               (Q(product=self.product.refill_product) | Q(product=self.product.trial_product)) &
                                               Q(order__payment_captured_datetime__isnull=False) &
                                               ~Q(order__status=Order.Status.cancelled))

        logger.debug(f'[get_latest_plan_order] customer: {self.customer.id}. subscription: {self.id}. product: {self.product}.order_items: {order_items}.')
        if order_items:
            latest_plan_order = order_items.latest('created_datetime').order
            logger.debug(f'[get_latest_plan_order] Latest plan order: {latest_plan_order.id}. Plan: {self.id}. Customer: {self.customer.email}.')
        return latest_plan_order

    def get_open_order(self):
        from orders.models import OrderItem
        from orders.models import Order

        open_order = None
        order_items = OrderItem.objects.filter(Q(order__customer=self.customer) &
                                               Q(order__autogenerated=True) &
                                               (Q(product=self.product.refill_product) | Q(product=self.product.trial_product)) &
                                               Q(order__payment_captured_datetime__isnull=True) &
                                               ~Q(order__status=Order.Status.cancelled))
        logger.debug(f'[get_open_order] customer: {self.customer.id}. product: {self.product}. order_items: {order_items}.')
        if order_items:
            open_order = order_items.latest('created_datetime').order
            logger.debug(f'[get_open_order] Latest open order: {open_order.id}. Plan: {self.id}. Customer: {self.customer.email}.')
        return open_order

    def reset_subscription_start_and_end_times(self):
        self.current_period_start_datetime = timezone.now()

        delta = self.frequency * 30
        if self.customer.is_on_trial_period:
            delta -= 30

        self.current_period_end_datetime = self.current_period_start_datetime + relativedelta(
            days=+delta)

        self.save(update_fields=['current_period_end_datetime', 'current_period_start_datetime'])

        logger.debug(f'[OrderProductSubscription][reset_subscription_start_and_end_times]. subscription: {self.id}. '
                     f'current_period_start_datetime: {self.current_period_start_datetime}. '
                     f'current_period_end_datetime: {self.current_period_end_datetime}.')

    def deactivate(self):
        self.is_active = False
        self.save(update_fields=["is_active"])

    @property
    def require_upcoming_order_email(self):
        ship_now_subscription_edits = self.subscription_edits.filter(type=Edit.Type.early_ship)
        logger.debug(f'[OrderProductSubscription][require_upcoming_order_email] '
                     f'customer: {self.customer.id}. ship_now_subscription_edits: {ship_now_subscription_edits}.')
        if ship_now_subscription_edits:
            ship_now_subscription_edit = ship_now_subscription_edits.latest('created_datetime')
            # if Ship Now was requested 8 days or less from the next ship date, then skip the upcoming order email
            if ship_now_subscription_edit.created_datetime > self.current_period_end_datetime - timedelta(days=8):
                return False

        resume_subscription_edits = self.subscription_edits.filter(type=Edit.Type.restart)
        logger.debug(
            f'[OrderProductSubscription][require_upcoming_order_email] '
            f'customer: {self.customer.id}. resume_subscription_edits: {resume_subscription_edits}.')
        if resume_subscription_edits:
            resume_subscription_edit = resume_subscription_edits.latest('created_datetime')
            # if subscription restart was requested 8 days or less from the next ship date, then skip the upcoming order email
            if resume_subscription_edit.created_datetime > self.current_period_end_datetime - timedelta(days=8):
                return False

        # Sometimes user add plans on the day of another shipment, but that plan has been invoiced already
        five_days_ago = timezone.now() - timedelta(days=5)
        if self.created_datetime > five_days_ago:
            logger.debug(
                f'[Subscription][require_upcoming_order_email] '
                f'Customer: {self.customer.id}. Subscription: {self.id}. Plan created less than 5 days ago.')
            return False

        # upcoming order created
        upcoming_order = self.get_open_order()
        logger.debug(
            f'[OrderProductSubscription][require_upcoming_order_email] '
            f'customer: {self.customer.id}. upcoming_order: {upcoming_order}.')
        if upcoming_order:
            return False
        return True

    def __str__(self):
        return f'uuid: {self.uuid}, ' \
            f'customer: {self.customer.email}, ' \
            f'frequency: {self.frequency}, ' \
            f'is active: {self.is_active} ' \
            f'product: {self.product.name}, ' \
            f'start time: {self.current_period_start_datetime}, ' \
            f'end time: {self.current_period_end_datetime}, ' \
            f'delay_in_days: {self.delay_in_days}, ' \
            f'cancel_datetime: {self.cancel_datetime}, ' \
            f'cancel_reason: {self.cancel_reason}'

    def save(self, **kwargs):
        if not self.pk:
            if self.current_period_start_datetime:
                delta_in_days = self.frequency * 30 + self.delay_in_days
                if self.customer.is_on_trial_period:
                    delta_in_days -= 30
                self.current_period_end_datetime = self.current_period_start_datetime + relativedelta(days=+delta_in_days)
                logger.debug(f'[current_period_end_datetime] subscription: {self.id}. end date: {self.current_period_end_datetime} ')
        super().save(**kwargs)


class OrderItemSubscription(models.Model):
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    customer = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.CASCADE,
                                 related_name='order_item_subscriptions')

    order_product_subscription = models.ForeignKey('subscriptions.OrderProductSubscription', null=True, blank=True, on_delete=models.CASCADE,
                                                   related_name='order_item_subscriptions')
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.CASCADE,
                                related_name='order_item_subscription_plans')
    payment_processor_subscription_id = models.CharField(_('Subscription ID assigned by the payment processor'),
                                                         max_length=256, null=True, blank=True)

    @property
    def current_period_end_datetime(self):
        return self.order_product_subscription.current_period_end_datetime

    @property
    def current_period_start_datetime(self):
        return self.order_product_subscription.current_period_start_datetime

    @property
    def frequency(self):
        return self.order_product_subscription.frequency

    @property
    def is_active(self):
        return self.order_product_subscription.is_active

    @property
    def is_part_of_set(self):
        return self.order_product_subscription.product.is_set

    def get_tax_rate(self):
        from payment.services.tax_jar_services import TaxJarService
        return TaxJarService().get_subscription_item_tax_rate(self)

    def __str__(self):
        return f'id: {self.id}, customer: {self.customer.email}, ' \
            f'payment_processor_subscription_id: {self.payment_processor_subscription_id}, ' \
            f'product: {self.product.name}'
