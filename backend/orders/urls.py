from django.urls import path
from rest_framework.routers import DefaultRouter

from orders.views import AdminOrderViewSet, OrderViewSet, UserOrderListView, OrderStatusChoicesView, AdminInventoryViewSet, AdminOrderItemViewSet

app_name = 'orders'

router = DefaultRouter(trailing_slash=False)
router.register('orders', OrderViewSet, base_name='orders')
router.register('admin/orders', AdminOrderViewSet, base_name='admin_orders')
router.register('admin/inventory', AdminInventoryViewSet, base_name='admin_inventory')
router.register('admin/order_items', AdminOrderItemViewSet, base_name='admin_order_items')

urlpatterns = [
    path('orders/choices/status', OrderStatusChoicesView.as_view(), name='status'),
    path('customers/<uuid:user_uuid>/orders', UserOrderListView.as_view(), name='user_orders'),
] + router.urls
