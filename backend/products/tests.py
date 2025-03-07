from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Order
from orders.tests.factories import OrderFactory, OrderItemFactory, OrderProductFactory
from products_new.factories import ProductFactory


class RetoolDashboardsViewSetTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.get_revenue_data_url = reverse(
            "products:retool-dashboards-get-revenue-data"
        )
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.product_1 = ProductFactory(
            price=1000, product_category="retinoid", sku="SKU-1"
        )
        cls.product_2 = ProductFactory(
            price=2000, product_category="moisturizer", sku="SKU-2"
        )
        cls.order_1 = OrderFactory(
            status=Order.Status.shipped, payment_captured_datetime="2022-01-01"
        )
        cls.order_2 = OrderFactory(
            status=Order.Status.shipped, payment_captured_datetime="2022-01-01"
        )
        cls.order_product_1 = OrderProductFactory(
            order=cls.order_1, product=cls.product_1
        )
        cls.order_product_2 = OrderProductFactory(
            order=cls.order_2, product=cls.product_2
        )
        cls.order_item_1 = OrderItemFactory(
            order=cls.order_1, product=cls.product_1, order_product=cls.order_product_1
        )
        cls.order_item_2 = OrderItemFactory(
            order=cls.order_2, product=cls.product_2, order_product=cls.order_product_2
        )
        cls.start_date = "2022-01-01"
        cls.end_date = "2022-01-02"
        cls.order_1.save()
        cls.order_2.save()

    def test_get_revenue_data_filled_products_and_product_category_validation_error(
        self,
    ):
        response = self.client.get(
            path=self.get_revenue_data_url,
            data={
                "products": [self.product_1.id, self.product_2.id],
                "product_category": [
                    self.product_1.product_category,
                    self.product_2.product_category,
                ],
                "start_date": self.start_date,
                "end_date": self.end_date,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0], "You can't use both products and product_category."
        )

    def test_get_revenue_data_empty_products_and_product_category(
        self,
    ):
        response = self.client.get(
            path=self.get_revenue_data_url, **{"HTTP_API_KEY": self.api_key}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            [
                {
                    "productName": f"{self.product_1.name} - {self.product_1.quantity} oz - ${self.product_1.price / 100}",
                    "sku": self.product_1.sku,
                    "quantity": 1,
                    "grossSales": self.order_1.subtotal / 100,
                    "discounts": self.order_1.discount / 100,
                    "returns": self.order_1.refund_amount / 100,
                    "netSales": (self.order_1.subtotal / 100)
                    - (self.order_1.discount / 100)
                    - (self.order_1.refund_amount / 100),
                    "taxes": self.order_1.tax / 100,
                    "shipping": self.order_1.shipping_fee / 100,
                    "totalSales": self.order_1.total_amount / 100,
                },
                {
                    "productName": f"{self.product_2.name} - {self.product_2.quantity} oz - ${self.product_2.price / 100}",
                    "sku": self.product_2.sku,
                    "quantity": 1,
                    "grossSales": self.order_2.subtotal / 100,
                    "discounts": self.order_2.discount / 100,
                    "returns": self.order_2.refund_amount / 100,
                    "netSales": (self.order_2.subtotal / 100)
                    - (self.order_2.discount / 100)
                    - (self.order_2.refund_amount / 100),
                    "taxes": self.order_2.tax / 100,
                    "shipping": self.order_2.shipping_fee / 100,
                    "totalSales": self.order_2.total_amount / 100,
                },
            ],
        )

    def test_get_revenue_data_for_products(self):
        response = self.client.get(
            path=self.get_revenue_data_url,
            data={
                "products": [self.product_1.id, self.product_2.id],
                "start_date": self.start_date,
                "end_date": self.end_date,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            [
                {
                    "productName": f"{self.product_1.name} - {self.product_1.quantity} oz - ${self.product_1.price / 100}",
                    "sku": self.product_1.sku,
                    "quantity": 1,
                    "grossSales": self.order_1.subtotal / 100,
                    "discounts": self.order_1.discount / 100,
                    "returns": self.order_1.refund_amount / 100,
                    "netSales": (self.order_1.subtotal / 100)
                    - (self.order_1.discount / 100)
                    - (self.order_1.refund_amount / 100),
                    "taxes": self.order_1.tax / 100,
                    "shipping": self.order_1.shipping_fee / 100,
                    "totalSales": self.order_1.total_amount / 100,
                },
                {
                    "productName": f"{self.product_2.name} - {self.product_2.quantity} oz - ${self.product_2.price / 100}",
                    "sku": self.product_2.sku,
                    "quantity": 1,
                    "grossSales": self.order_2.subtotal / 100,
                    "discounts": self.order_2.discount / 100,
                    "returns": self.order_2.refund_amount / 100,
                    "netSales": (self.order_2.subtotal / 100)
                    - (self.order_2.discount / 100)
                    - (self.order_2.refund_amount / 100),
                    "taxes": self.order_2.tax / 100,
                    "shipping": self.order_2.shipping_fee / 100,
                    "totalSales": self.order_2.total_amount / 100,
                },
            ],
        )

    def test_get_revenue_data_for_product_category(self):
        response = self.client.get(
            path=self.get_revenue_data_url,
            data={
                "product_category": [
                    self.product_1.product_category,
                    self.product_2.product_category,
                ],
                "start_date": self.start_date,
                "end_date": self.end_date,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            [
                {
                    "productCategory": f"{self.product_1.product_category}",
                    "quantity": 1,
                    "grossSales": self.order_1.subtotal / 100,
                    "discounts": self.order_1.discount / 100,
                    "returns": self.order_1.refund_amount / 100,
                    "netSales": (self.order_1.subtotal / 100)
                    - (self.order_1.discount / 100)
                    - (self.order_1.refund_amount / 100),
                    "taxes": self.order_1.tax / 100,
                    "shipping": self.order_1.shipping_fee / 100,
                    "totalSales": self.order_1.total_amount / 100,
                },
                {
                    "productCategory": f"{self.product_2.product_category}",
                    "quantity": 1,
                    "grossSales": self.order_2.subtotal / 100,
                    "discounts": self.order_2.discount / 100,
                    "returns": self.order_2.refund_amount / 100,
                    "netSales": (self.order_2.subtotal / 100)
                    - (self.order_2.discount / 100)
                    - (self.order_2.refund_amount / 100),
                    "taxes": self.order_2.tax / 100,
                    "shipping": self.order_2.shipping_fee / 100,
                    "totalSales": self.order_2.total_amount / 100,
                },
            ],
        )
