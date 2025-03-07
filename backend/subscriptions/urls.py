from rest_framework.routers import DefaultRouter
from subscriptions.views import SubscriptionViewSet
from django.urls import path
from subscriptions.views import UserSubscriptionListView

app_name = 'subscriptions'

router = DefaultRouter(trailing_slash=False)
router.register('subscriptions', SubscriptionViewSet, base_name='subscriptions')

urlpatterns = [
    path('customers/<uuid:user_uuid>/subscriptions', UserSubscriptionListView.as_view(), name='user_subscriptions'),
] + router.urls