from factory import Sequence
from factory.django import DjangoModelFactory

from products.models import Product


class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product

    name = Sequence(lambda n: f"Product {n}")
