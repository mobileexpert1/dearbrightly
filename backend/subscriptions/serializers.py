import uuid
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from orders.models import Order
from users.models import User
from products.models import Product
from subscriptions.models import Subscription, Edit
from rest_framework.exceptions import ValidationError, APIException
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from mail.services import MailService
from users.serializers import ShippingDetailsSerializer, PaymentDetailsSerializer
import logging

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class EditSerializer(serializers.ModelSerializer):
    customer_id = serializers.ReadOnlyField(source='customer.id')
    delay_in_days = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=True)
    subscription_id = serializers.ReadOnlyField(source='subscription.id')
    type = serializers.CharField(required=True)

    class Meta:
        model = Edit
        fields = ('created_datetime', 'customer_id', 'delay_in_days', 'reason', 'subscription_id', 'type')


class SubscriptionSerializer(serializers.ModelSerializer):
    customer_uuid = serializers.UUIDField(source='customer.uuid', write_only=True)
    product_uuid = serializers.UUIDField(source='product.uuid')
    product_sku = serializers.UUIDField(source='product.sku', required=False)
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.ReadOnlyField(source='product.image')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    product_refill_price = serializers.ReadOnlyField(source='product.refill_product.price')
    product_subscription_price = serializers.ReadOnlyField(source='product.subscription_price')

    current_period_end_datetime = serializers.DateTimeField(required=False)
    current_period_start_datetime = serializers.DateTimeField(required=False)
    frequency = serializers.IntegerField(required=True)
    is_active = serializers.BooleanField(required=False)
    quantity = serializers.IntegerField(required=False)
    delay_in_days = serializers.IntegerField(required=False)
    subscription_edit_delay_in_days = serializers.SerializerMethodField()
    ship_now = serializers.BooleanField(required=False, write_only=True)

    current_treatment = serializers.SerializerMethodField()
    upcoming_treatment = serializers.SerializerMethodField()

    current_order = serializers.SerializerMethodField()
    
    shipping_details = serializers.SerializerMethodField()
    payment_details = PaymentDetailsSerializer(required=False, read_only=True, allow_null=True)

    class Meta:
        model = Subscription
        fields = ('cancel_reason', 'current_order', 'current_period_end_datetime', 'current_period_start_datetime', 'current_treatment', 'delay_in_days', 'subscription_edit_delay_in_days', 'frequency',
                  'is_active', 'product_uuid', 'product_name', 'product_image', 'product_refill_price', 'product_sku', 'product_subscription_price', 'product_type', 'quantity', 'ship_now', 'upcoming_treatment', 'uuid', 'customer_uuid',
                  'shipping_details', 'payment_details')

    def get_subscription_edit_delay_in_days(self, instance):
        subscription_edit_delay_in_days = 0
        subscription_edits = instance.subscription_edits.all()
        if subscription_edits:
            subscription_edit_delay_in_days = subscription_edits.latest('created_datetime').delay_in_days
        return subscription_edit_delay_in_days

    def get_current_treatment(self, instance):
        from emr.serializers import PatientPrescriptionDisplaySerializer

        current_treatment = None

        latest_plan_order = instance.get_latest_plan_order()
        if latest_plan_order:
            if latest_plan_order.patient_prescription:
                prescription = latest_plan_order.patient_prescription
                if prescription:
                    current_treatment = PatientPrescriptionDisplaySerializer(prescription).data
                    logger.debug(f'[get_current_treatment] latest plan order: {latest_plan_order}. Current treatment: {current_treatment}. '
                                 f'Plan product: {instance.product}.')

        return current_treatment

    def get_upcoming_treatment(self, instance):
        from emr.serializers import PatientPrescriptionDisplaySerializer
        upcoming_treatment = None
        latest_completed_medical_visit = instance.customer.get_latest_medical_visit_completed()
        if latest_completed_medical_visit:
            prescription = latest_completed_medical_visit.get_latest_refill_prescription()
            if prescription:
                upcoming_treatment = PatientPrescriptionDisplaySerializer(prescription).data
        return upcoming_treatment

    def get_current_order(self, instance):
        from orders.serializers import OrderSerializer
        latest_plan_order = instance.get_latest_plan_order()
        if latest_plan_order:
            return OrderSerializer(latest_plan_order).data
        return latest_plan_order

    def get_shipping_details(self, instance):
        shipping_details = instance.shipping_details
        if shipping_details:
            return ShippingDetailsSerializer(shipping_details).data
        return shipping_details

    def update(self, instance, validated_data):
        from emr.models import Visit
        from payment.services.stripe_services import StripeService

        logger.debug(f'[SubscriptionSerializer][update] Updating subscription: {instance.id}. '
                     f'Validated data: {validated_data}')

        existing_current_period_end_datetime = instance.current_period_end_datetime
        existing_frequency = instance.frequency
        existing_is_active_status = instance.is_active
        existing_quantity = instance.quantity

        current_period_end_datetime = validated_data.pop('current_period_end_datetime') \
            if validated_data.get('current_period_end_datetime') else None
        current_period_start_datetime = validated_data.pop('current_period_start_datetime') \
            if validated_data.get('current_period_start_datetime') else None
        frequency = validated_data.pop('frequency') \
            if validated_data.get('frequency') else None
        is_active_status = validated_data.pop('is_active') \
            if validated_data.get('is_active') is not None else None
        delay_in_days = validated_data.pop('delay_in_days') \
            if validated_data.get('delay_in_days') else 0
        ship_now = validated_data.pop('ship_now') \
            if validated_data.get('ship_now') is not None else None
        product = validated_data.pop('product') \
            if validated_data.get('product') else None
        cancel_reason = validated_data.pop('cancel_reason') \
            if validated_data.get('cancel_reason') else None
        quantity = validated_data.pop('quantity') \
            if validated_data.get('quantity') else None

        cancel = False
        resume = False
        if is_active_status is not None:
            cancel = existing_is_active_status and not is_active_status
            resume = not existing_is_active_status and is_active_status
        if current_period_end_datetime:
            delay_in_days = (current_period_end_datetime - existing_current_period_end_datetime).days

        logger.debug(f'[SubscriptionSerializer][update] '
                     f' ******** Updated instance: {instance} ******** '
                     f'cancel: {cancel}. resume: {resume}. '
                     f'existing_is_active_status: {existing_is_active_status}. '
                     f'existing_frequency: {existing_frequency}. '
                     f'existing_quantity: {existing_quantity} '
                     f'is_active_status: {is_active_status}. '
                     f'frequency: {frequency}.'
                     f'delay_in_days: {delay_in_days}. '
                     f'ship_now: {ship_now}. '
                     f'product: {product}. '
                     f'current_period_start_datetime: {current_period_start_datetime}. '
                     f'current_period_end_datetime: {current_period_end_datetime}. '
                     f'cancel_reason: {cancel_reason}. '
                     f'quantity: {quantity}.')

        # TODO - remove cancel_datetime and cancel_reason after migration to subscription edits
        instance.cancel_reason = Subscription.CancelReason.not_applicable
        instance.cancel_datetime = None

        if frequency:
            instance.frequency = frequency
            if existing_frequency and existing_frequency != frequency:

                subscription_edit = Edit.objects.create(customer=instance.customer,
                                                        original_frequency=existing_frequency,
                                                        updated_frequency=frequency,
                                                        subscription=instance,
                                                        type=Edit.Type.frequency_update)
                logger.debug(
                    f'[SubscriptionSerializer][update] '
                    f'Frequency edit. Instance: {instance}. '
                    f'subscription_edit: {subscription_edit}.')

        if quantity:
            instance.quantity = quantity
            if existing_quantity and existing_quantity != quantity:
                subscription_edit = Edit.objects.create(customer=instance.customer,
                                                        original_quantity=existing_quantity,
                                                        updated_quantity=quantity,
                                                        subscription=instance,
                                                        type=Edit.Type.quantity_update)
                logger.debug(
                    f'[SubscriptionSerializer][update] '
                    f'Quantity edit. Instance: {instance}. '
                    f'subscription_edit: {subscription_edit}.')

        if current_period_end_datetime:
            if existing_current_period_end_datetime and existing_current_period_end_datetime != current_period_end_datetime:
                update_type = Edit.Type.pause if current_period_end_datetime > existing_current_period_end_datetime else Edit.Type.early_ship
                instance.current_period_end_datetime = current_period_end_datetime
                if update_type == Edit.Type.pause:
                    if instance.open_invoice_id:
                        # cancel invoice
                        StripeService().cancel_invoice(instance.customer, instance.open_invoice_id)
                        instance.open_invoice_id = None
                subscription_edit = Edit.objects.create(customer=instance.customer,
                                                        delay_in_days=delay_in_days,
                                                        original_ship_datetime=existing_current_period_end_datetime,
                                                        updated_ship_datetime=current_period_end_datetime,
                                                        subscription=instance,
                                                        reason=cancel_reason,
                                                        type=update_type)

                logger.debug(
                    f'[SubscriptionSerializer][update] '
                    f'Ship time edit. Instance: {instance}. '
                    f'subscription_edit: {subscription_edit}.')

        # if delay_in_days:
        #     update_type = Edit.Type.pause if delay_in_days > 0 else Edit.Type.early_ship
        #     new_current_period_end_datetime = existing_current_period_end_datetime + relativedelta(days=+delay_in_days)
        #     instance.current_period_end_datetime = new_current_period_end_datetime
        #     logger.debug(
        #         f'[SubscriptionSerializer][update] Delay from days. Instance: {instance}')


        if cancel:
            instance.is_active = False
            # TODO - remove cancel_datetime and cancel_reason after migration to subscription edits
            instance.cancel_datetime = timezone.now()
            if cancel_reason:
                instance.cancel_reason = cancel_reason

            # cancel pending order
            open_invoice_id = instance.open_invoice_id
            pending_subscription_orders = instance.customer.orders.filter(Q(payment_captured_datetime__isnull=True) &
                                                                          Q(payment_processor_charge_id=open_invoice_id))
            for pending_subscription_order in pending_subscription_orders:
                pending_subscription_order.status = Order.Status.cancelled
                pending_subscription_order.save(update_fields=['status'])

                if pending_subscription_order.emr_medical_visit \
                        and pending_subscription_order.emr_medical_visit.status != Visit.Status.provider_signed \
                        and pending_subscription_order.emr_medical_visit.status != Visit.Status.provider_rx_submitted \
                        and pending_subscription_order.emr_medical_visit.status != Visit.Status.provider_rx_denied \
                        and pending_subscription_order.emr_medical_visit.status != Visit.Status.provider_cancelled:
                    pending_subscription_order.emr_medical_visit.status = Visit.Status.provider_cancelled
                    pending_subscription_order.emr_medical_visit.save(update_fields=['status'])

            instance.open_invoice_id = None

            subscription_edit = Edit.objects.create(customer=instance.customer,
                                                    reason=cancel_reason,
                                                    subscription=instance,
                                                    type=Edit.Type.cancel)

            logger.debug(f'[SubscriptionSerializer][update] '
                         f'Cancel subscription. '
                         f'Instance: {instance}. '
                         f'subscription_edit: {subscription_edit}.')

        elif resume:
            instance.is_active = True
            # TODO - check client date timestamp and format if needed
            instance.current_period_end_datetime = timezone.now() if not current_period_end_datetime else current_period_end_datetime

            subscription_edit = Edit.objects.create(customer=instance.customer,
                                                    original_quantity=existing_quantity,
                                                    updated_quantity=quantity,
                                                    original_frequency=existing_frequency,
                                                    updated_frequency=frequency,
                                                    original_ship_datetime=existing_current_period_end_datetime,
                                                    updated_ship_datetime=current_period_end_datetime,
                                                    subscription=instance,
                                                    type=Edit.Type.restart)

            try:
                MailService.send_user_email_order_confirmation_resume(instance.customer, instance)
            except (APIException, ValidationError) as error:
                logger.error(f'[SubscriptionSerializer][update] Unable to send resume email to customer: {instance.customer.id}.')

            logger.debug(
                f'[SubscriptionSerializer][update] '
                f'Resume subscription. Instance: {instance}. '
                f'subscription_edit: {subscription_edit}.')
        elif ship_now:
            instance.is_active = True
            instance.current_period_end_datetime = timezone.now()

            subscription_edit = Edit.objects.create(customer=instance.customer,
                                                    delay_in_days=delay_in_days,
                                                    original_ship_datetime=existing_current_period_end_datetime,
                                                    updated_ship_datetime=current_period_end_datetime,
                                                    subscription=instance,
                                                    type=Edit.Type.early_ship)

            try:
                MailService.send_user_email_order_confirmation_ship_now(instance.customer, instance)
            except (APIException, ValidationError) as error:
                logger.error(f'[SubscriptionSerializer][update] Unable to send ship now email to customer: {instance.customer.id}.')

            logger.debug(
                f'[SubscriptionSerializer][update] '
                f'Ship subscription now. '
                f'Instance: {instance}. '
                f'subscription_edit: {subscription_edit}.')

        logger.debug(f'[SubscriptionSerializer][update] validated_data: {validated_data}.')

        instance.save()

        logger.debug(f'[SubscriptionSerializer][update] '
                     f'Updated subscription {instance.__dict__}.')

        return instance

    def create(self, validated_data):
        customer_uuid = validated_data.pop("customer").get("uuid") if validated_data.get("customer") else None
        product_uuid = validated_data.pop("product").get("uuid") if validated_data.get("product") else None
        frequency = validated_data.get("frequency")
        current_period_start_datetime = validated_data.pop("current_period_start_datetime") if \
            validated_data.get("current_period_start_datetime") else timezone.now()
        current_period_end_datetime = validated_data.pop("current_period_end_datetime") if \
            validated_data.get("current_period_end_datetime") else current_period_start_datetime + relativedelta(
            days=+frequency*30)

        customer = None
        product = None
        if customer_uuid:
            customer = User.objects.get(uuid=customer_uuid)
        if product_uuid:
            product = Product.objects.get(uuid=product_uuid)

        logger.debug(f"[SubscriptionSerializer][create] Validated data: {validated_data}. "
                     f"customer: {customer}. product: {product}. "
                     f"customer_uuid: {customer_uuid}. product_uuid: {product_uuid}. "
                     f"current_period_start_datetime: {current_period_start_datetime}. "
                     f"current_period_end_datetime: {current_period_end_datetime}.")

        subscription = Subscription.objects.create(
            customer=customer,
            product=product,
            current_period_start_datetime=current_period_start_datetime,
            current_period_end_datetime=current_period_end_datetime,
            **validated_data
        )

        return subscription


class PatchSelectedSubscriptionOrdersAndPushToCurexaSerializer(serializers.Serializer):
    subscription_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1)
    )
    user_id = serializers.IntegerField(min_value=1)
    capture_payment = serializers.BooleanField(default=False)

    def validate(self, attrs):
        if not all(
            map(
                lambda customer_id: customer_id == attrs.get("user_id"),
                Subscription.objects.filter(
                    id__in=attrs.get("subscription_ids")
                ).values_list("customer", flat=True).distinct("customer"),
            )
        ):
            raise serializers.ValidationError(
                "Subscriptions don't match with given user."
            )
        return attrs

    def validate_subscription_ids(self, value):
        if len(value) != Subscription.objects.filter(id__in=value).count():
            raise serializers.ValidationError(
                "Some of the given subscription ids are wrong."
            )
        return value

    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User with given id does not exist.")
        return value
