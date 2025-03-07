from django.db.models import Q
from rest_framework import serializers
from orders.models import OrderProduct, Order
from payment.models import Coupon
from products.models import Product
from products_new.serializers import ProductSerializer
from users.serializers import UserSerializer


class AuthorizePaymentSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=64)


class ShoppingBagDataSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)
    frequency = serializers.IntegerField(min_value=0)
    product_uuid = serializers.UUIDField(required=True)
    price = serializers.IntegerField()
    subscription_price = serializers.IntegerField()

    class Meta:
        model = OrderProduct
        fields = (
            "product_uuid",
            "frequency",
            "quantity",
            "price",
            "subscription_price",
        )

    def create(self, validated_data, context=None):
        product_uuid = (
            validated_data.pop("product_uuid")
            if validated_data.get("product_uuid")
            else None
        )

        try:
            return OrderProduct.objects.create(
                product=Product.objects.get(uuid=product_uuid), **validated_data
            )
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                f"Unable to find product with uuid {product_uuid}"
            )


class DiscountInputSerializer(serializers.Serializer):
    discount_code = serializers.CharField(max_length=32)
    products = ShoppingBagDataSerializer(many=True)


class DiscountOutputSerializer(serializers.Serializer):
    discount_code = serializers.CharField(max_length=32)
    amount_off = serializers.IntegerField(min_value=0)
    percent_off = serializers.FloatField(min_value=0, max_value=100)


class InputCouponSerializer(serializers.ModelSerializer):
    allowed_customers = serializers.ListField(
        child=serializers.EmailField(), required=False
    )
    discounted_products = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )

    class Meta:
        model = Coupon
        fields = (
            "allowed_customers",
            "amount_off",
            "code",
            "discounted_products",
            "end_duration_range",
            "only_existing_purchasers",
            "first_time_order",
            "id",
            "is_active",
            "max_redemptions",
            "discounted_products_not_in_existing_plans_or_orders",
            "percent_off",
            "start_duration_range",
        )

    def validate(self, data):
        if data.get("amount_off") and data.get("percent_off"):
            raise serializers.ValidationError(
                "You cannot set both amount_off and percent_off."
            )
        return data


class OutputCouponSerializer(serializers.ModelSerializer):
    allowed_customers = serializers.SerializerMethodField()
    discounted_products = serializers.SerializerMethodField()
    redemptions_counter = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = (
            "allowed_customers",
            "amount_off",
            "code",
            "discounted_products",
            "end_duration_range",
            "only_existing_purchasers",
            "first_time_order",
            "id",
            "is_active",
            "max_redemptions",
            "discounted_products_not_in_existing_plans_or_orders",
            "percent_off",
            "redemptions_counter",
            "start_duration_range",
            "type",
        )

    def get_allowed_customers(self, obj):
        return [customer.email for customer in obj.allowed_customers.all()]

    def get_discounted_products(self, obj):
        return [
            {"id": product.id, "name": product.name, "quantity": product.quantity}
            for product in obj.discounted_products.all()
        ]

    def get_redemptions_counter(self, obj):
        return Order.objects.filter(
            Q(coupon=obj) &
            Q(payment_captured_datetime__isnull=False) &
            ~Q(status=Order.Status.cancelled) &
            ~Q(status=Order.Status.refunded)
        ).count()
