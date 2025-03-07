from typing import Any, Dict, Union, List, Optional

import stripe
from django.db.models import F, Case, When, Sum, IntegerField, Q
from django.conf import settings
from django.utils import timezone

from rest_framework.exceptions import APIException

from emr.models import Visit
from mail.services import MailService
from orders.models import Order
from payment_new.exceptions import BadRequestException
from subscriptions.models import Subscription
from users.models import User
from utils.logger_utils import logger


stripe.api_key = settings.STRIPE_KEY_SECRET


class StripeService:
    def get_discount(self, discount_code: str) -> Dict[str, Any]:
        stripe_coupon = self._retrieve_stripe_coupon(discount_code=discount_code)

        amount_off = (
            stripe_coupon.get("amount_off") if stripe_coupon.get("amount_off") else 0
        )
        percent_off = (
            stripe_coupon.get("percent_off") if stripe_coupon.get("percent_off") else 0
        )

        return {
            "discount_code": discount_code,
            "amount_off": amount_off,
            "percent_off": percent_off,
        }

    def authorize_payment(self, token: str, order: Order, capture: bool) -> Order:
        stripe_customer = self._create_or_retrieve_stripe_customer(
            customer=order.customer
        )
        stripe_card = self._create_or_retrieve_payment_method(
            customer=stripe_customer, token=token, set_default=False
        )
        if order.total_amount > 0:
            order = self._create_payment_intent_with_card(
                order=order, card=stripe_card, capture=capture
            )
        elif order.total_amount == 0:
            order.payment_processor_charge_id == "ch_00000000000000"
            order.notes = "Free order"
            order.save(update_fields=['notes', 'payment_processor_charge_id'])

        return order


    @classmethod
    def capture_payment(cls, order: Order) -> Order:
        payment_type = (
            order.payment_processor_charge_id.split("_")[0]
            if order.payment_processor_charge_id
            else None
        )
        logger.debug(
            f"[payment_new][StripeService][capture_payment] Capturing payment "
            f"for order: {order.id}. customer: {order.customer.id}. payment type: {payment_type}."
        )
        try:
            if (
                settings.DEBUG or settings.TEST_MODE
            ) and order.payment_processor_charge_id == "ch_00000000000000":
                return order

            if order.customer.is_skip_checkout_payment:
                logger.debug(
                    f"[payment_new][StripeService][capture_payment] Customer {order.customer.id} "
                    f"is exempt from payment at checkout."
                )
                return order

            payment_type_handler = {
                "ch": ProcessOrderPaymentService.handle_charge_payment_type,
                "in": ProcessOrderPaymentService.handle_invoice_payment_type,
                "pi": ProcessOrderPaymentService.handle_payment_intent_payment_type,
            }
            if (
                payment_type in payment_type_handler.keys()
                or order.customer.payment_processor_customer_id
            ):
                return payment_type_handler.get(
                    payment_type,
                    ProcessOrderPaymentService.handle_default_payment,
                )(order=order)
            logger.error(
                f"[payment_new][StripeService][capture_payment] Unable to capture payment for Order {order.id}. "
                f"Customer payment processor ID or Charge ID are unavailable."
            )
            return order
        except stripe.error.StripeError as stripe_error:
            error_message = stripe_error._message
            error_code = stripe_error.json_body.get("error", {}).get("code")
            logger.error(
                f"[payment_new][StripeService][capture_payment] Failed to capture payment "
                f"with error: {error_message}. Error code: {error_code}"
            )

            if error_code == "charge_expired_for_capture":
                logger.error(
                    f"[payment_new][StripeService][capture_payment] Recapture payment for order {order.id}."
                )
                order.payment_processor_charge_id = cls.create_stripe_charge(
                    customer_id=order.customer.payment_processor_customer_id,
                    order=order,
                    capture=True,
                )
                order.save(update_fields=["payment_processor_charge_id"])
                return order

            raise APIException(error_message)
        except stripe.error.APIConnectionError as stripe_error:
            logger.error(
                f"[payment_new][StripeService][capture_payment] Failed to capture payment "
                f"with error: {stripe_error}."
            )
            MailService.send_error_notification_email(
                notification="STRIPE ERROR",
                data=f"Payment capture failed for order: {order.id}. APIConnectionError: {stripe_error}.",
            )
            raise APIException(stripe_error)

    def webhook_handler(self, request):
        logger.debug(
            f"[payment_new][StripeService][webhook_handler] request: {request.data}."
        )
        invoice_type = request.data.get("type")
        if invoice_type.startswith("invoice."):
            self._invoice_webhook_handler(data=request.data.get("data"), event_type=invoice_type)

    def _invoice_webhook_handler(self, data: Dict[str, Any], event_type: str) -> None:
        invoice = data.get("object")
        invoice_id = invoice.get("id")
        customer_id = invoice.get("customer")

        logger.debug(
            f"[payment_new][StripeService][webhook_handler] "
            f"event_type: {event_type}. invoice_id: {invoice_id}. customer_id: {customer_id}."
        )

        try:
            customer = User.objects.get(payment_processor_customer_id=customer_id)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            return

        try:
            order = customer.orders.get(payment_processor_charge_id=invoice_id)
        except Order.DoesNotExist:
            order = None

        subscriptions = customer.subscriptions.filter(
            open_invoice_id=invoice_id
        )
        if not order or not subscriptions:
            order_id = order.id if order else None
            subscription_ids = subscriptions.values_list('id', flat=True) if subscriptions else None
            error_msg = f'Order or subscription not found for Stripe invoice: {invoice_id}. ' \
                        f'Customer: {customer.id}. Order: {order_id}. Subscriptions: {subscription_ids}. ' \
                        f'Stripe event type: {event_type}'
            logger.error(f"[payment_new][StripeService][_invoice_webhook_handler] {error_msg}")
            MailService.send_error_notification_email(
                notification="STRIPE INVOICE EVENT UPDATE ERROR", data=error_msg
            )
            return
        logger.debug(f"[payment_new][StripeService][_invoice_webhook_handler] "
                     f"order: {order}. subscriptions: {subscriptions.values_list('id', flat=True)}.")

        if event_type == "invoice.payment_succeeded":
            self._invoice_webhook_handler_payment_succeeded(
                order=order,
                subscriptions=subscriptions,
                customer=customer,
                invoice=invoice,
            )
        elif event_type == "invoice.payment_failed":
            self._invoice_webhook_handler_payment_failed(
                order=order,
                customer=customer,
                invoice=invoice
            )
        elif event_type == "invoice.finalization_failed":
            self._invoice_webhook_handler_finalization_failed(
                order=order,
                subscriptions=subscriptions,
                customer=customer,
                invoice=invoice,
            )
        elif event_type == "invoice.marked_uncollectible":
            self._invoice_webhook_handler_marked_uncollectible(
                order=order,
                subscriptions=subscriptions,
                customer=customer,
                invoice=invoice
            )

    def capture_payment_with_subscription_payment_method_or_default_payment_method(
            self, order: Order, payment_processor_card_id: Optional[str]
    ) -> str:
        if payment_processor_card_id:
            charge_id = StripeService.capture_payment_with_payment_method(
                order=order,
                payment_method_id=payment_processor_card_id,
            )
        else:
            charge_id = StripeService.capture_payment_with_default_payment_method(
                order=order
            )
        return charge_id

    def capture_payment_or_create_invoice(
            self, customer: User, subscriptions: List[Subscription], order: Order
    ) -> None:
        payment_processor_card_id = self._get_payment_processor_card_id_associated_with_subscriptions(
            subscriptions=subscriptions
        )
        charge_id = None
        try:
            charge_id = self.capture_payment_with_subscription_payment_method_or_default_payment_method(
                order=order, payment_processor_card_id=payment_processor_card_id
            )
        except stripe.error.StripeError as stripe_error:
            error_message = stripe_error._message
            error_code = stripe_error.json_body.get("error", {}).get("code")
            logger.error(
                f"[payment_new][stripe_services][capture_payment_or_create_invoice] Failed to capture payment "
                f"with error: {error_message}. Error code: {error_code}"
            )
        # TODO - put this task in a queue and retry
        except stripe.error.APIConnectionError as stripe_error:
            logger.error(
                f"[payment_new][stripe_services][capture_payment_or_create_invoice] Failed to capture payment "
                f"with error: {stripe_error}."
            )
            MailService.send_error_notification_email(
                notification="STRIPE ERROR",
                data=f"Payment capture failed for order: {order.id}. APIConnectionError: {stripe_error}.",
            )
            raise APIException(stripe_error)

        if charge_id:
            for subscription in subscriptions:
                subscription.open_invoice_id = None
                subscription.save(update_fields=["open_invoice_id"])

            order.payment_processor_charge_id = charge_id
            order.save(update_fields=["payment_processor_charge_id"])

            self.finalize_subscription_payment_success(customer=customer, order=order)

            logger.debug(
                f"[payment_new][stripe_services][capture_payment_or_create_invoice] "
                f"PaymentIntent captured. "
                f"Order: {order.id}. "
                f"Customer: {customer.id}. "
                f"Charge ID: {charge_id}"
            )
        else:
            invoice_id = self._create_invoice(
                customer=customer, order=order, payment_processor_card_id=payment_processor_card_id
            )

            if invoice_id:
                for subscription in subscriptions:
                    subscription.open_invoice_id = invoice_id
                    subscription.save(update_fields=["open_invoice_id"])
                order.status = Order.Status.pending_payment
                order.payment_processor_charge_id = invoice_id
                order.save(update_fields=["payment_processor_charge_id", "status"])

    def update_credit_card_info(self, user, token, set_default=True):
        stripe_customer = self._create_or_retrieve_stripe_customer(
            customer=user
        )
        stripe_card = self._create_or_retrieve_payment_method(
            customer=stripe_customer, token=token, set_default=set_default
        )
        logger.debug(f'[payment_new][stripe_services][update_credit_card_info] Stripe credit card attached to customer:'
                     f'{user.id}. Card: {stripe_card}.')
        return stripe_card

    def _create_invoice(self, customer, order, payment_processor_card_id = None):
        try:
            for order_item in order.order_items.all():
                logger.debug(f'[payment_new][stripe_services][create_invoice] '
                             f'unit_amount: {order_item.price}.')

                stripe_tax_id = self._get_tax_id(order_item)
                price = self._get_or_create_price(order_item)

                if stripe_tax_id:
                    invoice_item = stripe.InvoiceItem.create(
                        customer=customer.payment_processor_customer_id,
                        price=price.id,
                        tax_rates=[stripe_tax_id],
                    )
                else:
                    invoice_item = stripe.InvoiceItem.create(
                        customer=customer.payment_processor_customer_id,
                        price=price.id,
                    )

                logger.debug(f'[payment_new][stripe_services][create_invoice] '
                             f'invoice_item: {invoice_item}. price: {order_item.price}. tax: {order_item.tax_rate}.')

            self._add_shipping_invoice_item(order)

            invoice = stripe.Invoice.create(
                customer=customer.payment_processor_customer_id,
                auto_advance=True,   # auto-finalize this draft after ~1 hour
                discounts=[{'coupon': order.discount_code}],
                default_source=payment_processor_card_id
            )

            invoice_id = invoice.get('id')
            logger.debug(f'[payment_new][stripe_services][create_invoice] Stripe invoice created. '
                         f'Invoice id: {invoice_id}.')

            return invoice_id

        except (stripe.error.APIConnectionError, stripe.error.StripeError) as error:
            error = error.json_body.get('error', {})
            error_message = error.get('message', None)
            error_code = error.get('code', None)
            no_such_customer_message = error_message[0:17] == 'No such customer:'

            # Missing customer ID: Error: Missing required param: customer. Error code: parameter_missing
            # Email user to update payment if their Stripe customer ID can't be found or they don't have a Stripe customer ID
            if error_code == 'resource_missing' and no_such_customer_message or not customer.payment_processor_customer_id:
                customer.payment_processor_customer_id = None
                customer.save(update_fields=['payment_processor_customer_id'])
                MailService.send_user_email_subscription_payment_failure(customer)

            order.status = Order.Status.payment_failure
            order.save(update_fields=['status'])

            error_msg = f'Unable to create invoice for customer id {customer.id}'
            MailService.send_error_notification_email(notification='STRIPE INVOICE ERROR',
                                                      data=error_msg)

            logger.error(f'[payment_new][stripe_services][create_invoice] Unable to create invoice. '
                         f'Error: {error_message}. Error code: {error_code}')

    def _get_or_create_price(self, order_item):
        prices = stripe.Price.list(limit=1, product=f'PROD_{order_item.product.sku}', active=True)
        price = prices.data[0] if prices and prices.data else None
        if not price:
            price = stripe.Price.create(
                unit_amount=order_item.price,
                currency='usd',
                product=f'PROD_{order_item.product.sku}'
            )
            logger.error(f'[payment_new][_get_or_create_price] '
                         f'New Price created. Price: {price}.')
        else:
            logger.error(f'[payment_new][_get_or_create_price] '
                         f'Existing price: {price}.')
        return price

    def _get_tax_id(self, order_item):
        stripe_tax_id = None
        if order_item.tax_rate:
            try:
                # Search for Stripe tax rate
                tax_rate = '{:.4f}'.format(order_item.tax_rate * 100)
                stripe_tax_rates = stripe.TaxRate.list(limit=100)
                stripe_tax_rate = next(item for item in stripe_tax_rates if item["percentage"] == tax_rate)
                stripe_tax_id = stripe_tax_rate.get('id', None)

                logger.debug(f'[payment_new][stripe_services][_get_tax_id] stripe_tax_rates: {stripe_tax_rates}.'
                             f'stripe_tax_rate: {stripe_tax_rate}. stripe_tax_id: {stripe_tax_id}.')
            except StopIteration:
                stripe_tax_rate = stripe.TaxRate.create(
                    display_name=f'{tax_rate}%',
                    percentage=tax_rate,
                    inclusive=False,
                )
                stripe_tax_id = stripe_tax_rate.id

                logger.debug(
                    f'[payment_new][stripe_services][_get_tax_id] New Stripe tax created: {stripe_tax_rate}. '
                    f'stripe_tax_id: {stripe_tax_id}.')
        return stripe_tax_id

    def _add_shipping_invoice_item(self, order):
        if order.shipping_fee:
            prices = stripe.Price.list(limit=1, product='PROD_SHIPPING-450', active=True)
            price = prices.data[0] if prices and prices.data else None
            if price:
                invoice_item = stripe.InvoiceItem.create(
                    customer=order.customer.payment_processor_customer_id,
                    price=price.id,
                )

    @classmethod
    def update_order_payment_processor_charge_id(
        cls, order: Order, charge_id: str
    ) -> Order:
        Order.objects.filter(id=order.id).update(payment_processor_charge_id=charge_id)
        return Order.objects.filter(id=order.id).first()

    @classmethod
    def capture_payment_from_pi_payment_type(cls, order: Order) -> Union[str, None]:
        stripe.PaymentIntent.confirm(order.payment_processor_charge_id)
        payment_intent = stripe.PaymentIntent.capture(order.payment_processor_charge_id)
        charge_id = StripeService.get_charge_id_from_payment_intent(payment_intent)
        return charge_id

    def cancel_invoice(self, customer, invoice_id):

        if settings.TEST_MODE:
            return 1

        try:
            stripe_invoice = stripe.Invoice.retrieve(invoice_id)
            invoice_status = stripe_invoice.get("status")

            if invoice_status == "closed":
                stripe.Invoice.void_invoice(invoice_id)
            elif invoice_status == "draft":
                stripe.Invoice.delete(invoice_id)

            Subscription.objects.filter(open_invoice_id=invoice_id).update(open_invoice_id=None)

            logger.debug(f'[stripe_services][cancel_invoice] Void invoice. Customer: {customer.id}. '
                         f'invoice_id: {invoice_id}.')

        except (stripe.error.APIConnectionError, stripe.error.StripeError) as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = error.get('message', None)

            error_msg = f'Unable to cancel invoice for customer id {customer.payment_processor_customer_id}'
            MailService.send_error_notification_email(notification='STRIPE INVOICE ERROR',
                                                      data=error_msg)

            logger.error(f'[stripe_services][cancel_invoice] Unable to cancel invoice. '
                         f'Error: {error_message}')

    def is_invoice_closed(self, invoice_id: str) -> bool:
        is_closed = False

        try:
            stripe_invoice = stripe.Invoice.retrieve(invoice_id)
            is_closed = stripe_invoice.get("closed")
            logger.debug(
                f"[payment_new][StripeService][is_invoice_closed] "
                f"invoice_id: {invoice_id}. "
                f"is_closed: {is_closed}. "
                f"stripe_invoice: {stripe_invoice}."
            )
        except stripe.error.StripeError as error:
            logger.error(
                f"[payment_new][StripeService][is_invoice_closed] Unable to get invoice. "
                f"Error: {error}"
            )

        return is_closed

    @staticmethod
    def finalize_subscription_payment_success(
        customer: User, order: Order
    ) -> None:
        if order.is_otc_only():
            order.finalize_purchase()
        else:
            # ---- Handle expired yearly visit ----
            if customer.rx_status == User.RxStatus.expired:
                visits_pending_provider = customer.patient_visits.filter(Q(status=Visit.Status.provider_pending) |
                                                                         Q(status=Visit.Status.pending_prescription) |
                                                                         Q(status=Visit.Status.provider_awaiting_user_input))
                if visits_pending_provider:
                    visits_pending_provider_ids = visits_pending_provider.values_list('id', flat=True)
                    logger.debug(
                        f'[finalize_subscription_payment_success] Not handling expired medical visit. '
                        f'User: {customer.id}. '
                        f'Visits pending provider: {visits_pending_provider_ids}')
                    current_time = timezone.now()
                    order.payment_captured_datetime = current_time
                    order.purchased_datetime = current_time
                    order.status = Order.Status.pending_medical_provider_review
                    order.save(update_fields=['payment_captured_datetime', 'purchased_datetime', 'status'])

                    return

                visits = customer.patient_visits.filter(Q(status=Visit.Status.pending) |
                                                        Q(status=Visit.Status.skin_profile_pending) |
                                                        Q(status=Visit.Status.skin_profile_complete))

                visit = visits.latest('created_datetime') if visits else None

                logger.debug(
                    f'[finalize_subscription_payment_success] visits: {visits}. all visits: {customer.patient_visits.all().values()}.')

                if visit:
                    # Mark pending visits as complete
                    if visit.status == Visit.Status.pending or visit.status == Visit.Status.skin_profile_pending:
                        Visit.objects.filter(id=visit.id).update(skin_profile_status=Visit.SkinProfileStatus.incomplete_user_response,
                                                                 status=Visit.Status.skin_profile_complete)
                        MailService.send_user_email_skin_profile_completion_returning_user_incomplete_response(visit.patient)
                    logger.debug(
                        f'[finalize_subscription_payment_success] Pending visit: {visit.id}. User: {customer.email}. Status: {visit.status}.')
                else:
                    # Create a no-user-response visit
                    visit = Visit.objects.create(patient=customer)
                    Visit.objects.filter(id=visit.id).update(
                        skin_profile_status=Visit.SkinProfileStatus.no_changes_no_user_response,
                        status=Visit.Status.skin_profile_complete)
                    MailService.send_user_email_skin_profile_completion_returning_user_no_change_no_response(
                        visit.patient)

                    logger.debug(
                        f'[finalize_subscription_payment_success] No-user-response visit: {visit.id} created for user: {customer.email}.')

                if not order.emr_medical_visit or order.emr_medical_visit.is_expired:
                    order.emr_medical_visit = visit
                    order.save(update_fields=['emr_medical_visit'])

            order.finalize_purchase()

            # User's with expired visits need to queue their latest visit
            if customer.rx_status == User.RxStatus.expired and order.emr_medical_visit:
                order.emr_medical_visit.status = Visit.Status.provider_pending
                order.emr_medical_visit.save(update_fields=['status'])

    def _invoice_webhook_handler_payment_succeeded(
        self,
        order: Order,
        subscriptions: List[Subscription],
        customer: User,
        invoice: Dict[str, Any],
    ) -> None:

        for subscription in subscriptions:
            subscription.open_invoice_id = None
            subscription.save(update_fields=["open_invoice_id"])

        charge_id = invoice.get("charge")
        if charge_id:
            order.payment_processor_charge_id = charge_id
            order.save(update_fields=["payment_processor_charge_id"])

        invoice_id = invoice.get("id")
        if order.payment_captured_datetime:
            logger.debug(
                f"[payment_new][StripeService][_invoice_webhook_handler_payment_suceeded] "
                f"Duplicate webhook. Order payment already finalized."
                f"Order: {order.id}. "
                f"Customer: {customer.email}. "
                f"Invoice ID: {invoice_id}"
            )
            return

        StripeService.finalize_subscription_payment_success(customer=customer, order=order)

        logger.debug(
            f"[payment_new][StripeService][_invoice_webhook_handler_payment_suceeded] "
            f"Invoice payment succeeded. "
            f"Order: {order.id}. "
            f"Customer: {customer.email}. "
            f"Invoice ID: {invoice_id}"
        )

    def _invoice_webhook_handler_payment_failed(
        self, order: Order, customer: User, invoice: Dict[str, Any]
    ) -> None:
        order.status = Order.Status.payment_failure
        order.save(update_fields=["status"])

        invoice_id = invoice.get("id")
        MailService.send_user_email_subscription_payment_failure(customer)
        logger.error(
            f"[payment_new][StripeService][_handle_invoice_payment_fail_webhook] "
            f"Invoice payment failed. "
            f"Order: {order.id}. "
            f"Customer: {customer.email}. "
            f"Invoice ID: {invoice_id}"
        )

    def _invoice_webhook_handler_finalization_failed(
        self,
        order: Order,
        subscriptions: List[Subscription],
        customer: User,
        invoice: Dict[str, Any],
    ) -> None:
        for subscription in subscriptions:
            subscription.open_invoice_id = None
            subscription.save(update_fields=["open_invoice_id"])
        order.payment_processor_charge_id = None
        order.save(update_fields=["payment_processor_charge_id"])

        invoice_id = invoice.get("id")
        error_message = invoice.get("last_finalization_error")
        MailService.send_error_notification_email(
            notification="SUBSCRIPTION INVOICE FINALIZATION FAILED",
            data=(
                f"Stripe invoice finalization failed. Invoice id: {invoice_id}. "
                f"Error message: {error_message}. "
                f"Customer: {customer.id}. Order: {order.id}."
            ),
        )
        logger.debug(
            f"[payment_new][StripeService][_invoice_webook_handler_finalization_failed] "
            f"Invoice finalization failed. "
            f"Order: {order.id}. "
            f"Customer: {customer.email}. "
            f"Invoice ID: {invoice_id}"
        )

    def _invoice_webhook_handler_marked_uncollectible(
        self,
        order: Order,
        subscriptions: List[Subscription],
        customer: User,
        invoice: Dict[str, Any],
    ) -> None:
        order.notes = "Order was canceled because payment was marked uncollectible."
        order.status = Order.Status.cancelled
        order.save(update_fields=["notes", "status"])

        for subscription in subscriptions:
            subscription.is_active = False
            subscription.cancel_datetime = timezone.now()
            subscription.cancel_reason = (
                Subscription.CancelReason.payment_failure
            )
            subscription.save(
                update_fields=["cancel_datetime", "cancel_reason", "is_active"]
            )

        invoice_id = invoice.get("id")
        MailService.send_user_email_subscription_cancel_payment_failure(customer)
        logger.error(
            f"[payment_new][StripeService][_invoice_webhook_handler_marked_uncollectible] "
            f"Invoice marked uncollectible. "
            f"Order: {order.id}. "
            f"Customer: {customer.id}. "
            f"Invoice ID: {invoice_id}"
        )

    def _retrieve_stripe_coupon(self, discount_code: str) -> stripe.Coupon:
        try:
            stripe_coupon = stripe.Coupon.retrieve(id=discount_code)
        except stripe.error.InvalidRequestError:
            error_message = f"Stripe discount {discount_code} does not exist."
            logger.error(f"[payment_new][StripeService][_retrieve_stripe_coupon] {error_message}")
            raise BadRequestException(detail=error_message)

        if not stripe_coupon.get("valid"):
            error_message = f"Stripe discount {discount_code} is invalid."
            logger.error(f"[payment_new][StripeService][_retrieve_stripe_coupon] {error_message}")
            raise BadRequestException(detail=error_message)

        return stripe_coupon

    def _create_or_retrieve_stripe_customer(self, customer: User) -> stripe.Customer:
        stripe_customer = None
        if customer.payment_processor_customer_id:
            stripe_customer = self._retrieve_stripe_customer(customer=customer)

        if not stripe_customer:
            stripe_customer = self._create_stripe_customer(customer=customer)

        return stripe_customer

    def _create_stripe_customer(self, customer: User) -> stripe.Customer:
        try:
            stripe_customer = stripe.Customer.create(email=customer.email)
            customer.payment_processor_customer_id = stripe_customer.id
            customer.save(update_fields=["payment_processor_customer_id"])
            logger.debug(
                f"[payment_new][StripeService][_create_or_update_stripe_customer] Stripe customer created: {stripe_customer.id}"
            )
        except stripe.error.StripeError as error:
            logger.error(f"[payment_new][StripeService][_create_or_update_stripe_customer] {error}")
            raise BadRequestException(detail=error)

        return stripe_customer

    def _retrieve_stripe_customer(self, customer: User) -> stripe.Customer:
        try:
            stripe_customer = stripe.Customer.retrieve(
                id=customer.payment_processor_customer_id
            )
            logger.debug(
                f"[payment_new][StripeService][_retrieve_stripe_customer] Stripe customer retrieved: {stripe_customer.id}"
            )
        except stripe.error.InvalidRequestError as error:
            logger.error(
                f"[payment_new][StripeService][_retrieve_stripe_customer] Stripe customer {stripe_customer.id} does not exist."
            )
            customer.payment_processor_customer_id = None
            customer.save(update_fields=["payment_processor_customer_id"])
            return None
        except stripe.error.StripeError as error:
            logger.error(f"[payment_new][StripeService][_retrieve_stripe_customer] {error}")
            raise BadRequestException(detail=error)

        return stripe_customer

    def _create_or_retrieve_payment_method(self, customer: stripe.Customer, token: str, set_default: bool):
        cards = self._retrieve_customer_sources(customer=customer)
        return self._create_or_retrieve_card(
            customer=customer, cards=cards, token=token, set_default=set_default
        )

    def _retrieve_customer_sources(self, customer: stripe.Customer) -> Dict[str, Any]:
        try:
            cards = stripe.Customer.list_sources(id=customer.id, object="card")
        except stripe.error.StripeError as error:
            logger.error(f"[payment_new][StripeService][_retrieve_customer_sources] {error}")
            raise BadRequestException(detail=error)
        logger.debug(f"[payment_new][StripeService][_retrieve_customer_sources] sources: {cards}")
        return cards.data

    def _retrieve_stripe_token(self, token: str) -> str:
        try:
            stripe_token = stripe.Token.retrieve(id=token)
        except stripe.error.StripeError as error:
            logger.error(f"[payment_new][StripeService][_retrieve_stripe_token] {error}")
            raise BadRequestException(detail=error)

        return stripe_token

    def _create_or_retrieve_card(
        self, customer: User, cards: stripe.ListObject, token: str, set_default: bool
    ) -> stripe.Card:
        stripe_token = self._retrieve_stripe_token(token=token)
        fingerprint = stripe_token.card.fingerprint
        card = None

        tokenized_card = stripe_token.card
        # logger.debug(
        #     f"[payment_new][StripeService][_create_or_retrieve_card] stripe_token: {stripe_token}"
        # )

        for card_data in cards:
            # logger.debug(
            #     f"[payment_new][StripeService][_create_or_retrieve_card] card_data: {card_data}"
            # )
            if card_data.fingerprint == fingerprint:
                if card_data.exp_month == tokenized_card.exp_month and card_data.exp_year == tokenized_card.exp_year:
                    card = card_data
                    logger.debug(
                        f"[payment_new][StripeService][_create_or_retrieve_card] Duplicate card detected: {card.id}"
                    )
                    break
                else:
                    updated_card = stripe.Customer.modify_source(
                        card_data.customer,
                        card_data.id,
                        exp_month=tokenized_card.exp_month,
                        exp_year=tokenized_card.exp_year
                    )
                    # logger.debug(
                    #     f"[payment_new][StripeService][_create_or_retrieve_card] updated_card: {updated_card}"
                    # )
        if not card:
            try:
                card = stripe.Customer.create_source(
                    id=customer.id, source=stripe_token.id
                )
            except stripe.error.StripeError as error:
                logger.error(f"[payment_new][StripeService][_create_or_retrieve_card] {error}")
                raise BadRequestException(detail=error._message)

        if set_default:
            stripe.Customer.modify(
                customer.id,
                default_source=card.id,
            )

        logger.debug(
            f"[payment_new][StripeService][_create_or_retrieve_card] card: {card}"
        )
        return card

    def _create_payment_intent_with_card(
        self, order: Order, card: stripe.Card, capture: bool
    ) -> Order:

        try:
            if capture:
                stripe_payment_intent = stripe.PaymentIntent.create(
                    amount=order.total_amount,
                    currency="usd",
                    customer=order.customer.payment_processor_customer_id,
                    payment_method=card.id,
                    confirm=True,
                    metadata={'order_id': order.id,
                              'user_id': order.customer.id}
                )
                payment_processor_charge_id = StripeService.get_charge_id_from_payment_intent(stripe_payment_intent)
            else:
                stripe_payment_intent = stripe.PaymentIntent.create(
                    amount=order.total_amount,
                    currency="usd",
                    customer=order.customer.payment_processor_customer_id,
                    payment_method=card.id,
                    capture_method="manual",
                    metadata={'order_id': order.id,
                              'user_id': order.customer.id}
                )
                payment_processor_charge_id = stripe_payment_intent.id
        except stripe.error.StripeError as error:
            logger.error(f"[payment_new][StripeService][_create_payment_intent_with_card] {error}")
            raise BadRequestException(detail=error._message)
        logger.error(f"[payment_new][StripeService][_create_payment_intent_with_card] card: {card}")
        order.payment_processor_charge_id = payment_processor_charge_id
        order.payment_processor_card_id = card.id
        order.payment_processor = Order.PaymentProcessor.stripe
        order.save(update_fields=["payment_processor_card_id", "payment_processor_charge_id", "payment_processor"])

        logger.debug(f'[payment_new][stripe_services][_create_payment_intent_with_card] Created Stripe Payment Intent: '
                     f'{stripe_payment_intent.id}. Customer: {order.customer.id}. Order: {order.id}. Immediately captured: {capture}.')

        return order

    @staticmethod
    def capture_payment_with_default_payment_method(order: Order) -> str:
        payment_intent = stripe.PaymentIntent.create(
            amount=order.total_amount,
            currency="usd",
            customer=order.customer.payment_processor_customer_id,
            confirm=True,
        )
        charge_id = StripeService.get_charge_id_from_payment_intent(payment_intent)
        logger.debug(f"[payment_new][StripeService][capture_payment_with_default_payment_method] payment_intent {payment_intent}, "
                     f"charge_id: {charge_id}")

        return charge_id

    @staticmethod
    def capture_payment_with_payment_method(order: Order, payment_method_id: str) -> str:
        payment_intent = stripe.PaymentIntent.create(
            amount=order.total_amount,
            currency="usd",
            customer=order.customer.payment_processor_customer_id,
            confirm=True,
            payment_method=payment_method_id,
        )
        charge_id = StripeService.get_charge_id_from_payment_intent(payment_intent)
        logger.debug(f"[payment_new][StripeService][capture_payment_with_payment_method] payment_intent {payment_intent}, "
                     f"charge_id: {charge_id}")

        return charge_id

    @staticmethod
    def get_charge_id_from_payment_intent(payment_intent: Dict[str, Any]) -> str:
        charges = payment_intent.get("charges")
        first_charge = charges.data[0] if charges and charges.data else None
        charge_id = first_charge.get("id") if first_charge else None
        return charge_id

    @staticmethod
    def _get_payment_processor_card_id_associated_with_subscriptions(
        subscriptions: List[Subscription]
    ) -> Optional[str]:
        payment_processor_card_id = None
        if all(
            hasattr(subscription, "payment_processor_card_id") and subscription.payment_processor_card_id is not None
            for subscription in subscriptions
        ) and all(
            subscription.payment_processor_card_id == subscriptions[0].payment_processor_card_id
            for subscription in subscriptions  
        ):
            payment_processor_card_id=subscriptions[0].payment_processor_card_id
        return payment_processor_card_id

class ProcessOrderPaymentService:
    @staticmethod
    def handle_charge_payment_type(order: Order) -> Order:
        stripe.Charge.capture(order.payment_processor_charge_id)
        logger.debug(
            f"[ProcessOrderPaymentService][handle_charge_payment_type] Captured charge: {order.payment_processor_charge_id}"
        )
        return order

    @staticmethod
    def handle_invoice_payment_type(order: Order) -> Order:
        charge_id = stripe.Invoice.pay(order.payment_processor_charge_id).get("charge")
        if charge_id:
            order = StripeService.update_order_payment_processor_charge_id(
                order=order, charge_id=charge_id
            )
            Subscription.objects.filter(
                open_invoice_id=order.payment_processor_charge_id
            ).update(open_invoice_id=None)
            StripeService.finalize_subscription_payment_success(
                customer=order.customer, order=order
            )
            logger.debug(
                f"[ProcessOrderPaymentService][handle_invoice_payment_type] Paid invoice: {order.payment_processor_charge_id}. "
                f"charge_id: {charge_id}."
            )
        return order

    @staticmethod
    def handle_payment_intent_payment_type(order: Order) -> Order:
        charge_id = StripeService.capture_payment_from_pi_payment_type(order=order)
        if charge_id:
            order = StripeService.update_order_payment_processor_charge_id(
                order=order, charge_id=charge_id
            )
            StripeService.finalize_subscription_payment_success(
                customer=order.customer, order=order
            )
            logger.debug(
                f"[ProcessOrderPaymentService][handle_payment_intent_payment_type] "
                f"Captured payment intent: {order.payment_processor_charge_id}. "
                f"charge_id: {charge_id}"
            )
        return order

    @staticmethod
    def handle_default_payment(order: Order) -> Order:
        charge_id = StripeService.capture_payment_with_default_payment_method(order=order)
        if charge_id:
            order = StripeService.update_order_payment_processor_charge_id(
                order=order, charge_id=charge_id
            )
            StripeService.finalize_subscription_payment_success(
                customer=order.customer, order=order
            )
            logger.debug(
                f"[ProcessOrderPaymentService][handle_default_payment] "
                f"Captured payment intent: {order.payment_processor_charge_id}. "
                f"charge_id: {charge_id}"
            )
        return order
