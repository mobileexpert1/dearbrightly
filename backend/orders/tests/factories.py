from factory import Sequence, SubFactory, post_generation
from factory.django import DjangoModelFactory

from orders.models import OrderProduct, Order, OrderItem
from products.models import Product
from users.tests.factories import UserFactory, ShippingDetailsFactory


class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product

    name = Sequence(lambda n: f'Product_{n}')
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


class OrderItemFactory(DjangoModelFactory):
    class Meta:
        model = OrderItem

    product = SubFactory(ProductFactory)
