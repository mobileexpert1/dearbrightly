from django.urls import path
from rest_framework.routers import DefaultRouter
import shipping.views as shipping

app_name = 'shipping'

router = DefaultRouter(trailing_slash=False)

urlpatterns = [
    path('webhooks/shippo', shipping.shippo_webhook_handler, name='shippo_webhook'),
    path('create-shipping-label', shipping.create_shipping_label, name='create-shipping-label'),
] + router.urls
