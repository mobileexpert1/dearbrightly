from django.apps import apps
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from mail.services import MailService
from utils.logger_utils import logger
from orders.models import Order
from django.db.models import Q
from payment.services.stripe_services import StripeService
from payment_new.services.stripe_service import StripeService as NewStripeService
from rest_framework.exceptions import APIException, ValidationError
from db_analytics.services import KlaviyoService, OptimizelyService
from dearbrightly.constants import FIRST_TIME_TRIAL_DISCOUNT_CODE, FIRST_TIME_TRIAL_DISCOUNT
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from payment_new.services.payment_service import PaymentService as NewPaymentService

MedicalProviderUser = apps.get_model('users', 'MedicalProviderUser')
Visit = apps.get_model('emr', 'Visit')
optimizely_service = OptimizelyService(settings.OPTIMIZELY_PROJECT_ID)


class Service:
    def webhook_handler(self, request, service_platform):
        logger.debug(f'[Payment Service][webhook_handler] Receiving webhook: {request.data}. '
                     f'Service platform: {service_platform}')

        if service_platform == 'stripe':
            NewStripeService().webhook_handler(request)

    def get_customer_payment_methods(self, customer_id):
        return StripeService().fetch_customer_payment_methods(customer_id)

    def get_customer_default_payment_method(self, customer_id):
        return StripeService().fetch_customer_default_payment_method(customer_id)

    def get_discount(self, discount_code, products=None):
        # ---- Remove after 'product_price' experiment is complete ----
        logger.debug(f'discount_code: {discount_code}')
        if discount_code == FIRST_TIME_TRIAL_DISCOUNT_CODE:
            if self._includes_rx_product(products):
                logger.debug(f'[Payment Service][get_discount] Discount code: {discount_code}')
                if discount_code == FIRST_TIME_TRIAL_DISCOUNT_CODE:
                    data = {'promo': FIRST_TIME_TRIAL_DISCOUNT_CODE,
                            'amount_off': FIRST_TIME_TRIAL_DISCOUNT,
                            'percent_off': 0}
                return Response(
                    data=data,
                    status=status.HTTP_200_OK
                )
            else:
                error_message = f'{discount_code} is only valid for Rx products.'
                logger.error(error_message)
                raise APIException(error_message)

        return StripeService().get_discount(discount_code)

    def _includes_rx_product(self, products):
        from products.models import Product

        if not products:
            return False

        for product in products:
            product = Product.objects.get(uuid=product.get('product_uuid'))
            if product.product_type == Product.Type.rx:
                return True
        return False

    def fetch_stripe_connect_user_id(self, request, authorization_code):
        try:
            stripe_connect_id = StripeService().fetch_stripe_connect_user_id(user=request.user, authorization_code=authorization_code)
            try:
                medical_provider = MedicalProviderUser.objects.get(user_ptr_id=request.user.pk)
                medical_provider.stripe_connect_id = stripe_connect_id
                medical_provider.save(update_fields=['stripe_connect_id'])
                logger.debug(
                    f'[Checkout Services][fetch_stripe_connect_user_id] stripe_connect_id: {stripe_connect_id} fetched for {medical_provider.email}.')
            except MedicalProviderUser.DoesNotExist:
                error_msg = f'[Checkout Services][fetch_stripe_connect_user_id] Unable to get medical provider for user: {medical_provider.email}'
                logger.error(error_msg)
                raise APIException(error_msg)
        except APIException as error:
            raise APIException(error)

    def create_stripe_charge(self, order):
        stripe_connect_id = StripeService().create_stripe_charge(order=order)
        return stripe_connect_id

    def fetch_stripe_user_id(self, email):
        return StripeService().fetch_stripe_user_id(email)

    def update_credit_card_info(self, request, user, token):
        from subscriptions.services import SubscriptionsService
        from users.serializers import UserSerializer
        from subscriptions.models import Subscription

        try:
            StripeService().update_credit_card_info(user, token)

            logger.debug(f'[Payment Service][update_credit_card_info] '
                         f'Updating credit card. User: {user.email}.')

            # Charge the user after the user updates their payment details if they have an order with failed payment
            failed_subscription_orders = user.orders.filter(status=Order.Status.payment_failure)
            logger.debug(f'[Payment Service][update_credit_card_info] '
                         f'failed_subscription_orders: {failed_subscription_orders}.')
            for failed_subscription_order in failed_subscription_orders:
                NewPaymentService().capture_payment(order=failed_subscription_order)
                MailService.send_user_email_order_confirmation_payment_detail_updated(user)

            # Restart a user's subscription if it was paused because of failed payments
            # TODO - After Stripe refactor, don't start subscription immediately (start on the next subscription date)
            subscriptions_failed_payment_cancellation = user.subscriptions.filter(
                Q(cancel_reason=Subscription.CancelReason.payment_failure) & Q(is_active=False)
            )

            for subscription_failed_payment_cancellation in subscriptions_failed_payment_cancellation:
                SubscriptionsService().resume_subscription(subscription_failed_payment_cancellation)
                logger.debug(f'[Payment Service][update_credit_card_info] User: {user.email}. '
                                     f'Resuming subscription: {subscription_failed_payment_cancellation.id}.')

            msg = f"Updated order: {len(failed_subscription_orders) > 0}. Updated subscription: {len(subscriptions_failed_payment_cancellation) > 0}."
            MailService.send_user_notification_email(user=user,
                                                     notification='PAYMENT DETAILS UPDATED',
                                                     data=msg)

            user_data = UserSerializer(user).data
            return Response(data=user_data, status=status.HTTP_200_OK)
        except APIException as error:
            notes = f'Unable to update credit card details: {error.detail}'
            MailService.send_user_notification_email(user,
                                                     notification='CREDIT CARD UPDATE FAILED',
                                                     data=notes)
            raise APIException(error)

    def refund_order(self, order, reverse_transfer=False, refund_amount=None):
        try:
            refund_amt = StripeService().refund_order(order, reverse_transfer, refund_amount)
            total_amt = order.total_amount - refund_amt

            logger.debug(f'[Payment Service][refund_order] refund_amount: {refund_amt}. '
                         f'total_amt: {total_amt}. reverse_transfer: {reverse_transfer}.')

            Order.objects.filter(id=order.id).update(refund_amount=refund_amt + order.refund_amount,
                                                     total_amount=total_amt)

            if reverse_transfer:
                self.reverse_transfer_fees(order.emr_medical_visit)

            KlaviyoService().track_refunded_order_event(order)

            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            MailService.send_error_notification_email(notification='REFUND FAILURE',
                                                      data=error.detail)
            raise APIException(error)

    def transfer_fees(self, order):
        try:
            platform_service_fee_transfer_id = None
            medical_visit_fee_transfer_id = StripeService().transfer_medical_visit_fee(order)
            if medical_visit_fee_transfer_id:
                platform_service_fee_transfer_id = StripeService().transfer_platform_service_fee(order=order)
            logger.debug(f'[payment][services][transfer_fees] Visit: {order.emr_medical_visit.id}. Order: {order.id}. '
                         f'Transfer payment to medical provider. Transfer ID: {medical_visit_fee_transfer_id}. '
                         f'platform_service_fee_transfer_id: {platform_service_fee_transfer_id}.')
            Visit.objects.filter(id=order.emr_medical_visit.id).update(
                medical_visit_fee_transfer_id=medical_visit_fee_transfer_id,
                platform_service_fee_transfer_id=platform_service_fee_transfer_id)
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            raise APIException(error)

    def reverse_transfer_fees(self, visit):
        connect_account_id = None
        try:
            medical_visit_fee_reverse_transfer_id = StripeService().reverse_transfer(
                visit=visit, transfer_id=visit.medical_visit_fee_transfer_id, connect_account_id=None)
            platform_service_fee_reverse_transfer_id = None
            if medical_visit_fee_reverse_transfer_id:
                transfer = StripeService().get_transfer(visit.medical_visit_fee_transfer_id)
                connect_account_id = transfer.destination if transfer else None
                logger.debug(f'[payment][services][reverse_transfer_fees] '
                             f'transfer: {transfer}. '
                             f'connect_account_id: {connect_account_id}.')
            if connect_account_id:
                platform_service_fee_reverse_transfer_id = StripeService().reverse_transfer(visit=visit,
                                                                                            transfer_id=visit.platform_service_fee_transfer_id,
                                                                                            connect_account_id=connect_account_id)
            if medical_visit_fee_reverse_transfer_id:
                # unable to save reverse transfer id as it's not searchable on the Stripe dashboard, so adding a prefix to differentiate reversed transfers
                Visit.objects.filter(id=visit.id).update(medical_visit_fee_transfer_id=f'r: {visit.medical_visit_fee_transfer_id}')
            if platform_service_fee_reverse_transfer_id:
                Visit.objects.filter(id=visit.id).update(platform_service_fee_transfer_id=f'r: {visit.platform_service_fee_transfer_id}')
            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            raise APIException(error)

    def stripe_payout_to_bank(self, payout_amount=None, payout_threshold=None):
        try:
            StripeService().stripe_payout_to_bank(payout_amount=payout_amount, payout_threshold=payout_threshold)
        except APIException as error:
            raise APIException(error)

    @receiver(post_save, sender=Order)
    def order_status_update_handler(sender, instance, **kwargs):
        if kwargs.get('raw', True):
            return

        if instance.id:
            original_status = instance.get_original_status()
            try:
                logger.debug(f'[Payment Services][order_status_update_handler] order: {instance.id}. '
                             f'Original status: {original_status}. '
                             f'New status: {instance.status}.')

                # Charge order for new users after skin profile is complete
                if int(instance.status) == Order.Status.skin_profile_complete and \
                        int(original_status) != Order.Status.skin_profile_complete:
                    # capture payment for first-time customers
                    customer = instance.customer
                    if not customer.has_active_rx_subscriptions and customer.payment_processor_customer_id and not instance.payment_captured_datetime or \
                            customer.is_skip_checkout_payment:
                        NewPaymentService().capture_payment(order=instance)
                        logger.debug(
                            f'[Payment][Service][order_status_update_handler] Capture payment for order {instance.id}. '
                            f'payment_captured_datetime: {instance.payment_captured_datetime}.')

            except APIException as e:
                logger.error(f'[Payment][Service][order_status_update_handler] Unable to charge order {instance.id}.')


    def update_transfer_payment_to_medical_provider(self):
        try:
            has_more = True
            starting_after = None

            while has_more:
                transfers = StripeService().get_stripe_transfers(limit=100, starting_after=starting_after)
                transfer_data = transfers.get('data') if transfers else None
                last_transfer = transfer_data[-1] if transfer_data else None
                starting_after = last_transfer.id if last_transfer else None
                has_more = transfers.get('has_more', False)

                # logger.debug(f'[Payment][update_transfer_payment_to_medical_provider] '
                #              f'transfer_data: {transfer_data}. '
                #              f'last_transfer: {last_transfer}. '
                #              f'starting_after: {starting_after}. '
                #              f'has_more: {has_more}.')

                for transfer in transfer_data:
                    order_id_str = transfer.get('transfer_group', None)
                    order_id = int(order_id_str) if order_id_str else None
                    order = Order.objects.filter(id=order_id).first()
                    logger.debug(f'[Payment][update_transfer_payment_to_medical_provider] '
                                 f'order_id_str: {order_id_str}. transfer: {transfer}.')
                    if order:
                        medical_visit = order.emr_medical_visit
                        if medical_visit and not medical_visit.medical_visit_fee_transfer_id:
                            medical_visit.medical_visit_fee_transfer_id = transfer.id
                            medical_visit.save(update_fields=['medical_visit_fee_transfer_id'])
                            logger.debug(f'[Payment][update_transfer_payment_to_medical_provider] '
                                         f'Order: {order_id}. '
                                         f'Visit: {medical_visit.id}. '
                                         f'Transfer ID: {transfer.id}.')

            return Response(status=status.HTTP_200_OK)
        except APIException as error:
            raise APIException(error)