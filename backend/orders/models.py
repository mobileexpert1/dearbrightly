from django.conf import settings
from django.db.models import Q
from uuid import uuid4
from datetime import datetime, timezone
from django.db import models
from django.utils.translation import ugettext_lazy as _
from djchoices import DjangoChoices, ChoiceItem
from dearbrightly.constants import \
    ALLOWED_SHIPPING_STATES, \
    DEFAULT_PHARMACY_ID, \
    DEFAULT_SHIP_RATE, \
    FREE_SHIP_ORDER_ITEM_COUNT_THRESHOLD, \
    MEDICAL_VISIT_FEE, \
    ORDER_NUMBER_OFFSET
from utils.logger_utils import logger
from django.utils import timezone
from db_analytics.services import OptimizelyService
from products.models import Product


optimizely_service = OptimizelyService(settings.OPTIMIZELY_PROJECT_ID)


# inventory of bottles and products
class Inventory(models.Model):
    class Type(DjangoChoices):
        product = ChoiceItem('product')
        bottle = ChoiceItem('bottle')
        packaging = ChoiceItem('packaging')
        pamphlet = ChoiceItem('pamphlet')

    class BottleType(DjangoChoices):
        none = ChoiceItem('none')
        refillable_bottle = ChoiceItem('refillable bottle')
        refill = ChoiceItem('refill')
        non_refillable_bottle = ChoiceItem('non refillable bottle')

    type = models.CharField(
        _('Type of Inventory'), max_length=32, default=Type.product, choices=Type.choices)
    bottle_type = models.CharField(
        _('Inventory Bottle Type'), max_length=32, default=BottleType.non_refillable_bottle, choices=BottleType.choices, blank=True, null=True)
    created_datetime = models.DateTimeField(auto_now_add=True)
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL, related_name='inventory')
    quantity = models.PositiveIntegerField(default=0)
    quantity_remaining_notification = models.PositiveIntegerField(default=0) # inventory left when admin will get notification (add flag in the Re-Tool dashboard)
    starting_order_number = models.PositiveIntegerField(null=True, blank=True)
    start_datetime = models.DateTimeField(auto_now_add=False, null=True)
    name = models.CharField(max_length=64, blank=True)
    description = models.CharField(max_length=512, blank=True, null=True)

    @property
    def number_items_used(self):
        items_used = None
        if self.start_datetime:
            shipped_order_items = OrderItem.objects.filter(order__status=Order.Status.shipped)
            shipped_orders = Order.objects.filter(status=Order.Status.shipped)
            if self.bottle_type:
                items_used = shipped_order_items.filter(Q(bottle_type=self.bottle_type) & Q(order__shipped_datetime__gte=self.start_datetime))
            elif self.product:
                items_used = shipped_order_items.filter(Q(product=self.product) & Q(order__shipped_datetime__gte=self.start_datetime))
            else:
                items_used = shipped_orders.filter(shipped_datetime__gte=self.start_datetime)
        number_items_used = len(items_used) if items_used else 0
        logger.debug(
            f'[Inventory][quantity_remaining] type: {self.type}. items_used: {items_used}. number_items_used: {number_items_used}')
        return number_items_used

    @property
    def quantity_remaining(self):
        # TODO - Add back returned products or bottles??
        number_items_used = self.number_items_used
        number_products_remaining = self.quantity - number_items_used
        logger.debug(f'[Inventory][quantity_remaining] number_products_remaining: {number_products_remaining}.')
        return number_products_remaining

    def save(self, *args, **kwargs):
        starting_order = Order.objects.filter(id=self.starting_order_number)
        if starting_order:
            start_time = starting_order.first().shipped_datetime
            if start_time:
                self.start_datetime = start_time
        logger.debug(f'[Inventory][save] inventory: {self.id}. starting_order_number: {self.starting_order_number}. '
                     f'start_time: {start_time}.')

        return super().save(*args, **kwargs)

# External-facing product in an order (this is needed for the sets, which may include different items)
# An order's order_products should be used over the order_items for all client-related events


class OrderProduct(models.Model):
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE,
                              related_name='order_products', null=True, blank=True)
    product = models.ForeignKey('products.Product', null=True, blank=True,
                                on_delete=models.SET_NULL, related_name='order_products')
    frequency = models.IntegerField(
        _('Subscription frequency in months'), default=0)
    quantity = models.IntegerField(
        _('Quantity of products made in the order'), default=1)

    @property
    def discount(self):
        total_discount = 0
        for order_item in self.order_items.all():
            if order_item.discount > 0:
                total_discount += order_item.discount * self.quantity
        return total_discount

    @property
    def is_set(self):
        return self.product.is_set

    @property
    def is_subscription(self):
        return self.frequency > 0

    @property
    def price(self):
        total_price = 0
        for order_item in self.order_items.all():
            total_price += order_item.price * self.quantity
        return total_price

    @property
    def shipping_fee(self):
        return (self.price/self.order.subtotal) * self.order.shipping_fee

    @property
    def tax(self):
        total_tax = 0
        for order_item in self.order_items.all():
            if order_item.tax > 0:
                total_tax += order_item.tax * order_item.quantity
        return total_tax

# Internal-facing order products in an order
# Used for subscriptions, tax and price calculation, etc.


class OrderItem(models.Model):
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE,
                              related_name='order_items', null=True, blank=True)
    order_product = models.ForeignKey('orders.OrderProduct', null=True, blank=True, on_delete=models.CASCADE,
                                      related_name='order_items')
    product = models.ForeignKey('products.Product', null=True, blank=True,
                                on_delete=models.SET_NULL, related_name='order_items')
    discount = models.PositiveIntegerField(
        _('Discount amount for item'), null=True, default=0)
    # TODO - Rename this to describe that this is NOT the user's first trial item (e.g., 'is_returning', 'is_recurring', 'is_not_trial')
    # Or, get rid of the field and replace with 'is_trial_order' (can be derived)
    # 'is_refill' is not accurate as the item could be created from a new yearly Rx, which technically is not a refill
    is_refill = models.BooleanField(default=False)
    subscription = models.ForeignKey('subscriptions.Subscription', null=True, blank=True,
                                     on_delete=models.SET_NULL, related_name='order_items')
    is_invoice_created = models.BooleanField(default=False)
    is_invoice_payment_success = models.BooleanField(default=False)
    price = models.PositiveIntegerField(
        _('Unit price of item, not including discounts, shipping, or tax.'), null=True, default=0)

    # TODO - Remove tax field since it's not really used and can be calculated
    #  Precision is lost when quantity of the order item > 1
    tax = models.PositiveIntegerField(
        _('Tax amount for item'), null=True, default=0)

    tax_rate = models.FloatField(_('Tax rate for item'), null=True, default=0)
    bottle_type = models.CharField(
        _('Bottle type'), max_length=32, default=Inventory.BottleType.non_refillable_bottle, choices=Inventory.BottleType.choices)
    tracking_number = models.CharField(
        _('Tracking number'), max_length=64, blank=True, null=True)
    shipping_carrier = models.CharField(
        _('Shipping Carrier'), max_length=8, blank=True, null=True)
    shipped_datetime = models.DateTimeField(auto_now=False, blank=True, null=True)
    delivered_datetime = models.DateTimeField(auto_now=False, null=True)

    @property
    def tracking_uri(self):
        if self.tracking_number:
            return settings.USPS_TRACKING_URL.format(tracking_number=self.tracking_number)
        return None

    @property
    def frequency(self):
        return self.order_product.frequency

    @property
    def is_part_of_set(self):
        return self.order_product.product.is_set

    @property
    def is_subscription(self):
        return self.frequency > 0

    @property
    def quantity(self):
        return self.order_product.quantity

    def get_bottle_type(self):
        if self.product.product_type == Product.Type.rx:
            return self._get_bottle_type_for_rx_product(self.order.customer)

        return self.product.bottle_type


    def save(self, *args, **kwargs):
        if not self.pk:
            self.bottle_type = self.get_bottle_type()
            self.price = (self.product.subscription_price if self.frequency > 0 and self.product.product_type == Product.Type.otc else self.product.price)
            logger.debug(f'[OrderItem][save] is_refill: {self.is_refill}. price: {self.price}. bottle_type: {self.bottle_type}.')

        return super().save(*args, **kwargs)

    def _get_bottle_type_for_rx_product(self, customer):
        bottle_type = Inventory.BottleType.refillable_bottle

        if customer.has_received_refillable_bottle(self.product):
            bottle_type = Inventory.BottleType.refill

        logger.debug(f'[OrderItem][_get_bottle_type_for_rx_product] order_id: {self.order.id} '
                     f'bottle_type: {bottle_type}. product: {self.product}.')

        return bottle_type


class Order(models.Model):
    # User sees these status
    class Status(DjangoChoices):
        account_created = ChoiceItem(0, 'Account Created')
        pending_questionnaire = ChoiceItem(1, 'Pending Questionnaire')
        pending_photos = ChoiceItem(2, 'Pending Photos')
        pending_medical_provider_review = ChoiceItem(
            3, 'Pending Medical Provider Review')
        pending_pharmacy = ChoiceItem(4, 'Pending Pharmacy')
        awaiting_fulfillment = ChoiceItem(5, 'Awaiting Fulfillment')
        shipped = ChoiceItem(6, 'Shipped')
        pending_payment = ChoiceItem(7, 'Pending Payment')
        refunded = ChoiceItem(8, 'Refunded')
        cancelled = ChoiceItem(9, 'Cancelled')
        payment_failure = ChoiceItem(
            10, 'Payment Failure')
        subscription_order_autogenerated = ChoiceItem(
            11, 'Subscription Order Autogenerated')
        # Skin Profile complete (order not paid)
        skin_profile_complete = ChoiceItem(12, 'Skin Profile Complete')
        payment_complete = ChoiceItem(13, 'Payment Complete')
        payment_override = ChoiceItem(14, 'Payment Override')
        returned = ChoiceItem(15, 'Returned')
        partially_shipped = ChoiceItem(16, 'Partially Shipped')

    class PharmacyStatus(DjangoChoices):
        pending = ChoiceItem(0, 'Pending')
        rx_received = ChoiceItem(1, 'Pharmacy Rx Received')
        rx_fulfilled = ChoiceItem(2, 'Pharmacy Rx Fulfilled')
        rx_shipped = ChoiceItem(3, 'Pharmacy Rx Shipped')
        rx_error = ChoiceItem(4, 'Pharmacy Rx Error')

    class PaymentProcessor(DjangoChoices):
        stripe = ChoiceItem(0, 'Stripe')
        braintree = ChoiceItem(1, 'Braintree')
        square = ChoiceItem(2, 'Square')
        paypal = ChoiceItem(3, 'PayPal')

    class OrderType(DjangoChoices):
        rx = ChoiceItem('Rx')
        otc = ChoiceItem('OTC')

    class QuestionnaireType(DjangoChoices):
        none = ChoiceItem("None")
        new_user = ChoiceItem('New User')
        returning_user = ChoiceItem("Returning User")

    class PaymentCheckoutType(DjangoChoices):
        none = ChoiceItem(0, 'None')
        credit_card = ChoiceItem(1, 'Credit Card')
        apple_pay = ChoiceItem(2, 'Apple Pay')
        google_pay = ChoiceItem(3, 'Google Pay')
        # Not really supported on the client, but just adding it in to remind us that this payment type may exist in the wild
        microsoft_pay = ChoiceItem(4, 'Microsoft Pay')
        link = ChoiceItem(5, 'Link')

    # control: payment --> questionnaire --> photos --> complete
    ONBOARDING_FLOW_CONTROL = {
        Status.account_created: Status.pending_payment,
        Status.pending_payment: Status.pending_questionnaire,
        Status.pending_questionnaire: Status.pending_photos,
        Status.pending_photos: Status.skin_profile_complete
    }
    ONBOARDING_FLOW_OTC = {
        Status.account_created: Status.pending_payment,
    }
    # variation 1: questionnaire --> photos --> payment --> complete
    ONBOARDING_FLOW_TYPE_1 = {
        Status.account_created: Status.pending_questionnaire,
        Status.pending_questionnaire: Status.pending_photos,
        Status.pending_photos: Status.pending_payment,
        Status.pending_payment: Status.skin_profile_complete
    }
    # variation 2: questionnaire --> payment --> photos --> complete
    ONBOARDING_FLOW_TYPE_2 = {
        Status.account_created: Status.pending_questionnaire,
        Status.pending_questionnaire: Status.pending_payment,
        Status.pending_payment: Status.pending_photos,
        Status.pending_photos: Status.skin_profile_complete
    }
    # skip payment: questionnaire --> photos --> complete
    SKIP_PAYMENT_FLOW = {
        Status.account_created: Status.pending_questionnaire,
        Status.pending_questionnaire: Status.pending_photos,
        Status.pending_photos: Status.skin_profile_complete
    }
    # skip payment: questionnaire --> photos --> complete
    REFILL_FLOW = {
        Status.account_created: Status.pending_questionnaire,
        Status.pending_questionnaire: Status.pending_photos,
        Status.pending_photos: Status.skin_profile_complete
    }

    uuid = models.UUIDField(blank=False, default=uuid4, unique=True)
    created_datetime = models.DateTimeField(auto_now_add=True)
    last_modified_datetime = models.DateTimeField(auto_now=True)
    purchased_datetime = models.DateTimeField(auto_now=False, null=True)
    payment_captured_datetime = models.DateTimeField(auto_now=False, null=True)
    seen_datetime = models.DateTimeField(auto_now=False, null=True)
    shipped_datetime = models.DateTimeField(auto_now=False, null=True)
    customer = models.ForeignKey(
        'users.User', null=True, blank=True, related_name='orders', on_delete=models.SET_NULL)
    status = models.CharField(_('Order status'), max_length=32,
                              default=Status.account_created, choices=Status.choices)
    payment_processor = models.CharField(_('Payment Processor'), max_length=16,
                                         default=PaymentProcessor.stripe, choices=PaymentProcessor.choices)
    # Stripe IDs are generally fewer than 30 chars (absolute max size is 256 bytes)
    payment_processor_charge_id = models.CharField(_('Payment Processor Charge/Payment Method ID'), max_length=256,
                                                   blank=True, null=True)
    payment_processor_card_id = models.CharField(_('Payment Processor Card ID'), max_length=256,
                                                   blank=True, null=True)

    # TODO (Alda) - Rename emr_medical_visit to medical_visit
    emr_medical_visit = models.ForeignKey(
        'emr.Visit', on_delete=models.SET_NULL, related_name='orders', null=True)

    subtotal = models.PositiveIntegerField(default=0)
    total_amount = models.PositiveIntegerField(default=0)
    refund_amount = models.PositiveIntegerField(
        _('Amount refunded.'), default=0)
    tax = models.PositiveIntegerField(default=0)
    shipping_fee = models.PositiveIntegerField(default=0)
    coupon = models.ForeignKey(
        'payment.Coupon',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='orders'
    )
    discount = models.PositiveIntegerField(default=0)
    discount_code = models.CharField(
        _('Discount code'), max_length=128, blank=True, null=True)
    notes = models.CharField(_('Admin notes'), max_length=256, blank=True)
    is_archived = models.BooleanField(default=False)
    smart_warehouse_submit_datetime = models.DateTimeField(auto_now=False, null=True)
    autogenerated = models.BooleanField(
        _('Autogenerated for subscription orders'), default=False)
    shipping_details = models.ForeignKey('users.ShippingDetails', on_delete=models.SET_NULL, related_name='orders',
                                         null=True, blank=True)
    patient_prescription = models.ForeignKey('emr.PatientPrescription', on_delete=models.SET_NULL,
                                             related_name='orders', null=True)
    tracking_number = models.CharField(
        _('Tracking number'), max_length=64, blank=True, null=True)
    shipping_carrier = models.CharField(
        _('Shipping Carrier'), max_length=32, blank=True, null=True)
    payment_checkout_type = models.CharField(
        _('Payment checkout type'), max_length=1, default=PaymentCheckoutType.none, choices=PaymentCheckoutType.choices)
    is_klaviyo_migrated = models.BooleanField(
        _('Migrated over to Klaviyo'), default=False)
    onboarding_flow_type = models.CharField(
        _('Determines the onboarding flow type'), max_length=32, default='otc')
    delivered_datetime = models.DateTimeField(auto_now=False, null=True)
    shopify_order_id = models.CharField(_('Shopify Order ID'), blank=True, null=True, unique=True, max_length=512)

    __original_status = None

    def __init__(self, *args, **kwargs):
        super(Order, self).__init__(*args, **kwargs)
        self.__original_status = self.status

    # def delete(self, using=None, keep_parents=False):
    #     self.is_archived = True
    #     self.save()

    @property
    def order_type(self):
        order_type = Order.OrderType.otc
        if self.is_rx_order():
            order_type = Order.OrderType.rx
        #logger.debug(f'[order_type] order: {self.id}. order_type: {order_type}.')
        return order_type

    @property
    def is_refill(self):
        refill_products = self.order_items.filter(is_refill=True)
        is_refill = len(refill_products) > 0
        #logger.debug(f'[is_refill] order: {self.id}. is_refill: {is_refill}.')
        return is_refill

    @property
    def contains_set(self):
        set_products = self.order_products.filter(product__is_set=True)
        return len(set_products) > 0

    @property
    def is_paid(self):
        if self.payment_captured_datetime is not None:
            return True
        return False

    @property
    def is_subscription(self):
        return self.get_is_subscription_status()

    @property
    def order_number(self):
        return self.id + ORDER_NUMBER_OFFSET

    @property
    def tracking_uri(self):
        if self.tracking_number:
            return settings.USPS_TRACKING_URL.format(tracking_number=self.tracking_number)
        return None

    @property
    def contains_decimal_values(self):
        return (self.subtotal % 100 > 0) or (self.shipping_fee % 100 > 0) or (self.discount % 100 > 0) or (self.total_amount % 100 > 0)

    @property
    def is_all_items_shipped(self):
        order_items_with_no_tracking = self.order_items.filter(tracking_number__isnull=True)
        return not order_items_with_no_tracking

    @property
    def is_shopify_order(self):
        if self.shopify_order_id is not None:
            return True
        return False

    def calculate_subtotal(self):
        order_items = self.order_items.all()
        subtotal = 0
        for order_item in order_items:
            subtotal += order_item.price * order_item.order_product.quantity
        return subtotal

    def is_rx_order(self):
        rx_items = self.order_items.filter(product__product_type='Rx')
        is_rx = len(rx_items) > 0
        #logger.debug(f'[is_rx_order] order: {self.id}. is_rx_order: {is_rx}. rx_items: {rx_items}.')
        return is_rx

    def is_otc_only(self):
        rx_items = self.order_items.filter(product__product_type='Rx')
        is_otc_only = len(rx_items) == 0
        return is_otc_only

    def is_rx_only(self):
        otc_items = self.order_items.filter(product__product_type='OTC')
        is_rx_only = len(otc_items) == 0
        return is_rx_only

    def get_is_subscription_status(self):
        subscription_products = self.order_products.filter(frequency__gt=0)
        return len(subscription_products) > 0

    def calculate_shipping_fee(self):
        if self.is_shopify_order:
            return self.shipping_fee
        return 0

    def is_first_order(self):
        orders = self.customer.orders.filter(~Q(status=Order.Status.refunded) &
                                             ~Q(status=Order.Status.cancelled))
        earliest_shipped_order = orders.earliest('created_datetime') if orders else None
        first_order = self == earliest_shipped_order or not earliest_shipped_order
        # logger.debug(f'[Order][is_first_order] '
        #              f'order: {self.id}. '
        #              f'earliest_shipped_order: {earliest_shipped_order}. '
        #              f'first_order: {first_order}.')
        return first_order

    def is_all_invoiced(self):
        order_items_not_invoiced = self.order_items.filter(
            is_invoice_created=False)
        return len(order_items_not_invoiced) == 0

    def is_invoice_payment_complete(self):
        order_items_unpaid = self.order_items.filter(
            is_invoice_payment_success=False)
        return len(order_items_unpaid) == 0

    def reset_total_amount(self):
        self.tax = 0
        self.subtotal = 0
        self.shipping_fee = 0

    def get_products_list(self):
        products_list = ''
        for order_product in self.order_products.all():
            products_list += f'{order_product.product.name}, '
        if len(products_list) > 0:
            products_list = products_list[:-2]
        return products_list

    def get_product_sku_list(self):
        products_sku_list = ''
        for order_product in self.order_products.all():
            products_sku_list += f'{order_product.product.sku}, '
        if len(products_sku_list) > 0:
            products_sku_list = products_sku_list[:-2]
        return products_sku_list

    def get_products(self):
        products = []
        for order_product in self.order_products.all():
            products.append(order_product.product)
        return products

    def get_shopping_bag_product_data(self):
        from orders.serializers import ShoppingBagOrderProductSerializer
        product_data = []
        for order_product in self.order_products.all():
            data = ShoppingBagOrderProductSerializer(order_product).data
            product_data.append(data)
        return product_data

    def get_original_status(self):
        return self.__original_status

    # All orders before 10/26/19 are from Big Commerce or are Manual Square orders
    def is_migrated_order(self):
        if self.payment_captured_datetime:
            return self.payment_captured_datetime < datetime(2018, 10, 26, tzinfo=timezone.utc)
        return False

    # First order of a new prescription
    def is_start_of_rx_cycle(self):
        visit = self.emr_medical_visit
        if visit:
            orders = visit.orders.filter(~Q(status=Order.Status.refunded) & ~Q(status=Order.Status.cancelled) & Q(payment_captured_datetime__isnull=False))
            earliest_order = orders.earliest('payment_captured_datetime') if orders else None
            logger.debug(f'[is_start_of_rx_cycle] order: {self.id}. orders: {orders}. earliest_order: {earliest_order}.')
            if not earliest_order:
                return False
            return earliest_order.id == self.id
        return False

    # Do all things needed at the successful payment of an order
    def finalize_purchase(self):
        if self.payment_captured_datetime:
            return

        current_time = timezone.now()
        self.payment_captured_datetime = current_time
        if not self.purchased_datetime:
            self.purchased_datetime = current_time

        if not self.is_rx_order():
            self.emr_medical_visit = None

        self.status = Order.Status.payment_complete

        logger.debug(f'[orders][finalize_purchase] order: {self.id}. {self.__dict__}')
        self.save()

    # TODO - This should be called if anytime order discount changes.
    def update_order_item_discount(self):
        # Distribute discount proportionally across multiple products in an order
        # This is needed for proper tax calculation
        discount_rounding_error = self.discount  # account for rounding error
        for idx, order_item in enumerate(self.order_items.all(), start=1):
            if self.discount == 0:
                order_item_discount_amount = 0
            else:
                order_item_discount_amount = round(order_item.price / self.subtotal * self.discount)

            discount_rounding_error -= order_item_discount_amount

            if idx == len(self.order_items.all()):
                if abs(discount_rounding_error) > 0:
                    order_item_discount_amount += discount_rounding_error

            logger.debug(f'[update_order_item_discount] '
                         f'Order Item {order_item.id}. '
                         f'Discount amount: {order_item_discount_amount}. '
                         f'Rounding error: {discount_rounding_error}.')

            order_item.discount = order_item_discount_amount/order_item.quantity
            order_item.save(update_fields=['discount'])

    def get_next_checkout_step_status(self):
        next_checkout_step_status = self.ONBOARDING_FLOW_OTC.get(
            int(self.status), self.status)

        if self.is_rx_order():
            if self.onboarding_flow_type == 'control':
                next_checkout_step_status = self.ONBOARDING_FLOW_CONTROL.get(
                    int(self.status), self.status)
            elif self.onboarding_flow_type == 'variation_1':
                next_checkout_step_status = self.ONBOARDING_FLOW_TYPE_1.get(
                    int(self.status), self.status)
            elif self.onboarding_flow_type == 'variation_2':
                next_checkout_step_status = self.ONBOARDING_FLOW_TYPE_2.get(
                    int(self.status), self.status)
            elif self.onboarding_flow_type == 'skip_payment':
                next_checkout_step_status = self.SKIP_PAYMENT_FLOW.get(
                    int(self.status), self.status)
            elif self.onboarding_flow_type == 'refill':
                next_checkout_step_status = self.REFILL_FLOW.get(
                    int(self.status), self.status)

        logger.debug(f'[get_next_checkout_step_status] '
                     f'Order: {self.id}. '
                     f'current_step: {self.status}. '
                     f'next_checkout_step_status: {next_checkout_step_status}. '
                     f'onboarding_flow_type: {self.onboarding_flow_type}.')

        return next_checkout_step_status

    def get_initial_checkout_step_status(self):
        reset_checkout_step_status = self.ONBOARDING_FLOW_OTC.get(
            int(self.Status.account_created), self.status)

        if self.is_rx_order():
            if self.onboarding_flow_type == 'control':
                reset_checkout_step_status = self.ONBOARDING_FLOW_CONTROL.get(
                    int(self.Status.account_created), self.status)
            elif self.onboarding_flow_type == 'variation_1':
                reset_checkout_step_status = self.ONBOARDING_FLOW_TYPE_1.get(
                    int(self.Status.account_created), self.status)
            elif self.onboarding_flow_type == 'variation_2':
                reset_checkout_step_status = self.ONBOARDING_FLOW_TYPE_2.get(
                    int(self.Status.account_created), self.status)
            elif self.onboarding_flow_type == 'skip_payment':
                reset_checkout_step_status = self.SKIP_PAYMENT_FLOW.get(
                    int(self.Status.account_created), self.status)

        logger.debug(f'[get_initial_checkout_step_status] '
                     f'Order: {self.id}. '
                     f'current_step: {self.status}. '
                     f'is_rx_order: {self.is_rx_order()}'
                     f'reset_checkout_step_status: {reset_checkout_step_status}. '
                     f'onboarding_flow_type: {self.onboarding_flow_type}.')

        return reset_checkout_step_status

    def get_onboarding_flow_type(self):
        onboarding_flow_type = 'otc'
        #logger.debug(f'[get_onboarding_flow_type] order: {self.__dict__}')
        if self.is_refill:
            onboarding_flow_type = 'refill'

        if self.is_rx_order() and not self.is_refill:
            # optimizely_service.activate_and_get_variation(request,'ob')
            variation = '2'
            onboarding_flow_type = 'control' if variation == '0' or not variation else f'variation_{variation}'
            logger.debug(
                f'[get_onboarding_flow_type] order: {self.id}. Onboarding variation {onboarding_flow_type}')

        if self.customer.is_skip_checkout_payment:
            onboarding_flow_type = 'skip_payment'

        return onboarding_flow_type

    def add_product(self, frequency, product, quantity):
        order_product = OrderProduct.objects.create(frequency=frequency, order=self, product=product,
                                                    quantity=quantity)
        order_item = OrderItem.objects.create(order=self, order_product=order_product, product=product,
                                              is_refill=not product.is_trial())
        logger.debug(
            f'[Order][add_product] order: {self.id}. product: {product}. frequency: {frequency}. quantity: {quantity}. '
            f'order_product: {order_product}. order_item: {order_item}.')

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        logger.debug(f'[Order][save][{self.id}] original_status: {self.__original_status}. status: {self.status}. update_fields: {update_fields}. ')
        self.subtotal = self.calculate_subtotal()
        self.shipping_fee = self.calculate_shipping_fee()
        self.total_amount = 0
        if self.subtotal > 0:
            self.total_amount = int(self.subtotal + self.tax + self.shipping_fee - self.discount - self.refund_amount)

        logger.debug(f'[Order][save][{self.id}] '
                     f'Total amount: {self.total_amount}. '
                     f'Subtotal: {self.subtotal}. '
                     f'Tax: {self.tax}. '
                     f'Shipping fee: {self.shipping_fee}. '
                     f'Discount: {self.discount}')

        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)
        self.__original_status = self.status
