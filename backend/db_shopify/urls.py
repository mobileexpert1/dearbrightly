from django.urls import path
from rest_framework.routers import DefaultRouter

import db_shopify.views as ShopifyViews

app_name = "db_shopify"

router = DefaultRouter(trailing_slash=False)

urlpatterns = [
    path("oauth-callback-handler", ShopifyViews.oauth_callback_handler, name="oauth-callback-handler"),
    path("authenticate", ShopifyViews.authenticate, name="authenticate"),
    path("get-orders", ShopifyViews.get_orders, name="get-order"),
    path("order-created-webhook-handler", ShopifyViews.order_created_webhook_handler, name="order-created-webhook-handler"),
    path("get-discount", ShopifyViews.get_discount, name="get-discount"),
] + router.urls
