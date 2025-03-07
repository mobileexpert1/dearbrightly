from db_shopify.services.subscription_service import RechargeSubscriptionService
from django.test import TestCase
from users.tests.factories import UserFactory
from subscriptions.tests.factories import SubscriptionFactory
from django.utils import timezone
from subscriptions.models import Subscription
from subscriptions.services import SubscriptionsService
from typing import List
from unittest.mock import patch

class BundleSubscriptionDatesTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.today = timezone.now()
        cls.today_5_days = cls.today + timezone.timedelta(days=5)
        cls.today_7_days = cls.today + timezone.timedelta(days=7)

    def setUp(self):
        self.customer = UserFactory()
        self.first_subscription = SubscriptionFactory(
            customer=self.customer,
        )
        self.second_subscription = SubscriptionFactory(
            customer=self.customer,
        )

    @patch("db_shopify.services.subscription_service.RechargeSubscriptionService.change_charge_date_request")
    def test_upcoming_in_5_days_with_another_less_than_two_days_apart(self, change_recharge_ship_date_mock):
        change_recharge_ship_date_mock.return_value = None
        self.first_subscription.current_period_end_datetime = self.today + timezone.timedelta(days=5)
        self.first_subscription.save(update_fields=["current_period_end_datetime"])
        self.second_subscription.current_period_end_datetime = self.first_subscription.current_period_end_datetime + timezone.timedelta(
            days=2
        )
        self.second_subscription.save(update_fields=["current_period_end_datetime"])
        shopify_subscriptions_upcoming_in_5_7_days=Subscription.objects.filter(
            current_period_end_datetime__date__gte=self.today_5_days,
            current_period_end_datetime__date__lte=self.today_7_days,
            is_active=True,
            customer=self.customer,
        )
        SubscriptionsService()._bundle_customer_subscription_dates(
            customer=self.customer,
            subscriptions=shopify_subscriptions_upcoming_in_5_7_days,
        )
        change_recharge_ship_date_mock.assert_called_once_with(
            recharge_subscription_id=str(self.first_subscription.recharge_subscription_id),
            set_charge_date=str(self.second_subscription.current_period_end_datetime.date()),
        )
        self.first_subscription.refresh_from_db()
        self.second_subscription.refresh_from_db()
        self.assertEqual(self.first_subscription.current_period_end_datetime, self.second_subscription.current_period_end_datetime)

    @patch("db_shopify.services.subscription_service.RechargeSubscriptionService.change_charge_date_request")
    def test_upcoming_in_7_days_with_another_less_than_two_days_apart(self, change_recharge_ship_date_mock):
        change_recharge_ship_date_mock.return_value = None
        self.first_subscription.current_period_end_datetime = self.today + timezone.timedelta(days=7)
        self.first_subscription.save(update_fields=["current_period_end_datetime"])
        self.second_subscription.current_period_end_datetime = self.first_subscription.current_period_end_datetime + timezone.timedelta(
            days=2
        )
        self.second_subscription.save(update_fields=["current_period_end_datetime"])
        shopify_subscriptions_upcoming_in_5_7_days=Subscription.objects.filter(
            current_period_end_datetime__date__gte=self.today_5_days,
            current_period_end_datetime__date__lte=self.today_7_days,
            is_active=True,
            customer=self.customer,
        )
        SubscriptionsService()._bundle_customer_subscription_dates(
            customer=self.customer,
            subscriptions=shopify_subscriptions_upcoming_in_5_7_days,
        )
        change_recharge_ship_date_mock.assert_called_once_with(
            recharge_subscription_id=str(self.second_subscription.recharge_subscription_id),
            set_charge_date=str(self.first_subscription.current_period_end_datetime.date()),
        )
        self.first_subscription.refresh_from_db()
        self.second_subscription.refresh_from_db()
        self.assertEqual(self.first_subscription.current_period_end_datetime, self.second_subscription.current_period_end_datetime)

    @patch("db_shopify.services.subscription_service.RechargeSubscriptionService.change_charge_date_request")
    def test_upcoming_in_5_days_with_another_more_than_two_days_apart(self, change_recharge_ship_date_mock):
        change_recharge_ship_date_mock.return_value = None
        self.first_subscription.current_period_end_datetime = self.today + timezone.timedelta(days=5)
        self.first_subscription.save(update_fields=["current_period_end_datetime"])
        self.second_subscription.current_period_end_datetime = self.first_subscription.current_period_end_datetime + timezone.timedelta(
            days=3
        )
        self.second_subscription.save(update_fields=["current_period_end_datetime"])
        shopify_subscriptions_upcoming_in_5_7_days=Subscription.objects.filter(
            current_period_end_datetime__date__gte=self.today_5_days,
            current_period_end_datetime__date__lte=self.today_7_days,
            is_active=True,
            customer=self.customer,
        )
        SubscriptionsService()._bundle_customer_subscription_dates(
            customer=self.customer,
            subscriptions=shopify_subscriptions_upcoming_in_5_7_days,
        )
        self.first_subscription.refresh_from_db()
        self.second_subscription.refresh_from_db()
        change_recharge_ship_date_mock.assert_not_called()
        self.assertNotEqual(self.first_subscription.current_period_end_datetime, self.second_subscription.current_period_end_datetime)

    @patch("db_shopify.services.subscription_service.RechargeSubscriptionService.change_charge_date_request")
    def test_upcoming_in_7_days_with_another_more_than_two_days_apart(self, change_recharge_ship_date_mock):
        change_recharge_ship_date_mock.return_value = None
        self.first_subscription.current_period_end_datetime = self.today + timezone.timedelta(days=7)
        self.first_subscription.save(update_fields=["current_period_end_datetime"])
        self.second_subscription.current_period_end_datetime = self.first_subscription.current_period_end_datetime + timezone.timedelta(
            days=3
        )
        self.second_subscription.save(update_fields=["current_period_end_datetime"])
        shopify_subscriptions_upcoming_in_5_7_days=Subscription.objects.filter(
            current_period_end_datetime__date__gte=self.today_5_days,
            current_period_end_datetime__date__lte=self.today_7_days,
            is_active=True,
            customer=self.customer,
        )
        SubscriptionsService()._bundle_customer_subscription_dates(
            customer=self.customer,
            subscriptions=shopify_subscriptions_upcoming_in_5_7_days,
        )
        self.first_subscription.refresh_from_db()
        self.second_subscription.refresh_from_db()
        change_recharge_ship_date_mock.assert_not_called()
        self.assertNotEqual(self.first_subscription.current_period_end_datetime, self.second_subscription.current_period_end_datetime)
