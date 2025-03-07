from django.core import mail
from django.conf import settings
from factory.django import DjangoModelFactory
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import APIException
from subscriptions.services import SubscriptionsService
from subscriptions.models import Subscription
from django.utils import timezone
from datetime import timedelta
from utils.logger_utils import logger
from dateutil.relativedelta import relativedelta
from orders.models import Order
from subscriptions.tests.factories import (
    SubscriptionFactory,
    ProductFactory,
)
from products.models import Product

class TestHandleUpcomingSubscriptionOrders(APITestCase):
    fixtures = [
        "customers.json",
        "shipping_details.json",
        "groups.json",
        "medical_provider_user.json",
        "emr_pharmacies.json",
        "emr_prescriptions.json",
        "products.json",
        "set_products.json",
        "emr_question_ids.json",
        "emr_questionnaire_answers.json",
        "emr_visits.json",
        "emr_patient_prescriptions.json",
        "orders.json",
        "order_products.json",
        "order_items.json",
        "subscriptions.json",
        "emr_snippets.json",
        "emr_questionnaire_initial_20200102.json",
        "emr_questionnaire_initial_20200418.json",
        "emr_questionnaire_initial_20200904.json",
        "emr_questionnaire_returning_20200102.json",
        "emr_questionnaire_returning_female_20200308.json",
        "emr_questionnaire_returning_male_20200327.json",
        "emr_questionnaires_sappira_legacy.json",
    ]

    @classmethod
    def setUpTestData(cls):
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.handle_upcoming_subscription_orders_url = reverse(
            "subscriptions:subscriptions-handle-upcoming-subscription-orders",
        )
        cls.today = timezone.now()

    def setUp(self) -> None:
        self.subscription = Subscription.objects.all().first()

        self.subscription_no_order = SubscriptionFactory()
        self.subscription_no_order.current_period_start_datetime = self.today - timedelta(days=90)
        self.subscription_no_order.upcoming_order_email_sent_datetime = self.today - timedelta(days=7)
        self.subscription_no_order.open_invoice_id = None
        self.subscription_no_order.product = Product.objects.get(sku="RX-RET-0001-25")
        self.subscription_no_order.save()

    def test_send_upcoming_order_mail_without_authentication(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=7)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_upcoming_order_mail_8_days_before_ship_date(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=8)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 0)

    def test_send_upcoming_order_mail_7_days_before_ship_date(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=7)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 1)

    def test_send_upcoming_order_mail_6_days_before_ship_date(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=6)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 1)

    def test_send_upcoming_order_mail_5_days_before_ship_date(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=5)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 1)

    def test_send_upcoming_order_mail_4_days_before_ship_date(self):
        self.subscription.current_period_start_datetime = self.today
        self.subscription.current_period_end_datetime = self.today + timedelta(days=4)
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 0)

    def test_send_upcoming_order_mail_email_multiple_subscriptions(self):
        self.subscription.current_period_end_datetime = self.today + timedelta(days=7)
        self.subscription.save()

        other_subscription = SubscriptionFactory()
        other_subscription.customer=self.subscription.customer
        other_subscription.current_period_end_datetime=self.today + timedelta(days=7)
        other_subscription.save()

        subscriptions = self.subscription.customer.subscriptions.filter(current_period_end_datetime=self.subscription.current_period_end_datetime)
        logger.debug(f"[test_send_upcoming_order_mail_email_multiple_subscriptions] subscriptions: {subscriptions}.")

        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()
        other_subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(self.subscription.upcoming_order_email_sent_datetime, other_subscription.upcoming_order_email_sent_datetime)
        self.assertEqual(len(mail.outbox), 1)

    def test_invoice_today_is_the_day_of_ship_date(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.open_invoice_id)
        self.assertTrue(self.subscription.get_open_order())
        self.assertEqual(
            self.subscription.get_open_order().payment_processor_charge_id,
            self.subscription.open_invoice_id,
        )

    def test_invoice_today_is_1_day_after_ship_date(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today - timedelta(days=1)
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.open_invoice_id)
        self.assertTrue(self.subscription.get_open_order())
        self.assertEqual(
            self.subscription.get_open_order().payment_processor_charge_id,
            self.subscription.open_invoice_id,
        )

    def test_invoice_today_is_2_day_after_ship_date(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today - timedelta(days=2)
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.open_invoice_id)
        self.assertTrue(self.subscription.get_open_order())
        self.assertEqual(
            self.subscription.get_open_order().payment_processor_charge_id,
            self.subscription.open_invoice_id,
        )

    def test_invoice_today_is_3_day_after_ship_date(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today - timedelta(days=3)
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.subscription.open_invoice_id)
        self.assertTrue(self.subscription.get_open_order())
        self.assertEqual(
            self.subscription.get_open_order().payment_processor_charge_id,
            self.subscription.open_invoice_id,
        )

    def test_invoice_today_is_4_day_after_ship_date(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today - timedelta(days=4)
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(self.subscription.open_invoice_id)

    def test_invoice_without_upcoming_order_email(self):
        self.subscription_no_order.current_period_end_datetime = self.today
        self.subscription_no_order.upcoming_order_email_sent_datetime = None
        self.subscription_no_order.save()

        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription_no_order.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(
            mail.outbox[0].subject,
            "!!!! Error Notification: UPCOMING ORDER EMAIL NOT SENT !!!!",
        )

    def test_invoice_with_an_invoice_already_created(self):
        current_subscription_invoice_id = self.subscription.open_invoice_id
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.subscription.open_invoice_id, current_subscription_invoice_id
        )

    def test_invoice_with_a_subscription_order_that_was_paid_recently(self):
        self.subscription.current_period_start_datetime = self.today - timedelta(
            days=10
        )
        self.subscription.current_period_end_datetime = self.today
        self.subscription.upcoming_order_email_sent_datetime = self.today - timedelta(
            days=7
        )
        self.subscription.open_invoice_id = None
        latest_paid_subscription_order = self.subscription.get_latest_plan_order()
        latest_paid_subscription_order.payment_captured_datetime = (
            self.subscription.current_period_end_datetime - timedelta(days=10)
        )
        latest_paid_subscription_order.save()
        self.subscription.save()
        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(
            mail.outbox[0].subject, "!!!! Error Notification: DUPLICATE CHARGE !!!!"
        )

    def test_invoice_without_upcoming_order_but_will_be_created(
        self
    ):
        self.subscription_no_order.current_period_end_datetime = self.today
        self.subscription_no_order.save()

        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )
        self.subscription_no_order.refresh_from_db()

        orders_created = Order.objects.filter(customer=self.subscription_no_order.customer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(orders_created), 1)

    @patch("orders.services.services.OrderService.create_upcoming_subscription_order")
    def test_invoice_without_upcoming_order_creating_will_raise_error(
        self, mock_create_upcoming_subscription_order
    ):
        self.subscription_no_order.current_period_end_datetime = self.today
        self.subscription_no_order.save()

        mock_create_upcoming_subscription_order.side_effect = APIException(
            detail="Mocked error"
        )
        number_of_orders = Order.objects.count()

        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(Order.objects.count(), number_of_orders)
        self.assertEqual(
            mail.outbox[0].subject,
            "!!!! Error Notification: UNABLE TO CREATE UPCOMING ORDER !!!!",
        )

    # one order and invoice should be created
    @patch("db_analytics.services.KlaviyoService.track_placed_order_event")
    @patch("subscriptions.services.SubscriptionsService.invoice_order")
    @patch("payment.services.tax_jar_services.TaxJarService.update_order_with_tax")
    def test_invoice_with_multiple_subscriptions(
        self, mock_invoice_order, mock_update_order_with_tax, mock_track_placed_order_event
    ):
        self.subscription_no_order.current_period_end_datetime = self.today
        self.subscription_no_order.save()

        other_subscription = SubscriptionFactory()
        other_subscription.customer = self.subscription_no_order.customer
        other_subscription.open_invoice_id = None
        other_subscription.upcoming_order_email_sent_datetime=self.today - timedelta(days=7)
        other_subscription.current_period_start_datetime = self.today - timedelta(days=90)
        other_subscription.current_period_end_datetime=self.today
        other_subscription.product = Product.objects.get(sku="OTC-VITC-0001-20")
        other_subscription.save()

        mock_invoice_order.side_effect = None
        mock_track_placed_order_event.return_value = None
        mock_update_order_with_tax.return_value = Order.objects.first()

        number_of_orders = Order.objects.count()

        response = self.client.post(
            path=self.handle_upcoming_subscription_orders_url,
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(len(Subscription.objects.filter(customer=self.subscription_no_order.customer)), 2)

        order = Order.objects.latest('created_datetime')
        order_items = order.order_items.all()
        self.assertEqual(len(order_items), 2)
        contains__RX_RET_0001_25 = order_items.filter(product__sku="RX-RET-0001-25")
        contains__OTC_VITC_0001_20 = order_items.filter(product__sku="OTC-VITC-0001-20")
        self.assertTrue(contains__RX_RET_0001_25)
        self.assertTrue(contains__OTC_VITC_0001_20)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), number_of_orders+1)
        mock_invoice_order.assert_called_once()

class SubscriptionServiceTestCase(TestCase):
    factory = RequestFactory()
    fixtures = ['customers.json', 'shipping_details.json', 'groups.json', 'medical_provider_user.json',
                'emr_pharmacies.json', 'emr_prescriptions.json', 'products.json', 'set_products.json',
                'emr_question_ids.json', 'emr_questionnaire_answers.json', 'emr_visits.json', 'emr_patient_prescriptions.json',
                'orders.json', 'order_products.json', 'order_items.json', 'subscriptions_order_product_subscriptions.json',
                'subscriptions_order_item_subscriptions.json', 'emr_snippets.json', 'emr_questionnaire_initial_20200102.json',
                'emr_questionnaire_initial_20200418.json', 'emr_questionnaire_initial_20200904.json',
                'emr_questionnaire_returning_20200102.json', 'emr_questionnaire_returning_female_20200308.json',
                'emr_questionnaire_returning_male_20200327.json', 'emr_questionnaires_sappira_legacy.json']


    @override_settings(TEST_MODE=True)
    def test_handle_upcoming_subscription_orders(self):
        datetime_now = timezone.now()
        subscription = Subscription.objects.first()

        # ---- Test that upcoming order emails are sent ---- #
        # start time is such that today is 5 days before next ship date
        start_time_for_next_ship_day_5_days_before_today = datetime_now - timedelta(days=55)
        subscription.current_period_start_datetime = start_time_for_next_ship_day_5_days_before_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_5_days_before_today + relativedelta(days=+60)
        subscription.save()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        # check that emails have been sent
        self.assertTrue(subscription.upcoming_order_email_sent_datetime)

        # start time is such that today is 6 days before next ship date
        start_time_for_next_ship_day_6_days_before_today = datetime_now - timedelta(days=54)
        subscription.upcoming_order_email_sent_datetime = None
        subscription.current_period_start_datetime = start_time_for_next_ship_day_6_days_before_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_6_days_before_today + relativedelta(days=+60)
        subscription.save()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        # check that emails have been sent
        self.assertTrue(subscription.upcoming_order_email_sent_datetime)

        # start time is such that today is 7 days before next ship date
        start_time_for_next_ship_day_7_days_before_today = datetime_now - timedelta(days=53)
        subscription.upcoming_order_email_sent_datetime = None
        subscription.current_period_start_datetime = start_time_for_next_ship_day_7_days_before_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_7_days_before_today + relativedelta(days=+60)
        subscription.save()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        # check that emails have been sent
        self.assertTrue(subscription.upcoming_order_email_sent_datetime)

        # ---- Test that orders to be shipped today are invoiced and an order is created ---- #
        # start time is such that today is the day of ship date
        timestamp_7_days_before_today = datetime_now - timedelta(days=7)
        start_time_for_next_ship_day_today = datetime_now - timedelta(days=60)
        subscription.current_period_start_datetime = start_time_for_next_ship_day_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_today + relativedelta(days=+60)
        subscription.upcoming_order_email_sent_datetime = timestamp_7_days_before_today
        subscription.save()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        self.assertTrue(subscription.open_invoice_id)
        self.assertTrue(subscription.get_open_order())

        # start time is such that today is 1 day after the ship date
        timestamp_6_days_before_today = datetime_now - timedelta(days=6)
        start_time_for_next_ship_day_1_day_after_today = datetime_now - timedelta(days=61)
        subscription.open_invoice_id = None
        subscription.current_period_start_datetime = start_time_for_next_ship_day_1_day_after_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_1_day_after_today + relativedelta(days=+60)
        subscription.upcoming_order_email_sent_datetime = timestamp_6_days_before_today
        subscription.save()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        logger.debug(f'[test_handle_upcoming_subscription_orders] subscription: {subscription.__dict__}.')
        self.assertTrue(subscription.open_invoice_id)

        # start time is such that today is 2 days after the ship date
        timestamp_5_days_before_today = datetime_now - timedelta(days=5)
        start_time_for_next_ship_day_2_day_after_today = datetime_now - timedelta(days=62)
        subscription.open_invoice_id = None
        subscription.current_period_start_datetime = start_time_for_next_ship_day_2_day_after_today
        subscription.current_period_end_datetime = start_time_for_next_ship_day_2_day_after_today + relativedelta(days=+60)
        subscription.upcoming_order_email_sent_datetime = timestamp_5_days_before_today
        subscription.save()
        subscription.refresh_from_db()
        SubscriptionsService().handle_upcoming_subscription_orders()
        subscription.refresh_from_db()
        self.assertTrue(subscription.open_invoice_id)

