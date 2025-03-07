from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from orders.tests.factories import OrderFactory, OrderProductFactory, ProductFactory
from users.tests.factories import UserFactory


class OrderViewSetTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.list_url = reverse('orders:orders-list')
        cls.login_url = reverse('auth:auth-login')

        cls.password = 'DearbrightlyGo1'

        cls.product = ProductFactory()
        cls.order_product = OrderProductFactory()

    @override_settings(SAPPIRA_DISABLED=True)
    def setUp(self):
        self.user_1 = UserFactory(password=self.password)
        self.user_2 = UserFactory(password=self.password)
        self.admin = UserFactory(is_superuser=True, password=self.password)

        self.client.post(path=self.login_url, data={'email': self.user_1.email, 'password': self.password})

        self.order_1 = OrderFactory.create(customer=self.user_1, products=(self.order_product,))
        self.order_2 = OrderFactory.create(customer=self.user_2, products=(self.order_product,))
        self.order_3 = OrderFactory.create(customer=self.user_2, products=(self.order_product,))

        self.order_data = {
            'customer': {'id':self.user_1.uuid},
            'order_products':[{'id': self.product.uuid, 'quantity': 2, 'frequency': 1}]
        }

        self.detail_url = reverse('orders:orders-detail', args=(self.order_1.uuid,))

    def test_create_order_success(self):
        response = self.client.post(path=self.list_url, data=self.order_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_list_of_own_orders(self):
        response = self.client.get(path=self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_list_of_orders_as_admin(self):
        self.client.post(path=self.login_url, data={'email': self.admin.email, 'password': self.password})
        response = self.client.get(path=self.list_url)

        self.assertEqual(len(response.data), 3)

    def test_partial_update_order(self):
        response = self.client.patch(path=self.detail_url, data={'notes': 'Lorem ipsum.'}, format='json')
        self.order_1.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.order_1.notes, 'Lorem ipsum.')


class OrderStatusChoicesViewTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.list_url = reverse('orders:status')

    def test_get_status_choices(self):
        response = self.client.get(path=self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
