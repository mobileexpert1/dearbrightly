from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from orders.tests.factories import OrderFactory, ProductFactory
from users.tests.factories import UserFactory, ShippingDetailsFactory
from unittest.mock import patch
from factory.faker import faker
from django.db.models import signals
from db_analytics.services import FacebookConversionServices
import factory

class OrderShippingDetailsTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.unused_phone_number = faker.Faker().numerify("812#######")
        cls.url = reverse("orders:orders-update-pending-or-create")
        cls.product = ProductFactory()
        cls.shipping_details_data = {
            "first_name": "Dearbrightly",
            "last_name": "User",
            "address_line1": "Shipping adress",
            "address_line2": "Shipping_address",
            "city": "San Francisco",
            "state": "CA",
            "postal_code": "94110",
            "country": "US"
        }

    def setUp(self):
        self.existing_shipping_details = ShippingDetailsFactory(**self.shipping_details_data)
        self.existing_user = UserFactory(
            shipping_details=self.existing_shipping_details
        )
        self.shipping_details = ShippingDetailsFactory(**self.shipping_details_data)
        self.user = UserFactory(
            shipping_details=self.shipping_details
        )
        self.order = OrderFactory(
            customer=self.user,
            shipping_details=self.shipping_details,
        )
        self.order_data = {
            "customer": {"id": self.user.uuid},
            "order_products":[{"id": self.product.uuid, "quantity": 2, "frequency": 1}]
        }

    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_phone_number_not_changed(self, facebook_conversion_mock):
        facebook_conversion_mock.return_value = None
        self.client.force_authenticate(user=self.user)
        self.order_data["shipping_details"] = {"phone": self.user.shipping_details.phone}
        response = self.client.post(
            path=self.url, 
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["shipping_details"]["phone"], self.user.shipping_details.phone)
    
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_unused_phone_number(self, facebook_conversion_mock):
        facebook_conversion_mock.return_value = None
        self.client.force_authenticate(user=self.user)
        self.order_data["shipping_details"] = {"phone": self.unused_phone_number}
        response = self.client.post(
            path=self.url, 
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["shipping_details"]["phone"], self.unused_phone_number)

    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_existing_phone_number_user(self, facebook_conversion_mock):
        facebook_conversion_mock.return_value = None
        self.client.force_authenticate(user=self.user)
        self.order_data["shipping_details"] = {"phone": self.existing_user.shipping_details.phone}
        response = self.client.post(
            path=self.url, 
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["detail"]), "An Account with this phone number already exists.")

    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_new_user_existing_phone_number(self, facebook_conversion_mock):
        facebook_conversion_mock.return_value = None
        self.client.force_authenticate(user=self.user)
        self.user.shipping_details.phone = None
        self.user.shipping_details.save()
        self.order_data["shipping_details"] = {"phone": self.existing_user.shipping_details.phone}
        response = self.client.post(
            path=self.url, 
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["detail"]), "An Account with this phone number already exists.")

    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_new_user_unused_phone_number(self, facebook_conversion_mock):
        facebook_conversion_mock.return_value = None
        self.client.force_authenticate(user=self.user)
        self.user.shipping_details.phone = None
        self.user.shipping_details.save()
        self.order_data["shipping_details"] = {"phone": self.unused_phone_number}
        response = self.client.post(
            path=self.url, 
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["shipping_details"]["phone"], self.unused_phone_number)
