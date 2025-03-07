from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Product
from products_new.factories import ProductFactory


class TestProductViewSet(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.visible_product = ProductFactory(is_hidden=False)
        cls.hidden_product = ProductFactory(is_hidden=True)
        cls.products_list_url = reverse("products_new:products-list")
        cls.visible_product_url = reverse(
            "products_new:products-detail", kwargs={"uuid": cls.visible_product.uuid}
        )
        cls.hidden_product_url = reverse(
            "products_new:products-detail", kwargs={"uuid": cls.hidden_product.uuid}
        )

    def test_get_all_products(self):
        response = self.client.get(self.products_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data), Product.objects.filter(is_hidden=False).count()
        )

    def test_get_single_visible_product(self):
        response = self.client.get(self.visible_product_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_hidden_product(self):
        response = self.client.get(self.hidden_product_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
