from rest_framework.routers import DefaultRouter

from products.views import ProductViewSet, RetoolDashboardsViewSet

app_name = 'products'

router = DefaultRouter(trailing_slash=False)
router.register('products', ProductViewSet, base_name='products')
router.register('retool-dashboards', RetoolDashboardsViewSet, base_name='retool-dashboards')

urlpatterns = router.urls
