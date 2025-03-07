from rest_framework import urlpatterns
from rest_framework.routers import DefaultRouter

from products_new.views import ProductViewSet


app_name = "products"

router = DefaultRouter(trailing_slash=False)
router.register("products", ProductViewSet, base_name="products")

urlpatterns = router.urls
