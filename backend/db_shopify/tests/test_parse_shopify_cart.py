from django.urls import reverse
from db_shopify.services.services import ShopifyService
from subscriptions.services import SubscriptionsService
from subscriptions.models import Subscription
from orders.models import Order
from unittest.mock import patch
from django.db.models import signals
from db_analytics.services import FacebookConversionServices
from products.models import Product
from users.tests.factories import UserFactory, ShippingDetailsFactory
from orders.tests.factories import OrderFactory, OrderItemFactory, OrderProductFactory
from rest_framework.test import APITestCase
from rest_framework import status
import factory
import faker

class ParseShopifyCartTestCase(APITestCase):
    fixtures = ["products.json", "set_products.json"]

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("orders:orders-update-pending-or-create")
        cls.shopify_cart_id = faker.Faker().sentence()
        cls.otc_product = Product.objects.filter(sku="OTC-SUNBLK-0001-50").last()
        cls.rx_product = Product.objects.filter(sku="RX-RET-0001-15").last()
        cls.rx_set_product = Product.objects.filter(sku="RX-SET-0003-15").last()

    def setUp(self):
        self.shopify_cart_contents_list = [{
            "quantity": 2,
            "product_uuid": self.otc_product.uuid,
            "frequency": 0,
        },
        {
            "quantity": 1,
            "product_uuid": self.rx_product.uuid,
            "frequency": 0,
        }]
        self.shipping_details = ShippingDetailsFactory(
            first_name="Dearbrightly",
            last_name="User",
            address_line1="Shipping adress",
            address_line2="Shipping_address",
            city="San Francisco",
            state="CA",
            postal_code="94110",
            country="US",
        )
        self.user = UserFactory(shipping_details=self.shipping_details)
        self.order_data = {
            "customer": { "id": self.user.uuid },
            "shopify_cart_id": self.shopify_cart_id,
        }

    def calculate_subtotal(self, shopify_cart: list) -> int:
        subtotal = 0
        for line_item in shopify_cart:
            product = Product.objects.get(uuid=line_item.get("product_uuid"))
            price = product.price
            if line_item.get("frequency") > 0 and product.product_type == Product.Type.otc:
                price = product.subscription_price
            subtotal += price * line_item.get("quantity")
        return subtotal

    def create_order_product(self, order: Order, product: Product, order_product_data: dict) -> None:
        order_product = OrderProductFactory(
            frequency=order_product_data.get("frequency"),
            order=order, 
            product=product, 
            quantity=order_product_data.get("quantity"),
        )
        self.order_item = OrderItemFactory(
            order=order,
            order_product=order_product,
            product=product,
            is_refill=False,
        )

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_from_shopify_cart_unauthenticated_user(self, facebook_conversion_mock, get_shopify_cart_mock):
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_from_shopify_cart(self, facebook_conversion_mock, get_shopify_cart_mock):
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("subtotal"), self.calculate_subtotal(self.shopify_cart_contents_list))

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_from_shopify_cart_with_set_product(self, facebook_conversion_mock, get_shopify_cart_mock):
        self.shopify_cart_contents_list.append({
            "quantity": 1,
            "product_uuid": self.rx_set_product.uuid,
            "frequency": 3,
        })
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("subtotal"), self.calculate_subtotal(self.shopify_cart_contents_list))

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_create_order_from_shopify_cart_create_subscription(self, facebook_conversion_mock, get_shopify_cart_mock):
        frequency = 4
        self.shopify_cart_contents_list[0]["frequency"] = frequency
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("subtotal"), self.calculate_subtotal(self.shopify_cart_contents_list))
        self.assertTrue(response.data.get("is_subscription"))
        
        try:
            order = Order.objects.get(uuid=response.data.get("id"))
        except Order.DoesNotExist:
            self.fail("Order not found")

        signals.post_save.connect(SubscriptionsService.order_status_update_handler, sender=Order)
        order.status = Order.Status.payment_complete
        order.save()
        signals.post_save.disconnect(SubscriptionsService.order_status_update_handler, sender=Order)

        try:
            Subscription.objects.get(
                customer=order.customer,
                product__uuid=self.shopify_cart_contents_list[0]["product_uuid"]
            )
        except Subscription.DoesNotExist:
            self.fail("Subscription not created")

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_update_existing_order_from_shopify_cart_update_quantity(self, facebook_conversion_mock, get_shopify_cart_mock):
        order = OrderFactory(customer=self.user,)
        self.create_order_product(order=order, product=self.otc_product, order_product_data=self.shopify_cart_contents_list[0])
        self.create_order_product(order=order, product=self.rx_product, order_product_data=self.shopify_cart_contents_list[1])
        
        quantity = 3
        self.shopify_cart_contents_list[1]["quantity"] = quantity
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("subtotal"), self.calculate_subtotal(self.shopify_cart_contents_list))
        self.assertEqual(response.data.get("order_products")[1].get("quantity"), quantity)

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_update_existing_order_from_shopify_cart_remove_product_from_cart(self, facebook_conversion_mock, get_shopify_cart_mock):
        order = OrderFactory(customer=self.user,)
        self.create_order_product(order=order, product=self.otc_product, order_product_data=self.shopify_cart_contents_list[0])
        self.create_order_product(order=order, product=self.rx_product, order_product_data=self.shopify_cart_contents_list[1])
        
        self.shopify_cart_contents_list.pop()
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("subtotal"), self.calculate_subtotal(self.shopify_cart_contents_list))
        self.assertEqual(len(response.data.get("order_products")), len(self.shopify_cart_contents_list))

    @patch.object(ShopifyService, "get_shopify_cart_contents")
    @patch.object(FacebookConversionServices, "track_add_to_cart")
    @factory.django.mute_signals(signals.post_save)
    def test_update_existing_order_from_shopify_cart_remove_all_products_from_cart(self, facebook_conversion_mock, get_shopify_cart_mock):
        order = OrderFactory(customer=self.user,)
        self.create_order_product(order=order, product=self.otc_product, order_product_data=self.shopify_cart_contents_list[0])
        self.create_order_product(order=order, product=self.rx_product, order_product_data=self.shopify_cart_contents_list[1])
        
        self.shopify_cart_contents_list = []
        facebook_conversion_mock.return_value = None
        get_shopify_cart_mock.return_value = self.shopify_cart_contents_list, None, None
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            path=self.url,
            data=self.order_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("subtotal"), 0)
        self.assertEqual(len(response.data.get("order_products")), 0)
