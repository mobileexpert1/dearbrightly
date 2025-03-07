from unittest.mock import patch

from django.conf import settings
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APITestCase

from emr_new.tests.utils import MockCurexaResponse
from orders.models import Order, OrderItem, OrderProduct
from orders.tests.factories import OrderFactory, OrderProductFactory, ProductFactory
from subscriptions.tests.factories import SubscriptionFactory
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


class PatchSelectedSubscriptionOrdersAndPushToCurexaTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.patch_selected_subscription_orders_and_push_to_curexa_url = reverse(
            "subscriptions:subscriptions-patch-selected-subscription-orders-and-push-to-curexa"
        )
        cls.user = UserFactory(payment_processor_customer_id="12345")
        cls.user_2 = UserFactory(payment_processor_customer_id="67890")

    def setUp(self):
        self.product_ = ProductFactory()
        self.product = ProductFactory(
            name="Night Shift",
            product_category="retinoid",
            refill_product=self.product_,
            trial_product=self.product_,
        )
        self.subscription = SubscriptionFactory(
            customer=self.user, product=self.product
        )
        self.subscription_2 = SubscriptionFactory(
            customer=self.user, product=self.product
        )
        self.subscription_3 = SubscriptionFactory(
            customer=self.user_2, product=self.product
        )
        self.timezone_now = timezone.now()
        self.custom_payment_processor_charge_id = "in_00000000000001"
        self.custom_payment_captured_datetime = self.timezone_now
        self.custom_purchased_datetime = self.timezone_now

    def test_without_api_key(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_with_given_all_invalid_subscription_ids(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [12345, 67890],
                "user_id": self.user.id,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("subscription_ids")[0],
            "Some of the given subscription ids are wrong.",
        )

    def test_with_given_one_invalid_and_one_valid_subscription_ids(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [12345, self.subscription.id],
                "user_id": self.user.id,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("subscription_ids")[0],
            "Some of the given subscription ids are wrong.",
        )

    def test_with_given_only_one_invalid_subscription_id(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [12345],
                "user_id": self.user.id,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("subscription_ids")[0],
            "Some of the given subscription ids are wrong.",
        )

    def test_with_given_invalid_user_id(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [self.subscription.id],
                "user_id": 12345,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("user_id")[0], "User with given id does not exist."
        )

    def test_subscriptions_dont_match_with_user(self):
        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [
                    self.subscription.id,
                    self.subscription_2.id,
                    self.subscription_3.id,
                ],
                "user_id": self.user.id,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("non_field_errors")[0],
            "Subscriptions don't match with given user.",
        )

    @patch("db_analytics.services.KlaviyoService.track_placed_order_event")
    @patch("payment.services.tax_jar_services.TaxJarService.update_order_with_tax")
    @patch("emr.services.CurexaService._curexa_post_request")
    @patch("django.utils.timezone.now")
    @patch(
        "payment_new.services.stripe_service.StripeService.get_charge_id_from_payment_intent"
    )
    @patch("stripe.PaymentIntent.create")
    def test_patch_selected_subscription_orders_with_capture_payment_and_push_to_curexa(
        self,
        mock_payment_intent_create,
        mock_get_charge_id_from_payment_intent,
        mock_timezone_now,
        mock_curexa_post_request,
        mock_update_order_with_tax,
        mock_track_placed_order_event,
    ):
        mock_payment_intent_create.return_value = {}
        mock_get_charge_id_from_payment_intent.return_value = (
            self.custom_payment_processor_charge_id
        )
        mock_timezone_now.return_value = self.timezone_now
        mock_curexa_post_request.return_value = MockCurexaResponse()
        mock_update_order_with_tax.return_value = None
        mock_track_placed_order_event.return_value = None

        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [self.subscription.id],
                "user_id": self.user.id,
                "capture_payment": True,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), 1)
        upcoming_order = Order.objects.first()
        self.assertEqual(OrderProduct.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertTrue(upcoming_order.autogenerated)
        self.assertEqual(
            upcoming_order.payment_processor_charge_id,
            self.custom_payment_processor_charge_id,
        )
        self.assertEqual(
            upcoming_order.payment_captured_datetime,
            self.custom_payment_captured_datetime,
        )
        self.assertEqual(
            upcoming_order.purchased_datetime, self.custom_purchased_datetime
        )
        self.assertEqual(int(upcoming_order.status), Order.Status.pending_questionnaire)

    @patch("db_analytics.services.KlaviyoService.track_placed_order_event")
    @patch("payment.services.tax_jar_services.TaxJarService.update_order_with_tax")
    @patch("emr_new.services.curexa_service.CurexaService.create_curexa_order")
    @patch("django.utils.timezone.now")
    def test_patch_selected_subscription_orders_without_capture_payment_and_with_push_to_curexa(
        self,
        mock_timezone_now,
        mock_create_curexa_order,
        mock_update_order_with_tax,
        mock_track_placed_order_event,
    ):
        mock_timezone_now.return_value = self.timezone_now
        mock_create_curexa_order.return_value = Response(
            data="An order was created successfully.", status=status.HTTP_200_OK
        )
        mock_update_order_with_tax.return_value = None
        mock_track_placed_order_event.return_value = None

        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [self.subscription.id],
                "user_id": self.user.id,
                "capture_payment": False,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), 1)
        upcoming_order = Order.objects.first()
        self.assertEqual(OrderProduct.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertTrue(upcoming_order.autogenerated)
        self.assertEqual(int(upcoming_order.status), Order.Status.pending_pharmacy)

    @patch("db_analytics.services.KlaviyoService.track_placed_order_event")
    @patch("payment.services.tax_jar_services.TaxJarService.update_order_with_tax")
    @patch("emr_new.services.curexa_service.CurexaService.create_curexa_order")
    @patch("django.utils.timezone.now")
    def test_patch_selected_subscription_orders_without_capture_payment_and_with_push_to_curexa_and_with_two_subscription_ids(
        self,
        mock_timezone_now,
        mock_create_curexa_order,
        mock_update_order_with_tax,
        mock_track_placed_order_event,
    ):
        mock_timezone_now.return_value = self.timezone_now
        mock_create_curexa_order.return_value = Response(
            data="An order was created successfully.", status=status.HTTP_200_OK
        )
        mock_update_order_with_tax.return_value = None
        mock_track_placed_order_event.return_value = None

        response = self.client.post(
            path=self.patch_selected_subscription_orders_and_push_to_curexa_url,
            data={
                "subscription_ids": [self.subscription.id, self.subscription_2.id],
                "user_id": self.user.id,
                "capture_payment": False,
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), 1)
        upcoming_order = Order.objects.first()
        self.assertEqual(OrderProduct.objects.count(), 2)
        self.assertEqual(OrderItem.objects.count(), 2)
        self.assertTrue(upcoming_order.autogenerated)
        self.assertEqual(int(upcoming_order.status), Order.Status.pending_pharmacy)
