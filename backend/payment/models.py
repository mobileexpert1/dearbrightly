import uuid

from django.db import models
from djchoices import DjangoChoices, ChoiceItem
from django.db.models import Q

from orders.models import Order
from products.models import Product
from users.models import User


class Coupon(models.Model):
    class Type(DjangoChoices):
        expiring = ChoiceItem("Expiring")
        infinite = ChoiceItem("Infinite")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    code = models.CharField(max_length=100)
    amount_off = models.PositiveIntegerField(default=0, null=True, blank=True)
    percent_off = models.DecimalField(
        max_digits=4, decimal_places=2, default=0, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    max_redemptions = models.PositiveIntegerField()
    start_duration_range = models.DateTimeField(null=True, blank=True)
    end_duration_range = models.DateTimeField(null=True, blank=True)
    type = models.CharField(max_length=32, default=Type.expiring, choices=Type.choices)
    first_time_order = models.BooleanField(default=False)
    only_existing_purchasers = models.BooleanField(default=False)
    discounted_products_not_in_existing_plans_or_orders = models.BooleanField(default=False)
    allowed_customers = models.ManyToManyField(User, related_name="coupons", blank=True)
    discounted_products = models.ManyToManyField(
        Product, related_name="coupons", blank=True
    )
    require_all_products = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code

    def max_redemptions_reached_by_customer(self, customer: User) -> bool:
        return (
                self.max_redemptions
                <= Order.objects.filter(
                    Q(coupon=self) &
                    Q(customer=customer) &
                    Q(payment_captured_datetime__isnull=False) &
                    ~Q(status=Order.Status.cancelled) &
                    ~Q(status=Order.Status.refunded)
                ).count()
        )
