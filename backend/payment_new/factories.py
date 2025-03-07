from factory import post_generation, Sequence, django

from payment.models import Coupon


class CouponFactory(django.DjangoModelFactory):
    class Meta:
        model = Coupon

    code = Sequence(lambda n: f"CODE_{n}")
    max_redemptions = 1

    @post_generation
    def allowed_customers(self, created, extracted, **kwargs):
        if not created:
            return
        if extracted:
            for customer in extracted:
                self.allowed_customers.add(customer)

    @post_generation
    def discounted_products(self, created, extracted, **kwargs):
        if not created:
            return
        if extracted:
            for product in extracted:
                self.discounted_products.add(product)
