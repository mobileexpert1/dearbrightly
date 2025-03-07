from django.contrib import admin

from subscriptions.models import OrderItemSubscription, OrderProductSubscription, Subscription

admin.site.register(OrderItemSubscription)
admin.site.register(OrderProductSubscription)
admin.site.register(Subscription)