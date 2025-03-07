import datetime

from rest_framework.response import Response

from payment_new.permissions import DearBrightlyAPIKeyAuth
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, status
from rest_framework.decorators import action

from products.services import RetoolDashboardsService
from products_new.services.revenue_by_sku_services import ProductRevenues


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    lookup_field = "uuid"
    http_method_names = ["get"]

    def get_queryset(self):
        queryset = Product.objects.all().order_by("-product_type", "name")
        return queryset


class RetoolDashboardsViewSet(viewsets.ViewSet):
    permission_classes = (DearBrightlyAPIKeyAuth,)

    @action(detail=False, methods=["get"])
    def get_revenue_data(self, request):
        return Response(
            data=RetoolDashboardsService.get_revenue_data(
                product_ids=request.query_params.getlist("products"),
                product_category=request.query_params.getlist("product_category"),
                start_date=request.query_params.get("start_date"),
                end_date=request.query_params.get("end_date"),
            ),
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def get_product_revenue_by_sku(self, request):
        from urllib.parse import urlparse, parse_qs
        from dateutil.relativedelta import relativedelta

        service = ProductRevenues()
        query_params = parse_qs(urlparse(request.build_absolute_uri()).query)

        start_time = query_params.get("start")
        end_time = query_params.get("end")
        sku_categories = query_params.get("sku_categories")
        product_ids = query_params.get("product_ids", [])
        product_filters = {}

        # disabled `is_hidden` filter because some products are hidden but need to be displayed
        # is_hidden_param = query_params.get("is_hidden", [])
        # is_hidden = False if not is_hidden_param or is_hidden_param[0] == "false" else True
        # product_filters = {"is_hidden": is_hidden}

        if product_ids:
            product_filters["pk__in"] = product_ids

        # uncomment to only show products amy requested
        else:
            product_filters["pk__in"] = [11, 9, 20, 21, 15, 22, 23, 24, 25, 27, 28]

        time_range = (
            [
                datetime.datetime.strptime(start_time[0][0:10], "%Y-%m-%d"),
                (
                    datetime.datetime.strptime(end_time[0][0:10], "%Y-%m-%d")
                    + relativedelta(days=1)
                    - relativedelta(minutes=1)
                ),
            ]
            if start_time and end_time else None
        )

        products = Product.objects.filter(**product_filters).order_by("-product_type", "name")

        return Response(
            data=service.get_product_revenue_data(
                products=products, time_range=time_range, sku_categories=sku_categories
            ),
            status=status.HTTP_200_OK,
        )
