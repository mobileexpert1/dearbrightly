from django.contrib.auth.models import Group
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from mock import patch
from mock import PropertyMock
from rest_framework import status
from payment.tests.fixtures_stripe_webhook import invoice_payment_success_webhook, invoice_payment_failed_webhook, \
    invoice_finalization_failed_webhook, invoice_invoice_marked_uncollectible_webhook, invoice_payment_success_webhook_expired_rx, \
    invoice_payment_success_webhook_expired_rx_pending_visit
from payment.services.services import Service as PaymentService
from orders.services.services import OrderService
from subscriptions.models import OrderItemSubscription, OrderProductSubscription
from django.utils import timezone
from datetime import timedelta
from users.models import User, ShippingDetails
from products.models import Product
from utils.logger_utils import logger
from orders.models import Order
from payment.services.stripe_services import StripeService
from orders.services.services import OrderService
from django.test.client import RequestFactory
from emr.models import Questionnaire, Visit
from payment.views import PaymentViewSet

class BaseTestCase(TestCase):
    @classmethod
    @override_settings(DEBUG=True)
    def setUpTestData(cls):
        cls.register_url = reverse('auth:auth-register')
        cls.stripe_webhook = reverse('payment:payment-webhook-handler', kwargs={'service_platform': 'stripe'})

    @override_settings(DEBUG=True)
    def setUp(self):
        self.retinoid = Product.objects.create(sku="RX-RET-0001-25", name="Night Shift", product_category="retinoid")
        self.datetime_now = timezone.now()
        self.timestamp_5_days_before_today = self.datetime_now - timedelta(days=5)
        self.start_time_for_next_ship_day_today = self.datetime_now - timedelta(days=60)

        self.order_product_subscription = OrderProductSubscription.objects.get(open_invoice_id='in_00000000000001')
        self.order_product_subscription.upcoming_order_email_sent_datetime = self.timestamp_5_days_before_today
        self.order_product_subscription.save()

        self.order_product_subscription_expired_rx_pending_visit = OrderProductSubscription.objects.get(open_invoice_id='in_00000000000002')
        self.order_product_subscription_expired_rx_pending_visit.upcoming_order_email_sent_datetime = self.timestamp_5_days_before_today
        self.order_product_subscription_expired_rx_pending_visit.save()

        self.order_product_subscription_expired_rx = OrderProductSubscription.objects.get(open_invoice_id='in_00000000000003')
        self.order_product_subscription_expired_rx.upcoming_order_email_sent_datetime = self.timestamp_5_days_before_today
        self.order_product_subscription_expired_rx.save()

        logger.debug(f'[test_stripe_services][setUp] order_product_subscription: {self.order_product_subscription.__dict__}. '
                     f'order_product_subscription_expired_rx: {self.order_product_subscription_expired_rx.__dict__}. '
                     f'order_product_subscription_expired_rx_pending_visit: {self.order_product_subscription_expired_rx_pending_visit.__dict__}.')

class StripeServiceTestCase(BaseTestCase):
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
    def test_handle_invoice_payment_success_webhook(self):
        # order = self.order_product_subscription.get_open_order()
        # print(f'[test_handle_invoice_payment_success_webhook] order_product_subscription: {self.order_product_subscription.__dict__}.')
        # print(f'[test_handle_invoice_payment_success_webhook] setup order: {order.__dict__}.')

        invoice_payment_success_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_payment_success_webhook,
            content_type='application/json')
        invoice_payment_success_webhook_request.data = invoice_payment_success_webhook
        PaymentViewSet().webhook_handler(invoice_payment_success_webhook_request, 'stripe')

        self.order_product_subscription.refresh_from_db()
        order = self.order_product_subscription.get_latest_plan_order()
        #print(f'[test_handle_invoice_payment_success_webhook] order: {order.__dict__}.')

        self.assertFalse(self.order_product_subscription.open_invoice_id)
        self.assertTrue(order.payment_captured_datetime)
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)

    @override_settings(TEST_MODE=True)
    def test_handle_invoice_payment_success_webhook_expired_rx_pending_visit(self):
        invoice_payment_success_expired_rx_pending_visit_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_payment_success_webhook_expired_rx_pending_visit,
            content_type='application/json')
        invoice_payment_success_expired_rx_pending_visit_webhook_request.data = invoice_payment_success_webhook_expired_rx_pending_visit
        PaymentViewSet().webhook_handler(invoice_payment_success_expired_rx_pending_visit_webhook_request, 'stripe')

        self.order_product_subscription_expired_rx_pending_visit.refresh_from_db()
        order = self.order_product_subscription_expired_rx_pending_visit.get_latest_plan_order()
        #print(f'[test_handle_invoice_payment_success_webhook_expired_rx_pending_visit] setup order: {order.__dict__}.')

        customer = self.order_product_subscription_expired_rx_pending_visit.customer
        visit = customer.patient_visits.latest('created_datetime')

        self.assertFalse(self.order_product_subscription_expired_rx_pending_visit.open_invoice_id)
        self.assertEqual(visit.skin_profile_status, Visit.SkinProfileStatus.incomplete_user_response)
        self.assertEqual(visit.status, Visit.Status.provider_pending)
        self.assertTrue(order.payment_captured_datetime)
        self.assertEqual(int(order.status), Order.Status.pending_medical_provider_review)

    @override_settings(TEST_MODE=True)
    def test_handle_invoice_payment_success_webhook_expired_visit(self):
        invoice_payment_success_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_payment_success_webhook_expired_rx,
            content_type='application/json')
        invoice_payment_success_webhook_request.data = invoice_payment_success_webhook_expired_rx
        PaymentViewSet().webhook_handler(invoice_payment_success_webhook_request, 'stripe')

        self.order_product_subscription_expired_rx.refresh_from_db()
        order = self.order_product_subscription_expired_rx.get_latest_plan_order()
        #print(f'[test_handle_invoice_payment_success_webhook_expired_visit] setup order: {order.__dict__}.')

        customer = self.order_product_subscription_expired_rx.customer
        visit = customer.patient_visits.latest('created_datetime')

        self.assertFalse(self.order_product_subscription_expired_rx.open_invoice_id)
        self.assertEqual(visit.skin_profile_status, Visit.SkinProfileStatus.no_changes_no_user_response)
        self.assertEqual(visit.status, Visit.Status.provider_pending)
        self.assertTrue(order.payment_captured_datetime)
        self.assertEqual(int(order.status), Order.Status.pending_medical_provider_review)

    @override_settings(TEST_MODE=True)
    def test_handle_invoice_payment_fail_webhook(self):

        invoice_failed_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_payment_success_webhook,
            content_type='application/json')
        invoice_failed_webhook_request.data = invoice_payment_failed_webhook
        PaymentViewSet().webhook_handler(invoice_failed_webhook_request, 'stripe')

        self.order_product_subscription.refresh_from_db()

        order = self.order_product_subscription.get_open_order()
        #print(f'[test_handle_invoice_payment_fail_webhook] order: {order.__dict__}.')

        self.assertEqual(int(order.status), Order.Status.payment_failure)


    @override_settings(TEST_MODE=True)
    def test_handle_invoice_finalization_failed_webhook(self):
        invoice_finalization_failed_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_finalization_failed_webhook,
            content_type='application/json')
        invoice_finalization_failed_webhook_request.data = invoice_finalization_failed_webhook
        PaymentViewSet().webhook_handler(invoice_finalization_failed_webhook_request, 'stripe')

        self.order_product_subscription.refresh_from_db()

        order = self.order_product_subscription.get_open_order()
        #print(f'[test_handle_invoice_finalization_failed_webhook] order: {order.__dict__}.')

        self.assertFalse(self.order_product_subscription.open_invoice_id)
        self.assertFalse(order.payment_processor_charge_id)


    @override_settings(TEST_MODE=True)
    def test_handle_invoice_marked_uncollectible_webhook(self):
        invoice_marked_uncollectible_webhook_request = self.factory.post(
            path=self.stripe_webhook,
            data=invoice_invoice_marked_uncollectible_webhook,
            content_type='application/json')
        invoice_marked_uncollectible_webhook_request.data = invoice_invoice_marked_uncollectible_webhook
        PaymentViewSet().webhook_handler(invoice_marked_uncollectible_webhook_request, 'stripe')

        self.order_product_subscription.refresh_from_db()

        order = self.order_product_subscription.get_open_order()
        #print(f'[test_handle_invoice_marked_uncollectible_webhook] order: {order.__dict__}.')

        self.assertEqual(int(order.status), Order.Status.cancelled)
        self.assertFalse(self.order_product_subscription.is_active)
        self.assertTrue(self.order_product_subscription.cancel_datetime)
        self.assertEqual(self.order_product_subscription.cancel_reason,
                         OrderProductSubscription.CancelReason.payment_failure)