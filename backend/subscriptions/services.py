from datetime import timedelta, datetime
from copy import copy
from typing import Union, List, Optional
from itertools import groupby
from db_analytics.services import KlaviyoService
from django.conf import settings
from django.db import transaction
from django.db.models import Q, QuerySet
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from mail.services import MailService
from orders.services.services import OrderService
from payment.services.stripe_services import StripeService
from payment.services.tax_jar_services import TaxJarService
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from subscriptions.models import Subscription, Edit
from utils.logger_utils import logger
from users.models import User, ShippingDetails
from products.models import Product
from orders.models import Order, OrderItem
from payment_new.services.payment_service import PaymentService as NewPaymentService
from emr_new.services.curexa_service import CurexaService as NewCurexaService
from dearbrightly.models import FeatureFlag
from emr.models import Flag, Visit
from db_shopify.services.subscription_service import RechargeSubscriptionService
from subscriptions.serializers import SubscriptionSerializer
from users.serializers import PaymentDetailsSerializer, ShippingDetailsSerializer

class SubscriptionsService:

    @receiver(post_save, sender=Order)
    def order_status_update_handler(sender, instance, **kwargs):
        if kwargs.get('raw', True):
            return

        original_status = instance.get_original_status()

        if int(instance.status) == Order.Status.payment_complete and int(original_status) != Order.Status.payment_complete \
            or int(instance.status) == Order.Status.awaiting_fulfillment and int(original_status) != Order.Status.awaiting_fulfillment \
                or int(instance.status) == Order.Status.pending_pharmacy and int(original_status) != Order.Status.pending_pharmacy:
                SubscriptionsService().update_or_create_subscription(order=instance, start_time=timezone.now())
                SubscriptionsService()._reset_subscription_start_end_times(instance)

        # reset the start/end times of a subscription after the order has been shipped
        if int(instance.status) == Order.Status.shipped and int(original_status) != Order.Status.shipped:
            SubscriptionsService()._reset_subscription_start_end_times(instance)
            TaxJarService().create_transaction(instance)
            KlaviyoService().track_fulfilled_order_event(instance)

    def _reset_subscription_start_end_times(self, order):
        subscription_order_items = order.order_items.filter(Q(order_product__frequency__gt=0))
        for order_item in subscription_order_items:
            logger.debug(f'[_reset_subscription_start_end_times] order_item: {order_item}. subscription_order_items: {subscription_order_items}.')
            if order_item.subscription:
                order_item.subscription.reset_subscription_start_and_end_times()

    def resume_subscription(self, subscription):
        current_time = timezone.now()
        existing_current_period_end_datetime = subscription.current_period_end_datetime
        subscription.cancel_reason = None
        subscription.is_active = True
        subscription.current_period_end_datetime = existing_current_period_end_datetime if existing_current_period_end_datetime > current_time else current_time
        subscription.save()

        subscription_edit = Edit.objects.create(customer=subscription.customer,
                                                subscription=subscription,
                                                type=Edit.Type.restart)

        logger.debug(f'[SubscriptionsService][resume_subscription] '
                     f'Subscription ID: {subscription.id}. '
                     f'existing_current_period_end_datetime: {existing_current_period_end_datetime}. '
                     f'subscription_edit: {subscription_edit.__dict__}.')
        try:
            MailService.send_user_email_order_confirmation_resume(subscription.customer)
        except (APIException, ValidationError) as error:
            MailService.send_user_email_payment_failure(subscription.customer)
            raise ValidationError(error.detail)

    def update_or_create_subscription(self, order, start_time):
        logger.debug(f'[SubscriptionService][update_or_create_subscription] Order: {order.id}. Start time: {start_time}.')
        if not order:
            error_msg = 'Missing order parameter.'
            return Response(data={'detail': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        try:
            self.update_or_create_order_subscriptions(order=order, start_time=start_time)

        except APIException as error:
            MailService.send_order_notification_email(order,
                                                      notification_type='SUBSCRIPTION UPDATE OR CREATE FAILED',
                                                      data=error.detail)
            raise APIException(error.detail)

    def update_or_create_order_subscriptions(self, order, start_time):
        customer = order.customer
        for order_item in order.order_items.all():
            logger.debug(f'[SubscriptionService][update_or_create_order_subscriptions]  '
                         f'order: {order}.'
                         f'order_item: {order_item.id}. frequency: {order_item.frequency}. is subscription: {order_item.is_subscription}')
            if not order_item.is_subscription:
                continue

            # if order.shopify_order_id:
            #     try:
            #         if customer.shopify_user_id and not customer.recharge_user_id:
            #             customer = RechargeSubscriptionService.parse_recharge_user_id(user=customer)
            #         if customer and customer.recharge_user_id:
            #             RechargeSubscriptionService.update_subscription_with_recharge_subscription_data(user=customer, order=order)
            #             return
            #     except APIException as error:
            #         error_msg = f'Unable to create Recharge subscription for user {customer.id}. Error: {error}'
            #         logger.error(f"[SubscriptionService][update_or_create_order_subscriptions] {error_msg}")
            #         MailService.send_error_notification_email(notification='UPDATE SUBSCRIPTION WITH RECHARGE DATA FAILED',
            #                                                   data=error_msg)

            subscription = order_item.subscription

            logger.debug(
                f'[SubscriptionService][update_or_create_order_subscriptions] '
                f'Existing Subscription: {subscription}. '
                f'Customer subscriptions: {customer.subscriptions.all()}'
            )

            if subscription:
                subscription.current_period_start_datetime=start_time
                subscription.frequency=order_item.frequency
                subscription.product=order_item.product.refill_product if order_item.product.product_type == Product.Type.rx else order_item.product.trial_product
                subscription.quantity=order_item.quantity
                subscription.is_active=True
                subscription.payment_processor_card_id=order.payment_processor_card_id
                logger.debug(
                    f'[SubscriptionService][update_or_create_order_subscriptions] Updated subscription. '
                    f'Subscription: {subscription}.'
                )
            else:
                subscription = Subscription.objects.create(
                    current_period_start_datetime=start_time,
                    customer=order.customer,
                    frequency=order_item.frequency,
                    product=order_item.product.refill_product if order_item.product.product_type == Product.Type.rx else order_item.product.trial_product,
                    quantity=order_item.quantity,
                    payment_processor_card_id=order.payment_processor_card_id,
                )
                order_item.subscription = subscription
                order_item.save(update_fields=['subscription'])

                logger.debug(f'[SubscriptionService][update_or_create_order_subscriptions] Created subscription. '
                             f'order_item: {order_item.id}. '
                             f'Subscription: {subscription}. '
                             f'payment_processor_card_id: {order.payment_processor_card_id}. '
                             f'shipping_details_data: {order.shipping_details.__dict__}')

        subscription_ids = list(map(lambda x: x.subscription_id, order.order_items.all()))
        subscription_qs = Subscription.objects.filter(pk__in=subscription_ids)
        self.update_or_create_shipping_details(
            customer=customer,
            subscriptions_to_update=subscription_qs,
            shipping_details_to_update=None,
            shipping_details_data=order.shipping_details.__dict__)

    # TODO - Remove after Stripe refactor
    # Patch to temporarily fix issues with users who's payments have failed and > 10 days have elapsed and their failed payment order is missing
    # the upcoming order has been removed at this point and the order is not pushed to Curexa
    def patch_subscription_order_and_push_to_curexa(self, user, subscription_ids=None, push_to_curexa=True, capture_payment=False):
        from orders.models import Order

        subscriptions = (
            Subscription.objects.filter(customer__email=user.email)
            if not subscription_ids
            else Subscription.objects.filter(id__in=subscription_ids)
        )
        upcoming_subscription_order = OrderService().create_upcoming_subscription_order(subscriptions, user)
        if capture_payment:
            # payment capture should push the order to Curexa
            NewPaymentService().capture_payment(order=upcoming_subscription_order)
            return

            payment_captured_datetime = timezone.now()
            upcoming_subscription_order.payment_captured_datetime = payment_captured_datetime
            upcoming_subscription_order.purchased_datetime = payment_captured_datetime
            upcoming_subscription_order.save(update_fields=['payment_captured_datetime', 'purchased_datetime'])

        if upcoming_subscription_order:
            if push_to_curexa:
                response = NewCurexaService().create_curexa_order(order=upcoming_subscription_order)
                if response.status_code == status.HTTP_200_OK:
                    upcoming_subscription_order.status = Order.Status.pending_pharmacy
                    upcoming_subscription_order.save(update_fields=['status'])

                    data = f'Failed payment order patched. Customer: {user.email}. Upcoming Subscription Order: {upcoming_subscription_order.id}.'
                    MailService.send_error_notification_email(notification='FAILED PAYMENT ORDER PATCHED', data=data)
                else:
                    data = f'Failed payment order patch failed. Customer: {user.email}.'
                    MailService.send_error_notification_email(notification='FAILED PAYMENT ORDER PATCH FAILED',
                                                              data=data)
            else:
                upcoming_subscription_order.status = Order.Status.shipped
                upcoming_subscription_order.save(update_fields=['status'])
        else:
            data = f'Failed payment order patch failed. Customer: {user.email}.'
            MailService.send_error_notification_email(notification='FAILED PAYMENT ORDER PATCH FAILED', data=data)

    FREE_SUBSCRIPTION = "FREE_SUBSCRIPTION"

    def handle_upcoming_subscription_orders(self):
        self._flag_users_with_upcoming_orders_for_nourisil_rx()
        self._email_users_with_upcoming_order()
        self._invoice_users_with_orders_shipping_today()

    def _flag_users_with_upcoming_orders_for_nourisil_rx(self):
        if not FeatureFlag.is_enabled('Nourisil Formula'):
            return

        today = timezone.now()
        try:
            today_plus_8_days = today + timedelta(days=8)
            upcoming_subscriptions_lte_8_days_of_next_ship = (
                Subscription.objects.filter(
                    Q(is_active=True) &
                    Q(current_period_end_datetime__date__lte=today_plus_8_days) &
                    Q(product__product_category='retinoid')
                )
            )

            subscription_customer_ids = upcoming_subscriptions_lte_8_days_of_next_ship.values_list('customer_id', flat=True).distinct()
            customers_subscriptions_lte_8_days_of_next_ship = User.objects.filter(pk__in=subscription_customer_ids)

            logger.debug(
                f"[SubscriptionsService][_flag_users_with_upcoming_orders_for_nourisil_rx] today: {today}. "
                f"today_plus_8_days: {today_plus_8_days}. "
                f"upcoming_subscriptions_lte_8_days_of_next_ship: {upcoming_subscriptions_lte_8_days_of_next_ship}. "
                f"subscription_customer_ids: {subscription_customer_ids}. "
                f"customers_subscriptions_lte_8_days_of_next_ship: {customers_subscriptions_lte_8_days_of_next_ship}."
            )

            for customer in customers_subscriptions_lte_8_days_of_next_ship:
                if customer.require_yearly_medical_visit_update:
                    logger.debug(
                        f"[SubscriptionsService][_flag_users_with_upcoming_orders_for_nourisil_rx] "
                        f"Not flagging user: {customer.id} because of expired visit.")
                    continue
                latest_visit = customer.medical_visit
                if latest_visit:
                    prescription = latest_visit.get_latest_refill_prescription()
                    if prescription and not prescription.contains_ingredient('nourisil'):
                        try:
                            admin_user = User.objects.get(email='dearbrightly.test+admin@gmail.com') if settings.DEBUG else User.objects.get(email='admin@dearbrightly.com')
                        except User.DoesNotExist:
                            logger.error(f'[SubscriptionsService][_flag_users_with_upcoming_orders_for_nourisil_rx] Admin user for Flag creation does not exist.')
                            return

                        existing_flag = latest_visit.flags.filter(Q(acknowledged_datetime__isnull=True) &
                                                                  (Q(category=Flag.Category.require_medical_admin_update) |
                                                                  Q(category=Flag.Category.require_prescription_update)))
                        latest_refill_prescription = latest_visit.get_latest_refill_prescription()
                        if not existing_flag and \
                                latest_visit.status != Visit.Status.pending_prescription and \
                                not latest_refill_prescription.contains_ingredient('nourisil'):
                            body = f'Patient needs updated Nourisil formula for: {latest_refill_prescription.prescription.display_name}'
                            new_flag = Flag.objects.create(creator=admin_user, visit=latest_visit, body=body,
                                                           category=Flag.Category.require_medical_admin_update)

                            logger.debug(
                                f"[SubscriptionsService][_flag_users_with_upcoming_orders_for_nourisil_rx] "
                                f"flag created: {new_flag}"
                            )
                        else:
                            logger.debug(
                                f"[SubscriptionsService][_flag_users_with_upcoming_orders_for_nourisil_rx] "
                                f"existing flag: {existing_flag}"
                            )

        except APIException as error:
            raise APIException(error)

    def _email_users_with_upcoming_order(self):
        today = timezone.now()
        try:
            today_5_days = today + timedelta(days=5)
            today_7_days = today + timedelta(days=7)
            upcoming_subscriptions_between_5_7_days_next_ship = (
                Subscription.objects.filter(
                    Q(is_active=True) &
                    Q(current_period_end_datetime__date__gte=today_5_days) &
                    Q(current_period_end_datetime__date__lte=today_7_days)
                )
            )
            subscription_customer_ids = upcoming_subscriptions_between_5_7_days_next_ship.values_list('customer_id', flat=True).distinct()
            customers_subscriptions_between_5_7_days_next_ship = User.objects.filter(pk__in=subscription_customer_ids)

            logger.debug(
                f"[SubscriptionsService][_email_users_with_upcoming_order] today: {today}. today_5_days: {today_5_days}. today_7_days: {today_7_days}. "
                f"upcoming_subscriptions_between_5_7_days_next_ship: {upcoming_subscriptions_between_5_7_days_next_ship}. "
                f"subscription_customer_ids: {subscription_customer_ids}. "
                f"customers_subscriptions_between_5_7_days_next_ship: {customers_subscriptions_between_5_7_days_next_ship}."
            )

            for customer in customers_subscriptions_between_5_7_days_next_ship:
                customer_subscriptions = upcoming_subscriptions_between_5_7_days_next_ship.filter(customer=customer)
                self._bundle_customer_subscription_dates(customer, customer_subscriptions)
                self.check_next_ship_date_and_send_email(customer, customer_subscriptions, today)
                logger.debug(
                    f"[SubscriptionsService][_email_users_with_upcoming_order] "
                    f"customer_subscriptions: {customer_subscriptions}"
                )

        except APIException as error:
            raise APIException(error)

    def _bundle_customer_subscription_dates(self, customer: User, subscriptions: List[Subscription]):
        latest_customer_subscription = subscriptions.latest('current_period_end_datetime')
        two_days_out = latest_customer_subscription.current_period_end_datetime + timedelta(days=2)
        two_days_ago = latest_customer_subscription.current_period_end_datetime - timedelta(days=2)

        logger.debug(
            f"[SubscriptionsService][_bundle_customer_subscription_dates] "
            f"two_days_out: {two_days_out}. "
            f"two_days_ago: {two_days_ago}. "
            f"updated date: {latest_customer_subscription.current_period_end_datetime}. "
            f"subscriptions: {subscriptions}."
        )

        subscriptions_to_bundle = customer.subscriptions.filter(
            Q(is_active=True) &
            Q(current_period_end_datetime__date__lte=two_days_out) &
            Q(current_period_end_datetime__date__gte=two_days_ago)
        ).exclude(id=latest_customer_subscription.id)
        shopify_subscriptions_to_bundle = subscriptions_to_bundle.filter(
            recharge_address_id__isnull=False,
            recharge_payment_method_id__isnull=False,
        )
        # logger.debug(
        #     f"[SubscriptionsService][_bundle_customer_subscription_dates] subscriptions_to_bundle: {subscriptions_to_bundle}. "
        #     f"shopify_subscriptions_to_bundle: {shopify_subscriptions_to_bundle}."
        # )
        if shopify_subscriptions_to_bundle:
            RechargeSubscriptionService.bundle_customer_shopify_subscription_dates(
                latest_current_period_end_datetime=latest_customer_subscription.current_period_end_datetime,
                shopify_subscriptions_to_bundle=shopify_subscriptions_to_bundle,
            )
        subscriptions_to_bundle.exclude(
            recharge_address_id__isnull=False,
            recharge_payment_method_id__isnull=False,
        ).update(current_period_end_datetime=latest_customer_subscription.current_period_end_datetime)

    def _check_upcoming_order_email_sent(self, customer_subscriptions: List[Subscription]):
        if not customer_subscriptions:
            return False

        latest_email_sent_datetime = customer_subscriptions[0].upcoming_order_email_sent_datetime
        subscription_ship_date = customer_subscriptions[0].current_period_end_datetime
        for subscription in customer_subscriptions[1:]:
            if subscription.upcoming_order_email_sent_datetime and latest_email_sent_datetime:
                if subscription.upcoming_order_email_sent_datetime > latest_email_sent_datetime:
                    latest_email_sent_datetime = subscription.upcoming_order_email_sent_datetime
                    subscription_ship_date = subscription.current_period_end_datetime

        customer_subscriptions.update(upcoming_order_email_sent_datetime=latest_email_sent_datetime)

        logger.debug(
            f"[SubscriptionsService][_check_upcoming_order_email_sent] "
            f"subscription_ship_date: {subscription_ship_date}. "
            f"latest_email_sent_datetime: {latest_email_sent_datetime}."
        )

        if Subscription.is_email_sent_recently(subscription_ship_date, latest_email_sent_datetime):
            return True

        return False

    def check_next_ship_date_and_send_email(
        self, customer: User, customer_subscriptions: List[Subscription], today: datetime
    ):
        logger.debug(
            f"[SubscriptionsService][_email_users_with_upcoming_order] todays_date: {today}. "
            f"customer_subscriptions: {customer_subscriptions}."
        )
        subscriptions_by_shipping_details_and_payment_method = self.group_subscriptions_by_shipping_details_and_payment_method(
            subscriptions=customer_subscriptions
        )
        for subscriptions in subscriptions_by_shipping_details_and_payment_method:
            subscription = subscriptions[0]

            subscription_ids = [x.id for x in subscriptions]
            subscription_qs = Subscription.objects.filter(pk__in=subscription_ids)

            logger.debug(
                f"[SubscriptionsService][_email_users_with_upcoming_order] "
                f"subscriptions_by_shipping_details_and_payment_method: {subscriptions_by_shipping_details_and_payment_method}"
                f" subscription: {subscription.id}."
            )
            if self._check_upcoming_order_email_sent(subscription_qs):
                logger.debug(
                    f"[SubscriptionsService][_email_users_with_upcoming_order] Upcoming order {subscription.id}"
                    f" email already sent."
                )
            else:
                try:
                    MailService.send_user_email_upcoming_subscription_order_rx_unchanged_returning_user(
                        customer, subscription
                    )
                    subscription_qs.update(upcoming_order_email_sent_datetime=today)
                except AttributeError as error:
                    logger.error(f'[SubscriptionsService][_email_users_with_upcoming_order] '
                                 f'Unable to send upcoming order email to customer: {customer.id}.')

    def _invoice_users_with_orders_shipping_today(self):
        today = timezone.now()
        try:
            subscriptions_to_ship_today = (
                self.get_subscriptions_to_ship_today(today)
            )

            subscription_customer_ids = subscriptions_to_ship_today.values_list('customer_id', flat=True).distinct()
            customers_subscriptions_to_ship_today = User.objects.filter(pk__in=subscription_customer_ids)

            logger.debug(f'[SubscriptionsService][_invoice_users_with_orders_shipping_today] '
                         f'subscriptions_to_ship_today: {subscriptions_to_ship_today}. '
                         f'subscription_customer_ids: {subscription_customer_ids}.')

            for customer in customers_subscriptions_to_ship_today:
                customer_subscriptions = subscriptions_to_ship_today.filter(customer=customer).order_by('uuid')
                subscription = customer_subscriptions[0]
                logger.debug(f'[SubscriptionsService][_invoice_users_with_orders_shipping_today] '
                             f'customer_subscriptions: {customer_subscriptions}. subscription: {subscription}.')

                subscriptions_by_shipping_details_and_payment_method = self.group_subscriptions_by_shipping_details_and_payment_method(
                    subscriptions=customer_subscriptions
                )

                for _subscriptions in subscriptions_by_shipping_details_and_payment_method:
                    if not self._are_customer_subscriptions_valid(customer=customer, customer_subscriptions=_subscriptions):
                        continue

                    upcoming_subscription_order = self.get_or_create_upcoming_subscription_order(
                        subscriptions=_subscriptions, customer=customer
                    )

                    if not upcoming_subscription_order:
                        continue

                    NewPaymentService().capture_payment_or_create_invoice(
                        customer=customer,
                        subscriptions=_subscriptions,
                        order=upcoming_subscription_order,
                    )

        except APIException as error:
            notes = (
                f"Error creating upcoming subscription orders: {error}. "
            )
            logger.error(f"[SubscriptionsService][_invoice_users_with_orders_shipping_today] {notes}")
            MailService.send_error_notification_email(
                notification="UNABLE TO CREATE UPCOMING SUBSCRIPTION ORDERS", data=notes
            )

    def group_subscriptions_by_shipping_details_and_payment_method(
        self, subscriptions: "QuerySet[Subscription]"
    ) -> List:
        subscriptions = subscriptions.order_by("shipping_details", "payment_processor_card_id")
        subscriptions_by_shipping_details_and_payment_method = []
        for _, group in groupby(
            subscriptions, lambda obj: (obj.shipping_details, obj.payment_processor_card_id)
        ):
            _subscriptions = list(group)
            subscriptions_by_shipping_details_and_payment_method.append(_subscriptions)
        return subscriptions_by_shipping_details_and_payment_method

    def _are_customer_subscriptions_valid(self, customer: User, customer_subscriptions: List[Subscription]):
        for subscription in customer_subscriptions:
            if (
                    not self.check_if_an_upcoming_email_has_been_sent(subscription=subscription, customer=customer)
                    or self.check_if_an_invoice_has_already_been_created(subscription=subscription, customer=customer)
                    or self.check_if_a_subscription_order_was_paid_recently(subscription=subscription,
                                                                            customer=customer)
            ):
                return False

        return True


    def get_subscriptions_to_ship_today(self, today: datetime):
        three_days_ago = today - timedelta(days=3)
        subscriptions_to_ship_today = Subscription.objects.filter(
            Q(is_active=True) &
            Q(current_period_end_datetime__date__lte=today) &
            Q(current_period_end_datetime__date__gte=three_days_ago) &
            Q(recharge_address_id__isnull=True) &
            Q(recharge_payment_method_id__isnull=True)
        )
        subscriptions_list = list(
            subscriptions_to_ship_today.values_list(
                "id", "customer__id", "current_period_end_datetime"
            )
        )
        logger.debug(
            f"[SubscriptionsService][_invoice_users_with_orders_shipping_today] today: {today}. "
            f"-3 days: {three_days_ago}. "
            f"subscriptions_due_today: {subscriptions_list}."
        )

        return subscriptions_to_ship_today

    def check_if_an_upcoming_email_has_been_sent(
        self, subscription: Subscription, customer: User
    ) -> bool:
        if subscription.is_upcoming_order_email_sent or \
                not subscription.require_upcoming_order_email:
            return True
        else:
            error_msg = (
                f"Attempting to invoice order with no upcoming order email sent (or not sent 5-14 days before the ship date). "
                f"Customer: {customer.id}. "
                f"Subscription: {subscription.id}. "
                f"Subscription ship date: {subscription.current_period_end_datetime}. "
                f"Upcoming order email sent datetime: {subscription.upcoming_order_email_sent_datetime}."
            )
            logger.error(
                f"[SubscriptionsService][check_if_an_upcoming_email_has_been_sent] {error_msg}"
            )
            MailService.send_error_notification_email(
                notification="UPCOMING ORDER EMAIL NOT SENT", data=error_msg
            )
            return False

    def check_if_an_invoice_has_already_been_created(
        self, subscription: Subscription, customer: User
    ) -> bool:
        if subscription.open_invoice_id:
            if not StripeService().is_invoice_closed(subscription.open_invoice_id):
                logger.error(
                    f"[SubscriptionsService][check_if_an_invoice_has_already_been_created] Open invoice ID already exists. "
                    f"Customer: {customer.id}. Subscription: {subscription.id}. "
                    f"Invoice ID: {subscription.open_invoice_id}."
                )
                return True

        return False

    def check_if_a_subscription_order_was_paid_recently(
        self, subscription: Subscription, customer: User
    ) -> bool:
        latest_paid_subscription_order = subscription.get_latest_plan_order()
        if latest_paid_subscription_order and (
            latest_paid_subscription_order.payment_captured_datetime
            > subscription.current_period_end_datetime - timedelta(days=14)
        ):
            error_msg = (
                f"Attempting to invoice recently paid order. "
                f"Customer: {customer.id}. "
                f"Subscription: {subscription.id}. "
                f"Subscription ship date: {subscription.current_period_end_datetime}. "
                f"Order: {latest_paid_subscription_order.id}. "
                f"Order status: {latest_paid_subscription_order.status}. "
                f"Order payment capture: {latest_paid_subscription_order.payment_captured_datetime}."
            )
            logger.error(
                f"[SubscriptionsService][check_if_a_subscription_order_was_paid_recently] {error_msg}"
            )
            MailService.send_error_notification_email(
                notification="DUPLICATE CHARGE", data=error_msg
            )
            return True

        return False

    def get_or_create_upcoming_subscription_order(
        self, subscriptions: List[Subscription], customer: User
    ) -> Union[Order, None]:

        open_orders = []
        for subscription in subscriptions:
            open_order = subscription.get_open_order()
            if open_order:
                open_orders.append(open_order)
        open_orders_uuids = [open_order.uuid for open_order in open_orders]
        open_orders = Order.objects.filter(uuid__in=open_orders_uuids)
        upcoming_subscription_order = open_orders.latest('created_datetime') if open_orders else None

        logger.debug(
            f"[SubscriptionsService][get_or_create_upcoming_subscription_order] "
            f"Existing upcoming_subscription_order: {upcoming_subscription_order}. subscriptions: {subscriptions}.")

        if upcoming_subscription_order:
            # check if product is added to the open order
            for subscription in subscriptions:
                subscription_products = upcoming_subscription_order.order_products.filter(
                    Q(product=subscription.product.trial_product) | Q(product=subscription.product.refill_product)
                )
                if not subscription_products:
                    upcoming_subscription_order.add_product(frequency=subscription.frequency,
                                                            product=subscription.product,
                                                            quantity=subscription.quantity)
                    upcoming_subscription_order.save()
        else:
            try:
                upcoming_subscription_order = (
                    OrderService().create_upcoming_subscription_order(
                        customer=customer,
                        subscriptions=subscriptions
                    )
                )
                logger.debug(
                    f"[SubscriptionsService][get_or_create_upcoming_subscription_order] "
                    f"created upcoming_subscription_order: {upcoming_subscription_order}")
            except APIException as error:
                notes = (
                    f"Error creating upcoming subscription order: {error}. "
                    f"Customer: {customer.id}. "
                    f"Subscriptions: {subscriptions}. "
                    f"Subscription ship date: {subscriptions[0].current_period_end_datetime}. "
                    f"Upcoming order email sent datetime: {subscriptions[0].upcoming_order_email_sent_datetime}."
                )
                logger.error(f"[SubscriptionsService][get_or_create_upcoming_subscription_order] {notes}")
                MailService.send_error_notification_email(
                    notification="UNABLE TO CREATE UPCOMING ORDER", data=notes
                )
                return None

        return upcoming_subscription_order

    def invoice_order(
        self, subscription: Subscription, customer: User, order: Order
    ):
        if not (subscription and customer and order):
            logger.error(
                f"[SubscriptionsService][invoice_order] "
                f"Unable to invoice order--missing parameter. "
                f"Customer: {customer}. Subscription: {subscription}. Order: {order}."
            )
            return
        invoice_id = None
        if subscription.discount_code == self.FREE_SUBSCRIPTION:
            logger.debug(
                f"[SubscriptionsService][invoice_order] "
                f"Free subscription. Skipping payment for customer: {customer.id}. "
                f"Order. {order.id}. Subscription: {subscription.id}."
            )
            StripeService().finalize_subscription_payment_success(customer, order)
        elif (
            not customer.payment_processor_customer_id
            and customer.is_skip_checkout_payment
        ):
            subscription.is_active = False
            subscription.cancel_datetime = timezone.now()
            subscription.cancel_reason = Subscription.CancelReason.free_customer
            subscription.save(update_fields=["cancel_datetime", "cancel_reason", "is_active"])
            subscription_edit = Edit.objects.create(customer=subscription.customer,
                                                    reason=Subscription.CancelReason.free_customer,
                                                    subscription=subscription,
                                                    type=Edit.Type.cancel)
        else:
            invoice_id = StripeService().create_invoice(customer=customer, order=order)

        if invoice_id:
            subscription.open_invoice_id = invoice_id
            subscription.save(update_fields=["open_invoice_id"])
            order.payment_processor_charge_id = invoice_id
            order.save(update_fields=["payment_processor_charge_id"])

    def cancel_subscription(self, subscription, cancel_reason, cancel_datetime=None):
        subscription.cancel_reason = cancel_reason
        subscription.is_active = False
        subscription.cancel_datetime = cancel_datetime if cancel_datetime else timezone.now()
        subscription.save(update_fields=['cancel_datetime', 'cancel_reason', 'is_active'])


        subscription_edit = Edit.objects.create(customer=subscription.customer,
                                                reason=cancel_reason,
                                                subscription=subscription,
                                                type=Edit.Type.cancel)
        if cancel_datetime:
            subscription_edit.created_datetime = cancel_datetime
            subscription_edit.save(update_fields=['created_datetime'])

        logger.debug(f'[services][cancel_subscription] '
                     f'subscription: {subscription}. '
                     f'subscription_edit: {subscription_edit}.')
        return subscription

    @staticmethod
    def _fetch_customer_payment_methods_from_stripe(
        user: User, subscriptions: "QuerySet[Subscription]"
    ) -> Optional[List]:
        payment_methods = None
        if (
            subscriptions.filter(
                is_active=True, payment_processor_card_id__isnull=False
            ).exists() and user.payment_processor_customer_id
        ):
            payment_methods = StripeService().fetch_customer_payment_methods(
                customer_id=user.payment_processor_customer_id
            )
        return payment_methods        

    @staticmethod
    def _fetch_customer_payment_methods_from_recharge(
        user: User, subscriptions: "QuerySet[Subscription]"
    ) -> Optional[List]:
        customer_recharge_payment_methods = None
        if (
            subscriptions.filter(
                is_active=True, recharge_payment_method_id__isnull=False
            ).exists() and user.recharge_user_id
        ):
            customer_recharge_payment_methods = RechargeSubscriptionService.get_customer_payment_methods(
                recharge_user_id=user.recharge_user_id
            )
        return customer_recharge_payment_methods  

    @staticmethod
    def _retrieve_payment_details_for_subscription_from_recharge_or_stripe(
        subscription: Subscription,
        stripe_payment_methods: List,
        recharge_payment_methods: List,
    ) -> Optional[dict]:
        card_data = None
        if subscription.recharge_payment_method_id and recharge_payment_methods:
            card = [payment_method.get("card") for payment_method in recharge_payment_methods
                    if payment_method.get("id") == int(subscription.recharge_payment_method_id)]
            card_data = {
                "id": subscription.recharge_payment_method_id,
                **card[0],
            } if card else None
        elif subscription.payment_processor_card_id and stripe_payment_methods:
            card = [payment_method.get("card") for payment_method in stripe_payment_methods
                    if payment_method.get("id") == subscription.payment_processor_card_id]
            card_data = {
                "id": subscription.payment_processor_card_id,
                **card[0],
            } if card else None
        return card_data

    def retrieve_payment_details_and_serialize_subscriptions(
        self, user: User, subscriptions: "QuerySet[Subscription]"
    ) -> List[Subscription]:
        stripe_payment_methods = self._fetch_customer_payment_methods_from_stripe(
            user=user, subscriptions=subscriptions
        )
        recharge_payment_methods = self._fetch_customer_payment_methods_from_recharge(
            user=user, subscriptions=subscriptions
        )
        for subscription in subscriptions:
            card_data = self._retrieve_payment_details_for_subscription_from_recharge_or_stripe(
                subscription=subscription,
                stripe_payment_methods=stripe_payment_methods,
                recharge_payment_methods=recharge_payment_methods,
            )
            if card_data:
                payment_details_serializer = PaymentDetailsSerializer(data=card_data)
                payment_details_serializer.is_valid(raise_exception=True)
                subscription.payment_details = payment_details_serializer.validated_data

        return SubscriptionSerializer(subscriptions, many=True).data

    @staticmethod
    def _get_existing_subscription_shipping_details_by_shipping_details_data(
        customer: User, shipping_details_data: dict, shipping_details_to_update: ShippingDetails
    ) -> Optional[ShippingDetails]:
        existing_shipping_details = ShippingDetails.objects.filter(
            subscriptions__customer=customer,
            first_name__iexact=shipping_details_data.get("first_name"),
            last_name__iexact=shipping_details_data.get("last_name"),
            address_line1__iexact=shipping_details_data.get("address_line1"),
            city__iexact=shipping_details_data.get("city"),
            state__iexact=shipping_details_data.get("state"),
            postal_code__iexact=shipping_details_data.get("postal_code"),
        )
        if shipping_details_to_update:
            existing_shipping_details = existing_shipping_details.exclude(pk=shipping_details_to_update.id)

        logger.debug(
            f"[SubscriptionsService][_get_existing_subscription_shipping_details_by_shipping_details_data] "
            f"existing_shipping_details: {existing_shipping_details.last()}"
        )

        return existing_shipping_details.last() if existing_shipping_details else None

    @staticmethod
    def _is_shipping_details_used_in_other_subscriptions(
        subscription_uuids: List[Subscription], shipping_details: ShippingDetails, customer: User
    ) -> bool:
        other_subscriptions = Subscription.objects.filter(
            customer=customer,
            shipping_details__id=shipping_details.id
        ).exclude(uuid__in=subscription_uuids)
        # logger.debug(
        #     f"[SubscriptionsService][_is_shipping_details_used_in_other_subscriptions] "
        #     f"other_subscriptions: {other_subscriptions}. shipping_details id: {shipping_details.id}. subscription_uuids: {subscription_uuids}"
        # )
        return other_subscriptions.exists()
    
    @staticmethod
    def _update_recharge_addresses_associated_with_subscriptions(
        subscriptions: "QuerySet[Subscription]", customer: User, shipping_details_data: dict
    ) -> None:
        associated_recharge_addresses = subscriptions.filter(
            is_active=True,
            recharge_address_id__isnull=False,
        ).values_list("recharge_address_id", flat=True).distinct()
        for recharge_address in associated_recharge_addresses:
            RechargeSubscriptionService.update_recharge_address(
                recharge_address_id=recharge_address,
                shipping_details_data=shipping_details_data,
                customer_id=customer.id,
            )

    # update shipping details if not used in other subscriptions; otherwise, create a new shipping detail object
    def _update_or_create_shipping_details(
        self,
        subscription_uuids: List[Subscription],
        customer: User,
        shipping_details_to_update: Optional[ShippingDetails],
        shipping_details_data: dict,
    ) -> ShippingDetails:
        new_shipping_details = None
        if shipping_details_to_update and not self._is_shipping_details_used_in_other_subscriptions(
            subscription_uuids=subscription_uuids, shipping_details=shipping_details_to_update, customer=customer
        ):
            serializer = ShippingDetailsSerializer(shipping_details_to_update, data=shipping_details_data, partial=True)
            serializer.is_valid(raise_exception=True)
            new_shipping_details = serializer.save()
            logger.debug(
                f"[SubscriptionsService][_update_or_create_shipping_details] "
                f"Shipping details ID: {new_shipping_details.pk} updated"
            )    
        if not new_shipping_details:
            serializer = ShippingDetailsSerializer(data=shipping_details_data)
            serializer.is_valid(raise_exception=True)
            new_shipping_details = serializer.save()
            logger.debug(
                f"[SubscriptionsService][_update_or_create_shipping_details] "
                f"Shipping details ID: {new_shipping_details.pk} created"
            )
        return new_shipping_details

    def update_or_create_shipping_details(
        self,
        customer: User,
        subscriptions_to_update: "QuerySet[Subscription]",
        shipping_details_to_update: ShippingDetails,
        shipping_details_data: dict
    ) -> ShippingDetails:
        subscription_uuids = [subscription.uuid for subscription in subscriptions_to_update]

        existing_shipping_details = self._get_existing_subscription_shipping_details_by_shipping_details_data(
            customer=customer, shipping_details_data=shipping_details_data, shipping_details_to_update=shipping_details_to_update
        )
        with transaction.atomic():
            if existing_shipping_details:
                new_shipping_details = existing_shipping_details
            else:
                new_shipping_details = self._update_or_create_shipping_details(
                    subscription_uuids=subscription_uuids,
                    customer=customer,
                    shipping_details_to_update=shipping_details_to_update,
                    shipping_details_data=shipping_details_data
                )

            # clean up orphaned shipping details
            # for subscription in subscriptions_to_update:
            #     if subscription.shipping_details is not None:
            #         subscription_shipping_details = subscription.shipping_details
            #         logger.debug(
            #             f"[SubscriptionsService][update_or_create_shipping_details] "
            #             f"user shipping details: {subscription_shipping_details.users.all()}. "
            #             f"subscriptions shipping details: {subscription_shipping_details.subscriptions.all()}."
            #         )
            #         if not (subscription_shipping_details.users.all() and subscription_shipping_details.subscriptions.all()):
            #             subscription_shipping_details.delete()

            subscriptions_to_update.update(shipping_details=new_shipping_details)
            self._update_rx_order_address(customer, subscriptions_to_update, new_shipping_details)
            self._update_medical_visit_provider(customer)

            logger.debug(
                f"[SubscriptionsService][update_or_create_shipping_details] "
                f"Subscriptions uuids: {subscription_uuids} updated with shipping details ID: {new_shipping_details.pk}"
            )
            self._update_recharge_addresses_associated_with_subscriptions(
                subscriptions=subscriptions_to_update, customer=customer, shipping_details_data=shipping_details_data
            )

        return new_shipping_details

    # update pending Rx orders with new shipping details so that the new address is pushed to Curexa
    # (OTC items pushed to Smart Warehouse can't be updated via API, so will require customer support request)
    def _update_rx_order_address(self, customer, subscriptions_to_update, new_shipping_details):
        retinoid_subscriptions = subscriptions_to_update.filter(product__product_type='Rx')
        for retinoid_subscription in retinoid_subscriptions:
            pending_rx_order_items = OrderItem.objects.filter(
                Q(order__customer=customer) &
                ~Q(order__status=Order.Status.shipped) &
                ~Q(order__status=Order.Status.awaiting_fulfillment) &
                ~Q(order__status=Order.Status.cancelled) &
                ~Q(order__status=Order.Status.refunded) &
                (Q(product=retinoid_subscription.product.trial_product) | Q(
                    product=retinoid_subscription.product.refill_product)))
            pending_rx_orders = list(set([x.order for x in pending_rx_order_items]))
            logger.debug(f'[SubscriptionsService][_update_rx_order_address] '
                         f'pending_rx_orders: {pending_rx_orders}. '
                         f'pending_rx_order_items: {pending_rx_order_items}.')
            for pending_rx_order in pending_rx_orders:
                OrderService.update_curexa_order_shipping_address(pending_rx_order, new_shipping_details)

    def _update_medical_visit_provider(self, customer):
        visit_before_prescription = customer.get_latest_medical_visit_before_prescription()
        if visit_before_prescription:
            visit_before_prescription.medical_provider = customer.get_medical_provider()
            visit_before_prescription.save(update_fields=['medical_provider'])