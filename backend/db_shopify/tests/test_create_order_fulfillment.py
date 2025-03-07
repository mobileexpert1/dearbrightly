from django.test import TestCase
from db_shopify.services.services import ShopifyService
from users.tests.factories import UserFactory
from orders.models import Order
from unittest.mock import patch
from orders.tests.factories import OrderFactory
from django.db.models import signals
import factory
import faker

class CreateOrderFulfillmentTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.shopify_order_id = faker.Faker().sentence()

    def setUp(self):
        self.user = UserFactory()
        self.order = OrderFactory(customer=self.user)

    @patch.object(ShopifyService, "create_order_fulfillment")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_fulfillment_on_status_change_to_shipped(self, create_order_fulfillment_mock):
        signals.post_save.connect(ShopifyService.order_status_update_handler, sender=Order)
        create_order_fulfillment_mock.return_value = None
        self.order.shopify_order_id = self.shopify_order_id
        self.order.status = Order.Status.shipped
        self.order.save()
        signals.post_save.disconnect(ShopifyService.order_status_update_handler, sender=Order)
        create_order_fulfillment_mock.assert_called_once_with(order=self.order)

    @patch.object(ShopifyService, "create_order_fulfillment")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_fulfillment_on_status_change_to_pending_pharmacy(self, create_order_fulfillment_mock):
        signals.post_save.connect(ShopifyService.order_status_update_handler, sender=Order)
        create_order_fulfillment_mock.return_value = None
        self.order.shopify_order_id = self.shopify_order_id
        self.order.status = Order.Status.pending_pharmacy
        self.order.save()
        signals.post_save.disconnect(ShopifyService.order_status_update_handler, sender=Order)
        self.assertFalse(create_order_fulfillment_mock.called)

    @patch.object(ShopifyService, "create_order_fulfillment")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_fulfillment_on_status_change_to_shipped_not_shopify_order(self, create_order_fulfillment_mock):
        signals.post_save.connect(ShopifyService.order_status_update_handler, sender=Order)
        create_order_fulfillment_mock.return_value = None
        self.order.status = Order.Status.shipped
        self.order.save()
        signals.post_save.disconnect(ShopifyService.order_status_update_handler, sender=Order)
        self.assertFalse(create_order_fulfillment_mock.called)
