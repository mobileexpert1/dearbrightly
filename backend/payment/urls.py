from rest_framework.routers import DefaultRouter
from django.urls import path, include
from payment.views import PaymentViewSet

app_name = 'payment'

router = DefaultRouter(trailing_slash=False)
router.register('', PaymentViewSet, base_name='payment')

urlpatterns = [
    path('', include(router.urls)),
]
