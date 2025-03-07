from django.test import TestCase
from django.urls import reverse
from db_shopify.tests.fixtures_shopify_webhook import shopify_order_created_webhook
from db_shopify.services.services import ShopifyService
from users.tests.factories import UserFactory
from users.models import User
from django.forms.models import model_to_dict
from orders.models import Order
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from db_analytics.services import KlaviyoService
from orders.services.supply_chain_services import SupplyChainService
from unittest.mock import patch
import json
import copy

class ShopifyServiceTestCase(TestCase):
    fixtures = ["products.json", "set_products.json"]

    @classmethod
    def setUpTestData(cls):
        cls.shopify_order_created_webhook_url = reverse("db_shopify:order-created-webhook-handler")

    def setUp(self):
        self.webhook_data = copy.deepcopy(shopify_order_created_webhook)
        self.expected_shipping_details = self._create_expected_shipping_details(
            shipping_details_key="shipping_address",
        )
        self.existing_shopify_customer = UserFactory(
            shopify_user_id=self.webhook_data.get("customer").get("id"),
            first_name=self.webhook_data.get("customer").get("first_name"),
            last_name=self.webhook_data.get("customer").get("last_name"),
        )

    def _create_expected_shipping_details(self, shipping_details_key: str) -> dict:
        shipping_details_data = ShopifyService._prepare_shipping_details_data(
            shipping_details_data=self.webhook_data.get(shipping_details_key),
        )
        return {
            "first_name": shipping_details_data.get("first_name"),
            "last_name": shipping_details_data.get("last_name"),
            "address_line1": shipping_details_data.get("address1"),
            "address_line2": shipping_details_data.get("address2"),
            "city": shipping_details_data.get("city"),
            "state": shipping_details_data.get("province_code"),
            "postal_code": shipping_details_data.get("zip"),
            "phone": shipping_details_data.get("phone"),
        }

    def _create_expected_total_amount(self) -> int:
        line_items = self.webhook_data.get("line_items")
        subtotal = sum([ShopifyService._convert_to_positive_integer(line_item.get("price")) for line_item in line_items])
        webhook_data_shipping_fee = self.webhook_data.get("total_shipping_price_set").get("shop_money").get("amount")
        webhook_data_shipping_fee = ShopifyService._convert_to_positive_integer(webhook_data_shipping_fee)
        webhook_data_tax = self.webhook_data.get("total_tax")
        webhook_data_tax = ShopifyService._convert_to_positive_integer(webhook_data_tax)
        webhook_data_discount = self.webhook_data.get("total_discounts")
        webhook_data_discount = ShopifyService._convert_to_positive_integer(webhook_data_discount)
        return (
            subtotal
            + webhook_data_shipping_fee 
            + webhook_data_tax
            - webhook_data_discount
        )

    def test_create_shipping_details_valid_shipping_address(self):
        shipping_details = ShopifyService._create_shipping_details(
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )
        response_shipping_details = model_to_dict(
            shipping_details, 
            fields=[key for key in self.expected_shipping_details.keys()],
        )
        self.assertEqual(self.expected_shipping_details, response_shipping_details)

    def test_shipping_address_invalid_phone(self):
        self.webhook_data["shipping_address"]["phone"] = "1234567890"
        self.assertRaises(
            ValidationError, 
            ShopifyService._create_shipping_details,
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )

    def test_shipping_address_invalid_postal_code(self):
        self.webhook_data["shipping_address"]["zip"] = "1234"
        self.assertRaises(
            ValidationError, 
            ShopifyService._create_shipping_details,
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )

    def test_shipping_address_invalid_state(self):
        self.webhook_data["shipping_address"]["province_code"] = "Invalid"
        self.assertRaises(
            ValidationError, 
            ShopifyService._create_shipping_details,
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )

    def test_shipping_address_invalid_country(self):
        self.webhook_data["shipping_address"]["country_code"] = "Invalid"
        self.assertRaises(
            ValidationError, 
            ShopifyService._create_shipping_details,
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )

    def test_shipping_address_no_address_line_1(self):
        self.webhook_data["shipping_address"]["address1"] = None
        self.assertRaises(
            ValidationError, 
            ShopifyService._create_shipping_details,
            shipping_details_data=self.webhook_data.get("shipping_address"),
        )

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_existing_user_existing_shipping_details_no_change(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        expected_shipping_details_id = self.existing_shopify_customer.shipping_details.pk
        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.existing_shopify_customer.refresh_from_db()
        self.assertEqual(expected_shipping_details_id, self.existing_shopify_customer.shipping_details.pk)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_mocks_get_called(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertTrue(klaviyo_identify_mock.called)
        self.assertTrue(klaviyo_track_order_mock.called)
        self.assertTrue(supply_chain_service_mock.called)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_existing_shopify_user_id_same_shipping_and_billing_address(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.existing_shopify_customer.shipping_details = None
        self.existing_shopify_customer.save()

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.existing_shopify_customer.refresh_from_db()
        order_shipping_details = model_to_dict(
            order.shipping_details, 
            fields=[key for key in self.expected_shipping_details.keys()],
        )
        self.assertEqual(self.existing_shopify_customer.pk, order.customer.pk)
        self.assertEqual(order_shipping_details, self.expected_shipping_details)
        self.assertEqual(order.shipping_details.id, order.customer.shipping_details.id)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_existing_shopify_user_id_different_billing_and_shipping_address(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.existing_shopify_customer.shipping_details = None
        self.existing_shopify_customer.save()

        self.webhook_data["shipping_address"]["first_name"] = "Shipping"
        self.webhook_data["shipping_address"]["last_name"] = "Name"
        self.webhook_data["shipping_address"]["name"] = "Shipping Name"
        expected_order_shipping_details = self._create_expected_shipping_details(
            shipping_details_key="shipping_address",
        )
        expected_customer_shipping_details = self._create_expected_shipping_details(
            shipping_details_key="billing_address",
        )

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )  
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        order_shipping_details = model_to_dict(
            order.shipping_details,
            fields=[key for key in expected_order_shipping_details.keys()],
        )
        customer_shipping_details = model_to_dict(
            order.customer.shipping_details,
            fields=[key for key in expected_customer_shipping_details.keys()],
        )
        self.assertEqual(self.existing_shopify_customer.pk, order.customer.pk)
        self.assertEqual(order_shipping_details, expected_order_shipping_details)
        self.assertEqual(customer_shipping_details, expected_customer_shipping_details)
        self.assertNotEqual(order.shipping_details.id, order.customer.shipping_details.id)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_new_customer_same_shipping_and_billing_address(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.existing_shopify_customer.shopify_user_id = None
        self.existing_shopify_customer.save()

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )  
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        try:
            customer = User.objects.get(shopify_user_id=self.webhook_data.get("customer").get("id"))
        except User.DoesNotExist:
            self.fail("Customer not created")
        order_shipping_details = model_to_dict(
            order.shipping_details, 
            fields=[key for key in self.expected_shipping_details.keys()],
        )
        self.assertFalse(customer.has_usable_password())
        self.assertEqual(order_shipping_details, self.expected_shipping_details)
        self.assertEqual(order.shipping_details.id, order.customer.shipping_details.id)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_new_customer_different_billing_and_shipping_address(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.existing_shopify_customer.shopify_user_id = None
        self.existing_shopify_customer.save()

        self.webhook_data["shipping_address"]["name"] = "Shipping Name"
        expected_order_shipping_details = self._create_expected_shipping_details(
            shipping_details_key="shipping_address",
        )
        expected_customer_shipping_details = self._create_expected_shipping_details(
            shipping_details_key="billing_address",
        )

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )  
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        try:
            customer = User.objects.get(shopify_user_id=self.webhook_data.get("customer").get("id"))
        except User.DoesNotExist:
            self.fail("Customer not created")
        order_shipping_details = model_to_dict(
            order.shipping_details, 
            fields=[key for key in expected_order_shipping_details.keys()],
        )
        customer_shipping_details = model_to_dict(
            customer.shipping_details,
            fields=[key for key in expected_customer_shipping_details.keys()],
        )
        self.assertFalse(customer.has_usable_password())
        self.assertEqual(order_shipping_details, expected_order_shipping_details)
        self.assertEqual(customer_shipping_details, expected_customer_shipping_details)
        self.assertNotEqual(order.shipping_details.id, order.customer.shipping_details.id)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_existing_customer_email_same_shipping_and_billing_address(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.existing_shopify_customer.email = self.webhook_data.get("customer").get("email")
        self.existing_shopify_customer.shipping_details = None
        self.existing_shopify_customer.save()

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.existing_shopify_customer.refresh_from_db()
        order_shipping_details = model_to_dict(
            order.shipping_details, 
            fields=[key for key in self.expected_shipping_details.keys()],
        )
        self.assertEqual(self.existing_shopify_customer.pk, order.customer.pk)
        self.assertEqual(order_shipping_details, self.expected_shipping_details)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_one_time_purchase_valid_total_amount_shipping_fee(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.webhook_data["total_shipping_price_set"]["shop_money"]["amount"] = "2.50"

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )  
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        webhook_data_shipping_fee = self.webhook_data.get("total_shipping_price_set").get("shop_money").get("amount")
        webhook_data_shipping_fee = ShopifyService._convert_to_positive_integer(webhook_data_shipping_fee)
        expected_total_amount = self._create_expected_total_amount()
        self.assertEqual(webhook_data_shipping_fee, order.shipping_fee)
        self.assertEqual(expected_total_amount, order.total_amount)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_one_time_purchase_valid_total_amount_tax(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.webhook_data["total_tax"] = "2.50"

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )  
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        webhook_data_tax = self.webhook_data.get("total_tax")
        webhook_data_tax = ShopifyService._convert_to_positive_integer(webhook_data_tax)
        expected_total_amount = self._create_expected_total_amount()
        self.assertEqual(webhook_data_tax, order.tax)
        self.assertEqual(expected_total_amount, order.total_amount)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_one_time_purchase_valid_total_amount_discount(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.webhook_data["total_discounts"] = "2.50"

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        webhook_data_discount = self.webhook_data.get("total_discounts")
        webhook_data_discount = ShopifyService._convert_to_positive_integer(webhook_data_discount)
        expected_total_amount = self._create_expected_total_amount()
        self.assertEqual(webhook_data_discount, order.discount)
        self.assertEqual(expected_total_amount, order.total_amount)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_update_purchased_and_payment_captured_datetimes(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        processed_at_datetime = timezone.now().isoformat()
        self.webhook_data["processed_at"] = processed_at_datetime

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertEqual(order.purchased_datetime.isoformat(), processed_at_datetime)
        self.assertEqual(order.payment_captured_datetime.isoformat(), processed_at_datetime)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_single_discount_code(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        discount_code = "TEST_RX_10_OFF"
        self.webhook_data["discount_codes"] = [
            {
                "code": discount_code,
            },
        ]

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertEqual(order.discount_code, discount_code)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_multiple_discount_codes(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        discount_code_1 = "TEST_RX_10_OFF"
        discount_code_2 = "TEST_OTC_10_PERCENT"
        self.webhook_data["discount_codes"] = [
            {
                "code": discount_code_1,
            },
            {
                "code": discount_code_2,
            },
        ]
        expected_discount_code = f"{discount_code_1},{discount_code_2}"

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertEqual(order.discount_code, expected_discount_code)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_sms_marketing_consent_subscribed(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock,
        supply_chain_service_mock,
        verify_webhook_mock,
        ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.webhook_data["customer"]["sms_marketing_consent"] = {
            "state": "subscribed",
        }

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertTrue(order.customer.opt_in_sms_app_notifications)

    @patch.object(ShopifyService, "verify_webhook")
    @patch.object(SupplyChainService, "submit_order_smart_warehouse")
    @patch.object(KlaviyoService, "identify")
    @patch.object(KlaviyoService, "track_placed_non_recurring_order_event")
    def test_order_created_sms_marketing_consent_not_subscribed(
        self, 
        klaviyo_track_order_mock, 
        klaviyo_identify_mock, 
        supply_chain_service_mock,
        verify_webhook_mock,
    ):
        klaviyo_track_order_mock.return_value = None
        klaviyo_identify_mock.return_value = None
        supply_chain_service_mock.return_value = None
        verify_webhook_mock.return_value = True

        self.webhook_data["customer"]["sms_marketing_consent"] = {
            "state": "not_subscribed",
        }

        response = self.client.post(
            path=self.shopify_order_created_webhook_url,
            data=json.dumps(self.webhook_data),
            content_type="application/json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        try:
            order = Order.objects.get(shopify_order_id=self.webhook_data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not created")
        self.assertFalse(order.customer.opt_in_sms_app_notifications)
