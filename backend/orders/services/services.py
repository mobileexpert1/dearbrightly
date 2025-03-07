import logging

from payment.services.tax_jar_services import TaxJarService
from copy import copy
from datetime import date, timedelta
from dearbrightly.constants import ALLOWED_SHIPPING_STATES, DEFAULT_SHIP_RATE, FREE_SHIP_ORDER_ITEM_COUNT_THRESHOLD, MEDICAL_VISIT_FEE, FIRST_TIME_TRIAL_DISCOUNT_CODE
from django.db.models import DateTimeField, ExpressionWrapper, F, IntegerField, Q, Sum, Value
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils import timezone
from emr.models import Visit
from mail.services import MailService
from orders.models import Order, OrderItem, OrderProduct
from products.models import Product
from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError, APIException
from subscriptions.models import Subscription
from users.exceptions import InvalidFieldException
from users.models import User, ShippingDetails
from utils.logger_utils import logger
from db_analytics.services import KlaviyoService, SegmentService, FacebookConversionServices
from emr_new.services.curexa_service import CurexaService as NewCurexaService
from orders.services.supply_chain_services import SupplyChainService
from users.validators.phone_number_validators import validate_unique_phone_number
from db_shopify.services.services import ShopifyService
from dearbrightly.constants import FIRST_TIME_TRIAL_DISCOUNT_CODE, FIRST_TIME_TRIAL_DISCOUNT
from typing import List
from django.db import transaction

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class OrderService:

    @staticmethod
    def update_curexa_order_shipping_address(order, shipping_details_instance):
        old_shipping_details = order.shipping_details
        old_shipping_details_dict = model_to_dict(old_shipping_details) if old_shipping_details else None
        if old_shipping_details_dict:
            old_shipping_details_dict.pop('id')

        address_dict = model_to_dict(shipping_details_instance)
        address_dict.pop('id')
        logger.debug(f'[OrderService][update_curexa_order_shipping_address] '
                     f'New shipping details: {address_dict}. '
                     f'Old shipping details: {old_shipping_details_dict}')
        OrderService().update_shipping_details(order=order, shipping_details=address_dict, is_checkout=False)

        if int(order.status) == Order.Status.pending_pharmacy:
            response = NewCurexaService().create_curexa_order(order)
            # Update Klaviyo order shipping address here?
            # KlaviyoService().track_placed_order_event(pending_order)
            logger.debug(f'[user_shipping_status_update_handler] Curexa response: {response}')
            if response.status_code != status.HTTP_200_OK:
                OrderService().update_shipping_details(order=order, shipping_details=old_shipping_details_dict,
                                                       is_checkout=False)
                logger.debug(f'[OrderService][user_shipping_status_update_handler] '
                             f'Reverse updated address: {order.shipping_details}')


    # email users after they've completed their Skin Profile
    @receiver(pre_save, sender=Visit)
    def skin_profile_completion_email_handler(sender, instance, **kwargs):
        user = instance.patient

        if not instance.id:

            if instance.skin_profile_status == Visit.SkinProfileStatus.no_changes_user_specified:
                MailService.send_user_email_skin_profile_completion_returning_user_no_change(user)
                return

            # --- Only want email sent for upcoming orders (not resume subscriptions) ----
            # if instance.skin_profile_status == Visit.SkinProfileStatus.no_changes_no_user_response:
            #     MailService.send_user_email_skin_profile_completion_returning_user_no_change_no_response(user)
            #     return

        try:
            pre_save_visit = Visit.objects.get(pk=instance.id)
        except Visit.DoesNotExist:
            return

        if instance.skin_profile_status == Visit.SkinProfileStatus.incomplete_user_response and \
                pre_save_visit.skin_profile_status != Visit.SkinProfileStatus.incomplete_user_response:
            MailService.send_user_email_skin_profile_completion_returning_user_incomplete_response(user)
            return

        if instance.skin_profile_status == Visit.SkinProfileStatus.complete and \
                pre_save_visit.skin_profile_status != Visit.SkinProfileStatus.complete:
            OrderService.send_skin_profile_completion_email(user)

    @staticmethod
    def send_skin_profile_completion_email(user):
        try:
            if user.rx_status == User.RxStatus.expired:
                MailService.send_user_email_skin_profile_completion_returning_user(user)
            else:
                MailService.send_user_email_skin_profile_completion_new_user(user)
        except APIException as error:
            logger.error(
                f'[_send_skin_profile_completion_email] Unable to send skin profile completion email to user: {user.email}. '
                f'Error: {error}.')
            
    @receiver(post_save, sender=Visit)
    def visit_created_handler(sender, instance, **kwargs):

        if kwargs.get('raw', True):
            return

        user = instance.patient
        created = kwargs.get('created', False)

        if created:
            if instance.skin_profile_status == Visit.SkinProfileStatus.no_changes_no_user_response:
                MailService.send_user_email_skin_profile_completion_returning_user_no_change_no_response(instance.patient)

            # associates created visits with orders pending a skin profile
            pending_medical_visit_orders = user.orders.filter(Q(status=Order.Status.pending_questionnaire) | Q(emr_medical_visit__isnull=True))
            pending_medical_visit_order = pending_medical_visit_orders.latest(
                'created_datetime') if pending_medical_visit_orders else None
            if pending_medical_visit_order and pending_medical_visit_order.is_rx_order():
                if not pending_medical_visit_order.emr_medical_visit:
                    pending_medical_visit_order.emr_medical_visit = instance
                    pending_medical_visit_order.save(update_fields=['emr_medical_visit'])
                # Queue visit if the order is paid
                if pending_medical_visit_order.is_paid:
                    logger.debug(
                        f'[visit_status_update_handler] Visits pending visits updated. Visit created {instance.id}. '
                        f'status: {instance.status}. skin profile status: {instance.skin_profile_status}.')
                    if instance.status == Visit.Status.skin_profile_complete:
                        instance.status = Visit.Status.provider_pending
                        instance.save()
                OrderService().update_order_status_based_on_visit_status(pending_medical_visit_order, instance)
                OrderService().update_order_status_based_on_visit_skin_profile_status(pending_medical_visit_order, instance)

            logger.debug(f'[visit_status_update_handler] Visits pending visits updated. Visit created {instance.id}. '
                         f'status: {instance.status}. '
                         f'pending visit orders: {pending_medical_visit_orders}. '
                         f'pending_medical_visit_order: {pending_medical_visit_order}.')
            return

    # Update order `status` and when visit `skin_profile_status` is updated
    @receiver(post_save, sender=Visit)
    def visit_status_update_handler(sender, instance, **kwargs):
        logger.debug(f'[orders][services][visit_status_update_handler] kwargs: {kwargs}. Instance: {instance}.')

        if kwargs.get('raw', True):
            return

        original_skin_profile_status = instance.get_original_skin_profile_status()
        original_status = instance.get_original_status()
        pending_order = instance.get_pending_order()

        logger.debug(f'[orders][services][visit_status_update_handler] visit {instance.id}. '
                     f'original status: {original_status}. '
                     f'instance status: {instance.status}. '
                     f'original skin profile status: {original_skin_profile_status}. '
                     f'instance skin profile status: {instance.skin_profile_status}. '
                     f'order: {pending_order}')

        # Update the order status if there has been a change in the status
        if original_status != instance.status:
            OrderService().update_order_status_based_on_visit_status(pending_order, instance)

        # Update the order status if there has been a change in the skin_profile_status
        if original_skin_profile_status != instance.skin_profile_status:
            OrderService().update_order_status_based_on_visit_skin_profile_status(pending_order, instance)

    @receiver(post_save, sender=Order)
    def order_status_update_handler(sender, instance, **kwargs):
        from payment.services.stripe_services import StripeService
        from payment.services.services import Service

        if kwargs.get('raw', True):
            return

        if instance.id:
            original_status = instance.get_original_status()
            logger.debug(f'[OrderService][order_status_update_handler] Order: {instance.id}. '
                         f'original_status: {original_status}. '
                         f'updated status: {instance.status}. '
                         f'Purchased datetime: {instance.purchased_datetime}. '
                         f'Medical visit: {instance.emr_medical_visit}.')

            # After payment is complete, medical visit fees to the provider and platform service fees to DB should be made
            if int(instance.status) == Order.Status.payment_complete:
                if int(original_status) != Order.Status.payment_complete:
                    if instance.is_start_of_rx_cycle() and not instance.emr_medical_visit.medical_visit_fee_transfer_id:
                        Service().transfer_fees(order=instance)
                    SupplyChainService().submit_order_smart_warehouse(instance)

            # For returning Rx users, there is a race condition in which the the order is pushed to the pharmacy before getting
            # submitted to smart warehouse
            if int(instance.status) == Order.Status.pending_pharmacy:
                if int(original_status) != Order.Status.pending_pharmacy:
                    SupplyChainService().submit_order_smart_warehouse(instance)

            if int(instance.status) == Order.Status.cancelled:
                if int(original_status) != Order.Status.cancelled:

                    if instance.customer.has_rx_subscription:
                        visits = instance.customer.patient_visits.filter(Q(status=Visit.Status.pending) |
                                                                         Q(status=Visit.Status.skin_profile_pending) |
                                                                         Q(status=Visit.Status.skin_profile_complete) |
                                                                         Q(status=Visit.Status.provider_pending) |
                                                                         Q(status=Visit.Status.pending_prescription) |
                                                                         Q(status=Visit.Status.provider_awaiting_user_input))
                    else:
                        # first-time users can't check out at a later time if visits (even ones that have been prescribed) is not canceled
                        visits = instance.customer.patient_visits.all()

                    for visit in visits:
                        visit.status = Visit.Status.provider_cancelled
                        visit.save(update_fields=['status'])

                    payment_type = instance.payment_processor_charge_id.split("_")[
                        0] if instance.payment_processor_charge_id else None
                    if payment_type == 'in':
                        StripeService().cancel_invoice(instance.customer, instance.payment_processor_charge_id)
                    if payment_type == 'ch':

                        reverse_transfer = False
                        if instance.emr_medical_visit and instance.emr_medical_visit.medical_visit_fee_transfer_id:
                            # check that the transfer was not reversed ("r:")
                            is_reversed = instance.emr_medical_visit.medical_visit_fee_transfer_id.split(":")[0] == 'r'
                            if not is_reversed and not instance.is_refill:
                                reverse_transfer = True
                                # refer to DEA-724 - medical fee once the visit has been reviewed by the provider is non refundable
                                if instance.emr_medical_visit.prescriptions.all():
                                    reverse_transfer = False

                        Service().refund_order(order=instance, reverse_transfer=reverse_transfer)

    def update_pending_or_create(self, request):
        from orders.serializers import OrderSerializer
        from sharing.models import Sharing

        created = False
        customer_data = request.data.get('customer', None)
        uuid_str = customer_data.get('id') if customer_data else None
        discount_code = request.data.get('discount_code', None)
        discount = None
        shipping_details = request.data.get('shipping_details', None)
        order_products = request.data.pop('order_products') if request.data.get('order_products') else None
        customer = request.user
        payment_checkout_type = request.data.get('payment_checkout_type', None)
        shopify_cart_id = request.data.get('shopify_cart_id')
        shopify_rx_product_sku = request.data.get('shopify_rx_product_sku')
        if shopify_cart_id:
            try:
                shopify_order_products, discount_code, discount = ShopifyService.get_shopify_cart_contents(shopify_cart_id=shopify_cart_id)
                order_products = order_products + shopify_order_products if order_products else shopify_order_products
                logger.debug(f'[update_pending_or_create] '
                             f'shopify_order_products: {shopify_order_products}. '
                             f'order_products: {order_products}. '
                             f'discount_code: {discount_code}. '
                             f'discount: {discount}.')
            except APIException as error:
                pass
                # let this pass...error is already logged

        if shopify_rx_product_sku:
            products = Product.objects.filter(sku=shopify_rx_product_sku)
            product = products.first() if products else None
            formatted_product = {"product_uuid": product.uuid, "frequency": 3, "quantity": 1}
            order_products = order_products + [formatted_product] if order_products else [formatted_product]
            logger.debug(f'[update_pending_or_create] order_products with shopify rx product sku: {order_products}.')
            if customer.subscriptions.filter(product=product.refill_product):
                error_msg = f"You have an existing Rx subscription. " \
                            f"Please go to your Plan to make any changes to your current subscription."
                raise APIException(error_msg)

        logger.debug(f'[update_pending_or_create] Customer uuid: {uuid_str}.'
                     f' Discount code: {discount_code}.'
                     f' Discount: {discount}.'
                     f' Shipping details: {shipping_details}.'
                     f' Request: {request.data}.'
                     f' Order products: {order_products}.')

        # ---- Update existing order ----
        # get order that still needs to complete checkout
        orders_pending_checkout = customer.orders.filter(
            ~Q(status=Order.Status.pending_medical_provider_review) &
            ~Q(status=Order.Status.pending_pharmacy) &
            ~Q(status=Order.Status.shipped) &
            ~Q(status=Order.Status.awaiting_fulfillment) &
            ~Q(status=Order.Status.cancelled) &
            ~Q(status=Order.Status.refunded) &
            ~Q(status=Order.Status.payment_complete) &
            Q(autogenerated=False))

        order = orders_pending_checkout.latest('created_datetime') if orders_pending_checkout else None

        if order:
            serializer = OrderSerializer(order, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            logger.debug(f'[update_pending_or_create] Updated existing order: {order.id}.')
        else:
            # ---- No pending orders. Create a new order. ----
            serializer = OrderSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            order = serializer.save()

            sharings = Sharing.objects.filter(Q(referee=customer) & Q(order__isnull=True))
            if sharings:
                sharing = sharings.earliest('created_datetime')
                sharing.order = order
                sharing.save(update_fields=['order'])
                logger.debug(
                    f'[update_pending_or_create] Sharing: {sharing}. Customer: {customer.email}. Order: {order.id}.')

            created = True
            logger.debug(f'[update_pending_or_create] New order created: {order.id}. '
                         f'Validated data: {serializer.validated_data}')

        # ---- Order is important! ----
        existing_order_type = order.order_type

        if order_products:
            self.update_order_products(order_products, order)
            for order_product in order_products:
                FacebookConversionServices().track_add_to_cart(request, order.customer, order, order_product.get('product_uuid'))
            self._check_duplicate_rx_order_checkout(customer, order_products)

        OrderService().update_order_discount(order, discount_code, discount)

        if shipping_details:
            self.update_shipping_details(order=order, shipping_details=shipping_details, is_checkout=True)

        if payment_checkout_type:
            order.payment_checkout_type = payment_checkout_type
            #order.save(update_fields=['payment_checkout_type'])

        # ----- Update order with the medical visit reference -----
        if order.is_rx_order():
            if not order.emr_medical_visit:
                most_recent_visit_in_progress = customer.get_latest_medical_visit_in_progress()
                if most_recent_visit_in_progress:
                    order.emr_medical_visit = most_recent_visit_in_progress
                    #order.save(update_fields=['emr_medical_visit'])
                    logger.error(f'[update_pending_or_create] Pending visit {most_recent_visit_in_progress.id} '
                                 f'associated with order {order.id}')
                else:
                    recent_completed_medical_visit = customer.get_latest_valid_medical_visit_completed()
                    if recent_completed_medical_visit:
                        order.emr_medical_visit = recent_completed_medical_visit
                        #order.save(update_fields=['emr_medical_visit'])
                        logger.error(f'[update_pending_or_create] Completed visit {recent_completed_medical_visit.id} '
                                     f'associated with order {order.id}')
                    else:
                        logger.error(f'[update_pending_or_create] No visit associated with order {order.id}')
        else:
            if order.emr_medical_visit:
                order.emr_medical_visit = None
                #order.save(update_fields=['emr_medical_visit'])

        if existing_order_type != order.order_type or created:
            order.onboarding_flow_type = order.get_onboarding_flow_type()
            order.status = order.get_initial_checkout_step_status()
            #order.save(update_fields=['onboarding_flow_type', 'status'])
            if order.onboarding_flow_type == 'skip_payment':
                order.discount = order.subtotal
                order.discount_code = 'FREE_TRIAL'
                order.notes = 'Free'
                #order.save(update_fields=['discount', 'discount_code'])

        order.save()

        logger.debug(
            f'[update_pending_or_create] onboarding_flow_type: {order.onboarding_flow_type}. status: {order.status}')

        return order, created

    def _check_duplicate_rx_order_checkout(self, customer, order_products):
        is_otc = self._is_otc(order_products)
        if not is_otc:
            # do not create an rx order if user has a pending provider order or subscription (active or inactive)
            orders_pending_medical_review = customer.orders.filter(
                status=Order.Status.pending_medical_provider_review)
            pending_medical_review = len(orders_pending_medical_review) > 0
            existing_rx_product_subscription = self._user_has_existing_rx_subscription(customer, order_products)
            if pending_medical_review or existing_rx_product_subscription:
                logger.debug(f'[update_pending_or_create] Not creating new order. '
                             f'User has a pending medical provider review order or existing subscription. '
                             f'orders_pending_medical_review: {orders_pending_medical_review}. '
                             f'existing_rx_product_subscription: {existing_rx_product_subscription}.')
                errorMessage = 'You have a pending order with a Rx retinoid product. Please remove the Rx retinoid product to proceed with checkout.' \
                    if pending_medical_review else 'You have an existing Rx retinoid plan. Please remove the Rx retinoid product to proceed with checkout.'
                raise APIException(errorMessage)

    def update_shipping_details(self, order, shipping_details, is_checkout=False):
        self._update_shipping_details(order, shipping_details, is_checkout)

    # Update order shipping details as well as the tax if shipping details are provided
    def _update_shipping_details(self, order, shipping_details, is_checkout):
        if not shipping_details:
            logger.error(f'[OrderService][_update_shipping_details] No shipping details '
                         f'to update for order {order.id}')
            return

        try:
            OrderService().update_or_create_shipping_details(order=order, shipping_details_data=shipping_details)
        except serializers.ValidationError as errors:
            error_msg = ''
            for key in errors.detail.keys():
                for detail in errors.detail[key]:
                    error_msg += detail + ' '
            raise InvalidFieldException(detail=error_msg)

        if is_checkout and order.is_rx_order():

            # check if shipping state is valid
            if order.shipping_details.state not in ALLOWED_SHIPPING_STATES:
                error_msg = f"Invalid state. Only the following states are allowed: " \
                    f"{', '.join(ALLOWED_SHIPPING_STATES)}"
                logger.error(error_msg)
                raise APIException(error_msg)

            # check if user has an active rx subscription
            if order.customer.has_active_rx_subscriptions:
                error_msg = f"You have an active subscription. " \
                    f"Please go to your Plan to make any changes to your current subscription."
                logger.error(error_msg)
                raise APIException(error_msg)

            # check if user has a paused subscription
            if order.customer.has_paused_subscriptions:
                error_msg = f"You have a paused subscription. " \
                    f"Please go to your Plan section to resume your subscription."
                logger.error(error_msg)
                raise APIException(error_msg)

            # check if the customer has an unshipped rx order pending
            if order.is_rx_order():
                pending_rx_orders = order.customer.get_pending_orders().filter(payment_captured_datetime__isnull=False)
                if len(pending_rx_orders) > 0:
                    error_msg = f"You have a pending order."
                    logger.error(error_msg)
                    raise APIException(error_msg)

        try:
            TaxJarService().update_order_with_tax(order)
        except APIException as error:
            error_msg = f'Failed to update order {order.id} with tax. Customer: {order.customer.email}. Error: {error.detail}.'
            logger.error(error_msg)
            MailService.send_error_notification_email(notification='TAX JAR ERROR', data=error_msg)

    def update_order_products(self, order_products, order):
        if not order_products:
            logger.error(f'[update_order_products] Order: {order.id}. '
                         f'No order products to update.')
            return

        logger.debug(f'[update_order_products] '
                     f'Order: {order.id}. '
                     f'Length: {len(order_products)}. '
                     f'Order_products: {order_products}')

        order.reset_total_amount()
        deduped_order_products_list = self._dedupe_order_products_list(order_products)
        self._update_order_products(deduped_order_products_list, order)

        order.save()

        return order

    def _update_order_products(self, new_order_products, order):

        # A product that is not in the new order_products list is removed from the order
        for existing_order_product in order.order_products.all():
            logger.debug(f"[_update_order_products] existing_order_product uuid: {existing_order_product.product.uuid}")

            new_order_products_in_existing_products = []
            for new_order_product_ in new_order_products:
                if new_order_product_.get('product_uuid') == str(existing_order_product.product.uuid):
                    logger.debug(
                        f"[_update_order_products] New order product uuid: {new_order_product_.get('product_uuid')}")
                    new_order_products_in_existing_products.append(existing_order_product)

            if not any(new_order_products_in_existing_products):
                self._delete_order_product(existing_order_product, order)
                logger.debug(f"[_update_order_products] Deleting existing order product which "
                             f"has been removed from the new products list. "
                             f"Order: {order.id}. "
                             f"Order Product: {existing_order_product.id}.")

            # Should be same logic as above, but this was not working
            # if not any(new_order_product_.get('product_uuid') == str(existing_order_product.product.uuid)
            #            for new_order_product_ in new_order_products):
            #     self._delete_order_product(existing_order_product, order)

        for order_product in new_order_products:
            product_uuid = order_product.get('product_uuid')
            existing_order_products = order.order_products.filter(product__uuid__exact=product_uuid)

            logger.debug(f"[_update_order_products] "
                         f"Order: {order.id}. "
                         f"Product uuid: {product_uuid}. "
                         f"Quantity: {order_product.get('quantity')}. "
                         f"Frequency: {order_product.get('frequency')}. "
                         f"New order_products: {new_order_products}. "
                         f"Existing order_products: {existing_order_products}")

            # ---- If order_product does not exist, create a new one ----
            if len(existing_order_products) == 0:
                try:
                    product = Product.objects.get(uuid=product_uuid)
                    new_order_product = self._create_order_product(order, product, order_product.get('quantity'),
                                                                   order_product.get('frequency'))
                    logger.debug(f"[_update_order_products] Adding order product. "
                                 f"Order: {order.id}. "
                                 f"New Order Product: {new_order_product.id}.")
                except Product.DoesNotExist as e:
                    logger.debug(f"[_update_order_products] Product does not exist. "
                                 f"Product UUID: {product_uuid}.")
            # ---- Update order product quantity if one unique order product is found ----
            elif len(existing_order_products) == 1:
                self._update_order_product_quantity(order, existing_order_products[0], order_product.get('quantity'))
                logger.debug(f"[_update_order_products] Updating quantity. "
                             f"Order: {order.id}. "
                             f"Order Product: {order_product.get('id')}. "
                             f"New quantity: {order_product.get('quantity')}")
                self._update_order_product_frequency(order, existing_order_products[0], order_product.get('frequency'))
                logger.debug(f"[_update_order_products] Updating frequency. "
                             f"Order: {order.id}. "
                             f"Order Product: {order_product.get('id')}. "
                             f"New frequency: {order_product.get('frequency')}")
            else:
                # ---- Consolidate multiple existing order_product and update the quantity ----
                for index, existing_order_product in enumerate(existing_order_products, start=1):
                    existing_order_products[0].quantity += existing_order_products[index].quantity
                    self._delete_order_product(existing_order_products, order)
                    logger.debug(f"[_update_order_products] Multiple existing products. "
                                 f"Order: {order.id}. "
                                 f"Order Product: {order_product.get('id')}. "
                                 f"New quantity: {order_product.get('quantity')}")

    def _create_order_product(self, order, product, quantity, frequency):
        """
        Create an order_item if an order_product is created.
        An order_product can have multiple order_items if the product is a set.
        """
        order_product = OrderProduct.objects.create(frequency=frequency, order=order, product=product, quantity=quantity,)

        products = product.get_all_products()

        for _product in products:
            is_refill = self._is_order_item_refill(order, _product)

            # This handles legacy users with a previous order with no subscription checking out again
            if is_refill:
                _product = _product.refill_product
                order_product.product = product.refill_product
                order_product.save(update_fields=['product'])

            order_item = OrderItem.objects.create(order=order, order_product=order_product, product=_product, is_refill=is_refill)
            logger.debug(f'[OrderProduct][save] Created an order_item. '
                         f'Order: {order.id}. '
                         f'Order Product: {order_product.id}. '
                         f'_product: {_product}.'
                         f'Order Item: {order_item.__dict__}')
        return order_product

    def _is_order_item_refill(self, order, product):
        is_refill = False
        if product.product_type == Product.Type.rx:
            # search shipped order items with same product
            shipped_order_items = OrderItem.objects.filter(Q(order__status=Order.Status.shipped) & Q(order__customer=order.customer))
            order_items_with_product = shipped_order_items.filter(product__product_category=product.product_category)
            is_refill = len(order_items_with_product) > 0
        return is_refill

    def _update_order_product_quantity(self, order, order_product, quantity):
        if quantity == 0:
            logger.debug(f'[_update_order_product_quantity] Quantity is 0. '
                         f'Deleting Order Product: {order_product.id}. ')
            self._delete_order_product(order_product, order)
        elif order_product.quantity != quantity:
            order_product.quantity = quantity
            order_product.save(update_fields=['quantity'])
            logger.debug(f'[_update_order_product_quantity] Updated quantity. '
                         f'Order: {order.id}. '
                         f'Order product: {order_product.id}. '
                         f'New quantity: {quantity}')
        else:
            logger.debug(f'[_update_order_product_quantity] Quantity unchanged. '
                         f'Order: {order.id}. '
                         f'Order product: {order_product.id}. '
                         f'New quantity: {quantity}. '
                         f'Existing quantity: {order_product.quantity}')

    def _update_order_product_frequency(self, order, order_product, frequency):
        if order_product.frequency != frequency:
            order_product.frequency = frequency
            order_product.save(update_fields=['frequency'])
            logger.debug(f'[_update_order_product_frequency] Updating frequency. Frequency: {frequency}')
        else:
            logger.debug(f'[_update_order_product_frequency] Frequency unchanged. '
                         f'Order: {order.id}. '
                         f'Order product: {order_product.id}. '
                         f'New frequency: {frequency}. '
                         f'Existing frequency: {order_product.frequency}')

    def _delete_order_product(self, order_product, order):
        order.order_products.remove(order_product)
        logger.debug(f'[_delete_order_product] Delete order product. '
                     f'Order: {order.id}. '
                     f'Order Product: {order_product.id}.')
        order_product.delete()

    def _delete_all_order_products(self, order):
        order.order_products.clear()
        for order_product in order.order_products.all():
            logger.debug(f'[_delete_order_product] Deleting all order products. '
                         f'Order: {order.id}.')
            order_product.delete()
        order.reset_total_amount()

    def _dedupe_order_products_list(self, new_order_products):
        uniques = []
        duplicates = []

        for order_product in new_order_products:
            if not any(order_product_.get('product_uuid') == order_product.get('product_uuid') for order_product_ in uniques):
                uniques.append(order_product)
            else:
                duplicates.append(order_product)

        logger.debug(f'[OrderServices][_dedupe_order_products_list] '
                     f'Uniques: {uniques}. '
                     f'Duplicates: {duplicates}')

        for unique_data in uniques:
            for duplicated_data in duplicates:
                if unique_data.get('product_uuid') == duplicated_data.get('product_uuid'):
                    unique_data['quantity'] += duplicated_data['quantity']

        return uniques

    def _user_has_existing_rx_subscription(self, user, order_products):
        subscription_product_list = [s.product for s in user.subscriptions.all()]
        subscriptions_set = set(subscription_product_list)
        rx_order_items_set = set(self._get_rx_order_items(order_products))

        logger.debug(f'[OrderServices][_user_has_existing_rx_subscription] '
                     f'subscription_products: {subscriptions_set}. '
                     f'rx_order_items_set: {rx_order_items_set}.')

        if subscriptions_set and rx_order_items_set and rx_order_items_set.issubset(subscriptions_set):
            return True
        return False

    def _get_rx_order_items(self, order_products):
        order_items = []
        for order_product in order_products:
            product = Product.objects.get(uuid=order_product.get('product_uuid'))
            rx_products = list(filter(lambda x: x.product_type == Product.Type.rx, product.refill_product.get_all_products()))
            order_items += rx_products

            logger.debug(f'[OrderServices][_get_rx_order_items] '
                         f'order_items: {order_items}. '
                         f'order_product: {order_product}. '
                         f'rx_products: {rx_products}.')

        return order_items

    def _is_otc(self, order_products):
        if order_products:
            for order_product in order_products:
                if order_product.get('type') == Product.Type.rx:
                    return False
            return True
        return False

    def create_upcoming_subscription_order(self, subscriptions, customer, medical_visit=None):
        """ Create order for next subscription shipment """

        logger.debug(f'[create_upcoming_subscription_order] medical_visit: {medical_visit}.')

        with transaction.atomic():
            upcoming_order = Order.objects.create(
                autogenerated=True,
                customer=customer,
                status=Order.Status.subscription_order_autogenerated
            )

            for subscription in subscriptions:
                product = subscription.product

                # Choose a refill or refillable bottle for the product
                if product.product_type == Product.Type.otc:
                    if product.has_refill_option() and customer.has_received_refillable_bottle(product):
                        product = product.refill_product
                    else:
                        product = product.trial_product

                order_product = OrderProduct.objects.create(frequency=subscription.frequency,
                                                            quantity=subscription.quantity,
                                                            order=upcoming_order,
                                                            product=product)

                order_item = OrderItem.objects.create(is_refill=True,
                                                    order=upcoming_order,
                                                    product=product,
                                                    order_product=order_product,
                                                    subscription=subscription)

                logger.debug(f'[OrdersService][create_upcoming_subscription_order] Created an OrderItem. '
                            f'Product: {product.name}. '
                            f'Bottle type: {order_item.bottle_type}. '
                            f'Order: {upcoming_order.id}. '
                            f'Order Product: {order_product.id}. '
                            f'Order Item: {order_item.__dict__}')

                discount_code = subscription.discount_code
                if discount_code:
                    # remove discount code for one-time discounts (promo code has a suffix _ONETIME)
                    # a bit of a hack, but will replace with a better solution when we build a more sophisticated coupon feature
                    discount_code_split = discount_code.split("_")
                    is_one_time = discount_code_split[-1] == 'ONETIME'
                    self.update_order_discount(upcoming_order, discount_code)
                    if is_one_time:
                        subscription.discount_code = None
                        subscription.save(update_fields=['discount_code'])
                    if discount_code == 'FREE_SUBSCRIPTION':
                        upcoming_order.notes = 'Free'

            upcoming_order.shipping_details = self.create_upcoming_order_shipping_details(
                customer=customer, subscriptions=subscriptions, order=upcoming_order
            )
            upcoming_order.onboarding_flow_type = upcoming_order.get_onboarding_flow_type()


            if not medical_visit and upcoming_order.is_rx_order():
                medical_visit = customer.get_latest_valid_medical_visit_completed()
                if not medical_visit:
                    medical_visit = customer.get_latest_medical_visit_in_progress()
            if medical_visit:
                upcoming_order.emr_medical_visit = medical_visit

            upcoming_order.save()
        try:
            TaxJarService().update_order_with_tax(upcoming_order)
        except APIException as error:
            error_msg = f'Failed to update order {upcoming_order.id} with tax. Customer: {upcoming_order.customer.email}. Error: {error.detail}.'
            logger.error(error_msg)
            MailService.send_error_notification_email(notification='TAX JAR ERROR', data=error_msg)

        #KlaviyoService().track_placed_order_event(upcoming_order)
        logger.debug(f'[Payment Service][create_upcoming_subscription_order] Upcoming order: {upcoming_order.__dict__}')
        return upcoming_order

    def create_upcoming_order_shipping_details(
        self, customer: User, subscriptions: List[Subscription], order: Order
    ) -> ShippingDetails:
        upcoming_order_shipping_details = None
        if self._check_if_all_subscription_shipping_details_are_none(subscriptions=subscriptions):
            upcoming_order_shipping_details = copy(customer.shipping_details)
        elif self._check_subscription_shipping_details_consistency(subscriptions=subscriptions):
            upcoming_order_shipping_details = copy(subscriptions[0].shipping_details)

        if not upcoming_order_shipping_details:
            logger.error(
                f"[OrderService][create_upcoming_order_shipping_details] "
                f"Shipping details vary across subscriptions "
                f"for subscriptions: {subscriptions} for Upcoming order ID: {order.pk} "
                f"Customer ID: {customer.pk}."
            )
            raise APIException(f"Inconsistent shipping details found.")
        else:
            upcoming_order_shipping_details.pk = None
            upcoming_order_shipping_details.save()
            return upcoming_order_shipping_details
    
    @staticmethod
    def _check_if_all_subscription_shipping_details_are_none(subscriptions: List[Subscription]) -> bool:
        if all(subscription.shipping_details is None for subscription in subscriptions):
            return True
        return False

    @staticmethod
    def _check_subscription_shipping_details_consistency(subscriptions: List[Subscription]) -> bool:
        if all(
            hasattr(subscription, "shipping_details") and subscription.shipping_details is not None
            for subscription in subscriptions
        ) and all(
            subscription.shipping_details == subscriptions[0].shipping_details
            for subscription in subscriptions  
        ):
            return True
        return False 

    def create_shipping_details(self, order, shipping_details):
        from users.serializers import ShippingDetailsSerializer
        logger.debug(f'[OrdersServices][create_shipping_details] Shipping details: {shipping_details}')
        validate_unique_phone_number(
            new_shipping_details=shipping_details,
            current_shipping_details=order.customer.shipping_details,
            user_id=order.customer.id,
        )
        serializer = ShippingDetailsSerializer(data=shipping_details)
        serializer.is_valid(raise_exception=True)
        shipping_details = serializer.save()
        order.shipping_details = shipping_details
        order.save()

    def update_or_create_shipping_details(self, order, shipping_details_data):
        from users.serializers import ShippingDetailsSerializerNoId
        validate_unique_phone_number(
            new_shipping_details=shipping_details_data,
            current_shipping_details=order.customer.shipping_details,
            user_id=order.customer.id,
        )
        serializer = ShippingDetailsSerializerNoId(data=shipping_details_data)
        serializer.is_valid(raise_exception=True)
        order_serializer = ShippingDetailsSerializerNoId(order.shipping_details)

        if not order.shipping_details:
            order.shipping_details = ShippingDetails.objects.create(**shipping_details_data)
            logger.debug(
                f'[OrderServices][update_or_create_shipping_details] Newly created shipping details: {order.shipping_details}')

        elif serializer.data != order_serializer.data:
            order_notification_notes = f'Shipping Details: {order_serializer.data}. Updated Shipping Details: {serializer.data} '

            ShippingDetails.objects.filter(pk=order.shipping_details_id).update(**shipping_details_data)
            order.shipping_details = ShippingDetails.objects.get(pk=order.shipping_details_id)

            #MailService.send_order_notification_email(order, notification_type='ORDER INFO UPDATE', data=order_notification_notes)

            # update placed order address?
            #KlaviyoService().track_placed_order_event(order)
            logger.debug(f'[OrderServices][update_or_create_shipping_details] Updated shipping details: {order.shipping_details}')

        order.shipping_details.save()
        order.save()

        visit_before_prescription = order.customer.get_latest_medical_visit_before_prescription()
        if visit_before_prescription:
            medical_provider = order.customer.get_medical_provider(order.shipping_details)
            if medical_provider:
                visit_before_prescription.medical_provider = medical_provider
                visit_before_prescription.save(update_fields=['medical_provider'])

        return order

    def update_order_discount(self, order, discount_code, discount=None):
        logger.debug(f'[update_order_discount] order: {order.id}. discount_code: {discount_code}. discount: {discount}.')

        if not discount_code:
            # set first-time trial code if no promo is given
            if order.is_rx_order() and not order.is_refill:
                order.discount_code = FIRST_TIME_TRIAL_DISCOUNT_CODE
                order.discount = FIRST_TIME_TRIAL_DISCOUNT
                order.save()
            return order

        try:
            if discount:
                order.discount = discount
            else:
                discount_details = ShopifyService.get_discount(discount_code, order, order.customer)

                logger.debug(f'[update_order_discount] Discount details: {discount_details}')
                amount_off = discount_details.get('amount_off', 0)
                percent_off = discount_details.get('percent_off', 0)
                logger.debug(f'[update_order_discount] Discount code: {discount_code}. '
                             f'Amount off: {amount_off}. Percent off: {percent_off}.')
                if amount_off and amount_off > 0:
                    order.discount = int(amount_off)
                elif percent_off and percent_off > 0:
                    order.discount = int(order.subtotal * percent_off/100)

            if discount_code:
                order.discount_code = discount_code

            order.save()
            order.update_order_item_discount()

            logger.debug(f'[update_order_discount] Order total after discount: {order.total_amount}. '
                         f'Discount amount: {order.discount}. Discount code: {order.discount_code}')
            return order
        except APIException as e:
            error_msg = f'[update_order_discount] Unable to apply discount code: {e.detail}.'
            logger.error(error_msg)
            return self._reset_order_discount(order)

    def _reset_order_discount(self, order):
        order.discount = 0
        order.discount_code = None
        order.coupon = None
        order.save()
        return order

    def send_user_reminder_emails(self):
        todays_date = timezone.now()
        logger.debug(f'[send_user_reminder_emails] Date: {todays_date}')

        # ---- Email reminder to users with pending questionnaire ----
        pending_questionnaire_orders = Order.objects.filter((Q(status=Order.Status.pending_questionnaire) |
                                                             Q(status=Order.Status.account_created)) &
                                                            Q(purchased_datetime__isnull=False))
        pending_questionnaire_orders_user_emails_str = MailService.send_user_emails_incomplete_skin_profile(
            pending_orders=pending_questionnaire_orders)
        logger.debug(f'[send_user_reminder_emails] pending_questionnaire_orders: {pending_questionnaire_orders}. '
                     f'pending_questionnaire_orders_user_emails_str: {pending_questionnaire_orders_user_emails_str}.')

        # ---- Email reminder to users with pending photos ----
        pending_photo_orders = Order.objects.filter(Q(status=Order.Status.pending_photos) & Q(purchased_datetime__isnull=False))
        pending_photo_orders_user_emails_str = MailService.send_user_emails_incomplete_photos(pending_orders=pending_photo_orders)
        logger.debug(f'[send_user_reminder_emails] pending_photo_orders: {pending_photo_orders}. '
                     f'pending_photo_orders_user_emails_str: {pending_photo_orders_user_emails_str}.')

        # ---- Email users with pending Skin Profile > 30 days that their order has been canceled ----
        pending_skin_profile_orders = Order.objects.filter((Q(status=Order.Status.pending_questionnaire) |
                                                            Q(status=Order.Status.account_created) |
                                                            Q(status=Order.Status.pending_photos)) &
                                                           Q(purchased_datetime__isnull=False))
        pending_skin_profile_orders_gt_30_days = pending_skin_profile_orders.filter(
            created_datetime__date__lte=todays_date-timedelta(days=30))
        pending_skin_profile_orders_gt_30_days_email_str = MailService.send_user_emails_order_cancellation_skin_profile_expired(
            pending_orders=pending_skin_profile_orders_gt_30_days)
        logger.debug(f'[send_user_reminder_emails] pending_skin_profile_orders_gt_30_days: {pending_skin_profile_orders_gt_30_days}. '
                     f'pending_questionnaire_orders_user_emails_str: {pending_skin_profile_orders_gt_30_days_email_str}.')

        # ---- Mark orders and visit canceled if greater than 30 days ----
        for pending_skin_profile_orders_gt_30_day in pending_skin_profile_orders_gt_30_days:
            pending_skin_profile_orders_gt_30_day.status = Order.Status.cancelled
            pending_skin_profile_orders_gt_30_day.save(update_fields=['status'])
            medical_visit = pending_skin_profile_orders_gt_30_day.emr_medical_visit
            if medical_visit:
                if medical_visit.status != Visit.Status.provider_signed and \
                        medical_visit.status != Visit.Status.provider_rx_submitted and \
                        medical_visit.status != Visit.Status.provider_rx_denied:
                    medical_visit.status = Visit.Status.provider_cancelled
                    medical_visit.save(update_fields=['status'])
                    logger.debug(f'[send_user_reminder_emails] Order canceled: {pending_skin_profile_orders_gt_30_day.id}. '
                                 f'Medical visit cancelled: {medical_visit.id} ')
            else:
                logger.debug(f'[send_user_reminder_emails] Order cancelled: {pending_skin_profile_orders_gt_30_day.id}.')

        # ---- Mark visits canceled if left incomplete for more than 30 days ----
        # This is important to clean up as we use the visit created datetime to determine if the user needs to update their visit
        # Stray visits can be created if a user navigates to /user-dashboard/skin-profile
        skin_profile_pending_visits = Visit.objects.filter(Q(status=Visit.Status.pending) | Q(status=Visit.Status.skin_profile_pending))
        skin_profile_pending_visits_gt_30_days = skin_profile_pending_visits.filter(
            created_datetime__date__lte=todays_date-timedelta(days=30))
        for skin_profile_pending_visit_gt_30_days in skin_profile_pending_visits_gt_30_days:
            skin_profile_pending_visit_gt_30_days.status = Visit.Status.provider_cancelled
            skin_profile_pending_visit_gt_30_days.save(update_fields=['status'])
            logger.debug(f'[send_user_reminder_emails] Visit canceled: {skin_profile_pending_visit_gt_30_days.id}. '
                         f'Visit created datetime: {skin_profile_pending_visit_gt_30_days.created_datetime}.')
            # clean up the order's visit reference and order statuses
            orders_for_skin_profile_pending_visit_gt_30_days = skin_profile_pending_visit_gt_30_days.orders.filter(
                Q(status=Order.Status.account_created) | Q(status=Order.Status.pending_questionnaire) | Q(status=Order.Status.pending_photos))
            for order_for_skin_profile_pending_visit_gt_30_days in orders_for_skin_profile_pending_visit_gt_30_days:
                order_for_skin_profile_pending_visit_gt_30_days.emr_medical_visit = None
                order_for_skin_profile_pending_visit_gt_30_days.status = Order.Status.pending_questionnaire
                order_for_skin_profile_pending_visit_gt_30_days.save(update_fields=['emr_medical_visit', 'status'])
                logger.debug(f'[send_user_reminder_emails] Remove visit from order: {order_for_skin_profile_pending_visit_gt_30_days.id}.')

        # ---- Send user check-in emails ----
        payment_captured_orders_all = Order.objects.filter(status=Order.Status.shipped)
        new_rx_orders = payment_captured_orders_all.filter(Q(autogenerated=False) & Q(emr_medical_visit__isnull=False))

        check_in_user_emails_str = MailService.send_user_emails_check_in(new_rx_orders)
        logger.debug(f'[send_user_reminder_emails] check_in_user_emails_str: {check_in_user_emails_str}.')

        # ---- Send users reminders to submit their yearly visit ----
        active_subscriptions = Subscription.objects.filter(Q(is_active=True) & Q(product__product_type=Product.Type.rx))
        active_subscriptions_requiring_yearly_visit = list(filter(lambda x: (x.customer.require_yearly_medical_visit_update),
                                                                  active_subscriptions))
        active_subscriptions_requiring_yearly_visit_ids = list(map(lambda x: x.id, active_subscriptions_requiring_yearly_visit))
        active_subscriptions_requiring_yearly_visit_qs = Subscription.objects.filter(pk__in=active_subscriptions_requiring_yearly_visit_ids)

        active_subscriptions_requiring_yearly_visit_str = MailService.send_user_emails_annual_visit(active_subscriptions_requiring_yearly_visit_qs)
        logger.debug(f'[send_user_reminder_emails] active_subscriptions_requiring_yearly_visit_str: '
                     f'{active_subscriptions_requiring_yearly_visit_str}.')

        # TODO: check that order is rx and that there is no pending visit
        # ---- Send users reminders (3) to submit their yearly visit if their visit expired and they have already paid for their order
        # payment_complete_orders = Order.objects.filter(Q(status=Order.Status.payment_complete) &
        #                                                Q(payment_captured_datetime__date__lte=todays_date) &
        #                                                Q(payment_captured_datetime__date__gte=todays_date - timedelta(
        #                                                    days=2)))
        # payment_complete_orders_with_expired_visit = list(filter(lambda x: (x.customer.rx_status == User.RxStatus.expired),
        #                                                          payment_complete_orders))
        # payment_complete_expired_visit_users_ids = list(map(lambda x: x.customer.id, payment_complete_orders_with_expired_visit))
        # payment_complete_expired_visit_users_qs = User.objects.filter(pk__in=payment_complete_expired_visit_users_ids)
        #
        # payment_complete_expired_visit_users_str = MailService.send_user_emails_annual_visit_order_payment_complete(payment_complete_expired_visit_users_qs)
        # logger.debug(f'[send_user_reminder_emails] send_user_emails_annual_visit_order_payment_complete: '
        #              f'{payment_complete_expired_visit_users_str}. '
        #              f'payment_complete_orders_with_expired_visit: {payment_complete_orders_with_expired_visit}. '
        #              f'payment_complete_expired_visit_users_qs: {payment_complete_expired_visit_users_qs}. '
        #              f'payment_complete_orders: {payment_complete_orders}.')

        # ---- Create or auto-complete pending visits for users with expired visits and payment complete 10 days after the payment date
        # date_10_days_ago = todays_date - timedelta(days=10)
        # payment_complete_orders_lte_10_days = Order.objects.filter(Q(status=Order.Status.pending_questionnaire) |
        #                                                            Q(status=Order.Status.pending_photos) |
        #                                                            (~Q(status=Order.Status.shipped) & Q(emr_medical_visit__isnull=True)) &
        #                                                            Q(payment_captured_datetime__date__lte=date_10_days_ago))
        # payment_complete_orders_lte_10_days_with_expired_visit = list(filter(lambda x: self._is_order_rx_active_plan_expired_visit_refill(x),
        #                                                                      payment_complete_orders_lte_10_days))
        # logger.debug(f'[send_user_reminder_emails] Handle expired medical visit. '
        #              f'date_10_days_ago: {date_10_days_ago}. '
        #              f'payment_complete_orders_lte_10_days: {payment_complete_orders_lte_10_days}. '
        #              f'payment_complete_orders_lte_10_days_with_expired_visit: {payment_complete_orders_lte_10_days_with_expired_visit}.')
        # for payment_complete_order_lte_10_days_with_expired_visit in payment_complete_orders_lte_10_days_with_expired_visit:
        #     customer = payment_complete_order_lte_10_days_with_expired_visit.customer
        #     customer.handle_expired_medical_visit(payment_complete_order_lte_10_days_with_expired_visit)

        # ---- Remove Orders Left Unpurchashed > 30 days ----
        self.delete_unpurchased_orders_gt_30_days()

        # ---- Cancel First-time Orders Unpurchashed > 10 days ----
        self.cancel_failed_payment_first_time_orders_gt_10_days()

        # ---- Cancel Subscription Orders that Failed Payment > 21 days (Stripe retries for 21 days) ----
        self.cancel_failed_payment_subscription_orders_gt_21_days()


    def _is_order_rx_active_plan_expired_visit_refill(self, order):
        result = order.customer.rx_status == User.RxStatus.expired and \
                 order.is_refill and \
                 order.order_type == Order.OrderType.rx and \
                 order.customer.is_plan_active()
        logger.debug(f'[_is_order_rx_active_plan_expired_visit_refill] order: {order.id}. result: {result}.')
        return result

    # Delete orders that are empty
    def delete_empty_orders(self):
        empty_orders = Order.objects.filter(Q(status=Order.Status.account_created) &
                                            Q(purchased_datetime__isnull=True))
        for empty_order in empty_orders:
            if len(empty_order.order_products.all()) == 0:
                logger.debug(f'[delete_empty_orders] Deleting empty order: {empty_order.id}. User: {empty_order.customer.email}')
                empty_order.delete()

    def cancel_failed_payment_first_time_orders_gt_10_days(self):
        todays_date = date.today()
        first_time_orders_failed_payment = Order.objects.filter(Q(purchased_datetime__isnull=False) &
                                                                Q(status=Order.Status.payment_failure) &
                                                                Q(payment_processor_charge_id__isnull=True))
        first_time_orders_failed_payment_gt_10_days = first_time_orders_failed_payment.filter(
            created_datetime__date__lte=todays_date - timedelta(days=10))
        for first_time_order_failed_payment_gt_10_days in first_time_orders_failed_payment_gt_10_days:
            first_time_order_failed_payment_gt_10_days.status = Order.Status.cancelled
            first_time_order_failed_payment_gt_10_days.notes = f'Autocancel: order failed payment. {first_time_order_failed_payment_gt_10_days.notes}'
            first_time_order_failed_payment_gt_10_days.save(update_fields=['notes', 'status'])
            logger.debug(
                f'[cancel_failed_payment_first_time_orders] '
                f'User: {first_time_order_failed_payment_gt_10_days.customer.id}. '
                f'Order: {first_time_order_failed_payment_gt_10_days.id}.')

    def cancel_failed_payment_subscription_orders_gt_21_days(self):
        from payment.services.stripe_services import StripeService

        todays_date = date.today()
        subscription_orders_failed_payment = Order.objects.filter(Q(purchased_datetime__isnull=True) &
                                                                  Q(status=Order.Status.payment_failure) &
                                                                  Q(payment_processor_charge_id__isnull=False))
        subscription_orders_failed_payment_gt_21_days = subscription_orders_failed_payment.filter(
            created_datetime__date__lte=todays_date - timedelta(days=21))
        for subscription_order_failed_payment_gt_21_days in subscription_orders_failed_payment_gt_21_days:
            if StripeService().is_invoice_closed(subscription_order_failed_payment_gt_21_days.payment_processor_charge_id):
                subscription_order_failed_payment_gt_21_days.status = Order.Status.cancelled
                subscription_order_failed_payment_gt_21_days.notes = f'Autocancel: order failed payment. {subscription_order_failed_payment_gt_21_days.notes}'
                subscription_order_failed_payment_gt_21_days.save(update_fields=['notes', 'status'])
                logger.debug(
                    f'[cancel_failed_payment_first_time_orders] '
                    f'User: {subscription_order_failed_payment_gt_21_days.customer.id}. '
                    f'Order: {subscription_order_failed_payment_gt_21_days.id}.')

    def delete_unpurchased_orders_gt_30_days(self):
        todays_date = date.today()
        unpurchased_orders = Order.objects.filter(Q(purchased_datetime__isnull=True) &
                                                   Q(payment_processor_charge_id__isnull=True))
        unpurchased_order_gt_30_days = unpurchased_orders.filter(
            created_datetime__date__lte=todays_date - timedelta(days=30))

        for unpurchased_order in unpurchased_order_gt_30_days:
            logger.debug(
                f'[delete_unpurchased_orders_gt_30_days] '
                f'User: {unpurchased_order.customer.id}. '
                f'Order: {unpurchased_order.id}.')

            # Un-reference Sharing
            sharings = unpurchased_order.sharings.all()
            for sharing in sharings:
                sharing.order = None
                sharing.save()

            if unpurchased_order.shipping_details:
                unpurchased_order.shipping_details.delete()
            for order_item in unpurchased_order.order_items.all():
                order_item.delete()
            for order_product in unpurchased_order.order_products.all():
                order_product.delete()
            unpurchased_order.delete()

    # Delete upcoming orders generated, but not captured (> 14 days old)
    def delete_payment_uncaptured_autogenerated_orders(self):
        todays_date = date.today()

        payment_uncaptured_autogenerated_orders = Order.objects.filter(Q(autogenerated=True) &
                                                                       Q(payment_captured_datetime__isnull=True) &
                                                                       Q(created_datetime__date__lte = todays_date - timedelta(days=14)))
        logger.debug(f'[delete_payment_uncaptured_autogenerated_orders] payment_uncaptured_autogenerated_orders: {payment_uncaptured_autogenerated_orders}')
        for payment_uncaptured_autogenerated_order in payment_uncaptured_autogenerated_orders:
            payment_uncaptured_autogenerated_order.delete()

    def update_order_status_based_on_visit_status(self, order, visit):
        if not order:
            return

        current_order_status = order.status
        new_order_status = order.status

        if visit.status == Visit.Status.provider_pending:
            new_order_status = Order.Status.pending_medical_provider_review

        if current_order_status != new_order_status:
            order.status = new_order_status
            order.save(update_fields=['status'])

        logger.debug(f'[orders][services][update_order_status_based_on_visit_status] '
                     f'status: {visit.status}. '
                     f'order: {order.id}. '
                     f'current_order_status: {current_order_status}. '
                     f'new_order_status: {new_order_status}. '
                     f'saved order status: {order.status}')

    def update_order_status_based_on_visit_skin_profile_status(self, order, visit):

        if not order or visit.status == Visit.Status.provider_pending:
            logger.debug(f'[orders][services]][update_order_status_based_on_visit_skin_profile_status] '
                         f'No order update from skin profile status change. '
                         f'Status: {visit.status}. skin_profile_status: {visit.skin_profile_status}.')
            return

        current_order_status = order.status
        new_order_status = order.status

        # Questionnaire is pending
        if visit.skin_profile_status == Visit.SkinProfileStatus.pending_questionnaire:
            new_order_status = Order.Status.pending_questionnaire

        # Questionnaire is complete
        if visit.skin_profile_status == Visit.SkinProfileStatus.pending_photos:
            new_order_status = order.get_next_checkout_step_status()
            if order.is_refill:
                new_order_status = Order.Status.pending_photos

        # Skin Profile is complete
        if visit.skin_profile_status == Visit.SkinProfileStatus.complete or \
                visit.skin_profile_status == Visit.SkinProfileStatus.no_changes_user_specified or \
                visit.skin_profile_status == Visit.SkinProfileStatus.no_changes_no_user_response or \
                visit.skin_profile_status == Visit.SkinProfileStatus.incomplete_user_response:
            new_order_status = order.get_next_checkout_step_status()
            if order.is_refill:
                new_order_status = Order.Status.skin_profile_complete
            # else:
            #     # Track only new orders for analytics
            #     SegmentService().track_order_completed_event(order)

        if current_order_status != new_order_status:
            order.status = new_order_status
            order.save(update_fields=['status'])

        logger.debug(f'[orders][services]][update_order_status_based_on_visit_skin_profile_status] '
                     f'skin_profile_status: {visit.skin_profile_status}. '
                     f'order: {order.id}. '
                     f'current_order_status: {current_order_status}. '
                     f'updated order status: {order.status}')

