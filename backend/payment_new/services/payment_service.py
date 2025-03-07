import logging
import uuid
from collections import OrderedDict
from typing import List, Union

from django.conf import settings
from django.db.models import Q
from django.db.models import QuerySet
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from rest_framework.exceptions import APIException
from rest_framework.request import Request

from db_analytics.services import KlaviyoService, OptimizelyService
from dearbrightly.constants import TEN_PERCENT_OFF_FIRST_PURCHASE_PROMO
from emr.models import Visit
from mail.services import MailService
from orders.models import Order
from payment_new.exceptions import BadRequestException
from payment_new.services.coupon_service import CouponService
from payment_new.services.stripe_service import StripeService
from products.models import Product
from subscriptions.models import Subscription
from users.models import User
from utils.utils import skip_signal
from db_shopify.services.subscription_service import RechargeSubscriptionService

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class PaymentService:
    @classmethod
    def get_discount(
        cls, discount_code: str, shopping_bag_data: List[OrderedDict], customer: User
    ) -> dict:
        logger.debug(
            f"[PaymentService][get_discount] Discount code: {discount_code}. shopping_bag_data: {shopping_bag_data}"
        )

        product_uuids = list(map(lambda x: x["product_uuid"], shopping_bag_data))
        products = Product.objects.filter(uuid__in=product_uuids)

        if products.count() != len(product_uuids):
            return cls._get_product_missing_response()

        if cls._is_shipping_promo_ab_test(discount_code=discount_code):
            return cls._get_shipping_promo_ab_test_response(
                discount_code=discount_code,
                products=products,
                shopping_bag_data=shopping_bag_data,
                customer=customer,
            )

        if cls._is_first_time_trial(discount_code=discount_code):
            return cls._get_trial_response(
                discount_code=discount_code, products=products
            )
        return CouponService().retrieve_coupon(
            discount_code=discount_code,
            customer=customer,
            products=products,
            shopping_bag_data=shopping_bag_data,
        )

    @classmethod
    def authorize_payment(cls, request, token: str, order: Order) -> Order:
        if order.purchased_datetime:
            cls._raise_order_paid_before_exception()

        capture_payment = order.order_type == Order.OrderType.otc

        order = StripeService().authorize_payment(
            token=token, order=order, capture=capture_payment
        )
        order = cls._set_order_pending_status(order=order)
        cls._send_notifications(capture=capture_payment, order=order)
        cls._track_order(request=request, order=order, capture=capture_payment)

        return order

    @classmethod
    def _raise_product_not_found_exception(cls) -> None:
        error_message = "One of the products was not found."
        logger.error(f"[payment_new][PaymentService] {error_message}")
        raise BadRequestException(detail=error_message)

    @classmethod
    def _set_order_pending_status(cls, order: Order) -> Order:
        order.status = Order.Status.pending_payment
        order.status = order.get_next_checkout_step_status()
        order.purchased_datetime = timezone.now()

        order.save(update_fields=["status", "purchased_datetime"])

        return order

    @classmethod
    def _send_notifications(cls, capture: bool, order: Order) -> None:
        if capture:
            order.finalize_purchase()
            MailService.send_user_email_order_confirmation(order.customer)

    @classmethod
    def _track_order(cls, request: Request, order: Order, capture: bool,) -> None:
        if capture:
            KlaviyoService().track_placed_non_recurring_order_event(order)
        KlaviyoService().track_placed_order_event(order=order)
        # OptimizelyService(settings.OPTIMIZELY_PROJECT_ID).track(
        #     event_key="checkout_purchase", request=request
        # )

    @classmethod
    def _raise_order_paid_before_exception(cls) -> None:
        error_message = "Order has been paid before."
        logger.error(
            f"[payment_new][PaymentService][_raise_order_paid_before_exception] {error_message}"
        )
        raise BadRequestException(error_message)

    @classmethod
    def _get_product_missing_response(cls):
        error_message = "One of the products was not found."
        logger.error(
            f"[payment_new][PaymentService][_raise_order_paid_before_exception] {error_message}"
        )
        raise BadRequestException(detail=error_message)

    @classmethod
    def _get_trial_response(
        cls, discount_code: str, products: Union[QuerySet, List[Product]]
    ) -> dict:
        if cls._includes_rx_product(products=products):
            logger.debug(
                f"[payment_new][PaymentService][_get_trial_response] Amount off: {settings.FIRST_TIME_TRIAL_DISCOUNT}"
            )

            return {
                "discount_code": settings.FIRST_TIME_TRIAL_DISCOUNT_CODE,
                "amount_off": settings.FIRST_TIME_TRIAL_DISCOUNT,
                "percent_off": 0,
            }

        else:
            error_message = f"{discount_code} is only valid for Rx products."
            logger.error(f"[PaymentService][_get_trial_response] {error_message}")
            raise BadRequestException(detail=error_message)

    @classmethod
    def _is_first_time_trial(cls, discount_code: str) -> bool:
        return settings.FIRST_TIME_TRIAL_DISCOUNT_CODE == discount_code

    @classmethod
    def _includes_rx_product(cls, products: Union[QuerySet, List[Product]]) -> bool:
        return products.filter(product_type=Product.Type.rx).exists()

    @classmethod
    def _is_shipping_promo_ab_test(cls, discount_code: str) -> bool:
        return discount_code == TEN_PERCENT_OFF_FIRST_PURCHASE_PROMO

    @classmethod
    def _get_shipping_promo_ab_test_response(
        cls,
        discount_code: str,
        products: Union[QuerySet, List[Product]],
        shopping_bag_data: List[OrderedDict],
        customer=None,
    ) -> dict:
        is_first_order = cls._is_customer_first_order(customer) if customer else False

        if customer and not is_first_order:
            error_message = f"{discount_code} can only be applied to your first order"
            logger.error(f"[PaymentService][_get_trial_response] {error_message}")
            raise BadRequestException(detail=error_message)

        if discount_code == TEN_PERCENT_OFF_FIRST_PURCHASE_PROMO:
            return {
                "discount_code": TEN_PERCENT_OFF_FIRST_PURCHASE_PROMO,
                "amount_off": 0,
                "percent_off": 10,
            }

        error_message = f"{discount_code} is not valid"
        logger.error(f"[PaymentService][_get_trial_response] {error_message}")
        raise BadRequestException(detail=error_message)

    @classmethod
    def _is_customer_first_order(cls, customer: User) -> bool:
        orders = customer.orders.filter(
            ~Q(status=Order.Status.refunded) & ~Q(status=Order.Status.cancelled)
        )
        number_of_orders = len(orders) if orders else 0
        is_first_order = number_of_orders <= 1
        logger.debug(f"[_is_customer_first_order] is_first_order: {is_first_order}.")
        return is_first_order

    @classmethod
    def _get_number_otc_products(
        cls, shopping_bag_data, products: Union[QuerySet, List[Product]]
    ) -> int:
        otc_product_uuids = cls._get_otc_product_uuids(products)
        number_otc_products = 0
        for shopping_bag_item in shopping_bag_data:
            if uuid.UUID(shopping_bag_item.get("product_uuid")) in otc_product_uuids:
                number_otc_products += shopping_bag_item.get("quantity")
        return number_otc_products

    @classmethod
    def _get_otc_product_uuids(self, products: Union[QuerySet, List[Product]]) -> list:
        return list(
            products.filter(product_type=Product.Type.otc)
            .values_list("uuid", flat=True)
            .distinct()
        )

    @classmethod
    def reverse_transfer_fees(cls, visit: Visit) -> Visit:
        try:
            medical_visit_fee_reverse_transfer_id = StripeService.reverse_transfer(
                visit=visit,
                transfer_id=visit.medical_visit_fee_transfer_id,
                connect_account_id=None,
            )
            if medical_visit_fee_reverse_transfer_id:
                transfer = StripeService().get_transfer(visit.medical_visit_fee_transfer_id)
                connect_account_id = transfer.destination if transfer else None
            platform_service_fee_reverse_transfer_id = (
                StripeService.reverse_transfer(
                    visit=visit,
                    transfer_id=visit.platform_service_fee_transfer_id,
                    connect_account_id=connect_account_id,
                )
                if medical_visit_fee_reverse_transfer_id and connect_account_id
                else None
            )
            cls._update_visits_depends_on_fee_reverse_transfer_id(
                medical_visit_fee_reverse_transfer_id=medical_visit_fee_reverse_transfer_id,
                platform_service_fee_reverse_transfer_id=platform_service_fee_reverse_transfer_id,
                visit=visit,
            )
            return visit
        except APIException as error:
            raise APIException(error)

    @staticmethod
    def _update_visits_depends_on_fee_reverse_transfer_id(
        medical_visit_fee_reverse_transfer_id: str,
        platform_service_fee_reverse_transfer_id: str,
        visit: Visit,
    ) -> None:
        if medical_visit_fee_reverse_transfer_id:
            Visit.objects.filter(id=visit.id).update(
                medical_visit_fee_transfer_id=f"r: {visit.medical_visit_fee_transfer_id}"
            )
        if platform_service_fee_reverse_transfer_id:
            Visit.objects.filter(id=visit.id).update(
                platform_service_fee_transfer_id=f"r: {visit.platform_service_fee_transfer_id}"
            )

    @staticmethod
    def transfer_fees(order: Order) -> None:
        try:
            medical_visit_fee_transfer_id = StripeService().transfer_medical_visit_fee(
                order=order
            )
            platform_service_fee_transfer_id = (
                StripeService().transfer_platform_service_fee(order=order)
                if medical_visit_fee_transfer_id
                else None
            )
            logger.debug(
                f"[PaymentService][transfer_fees] visit {order.id}. "
                f"Transfer payment to medical provider. Transfer ID: {medical_visit_fee_transfer_id}. "
                f"platform_service_fee_transfer_id: {platform_service_fee_transfer_id}."
            )
            Visit.objects.filter(id=order.emr_medical_visit.id).update(
                medical_visit_fee_transfer_id=medical_visit_fee_transfer_id,
                platform_service_fee_transfer_id=platform_service_fee_transfer_id,
            )
        except APIException as error:
            raise APIException(error)

    def refund_order(
        self, order: Order, reverse_transfer: bool = False, refund_amount: int = None
    ) -> None:
        try:
            refund_amt = StripeService().refund_order(
                order, reverse_transfer, refund_amount
            )
            total_amt = order.total_amount - refund_amt
            logger.debug(
                f"[Payment Service][refund_order] refund_amount: {refund_amt}. "
                f"total_amt: {total_amt}. reverse_transfer: {reverse_transfer}."
            )
            Order.objects.filter(id=order.id).update(
                refund_amount=refund_amt + order.refund_amount, total_amount=total_amt
            )
            if reverse_transfer:
                self.reverse_transfer_fees(visit=order.emr_medical_visit)
            KlaviyoService().track_refunded_order_event(order=order)

        except APIException as error:
            MailService.send_error_notification_email(
                notification="REFUND FAILURE", data=error.detail
            )
            raise APIException(error)

    @staticmethod
    @receiver(post_save, sender=Order)
    @skip_signal()
    def order_status_update_handler(sender, instance, **kwargs):
        if kwargs.get("raw", True):
            return

        if instance.id:
            original_status = instance.get_original_status()
            try:
                logger.debug(
                    f"[PaymentService][order_status_update_handler] order: {instance.id}. "
                    f"Original status: {original_status}. "
                    f"New status: {instance.status}."
                )
                if (
                    int(instance.status) == Order.Status.skin_profile_complete
                    and int(original_status) != Order.Status.skin_profile_complete
                ):
                    if (
                        not instance.customer.has_active_rx_subscriptions
                        and instance.customer.payment_processor_customer_id
                        and not instance.payment_captured_datetime
                        or instance.customer.is_skip_checkout_payment
                    ):
                        PaymentService().capture_payment(order=instance)
                        logger.debug(
                            f"[PaymentService][order_status_update_handler] Capture payment for order {instance.id}. "
                            f"payment_captured_datetime: {instance.payment_captured_datetime}."
                        )

            except APIException:
                logger.error(
                    f"[PaymentService][order_status_update_handler] Unable to charge order {instance.id}."
                )

    def capture_payment(self, order: Order) -> Order:
        try:
            logger.debug(
                f"[payment_new][PaymentService][capture_payment] Capturing payment for order {order.id}."
            )
            order = StripeService().capture_payment(order=order)
            order.finalize_purchase()
            return order
        except APIException as error:
            logger.error(
                f"[payment_new][PaymentService][capture_payment] Failed to capture payment "
                f"with error: {error.detail}"
            )
            order = self.update_order_status_to_payment_failure(order=order)
            # MailService.send_order_notification_email(
            #     order=order,
            #     notification_type="CHARGE FAILED",
            #     data=f"Start of cycle charge failed: {error.detail}.",
            # )
            MailService.send_user_email_payment_failure(user=order.customer)
            raise APIException(error)

    def capture_payment_or_create_invoice(
        self, customer: User, subscriptions: List[Subscription], order: Order
    ) -> None:
        if not (customer and subscriptions and order):
            logger.error(
                f"[payment_new][PaymentService][capture_payment_or_create_invoice] "
                f"Unable to invoice order--missing parameter. "
                f"Customer: {customer}. Subscription: {subscriptions}. Order: {order}."
            )
            return None

        if order.total_amount == 0:
            StripeService().finalize_subscription_payment_success(
                customer=customer, order=order
            )
        elif (
            not customer.payment_processor_customer_id
            and customer.is_skip_checkout_payment
        ):
            for subscription in subscriptions:
                subscription.deactivate(reason=Subscription.CancelReason.free_customer)
        else:
            StripeService().capture_payment_or_create_invoice(
                customer=customer, subscriptions=subscriptions, order=order
            )

    def update_credit_card_info(self, request, user, token):
        try:
            stripe_card = StripeService().update_credit_card_info(user=user, token=token, set_default=True)
            logger.debug(
                f"[payment_new][Payment Service][update_credit_card_info] "
                f"Updating credit card. User: {user.id}. stripe card: {stripe_card.id}."
            )

            # Charge the user after the user updates their payment details if they have an order with failed payment
            failed_payment_orders = user.orders.filter(status=Order.Status.payment_failure)
            logger.debug(f'[Payment Service][update_credit_card_info] '
                         f'failed_payment_orders: {failed_payment_orders}.')
            for failed_payment_order in failed_payment_orders:
                self.capture_payment(order=failed_payment_order)
                MailService.send_user_email_order_confirmation_payment_detail_updated(user)

            msg = f"Updated order: {len(failed_payment_orders) > 0}."
            MailService.send_user_notification_email(user=user,
                                                     notification='PAYMENT DETAILS UPDATED',
                                                     data=msg)
            return user
        except APIException as error:
            MailService.send_user_notification_email(
                user,
                notification="CREDIT CARD UPDATE FAILED",
                data=f"Unable to update credit card details: {error.detail}",
            )
            raise APIException(error)


    def _resume_canceled_subscriptions(self, user, subscriptions):
        subscriptions_failed_payment_cancellation = subscriptions.filter(
            Q(cancel_reason=Subscription.CancelReason.payment_failure)
            & Q(is_active=False)
        )

        for (
                subscription_failed_payment_cancellation
        ) in subscriptions_failed_payment_cancellation:
            subscriptions.services.SubscriptionsService().resume_subscription(
                subscription=subscription_failed_payment_cancellation
            )
            logger.debug(
                f"[payment_new][Payment Service][_resume_canceled_subscriptions] User: {user.id}. "
                f"Resuming subscription: {subscription_failed_payment_cancellation.id}."
            )

    def _charge_failed_or_pending_subscriptions_orders(self, user, subscriptions):
        for subscription in subscriptions:
            order_items = subscription.order_items.filter(order__status=Order.Status.payment_failure)
            unique_order_ids_failed_payment = set((order_items.values_list('order__id', flat=True).distinct()))
            unique_orders_failed_payment = Order.objects.filter(pk__in=unique_order_ids_failed_payment) if len(unique_order_ids_failed_payment) > 0 else Order.objects.none()
            logger.debug(
                f"[payment_new][Payment Service][_charge_failed_or_pending_subscriptions_orders] User: {user.id}. "
                f"subscriptions: {subscriptions}. unique_order_ids_failed_payment: {unique_order_ids_failed_payment}. "
                f"unique_orders_failed_payment: {unique_orders_failed_payment}"
            )

        for order in unique_orders_failed_payment:
            StripeService().capture_payment_or_create_invoice(
                customer=user, subscriptions=subscriptions, order=order
            )

        # Cancel open invoices & charge open order
        subscriptions_pending_invoice = subscriptions.filter(open_invoice_id__isnull=False)
        logger.debug(
            f"[payment_new][Payment Service][_charge_failed_or_pending_subscriptions_orders] User: {user.id}. "
            f"subscriptions_pending_invoice: {subscriptions_pending_invoice}."
        )
        for subscription in subscriptions_pending_invoice:
            StripeService().cancel_invoice(user, subscription.open_invoice_id)
            order = user.orders.filter(Q(payment_processor_charge_id=subscription.open_invoice_id) & Q(
                status=Order.Status.pending_payment)).first()
            if order:
                StripeService().capture_payment_or_create_invoice(
                    customer=user, subscriptions=subscriptions_pending_invoice, order=order
                )


    def update_credit_card_info_for_subscriptions(self, user, token, subscriptions):
        try:
            stripe_card = StripeService().update_credit_card_info(user=user, token=token, set_default=False)
            recharge_subscriptions = subscriptions.filter(
                recharge_subscription_id__isnull=False
            )
            if recharge_subscriptions:
                RechargeSubscriptionService.migrate_subscriptions_on_payment_method_update(
                    stripe_card=stripe_card,
                    subscriptions=recharge_subscriptions,
                )
            else:
                subscriptions.update(payment_processor_card_id=stripe_card.get("id"))
            logger.debug(
                f"[payment_new][Payment Service][update_credit_card_info_for_subscriptions] "
                f"Updating credit card. User: {user.id}. Subscriptions: {subscriptions}"
            )
            self._resume_canceled_subscriptions(user, subscriptions)
            self._charge_failed_or_pending_subscriptions_orders(user, subscriptions)
        except APIException as error:
            MailService.send_user_notification_email(
                user,
                notification="CREDIT CARD UPDATE FAILED",
                data=f"Unable to update credit card details: {error.detail}",
            )
            raise APIException(error)
        return user

    def is_invoice_closed(self, invoice_id: str) -> bool:
        return StripeService().is_invoice_closed(invoice_id=invoice_id)

    def _is_free_subscription(self, subscription: Subscription) -> bool:
        return subscription.discount_code == settings.FREE_SUBSCRIPTION_DISCOUNT_CODE

    @staticmethod
    def update_order_status_to_payment_failure(order: Order) -> Order:
        order.status = Order.Status.payment_failure
        order.save(update_fields=["status"])
        return order
