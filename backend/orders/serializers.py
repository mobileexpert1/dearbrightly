from rest_framework import serializers
from django.forms.models import model_to_dict
from orders.models import Inventory, Order, OrderItem, OrderProduct
from orders.services.services import OrderService
from users.serializers import UserOrderDataSerializer, ShippingDetailsSerializer
from emr.serializers import PatientPrescriptionDisplaySerializer
from users.exceptions import InvalidFieldException
from utils.object_utils import get_user

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

MAPPED_KLAVIYO_PRODUCT_CATEGORIES = {
    'retinoid': '1',
    'retinoid set': '2',
    'moisturizer': '3',
    'vitamin-c': '4',
    'sunblock': '5',
    'bottle': '6',
    'cleanser': '7',
}

MAPPED_KLAVIYO_PRODUCT_NAMES = {
    'Night Shift': '1',
    'Night Shift Set': '2',
    'Salve': '3',
    'Glowgetter': '4',
    'Glowgetter Set': '5',
    'Glowgetter Lite': '6',
    'Glowgetter Lite Set': '7',
    'Liquid Cloak': '8',
    'Liquid Cloak Refill': '9',
    'NeverSkip Tinted': '10',
    'Skinship': '11',
    'Skinship Refill': '12',
    'Night Shift Refillable Glass Bottle': '13',
    'Milk Tower': '14',
    'Milk Tower Refill': '15',
    'Skinship Refillable Glass Bottle': '16',
    'Liquid Cloak Refillable Glass Bottle': '17',
}


class OrderProductSerializer(serializers.ModelSerializer):
    discount = serializers.ReadOnlyField()
    frequency = serializers.IntegerField(required=True)
    is_set = serializers.ReadOnlyField()
    is_subscription = serializers.ReadOnlyField()
    price = serializers.ReadOnlyField()
    quantity = serializers.IntegerField(required=True)
    tax = serializers.ReadOnlyField()
    product_uuid = serializers.ReadOnlyField(source='product.uuid')
    product_name = serializers.ReadOnlyField(source='product.name')
    product_category = serializers.ReadOnlyField(source='product.product_category')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    product_image = serializers.ReadOnlyField(source='product.image')
    product_sku = serializers.ReadOnlyField(source='product.sku')
    refill_price = serializers.SerializerMethodField()
    trial_price = serializers.SerializerMethodField()
    subscription_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = ('id', 'discount', 'frequency', 'is_set', 'is_subscription', 'price',
                  'product_uuid', 'product_name', 'product_category', 'product_type',
                  'product_image', 'product_sku', 'quantity', 'tax', 'refill_price', 'trial_price', 'subscription_price')

    def get_refill_price(self, obj):
        if obj.product.refill_product:
            return obj.product.refill_product.price

    def get_trial_price(self, obj):
        if obj.product.trial_product:
            return obj.product.trial_product.price

    def get_subscription_price(self, obj):
        return obj.product.subscription_price

class ShoppingBagOrderProductSerializer(serializers.ModelSerializer):
    product_uuid = serializers.SerializerMethodField()
    product_name = serializers.ReadOnlyField(source='product.name')
    type = serializers.ReadOnlyField(source='product.product_type')
    description = serializers.ReadOnlyField(source='product.description')
    price = serializers.ReadOnlyField(source='product.refill_product.price')
    sku = serializers.ReadOnlyField(source='product.sku')
    image = serializers.ReadOnlyField(source='product.image')

    class Meta:
        model = OrderProduct
        fields = ('product_uuid', 'product_name', 'description', 'price', 'frequency', 'quantity',
                  'type', 'sku', 'image')

    def get_product_uuid(self, obj):
        return str(obj.product.uuid)

class OrderItemSerializer(serializers.ModelSerializer):
    frequency = serializers.ReadOnlyField()
    is_refill = serializers.BooleanField(required=False)
    is_subscription = serializers.ReadOnlyField()
    price = serializers.ReadOnlyField()
    quantity = serializers.ReadOnlyField()
    product_uuid = serializers.ReadOnlyField(source='product.uuid')
    product_name = serializers.ReadOnlyField(source='product.name')
    product_sku = serializers.ReadOnlyField(source='product.sku')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    tracking_uri = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['bottle_type',
                  'created_datetime',
                  'discount',
                  'frequency',
                  'is_invoice_created',
                  'is_invoice_payment_success',
                  'is_refill',
                  'is_subscription',
                  'last_modified_datetime',
                  'order',
                  'order_product',
                  'price',
                  'product',
                  'product_name',
                  'product_sku',
                  'product_type',
                  'product_uuid',
                  'quantity',
                  'shipped_datetime',
                  'shipping_carrier',
                  'tax',
                  'tax_rate',
                  'tracking_number',
                  'tracking_uri']

    def get_tracking_uri(self, obj):
        return obj.tracking_uri

class OrderSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='uuid')
    customer = UserOrderDataSerializer()
    order_products = OrderProductSerializer(many=True, read_only=True)
    order_items = OrderItemSerializer(many=True, read_only=True)
    shipping_details = ShippingDetailsSerializer(required=False, read_only=True)
    order_number = serializers.ReadOnlyField()
    order_type = serializers.ReadOnlyField()
    contains_set = serializers.ReadOnlyField()
    is_subscription = serializers.ReadOnlyField()
    is_subscription_active = serializers.ReadOnlyField()
    is_refill = serializers.ReadOnlyField()
    contains_decimal_values = serializers.ReadOnlyField()
    patient_prescription = PatientPrescriptionDisplaySerializer(required=False, read_only=True)
    tracking_uri = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['created_datetime', 'last_modified_datetime', 'payment_captured_datetime', 'purchased_datetime', 'customer', 'status',
                  'payment_processor', 'subtotal', 'total_amount', 'order_number', 'id',
                  'tax', 'shipping_fee', 'total_amount', 'subtotal',
                  'discount', 'discount_code', 'notes', 'order_type', 'payment_processor_charge_id',
                  'is_archived', 'is_refill', 'contains_set', 'is_subscription', 'is_subscription_active', 'shipping_details',
                  'order_products', 'autogenerated', 'seen_datetime', 'tracking_number', 'tracking_uri', 'shipping_carrier',
                  'payment_checkout_type', 'contains_decimal_values', 'patient_prescription', 'onboarding_flow_type', 'order_items']

    def get_tracking_uri(self, obj):
        return obj.tracking_uri

    def create(self, validated_data, context=None):
        customer_data = validated_data.pop('customer')
        shipping_details = validated_data.pop('shipping_details') if validated_data.get('shipping_details') else None
        discount = validated_data.pop('discount') if validated_data.get('discount') else None
        discount_code = validated_data.pop('discount_code') if validated_data.get('discount_code') else None
        order_products = validated_data.pop('order_products') if validated_data.get('order_products') else None

        logger.debug(f'[OrderSerializer][create] Validated data: {validated_data}')

        request = self.context.get('request') if self.context.get('request') else context.get('request')
        customer = get_user(self.context.get('request'), customer_data.get('uuid'))
        
        order = Order.objects.create(customer=customer, **validated_data)

        OrderService().update_order_discount(order, discount_code, discount)

        try:
            if shipping_details:
                logger.debug(f'Shipping Details: {shipping_details}')
                OrderService().create_shipping_details(order=order, shipping_details=shipping_details)
            elif customer.shipping_details:
                shipping_details_dict = model_to_dict(customer.shipping_details)
                if shipping_details_dict.get('id', None):
                    del shipping_details_dict['id']
                if shipping_details_dict.get('uuid', None):
                    del shipping_details_dict['uuid']
                logger.debug(f'Customer Shipping Details: {shipping_details_dict}')
                OrderService().create_shipping_details(order=order, shipping_details=shipping_details_dict)
            else:
                logger.debug(f'Shipping details for order does not exist: {order.id}')
        except TypeError as e:
            logger.debug(f'Unable to update shipping details for order {order.id} with error: {str(e)}')

        OrderService().update_order_products(order_products, order)

        order.save()
        return order

    def update(self, instance, validated_data):
        logger.debug(f'[OrderSerializer][update] Updated order: {instance.id}. Validated data: {validated_data}')
        order_products = validated_data.pop('order_products') if validated_data.get('order_products') else None
        shipping_details = validated_data.pop('shipping_details') if validated_data.get('shipping_details') else None
        discount_code = validated_data.pop('discount_code') if validated_data.get('discount_code') else None
        discount = validated_data.pop('discount') if validated_data.get('discount') else None

        OrderService().update_order_discount(instance, discount_code, discount)

        if shipping_details:
            try:
                OrderService().update_or_create_shipping_details(order=instance, shipping_details_data=shipping_details)
            except serializers.ValidationError as errors:
                error_msg = ''
                for key in errors.detail.keys():
                    for detail in errors.detail[key]:
                        error_msg += detail + ' '
                raise InvalidFieldException(detail=error_msg)

        if order_products:
            OrderService().update_order_products(order_products, instance)

        # update_status = validated_data.get('status')
        # if int(instance.status) != Order.Status.refunded:
        #     if update_status and int(update_status) == Order.Status.refunded:
        #         # TODO - Support refund_amount (right now the whole order is refunded)
        #         Service().refund_order(instance)

        return super().update(instance, validated_data)



class KlaviyoOrderItemSerializer(serializers.ModelSerializer):
    ProductID = serializers.SerializerMethodField()
    #SKU = serializers.ReadOnlyField(source='product.sku')
    ProductName = serializers.SerializerMethodField() #serializers.ReadOnlyField(source='product.name')
    Quantity = serializers.ReadOnlyField(source='quantity')
    ItemPrice = serializers.SerializerMethodField()
    RowTotal = serializers.SerializerMethodField()
    #ProductURL = serializers.SerializerMethodField()
    #ImageURL = serializers.SerializerMethodField()
    Categories = serializers.SerializerMethodField()
    Brand = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = ('ProductID', 'ProductName', 'Quantity', 'ItemPrice', 'RowTotal',
                  'Categories', 'Brand')

    def get_ProductID(self, obj):
        return str(obj.product.uuid)

    def get_ProductName(self, obj):
        mapped_product_name = obj.product.name #MAPPED_KLAVIYO_PRODUCT_NAMES[obj.product.name]
        return mapped_product_name

    # def get_ImageURL(self, obj):
    #     return obj.product.get_image()

    def get_ItemPrice(self, obj):
        return obj.price/100

    def get_RowTotal(self, obj):
        return obj.quantity*obj.price/100

    # def get_ProductURL(self, obj):
    #     return uri_utils.generate_absolute_url(request=None, path=f'product_details/{obj.product.get_kebab_case_name()}')

    def get_Categories(self, obj):
        mapped_category_name = obj.product.product_category #MAPPED_KLAVIYO_PRODUCT_CATEGORIES.get(obj.product.product_category, None)
        return [mapped_category_name]

    def get_Brand(self, obj):
        return "Dear Brightly"

class KlaviyoOrderSerializer(serializers.ModelSerializer):
    Categories = serializers.SerializerMethodField()
    ItemNames = serializers.SerializerMethodField()
    Brands = serializers.SerializerMethodField()
    DiscountCode = serializers.ReadOnlyField(source='discount_code')
    DiscountValue = serializers.SerializerMethodField()
    Items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('Categories', 'ItemNames', 'Brands', 'DiscountCode', 'DiscountValue', 'Items')

    def get_Categories(self, obj):
        categories_qs = obj.order_products.all().values_list('product__product_category', flat=True).distinct()
        categories = list(categories_qs)
        #mapped_categories = map(lambda x: MAPPED_KLAVIYO_PRODUCT_CATEGORIES.get(x, ''), categories)
        return categories  #list(mapped_categories)

    def get_DiscountValue(self, obj):
        return obj.discount/100

    def get_ItemNames(self, obj):
        item_names_qs = obj.order_products.all().values_list('product__name', flat=True).distinct()
        names = list(item_names_qs)
        #mapped_names = map(lambda x: MAPPED_KLAVIYO_PRODUCT_NAMES.get(x, ''), names)
        return names  #list(mapped_names)

    def get_Brands(self, obj):
        return ["Dear Brightly"]

    def get_Items(self, obj):
        items = []
        for order_product in obj.order_products.all():
            klaviyo_order_product = KlaviyoOrderItemSerializer(order_product).data
            items.append(klaviyo_order_product)
        return items


class KlaviyoOrderProductSerializer(serializers.ModelSerializer):
    ProductID = serializers.SerializerMethodField()
    #SKU = serializers.ReadOnlyField(source='product.sku')
    ProductName = serializers.SerializerMethodField() #serializers.ReadOnlyField(source='product.name')
    Quantity = serializers.ReadOnlyField(source='quantity')
    #ProductURL = serializers.SerializerMethodField()
    #ImageURL = serializers.SerializerMethodField()
    ProductCategories = serializers.SerializerMethodField()
    ProductBrand = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = ('ProductID', 'ProductName', 'Quantity', 'ProductCategories', 'ProductBrand')

    def get_ProductID(self, obj):
        return str(obj.product.uuid)

    def get_ProductName(self, obj):
        mapped_product_name = obj.product.name #MAPPED_KLAVIYO_PRODUCT_NAMES[obj.product.name]
        return mapped_product_name

    # def get_ProductURL(self, obj):
    #     return uri_utils.generate_absolute_url(request=None, path=f'product_details/{obj.product.get_kebab_case_name()}')

    # def get_ImageURL(self, obj):
    #     return obj.product.get_image()

    def get_ProductCategories(self, obj):
        mapped_category_name = obj.product.product_category #MAPPED_KLAVIYO_PRODUCT_CATEGORIES[obj.product.product_category]
        return [mapped_category_name]

    def get_ProductBrand(self, obj):
        return "Dear Brightly"


class InventorySerializer(serializers.ModelSerializer):
    number_items_used = serializers.ReadOnlyField()
    quantity_remaining = serializers.ReadOnlyField()
    product_sku = serializers.ReadOnlyField(source='product.sku')

    class Meta:
        model = Inventory
        fields = ('id', 'type', 'bottle_type', 'created_datetime', 'product', 'product_sku', 'quantity', 'quantity_remaining_notification',
                  'start_datetime', 'starting_order_number', 'name', 'description', 'number_items_used', 'quantity_remaining')
