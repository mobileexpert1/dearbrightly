from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from products.models import Product
from products.serializers import ProductSerializer


class ProductViewSet(ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_hidden=False)
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    lookup_field = "uuid"
