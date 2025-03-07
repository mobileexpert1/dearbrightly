import datetime
import json
import pytz
import requests
import stripe
from dateutil.relativedelta import relativedelta
from dearbrightly.constants import MEDICAL_VISIT_FEE, STRIPE_FEE_PERCENTAGE
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from mail.services import MailService
from orders.models import Order
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from sms.services import SMSService
from subscriptions.models import Subscription
from users.models import User
from utils.logger_utils import logger

stripe.api_key = settings.STRIPE_KEY_SECRET

class StripeService:
    def webhook_handler(self, request):

        event_json = request.data
        event_type = event_json.get('type')

        #match_invoice = event_type.find('invoice') > 0
        #logger.debug(f'[StripeService][webhook_handler] Event Type: {event_type}. Match invoice: {match_invoice}')

        if event_type == 'invoice.payment_succeeded' or event_type == 'invoice.marked_uncollectible' \
                or event_type == 'invoice.payment_failed' or event_type == 'invoice.finalization_failed':
            self.invoice_webhook_handler(request)

    def invoice_webhook_handler(self, request):
        event_json = request.data
        event_type = event_json.get('type')
        event_data = event_json.get('data')
        event_object = event_data.get('object')
        invoice_id = event_object.get('id')
        last_finalization_error = event_object.get('last_finalization_error')

        logger.debug(f'[StripeService][invoice_webhook_handler] Invoice ID: {invoice_id}. '
                     f'Event type: {event_type}. Event object: {event_object}')

        customer_id = event_object.get('customer')
        try:
            customer = User.objects.get(payment_processor_customer_id=customer_id)
            logger.debug(f'[StripeService][invoice_webhook_handler] Handling webhook for '
                         f'customer: {customer.email}.')
        except User.DoesNotExist:
            error_msg = f'User not found with customer id {customer_id}'
            logger.error(f"[StripeService][invoice_webhook_handler] {error_msg}.")
            MailService.send_error_notification_email(notification='STRIPE CUSTOMER NOT FOUND',
                                                      data=error_msg)
            return
        except User.MultipleObjectsReturned:
            error_msg = f'Multiple customers found with Stripe customer id {customer_id}'
            logger.error(f"[StripeService][invoice_webhook_handler] {error_msg}.")
            MailService.send_error_notification_email(notification='MULTIPLE STRIPE CUSTOMER FOUND',
                                                      data=error_msg)
            return

        # Find an order with the corresponding invoice id
        try:
            order = customer.orders.get(payment_processor_charge_id=invoice_id)
        except Order.DoesNotExist:
            order = None

        # Find a subscription with the open invoice id
        try:
            subscription = customer.subscriptions.get(open_invoice_id=invoice_id)
        except Subscription.DoesNotExist:
            subscription = None

        if not (order and subscription):
            order_id = order.id if order else None
            subscription_id = subscription.id if subscription else None
            error_msg = f'Order or subscription not found for Stripe invoice: {invoice_id}. ' \
                f'Customer: {customer.id}. Order: {order_id}. Subscription: {subscription_id}. Stripe event type: {event_type}'
            logger.error(f"[StripeService][invoice_webhook_handler] {error_msg}.")
            MailService.send_error_notification_email(notification='STRIPE INVOICE EVENT UPDATE ERROR',
                                                      data=error_msg)
            return

        logger.debug(f'[stripe_services][invoice_webhook_handler] customer: {customer}. '
                     f'order: {order}. subscription: {subscription}.')

        if event_type == 'invoice.payment_succeeded':
            charge_id = event_object.get('charge', None)
            return self._handle_invoice_payment_success_webhook(invoice_id, customer, order, subscription, charge_id)

        if event_type == 'invoice.payment_failed':
            return self._handle_invoice_payment_fail_webhook(invoice_id, customer, order)

        if event_type == 'invoice.finalization_failed':
            last_finalization_error_msg = last_finalization_error.message if last_finalization_error else None
            return self._handle_invoice_finalization_failed_webhook(
                invoice_id, customer, order, subscription, last_finalization_error_msg)

        if event_type == 'invoice.marked_uncollectible':
            return self._handle_invoice_marked_uncollectible_webhook(invoice_id, customer, order, subscription)


    def finalize_subscription_payment_success(self, customer, order):
        from emr.models import Visit

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


    def _handle_invoice_payment_success_webhook(self, invoice_id, customer, order, subscription, charge_id=None):
        subscription.open_invoice_id = None
        subscription.save(update_fields=['open_invoice_id'])

        if charge_id:
            # Order.objects.filter(pk=order.id).update(payment_processor_charge_id=charge_id)
            # updated_order = Order.objects.filter(pk=order.id).first()
            # logger.debug(f'[stripe_services][_handle_invoice_payment_success_webhook] '
            #              f'updated_order: {updated_order.__dict__} ')
            order.payment_processor_charge_id = charge_id
            order.save(update_fields=['payment_processor_charge_id'])

        if order.payment_captured_datetime:
            logger.debug(f'[stripe_services][_handle_invoice_payment_success_webhook] '
                         f'Duplicate webhook. Order payment already finalized.'
                         f'Order: {order.id}. '
                         f'Customer: {customer.email}. '
                         f'Invoice ID: {invoice_id}')
            return

        self.finalize_subscription_payment_success(customer, order)
        logger.debug(f'[stripe_services][_handle_invoice_payment_success_webhook] '
                     f'Invoice payment succeeded. '
                     f'Order: {order.id}. '
                     f'Customer: {customer.email}. '
                     f'Invoice ID: {invoice_id}')


    def _handle_invoice_payment_fail_webhook(self, invoice_id, customer, order):
        order.status = Order.Status.payment_failure
        order.save(update_fields=['status'])
        notes = f'Invoice ID: {invoice_id}'
        MailService.send_order_notification_email(order,
                                                  notification_type='SUBSCRIPTION INVOICE PAYMENT FAILED',
                                                  data=notes)
        MailService.send_user_email_subscription_payment_failure(customer)
        logger.debug(f'[stripe_services][_handle_invoice_payment_fail_webhook] '
                     f'Invoice payment failed. '
                     f'Order: {order.id}. '
                     f'Customer: {customer.email}. '
                     f'Invoice ID: {invoice_id}')


    def _handle_invoice_finalization_failed_webhook(self, invoice_id, customer, order, subscription, error_msg):
        subscription.open_invoice_id = None
        subscription.save(update_fields=['open_invoice_id'])
        order.payment_processor_charge_id = None
        order.save(update_fields=['payment_processor_charge_id'])

        notes = f'Stripe invoice finalization failed. Invoice id: {invoice_id}. Error message: {error_msg}. ' \
            f'Customer: {customer.id}. Order: {order.id}.'
        MailService.send_error_notification_email(notification='SUBSCRIPTION INVOICE FINALIZATION FAILED',
                                                  data=notes)
        logger.debug(f'[stripe_services][_handle_invoice_finalization_failed_webhook] '
                     f'Invoice finalization failed. '
                     f'Order: {order.id}. '
                     f'Customer: {customer.email}. '
                     f'Invoice ID: {invoice_id}')


    def _handle_invoice_marked_uncollectible_webhook(self, invoice_id, customer, order, subscription):
        order.notes = "Order was canceled because payment was marked uncollectible."
        order.status = Order.Status.cancelled
        order.save(update_fields=['notes', 'status'])

        subscription.is_active = False
        subscription.cancel_datetime = timezone.now()
        subscription.cancel_reason = Subscription.CancelReason.payment_failure
        subscription.save(update_fields=['cancel_datetime', 'cancel_reason', 'is_active'])

        notes = f'Invoice ID: {invoice_id}.'
        MailService.send_order_notification_email(order,
                                                  notification_type='SUBSCRIPTION INVOICE MARKED UNCOLLECTIBLE',
                                                  data=notes)
        MailService.send_user_email_subscription_cancel_payment_failure(customer)
        logger.debug(f'[stripe_services][_handle_invoice_marked_uncollectible_webhook] '
                     f'Invoice marked uncollectible. '
                     f'Order: {order.id}. '
                     f'Customer: {customer.id}. '
                     f'Invoice ID: {invoice_id}')


    def get_discount(self, discount_code):
        try:
            response = stripe.Coupon.retrieve(id=discount_code, api_key=settings.STRIPE_KEY_SECRET)
        except stripe.error.InvalidRequestError as error:
            error_message = f'Discount {discount_code} fetch failed with error. {error._message}'
            logger.error(error_message)
            return Response(data={'detail': error._message}, status=status.HTTP_400_BAD_REQUEST)

        is_valid = response.get('valid')
        if not is_valid:
            error_message = f'Discount {discount_code} is invalid.'
            logger.error(error_message)
            return Response(data={'detail': error._message}, status=status.HTTP_400_BAD_REQUEST)

        amount_off = response.get('amount_off', 0)
        percent_off = response.get('percent_off', 0)

        return Response(
            data={'promo': discount_code,
                  'amount_off': amount_off,
                  'percent_off': percent_off},
            status=status.HTTP_200_OK
        )

    def transfer_medical_visit_fee(self, order):
        medical_provider = order.emr_medical_visit.medical_provider

        # logger.debug(
        #     f'[stripe_services][transfer_medical_visit_fee] medical_provider: {medical_provider}.')

        if not order:
            logger.error(f'[stripe_services][transfer_medical_visit_fee] Unable to transfer funds to medical provider. '
                         f'No order provided.')
            return

        if not medical_provider:
            logger.error(f'[stripe_services][transfer_medical_visit_fee] Unable to transfer funds to medical provider. '
                         f'No medical provider. '
                         f'Order: {order.id}.')
            return

        if not medical_provider.stripe_connect_id:
            logger.error(f'[stripe_services][transfer_medical_visit_fee] Unable to transfer funds to medical provider. '
                         f'No medical provider Stripe connect ID. '
                         f'Order: {order.id}. medical_provider: {medical_provider.id}.')
            return

        try:
            medical_visit_fee_less_stripe_charges = MEDICAL_VISIT_FEE*(1-STRIPE_FEE_PERCENTAGE)
            response = stripe.Transfer.create(
                amount=int(medical_visit_fee_less_stripe_charges),
                currency='usd',
                source_transaction=order.payment_processor_charge_id,
                destination=medical_provider.stripe_connect_id,
                transfer_group=order.id,
                metadata={'order_id': order.id,
                          'visit_id': order.emr_medical_visit.id,
                          'user_id': order.customer.id}
            )

            logger.debug(f'[stripe_services][transfer_medical_visit_fee] Stripe transfer created: {response}. '
                         f'Order: {order.id}. Visit {order.emr_medical_visit.id}. Paid to: {medical_provider.stripe_connect_id}')
            return response.id
        except stripe.error.StripeError as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = str(e)
            error_code = error.get('code', None)
            data = f'Order: {order.id}. Visit: {order.emr_medical_visit.id}. Error message: {error_message}. Error code: {error_code}.'
            logger.error(f'[stripe_services][transfer_medical_visit_fee] Failed to transfer payment '
                         f'with error: {error_message}. Error code: {error_code}')
            MailService.send_user_notification_email(order.customer,
                                                     notification='STRIPE CONNECT TRANSFER FAILURE',
                                                     data=data)
            return None

    def transfer_platform_service_fee(self, order):
        try:
            medical_provider = order.emr_medical_visit.medical_provider
            response = stripe.Transfer.create(
                amount=medical_provider.platform_service_fee,
                currency="usd",
                destination=settings.STRIPE_CONNECT_ID,
                stripe_account=medical_provider.stripe_connect_id,
                transfer_group=order.id,
                metadata={'order_id': order.id,
                          'visit_id': order.emr_medical_visit.id,
                          'user_id': order.customer.id}
            )

            logger.debug(f'[stripe_services][transfer_payment_to_dearbrightly] Stripe transfer created: {response}. '
                         f'Order: {order.id}. Visit {order.emr_medical_visit.id}. Paid from: {medical_provider.stripe_connect_id}.')

            return response.id
        except stripe.error.StripeError as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = str(e)
            error_code = error.get('code', None)
            data = f'Visit: {order.emr_medical_visit.id}. Error message: {error_message}. Error code: {error_code}.'
            logger.error(f'[stripe_services][transfer_payment_to_dearbrightly] Failed to transfer payment to Dear Brightly '
                         f'with error: {error_message}. Error code: {error_code}')
            MailService.send_user_notification_email(order.emr_medical_visit.customer,
                                                     notification='STRIPE CONNECT TRANSFER FAILURE',
                                                     data=data)
            raise APIException(error_message)

    def reverse_transfer(self, visit, transfer_id, connect_account_id=None):
        if not transfer_id:
            logger.error(f'[stripe_services][reverse_transfer] '
                         f'Unable to reverse transfer. '
                         f'No transfer ID provided. Visit: {visit.id}.')
            return

        try:
            if connect_account_id:
                # if reversal is needed from Stripe medical provider connect account, need to specify their Stripe account ID
                transfer_reversal = stripe.Transfer.create_reversal(stripe_account=connect_account_id,
                                                                    id=transfer_id)
            else:
                transfer_reversal = stripe.Transfer.create_reversal(transfer_id)
            logger.debug(f'[stripe_services][reverse_transfer] '
                         f'Stripe transfer reversal created. Visit {visit.id}. '
                         f'Response: {transfer_reversal}.')

            return transfer_reversal.id
        except stripe.error.StripeError as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = str(e)
            error_code = error.get('code', None)
            data = f'Visit: {visit.id}. Transfer ID: {transfer_id}. Error message: {error_message}. Error code: {error_code}.'
            logger.error(f'[stripe_services][reverse_transfer] Failed to reverse transfer payment '
                         f'with error: {error_message}. Error code: {error_code}')
            raise APIException(error_message)

    def get_transfer(self, transfer_id):
        transfer = None
        try:
            transfer = stripe.Transfer.retrieve(transfer_id)
        except stripe.error.StripeError as e:
            logger.error(f'[stripe_services][get_transfer] Failed to get transfer '
                         f'with error: {e}.')
        return transfer

    def create_stripe_charge(self, order):
        stripe_charge_id = self._create_stripe_charge(customer_id=order.customer.payment_processor_customer_id, order=order, capture=False)
        return stripe_charge_id

    def _create_stripe_charge(self, customer_id, order, capture):
        """
        A Stripe Charge object needs to be created to authorize a payment.
        A "capture" must occur within 7 days; otherwise, the user will get refunded that amount.
        """
        total_amount = int(order.subtotal + order.shipping_fee + order.tax - order.discount)
        try:
            stripe_charge = stripe.Charge.create(
                amount=total_amount,
                currency="usd",
                customer=customer_id,
                capture=capture,
                transfer_group=order.id,
                metadata={'order_id': order.id,
                          'user_id': order.customer.id}
            )
            logger.debug(f'[stripe_services][_create_stripe_charge] Created Stripe charge successfully: '
                         f'{stripe_charge.get("id")}. Immediately captured: {capture}.')
            return stripe_charge.get('id')
        except stripe.error.CardError as error:
            error_message = self._get_stripe_card_error_message(error)
            raise APIException(error_message)
        except stripe.error.StripeError as error:
            error_message = f'{error._message}'
            logger.error(f'[stripe_services][_create_stripe_charge] Stripe charge failed with error: '
                         f'{error_message}.')
            raise APIException(error_message)

    def _create_stripe_charge_with_token(self, token, order, capture):
        total_amount = int(order.subtotal + order.shipping_fee + order.tax - order.discount)
        try:
            stripe_charge = stripe.Charge.create(
                amount=total_amount,
                currency="usd",
                source=token,
                capture=capture,
                transfer_group=order.id,
                metadata={'order_id': order.id,
                          'user_id': order.customer.id}
            )
            logger.debug(f'[stripe_services][_create_stripe_charge_with_token] Created Stripe charge successfully: '
                         f'{stripe_charge.get("id")}. Immediately captured: {capture}.')
            return stripe_charge.get('id')
        except stripe.error.CardError as error:
            error_message = self._get_stripe_card_error_message(error)
            raise APIException(error_message)
        except stripe.error.StripeError as error:
            error_message = f'{error._message}'
            logger.error(f'[stripe_services][_create_stripe_charge_with_token] Stripe charge failed with error: '
                         f'{error_message}.')
            raise APIException(error_message)

    def _create_stripe_customer(self, token, customer):
        # change for token dict with type, token

        stripe_customer = {
            'source': token,
            'email': customer.email,
        }

        logger.debug(f'[stripe_services][_create_stripe_customer] Stripe customer data: '
                     f'{stripe_customer}')

        try:
            stripe_customer = stripe.Customer.create(**stripe_customer)
            logger.debug(f'[stripe_services][_create_stripe_customer] Stripe customer created: '
                         f'{stripe_customer.id}.')
            return stripe_customer
        except stripe.error.CardError as error:
            error_message = self._get_stripe_card_error_message(error)
            raise APIException(error_message)
        except stripe.error.StripeError as error:
            error_message = f'{error._message}'
            logger.error(f'[stripe_services][_create_stripe_customer] Stripe customer creation '
                         f'failed with error: {error_message}. {error.__dict__}')
            raise APIException(error_message)


    def _get_stripe_card_error_message(self, error):
        stripe_error = error.json_body.get('error')

        stripe_error_message = stripe_error.get('message', None)
        stripe_error_code = stripe_error.get('code', None)
        stripe_decline_code = stripe_error.get('decline_code', None)

        error_message = stripe_error_message
        if stripe_decline_code:
            error_message = f"{error_message} Reason for decline: {stripe_decline_code.replace('_', ' ')}"
        logger.error(f'[_get_stripe_card_error_message] Error message: {stripe_error_message} '
                     f'Error Code: {stripe_error_code}. Decline Code: {stripe_decline_code}.')
        return error_message


    def fetch_stripe_connect_user_id(self, user, authorization_code):
        headers = { 'Content-Type' : 'application/json' }
        body = { 'client_secret' : settings.STRIPE_KEY_SECRET,
                 'code' : authorization_code,
                 'grant_type': 'authorization_code' }
        response = requests.post(url=settings.STRIPE_CONNECT_OAUTH_TOKEN_URI, headers=headers, json=body)
        logger.debug(f'[fetch_stripe_connect_user_id] Response: {response.content}')

        if response.status_code == status.HTTP_200_OK:
            json_response = json.loads(response.content)
            stripe_user_id = json_response.get('stripe_user_id')
            return stripe_user_id
        else:
            error_msg = f'Unable to get Stripe Connect user ID for user: {response.content}'
            logger.error(error_msg)
            raise APIException(error_msg)


    def fetch_stripe_user_id(self, email):
        response = stripe.Customer.list(email=email)
        logger.debug(f'[fetch_stripe_user_id] Response: {response}')

        if response.data:
            customer_data = response.data[0]
            stripe_user_id = customer_data.get('id')
            logger.debug(f'[fetch_stripe_user_id] stripe_user_id: {stripe_user_id}')
            return stripe_user_id

        error_msg = f'Unable to get Stripe user ID for user: {response}'
        logger.error(error_msg)
        return None


    def update_credit_card_info(self, user, token):
        try:
            if not user.payment_processor_customer_id:
                # Create a customer so we can save their payment method
                stripe_customer = self._create_stripe_customer(token, user)
                stripe_customer_id = stripe_customer.id
                user.payment_processor_customer_id = stripe_customer_id
                user.save(update_fields=['payment_processor_customer_id'])
                logger.debug(f'[stripe_services][update_credit_card_info] Credit card info updated. Stripe customer created: '
                             f'{stripe_customer_id}')
            else:
                stripe_customer = stripe.Customer.modify(user.payment_processor_customer_id,
                                                         source=token)
                logger.debug(f'[stripe_services][update_credit_card_info] Stripe credit card updated: '
                             f'{stripe_customer}.')
            return stripe_customer
        except stripe.error.CardError as error:
            stripe_error = error.json_body.get('error')
            stripe_error_message = stripe_error.get('message', None)
            logger.error(f'[stripe_services][update_credit_card_info] Stripe credit card update '
                         f'failed with error: {stripe_error_message}.')
            raise APIException(stripe_error_message)
        except stripe.error.StripeError as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = error.get('message', None)
            error_code = error.get('code', None)
            no_such_customer_message = error_message[0:17] == 'No such customer:'

            # Create new Stripe customer if the current one cannot be found
            if error_code == 'resource_missing' and no_such_customer_message:
                invalid_stripe_customer_id = user.payment_processor_customer_id
                stripe_customer = self._create_stripe_customer(token, user)
                user.payment_processor_customer_id = stripe_customer.id
                user.save(update_fields=['payment_processor_customer_id'])

                logger.debug(f'[stripe_services][update_credit_card_info] '
                             f'Stripe customer ID {invalid_stripe_customer_id} not found. '
                             f'Stripe customer created: '
                             f'{user.payment_processor_customer_id}')
                return stripe_customer

            logger.error(f'[stripe_services][update_credit_card_info] Stripe credit card update '
                         f'failed with error: {error_message}. {error.__dict__}')
            raise APIException(error_message)


    def refund_order(self, order, reverse_transfer=False, refund_amount=None):
        try:
            if not order.payment_processor_charge_id:
                logger.error(f'[stripe_services][refund_order] '
                             f'Unable to refund order {order.id}. No charge id.')
                return

            refund_total_amount = not refund_amount or refund_amount == order.total_amount

            refund_amt = refund_amount if refund_amount and refund_amount <= order.total_amount else order.total_amount

            if order.is_rx_order() and not order.is_refill and not reverse_transfer and refund_total_amount:
                refund_amt = refund_amt - MEDICAL_VISIT_FEE

            total_amt = order.total_amount - refund_amt

            logger.debug(f'[stripe_service][refund_order] '
                         f'Customer: {order.customer.email}. '
                         f'Order: {order.id}. '
                         f'reverse_transfer: {reverse_transfer}. '
                         f'refund_amount: {refund_amount}. '
                         f'total_amt: {total_amt}.')

            if order.total_amount <= 0:
                logger.debug(f'[stripe_service][refund_order] Order: {order.id}. Refund amt less than 0.')
                return

            stripe_refund = stripe.Refund.create(
                charge=order.payment_processor_charge_id,
                amount=refund_amt,
            )

            logger.debug(f'[stripe_service][refund_order] '
                         f'Customer: {order.customer.email}. '
                         f'Order: {order.id}. '
                         f'Is refill: {order.is_refill}. '
                         f'reverse_transfer: {reverse_transfer}. '
                         f'input refund_amount: {refund_amount}. '
                         f'calculated refund_amt: {refund_amt}. '
                         f'Stripe refund response: {stripe_refund}.')
            return refund_amt
        except stripe.error.StripeError as error:
            logger.error(f'[stripe_services][refund_order] '
                         f'Unable to refund order {order.id} with error: {error._message}')
            raise APIException(error._message)


    def stripe_payout_to_bank(self, payout_amount, payout_threshold):

        try:
            balance_obj = stripe.Balance.retrieve()
            available_balances = balance_obj.get('available')
            balance = 0
            for available_balance in available_balances:
                balance += available_balance.get('amount') if available_balance else 0

            threshold = payout_threshold if payout_threshold else 500000
            if balance > threshold:
                payout = payout_amount if payout_amount and payout_amount <= balance else balance - 100000
                if payout > 0:
                    stripe.Payout.create(amount=payout, currency="usd")

            logger.error(f'[stripe_services][stripe_payout_to_bank] '
                         f'Balance: {balance_obj}. Balance Amount: {balance}. Payout Amount: {payout_amount}. Threshold: {threshold}.')

        except stripe.error.StripeError as error:
            logger.error(f'[stripe_services][stripe_payout_to_bank] '
                         f'Error: {error._message}')

    def fetch_customer_payment_methods(self, customer_id):
        logger.debug(f'[stripe_services][fetch_customer_payment_methods] '
                     f'customer_id: {customer_id}')
        try:
            payment_methods = stripe.PaymentMethod.list(customer=customer_id, type="card").get("data")
            logger.debug(f'[stripe_services][fetch_customer_payment_methods] response {customer_id} {payment_methods}')
            return payment_methods
        except stripe.error.StripeError as error:
            logger.error(f'[stripe_services][fetch_customer_payment_methods] '
                         f'Error: {error._message}')
            raise APIException(error._message)

    def fetch_customer_default_payment_method(self, customer_id):
        try:
            payment_methods = stripe.PaymentMethod.list(customer=customer_id, type="card")
            stripe_customer = stripe.Customer.retrieve(customer_id)
            default_source = stripe_customer.default_source

            default_payment_method = None
            for payment_method in payment_methods.get("data"):
                if payment_method.get("id") == default_source:
                    default_payment_method = payment_method

            return default_payment_method
        except stripe.error.StripeError as error:
            logger.error(f'[stripe_services][fetch_customer_default_payment_method] '
                         f'Error: {error._message}')
            raise APIException(error._message)

    def remove_customer(self, customer):
        try:
            stripe_customer_id = customer.payment_processor_customer_id
            if not stripe_customer_id:
                return
            stripe_customer = stripe.Customer.retrieve(stripe_customer_id)
            stripe_customer.delete()
            logger.debug(f'[stripe_services][remove_customer] stripe customer removed: {customer.id}.')
        except stripe.error.StripeError as error:
            logger.error(f'[stripe_services][remove_customer] Unable to remove customer. '
                         f'Error: {error._message}')

    def create_invoice(self, customer, order):

        if settings.TEST_MODE:
            return 1

        try:
            for order_item in order.order_items.all():
                logger.debug(f'[stripe_services][create_invoice] '
                             f'unit_amount: {order_item.price}.')

                price = stripe.Price.create(
                    unit_amount=order_item.price,
                    currency='usd',
                    product=f'PROD_{order_item.product.sku}'
                )

                stripe_tax_id = None
                if order_item.tax_rate:
                    try:
                        # Search for Stripe tax rate
                        tax_rate = '{:.4f}'.format(order_item.tax_rate*100)
                        stripe_tax_rates = stripe.TaxRate.list(limit=100)
                        stripe_tax_rate = next(item for item in stripe_tax_rates if item["percentage"] == tax_rate)
                        stripe_tax_id = stripe_tax_rate.get('id', None)

                        logger.debug(f'[stripe_services][create_invoice] stripe_tax_rates: {stripe_tax_rates}.'
                                     f'stripe_tax_rate: {stripe_tax_rate}. stripe_tax_id: {stripe_tax_id}.')
                    except StopIteration:
                        stripe_tax_rate = stripe.TaxRate.create(
                            display_name=f'{tax_rate}%',
                            percentage=tax_rate,
                            inclusive=False,
                        )
                        stripe_tax_id = stripe_tax_rate.id

                        logger.debug(f'[stripe_services][create_invoice] New Stripe tax created: {stripe_tax_rate}. '
                                     f'stripe_tax_id: {stripe_tax_id}.')

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

                logger.debug(f'[stripe_services][create_invoice] '
                             f'invoice_item: {invoice_item}. price: {price}. tax: {order_item.tax_rate}.')

            invoice = stripe.Invoice.create(
                customer=customer.payment_processor_customer_id,
                auto_advance=True,   # auto-finalize this draft after ~1 hour
                discounts=[{'coupon': order.discount_code}]
            )

            invoice_id = invoice.get('id')
            logger.debug(f'[stripe_services][create_invoice] stripe invoice created: {invoice.__class__}. '
                         f'Invoice id: {invoice_id}.')

            return invoice_id

        except (stripe.error.APIConnectionError, stripe.error.StripeError) as e:
            body = e.json_body
            error = body.get('error', {})
            error_message = error.get('message', None)
            error_code = error.get('code', None)
            no_such_customer_message = error_message[0:17] == 'No such customer:'

            # Missing customer ID: Error: Missing required param: customer. Error code: parameter_missing
            # Email user to update payment if their Stripe customer ID can't be found or they don't have a Stripe customer ID
            if error_code == 'resource_missing' and no_such_customer_message or not customer.payment_processor_customer_id:
                customer.payment_processor_customer_id = None
                customer.save(update_fields=['payment_processor_customer_id'])
                MailService.send_user_email_subscription_payment_failure(customer)

            error_msg = f'Unable to create invoice for customer id {customer.id}'
            MailService.send_error_notification_email(notification='STRIPE INVOICE ERROR',
                                                      data=error_msg)

            logger.error(f'[stripe_services][create_invoice] Unable to create invoice. '
                         f'Error: {error_message}. Error code: {error_code}')

    def cancel_invoice(self, customer, invoice_id):

        if settings.TEST_MODE:
            return 1

        try:
            if not self.is_invoice_closed(invoice_id):
                stripe.Invoice.void_invoice(invoice_id)
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

    # invoice closed means no payment is automatically collected
    def is_invoice_closed(self, invoice_id):
        is_closed = False
        try:
            stripe_invoice = stripe.Invoice.retrieve(invoice_id)
            is_closed = stripe_invoice.get('closed')
            logger.debug(f'[stripe_services][is_invoice_closed] '
                         f'invoice_id: {invoice_id}. '
                         f'is_closed: {is_closed}. '
                         f'stripe_invoice: {stripe_invoice}.')
        except (stripe.error.APIConnectionError, stripe.error.StripeError) as e:
            logger.error(f'[stripe_services][is_invoice_closed] Unable to get invoice. '
                         f'Error: {e}')

        return is_closed

    def get_stripe_subscriptions(self, limit=100):
        try:
            # the max limit is 100 per the Stripe documentation
            subs = stripe.Subscription.list(limit=limit)
            return subs
        except stripe.error.StripeError as error:
            return None

    def cancel_stripe_subscription(self, subscription_id):
        try:
            stripe.Subscription.delete(subscription_id)
        except stripe.error.StripeError as error:
            raise APIException(error._message)

    def get_subscription_cancel_time(self, subscription_id):
        try:
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            logger.debug(f'[stripe_services][get_subscription_cancel_time] Stripe subscription: {subscription_id}.')
            if stripe_subscription.status == 'canceled':
                cancel_datetime = datetime.datetime.fromtimestamp(stripe_subscription.canceled_at).strftime('%Y-%m-%d %H:%M:%SZ')
                return cancel_datetime
            return None
        except stripe.error.StripeError as error:
            raise APIException(error._message)

    def get_stripe_transfers(self, limit, starting_after):
        try:
            transfers = stripe.Transfer.list(limit=limit, starting_after=starting_after)
            return transfers
        except stripe.error.StripeError as error:
            return None