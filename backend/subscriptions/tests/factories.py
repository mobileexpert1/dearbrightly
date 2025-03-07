import uuid

from django.utils import timezone
from factory import (
    Sequence,
    SubFactory,
    post_generation,
    LazyFunction,
    PostGenerationMethodCall,
)
from factory.django import DjangoModelFactory

from orders.models import OrderProduct, Order
from products.models import Product
from subscriptions.models import Subscription
from users.models import User
from users.tests.factories import ShippingDetailsFactory


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    uuid = LazyFunction(uuid.uuid4)
    email = Sequence(lambda n: f"user_{n}@dearbrightly.com")
    password = PostGenerationMethodCall("set_password", "DearbrightlyGo")
    shipping_details = SubFactory(ShippingDetailsFactory)

    is_superuser = False
    is_staff = False
    is_active = True


class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product

    uuid = LazyFunction(uuid.uuid4)
    name = Sequence(lambda n: f"Product_{n}")
    price = Sequence(lambda n: n)


class OrderProductFactory(DjangoModelFactory):
    class Meta:
        model = OrderProduct

    product = SubFactory(ProductFactory)


class OrderFactory(DjangoModelFactory):
    class Meta:
        model = Order

    customer = SubFactory(UserFactory)
    shipping_details = SubFactory(ShippingDetailsFactory)

    @post_generation
    def order_products(self, created, extracted, **kwargs):
        if not created:
            return
        if extracted:
            for order_product in extracted:
                self.order_products.add(order_product)


class SubscriptionFactory(DjangoModelFactory):
    class Meta:
        model = Subscription

    current_period_start_datetime = timezone.now() - timezone.timedelta(days=1)
    current_period_end_datetime = timezone.now() + timezone.timedelta(days=1)
    product = SubFactory(ProductFactory)
    customer = SubFactory(UserFactory)
    is_active = True
    frequency = 3
    delay_in_days = 0
    recharge_address_id = Sequence(lambda n: n + 1)
    recharge_subscription_id = Sequence(lambda n: n + 1)
