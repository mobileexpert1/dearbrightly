import re
from users.models import User, ShippingDetails
from orders.models import Order, OrderProduct, OrderItem
from subscriptions.models import Subscription
from rest_framework import serializers
from dearbrightly import constants
from users.serializers import ShippingDetailsSerializer
from django.db import IntegrityError
from utils.logger_utils import logger


class ShopifyCustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255, required=True)
    id = serializers.CharField(max_length=512, required=True, source="shopify_user_id")

    class Meta:
        model = User
        fields = ["email", "id", "first_name", "last_name", "opt_in_sms_app_notifications"]

class ShopifyOrderSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Order
        fields = ["customer", "shipping_details", "shopify_order_id", "shipping_fee", 
            "discount", "discount_code", "tax", "purchased_datetime", "payment_captured_datetime",
            "status"]
        extra_kwargs = {"customer": {"required": True}, "shipping_details": {"required": True}}

class ShopifyShippingDetailsSerializer(serializers.ModelSerializer):
    address1 = serializers.CharField(max_length=128, source="address_line1")
    address2 = serializers.CharField(max_length=128, source="address_line2", required=False, allow_null=True, allow_blank=True)
    zip = serializers.CharField(max_length=5, min_length=5, source="postal_code")
    province_code = serializers.ChoiceField(choices=constants.STATE_CHOICES, source="state")
    country_code = serializers.CharField(max_length=2, source="country")

    class Meta:
        model = ShippingDetails
        fields = ["id", "city", "phone", "first_name", "last_name", "address1", "address2", 
            "zip", "province_code", "country_code"]

    @staticmethod
    def clean_phone_number(phone_number: str) -> str:
        if phone_number.startswith("+"):
            phone_number = phone_number[2:]
        return re.sub(r"[^0-9]", "", phone_number)

class ShopifyOrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ["order", "product", "quantity", "frequency"]

class ShopifyOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["order", "product", "order_product", "tax", "tax_rate"]

class ShopifyDiscountInputSerializer(serializers.Serializer):
    order_id = serializers.UUIDField(required=True)
    discount_code = serializers.CharField(max_length=32)

class RechargeSubscriptionSerializer(serializers.ModelSerializer):
    current_period_start_datetime = serializers.DateTimeField(input_formats=["%Y-%m-%d"])
    current_period_end_datetime = serializers.DateTimeField(input_formats=["%Y-%m-%d"])
    shipping_details = ShippingDetailsSerializer(required=True)

    class Meta:
        model = Subscription
        fields = ["product", "customer", "recharge_subscription_id", "recharge_address_id", "recharge_payment_method_id", 
                  "quantity", "frequency", "current_period_start_datetime", "current_period_end_datetime", "is_active", 
                  "shipping_details"]
        
        extra_kwargs = {
            "recharge_subscription_id": {"required": True, "allow_blank": False, "allow_null": False},
            "recharge_address_id": {"required": True, "allow_blank": False, "allow_null": False},
            "recharge_payment_method_id": {"required": True, "allow_blank": False, "allow_null": False},
        }

    def create(self, validated_data):
        recharge_address_id = validated_data.get("recharge_address_id")
        recharge_subscription_id = validated_data.get("recharge_subscription_id")
        shipping_details_data = validated_data.pop("shipping_details")
        shipping_details = ShippingDetails.objects.filter(
            subscriptions__recharge_address_id=recharge_address_id
        ).last()
        if not shipping_details:
            shipping_details = ShippingDetails.objects.create(**shipping_details_data)
        else:
            shipping_details_serializer = ShippingDetailsSerializer(
                shipping_details, shipping_details_data, partial=True
            )
            shipping_details_serializer.is_valid(raise_exception=True)
            shipping_details = shipping_details_serializer.save()
        try:
            subscription = Subscription.objects.create(
                shipping_details=shipping_details,
                **validated_data,
            )
        except IntegrityError as e:
            logger.error(
                f"[RechargeSubscriptionSerializer][create] "
                f"Unable to create recharge subscription with error: {e} "
                f"for recharge subscription ID: {recharge_subscription_id}"
            )
            subscription = Subscription.objects.filter(
                recharge_subscription_id=recharge_subscription_id
            ).last()
            if subscription:
                logger.error(
                    f"[RechargeSubscriptionSerializer][create] "
                    f"Subscription with Recharge subscription ID: {recharge_subscription_id} already exists. "
                    f"Subscription ID: {subscription.id}"
                )
        return subscription

    def update(self, instance, validated_data):
        recharge_address_id = validated_data.get("recharge_address_id")
        shipping_details_data = validated_data.pop("shipping_details")
        if instance.recharge_address_id != recharge_address_id:
            shipping_details = ShippingDetails.objects.filter(
                subscriptions__recharge_address_id=recharge_address_id
            ).last()
            if not shipping_details:
                shipping_details = ShippingDetails.objects.create(**shipping_details_data)
            else:
                shipping_details_serializer = ShippingDetailsSerializer(
                    shipping_details, shipping_details_data, partial=True
                )
                shipping_details_serializer.is_valid(raise_exception=True)
                shipping_details = shipping_details_serializer.save()
        else:
            shipping_details_serializer = ShippingDetailsSerializer(
                instance.shipping_details, shipping_details_data, partial=True
            )
            shipping_details_serializer.is_valid(raise_exception=True)
            shipping_details = shipping_details_serializer.save()

        instance = super().update(instance, validated_data)
        if shipping_details:
            instance.shipping_details = shipping_details
        instance.save()
        return instance
