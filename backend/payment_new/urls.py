from django.urls import path
from rest_framework.routers import DefaultRouter

from payment_new.views import (
    AuthorizePaymentAPIView,
    PaymentViewSet,
    CouponViewSet,
)


app_name = "payment_new"

router = DefaultRouter(trailing_slash=False)
router.register("", PaymentViewSet, base_name="payment")
router.register("coupons", CouponViewSet, base_name="coupon")

urlpatterns = [
    path(
        "orders/<uuid:order_uuid>/authorize-payment",
        AuthorizePaymentAPIView.as_view(),
        name="authorize-payment",
    ),
] + router.urls