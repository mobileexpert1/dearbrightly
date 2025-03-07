import datetime
from typing import List, Dict
from unittest import mock

import klaviyo
import pytz
import requests
import stripe
from django.conf import settings
from django.db.models import Q
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Order
from orders.tests.factories import (
    OrderProductFactory,
    OrderFactory,
)
from payment.models import Coupon
from payment_new.factories import CouponFactory
from products.models import Product
from products_new.factories import ProductFactory
from users.tests.factories import UserFactory
from subscriptions.tests.factories import SubscriptionFactory

class GetDiscountActionTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.rx_product = ProductFactory(
            product_type=Product.Type.rx, price=2000, subscription_price=1500
        )
        cls.otc_product_refill = ProductFactory(
            product_type=Product.Type.otc, price=2000, subscription_price=1500
        )
        cls.otc_product = ProductFactory(
            product_type=Product.Type.otc,
            price=2000,
            subscription_price=1500,
            refill_product=cls.otc_product_refill,
        )
        cls.get_discount_url = reverse("payment_new:payment-get-discount")

    def setUp(self):
        order_product = OrderProductFactory(product=self.otc_product)
        self.get_discount_data = {
            "discount_code": "",
            "products": [
                {
                    "quantity": order_product.quantity,
                    "frequency": order_product.frequency,
                    "product_uuid": order_product.product.uuid,
                    "price": order_product.product.price,
                    "subscription_price": order_product.product.subscription_price,
                }
            ],
        }

    def test_get_discount_with_invalid_discount_code(self):
        invalid_code = "INVALID_CODE"
        self.get_discount_data["discount_code"] = invalid_code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"), f"Coupon: {invalid_code} does not exist."
        )

    def test_get_discount_with_inactive_discount_code(self):
        coupon_inactive = CouponFactory(is_active=False)
        self.get_discount_data["discount_code"] = coupon_inactive.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"), f"Coupon: {coupon_inactive} does not exist."
        )

    def test_get_discount_with_discount_code_that_has_reached_max_redemptions(self):
        self.client.force_authenticate(user=self.user)
        coupon_max_redemptions_reached = CouponFactory(max_redemptions=2)
        OrderFactory(
            customer=self.user,
            payment_captured_datetime=timezone.now(),
            coupon=coupon_max_redemptions_reached,
        )
        OrderFactory(
            customer=self.user,
            payment_captured_datetime=timezone.now(),
            coupon=coupon_max_redemptions_reached,
        )
        self.get_discount_data["discount_code"] = coupon_max_redemptions_reached.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_max_redemptions_reached.code} has reached max redemption limit per user.",
        )

    @mock.patch("django.utils.timezone.now")
    def test_get_discount_with_discount_code_that_time_range_expired(
        self, mock_timezone_now
    ):
        mock_timezone_now.return_value = datetime.datetime(
            year=2022, month=3, day=1, tzinfo=pytz.UTC
        )
        coupon_time_range_expired = CouponFactory(
            start_duration_range=datetime.datetime(
                year=2022, month=1, day=1, tzinfo=pytz.UTC
            ),
            end_duration_range=datetime.datetime(
                year=2022, month=1, day=30, tzinfo=pytz.UTC
            ),
        )
        self.get_discount_data["discount_code"] = coupon_time_range_expired.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon's: {coupon_time_range_expired.code} time range has expired.",
        )

    def test_get_discount_with_user_that_is_not_allowed_to_use_coupon(self):
        customer = UserFactory()
        self.client.force_authenticate(customer)
        coupon_with_allowed_customers = CouponFactory(
            allowed_customers=(UserFactory(),)
        )
        self.get_discount_data["discount_code"] = coupon_with_allowed_customers.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_with_allowed_customers.code} is not allowed for customer: {customer}.",
        )

    def test_get_discount_with_coupon_that_is_restricted_for_specific_products(self):
        coupon_with_discounted_products = CouponFactory(
            discounted_products=(ProductFactory(),)
        )
        self.get_discount_data["discount_code"] = coupon_with_discounted_products.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Your shopping cart doesn't contain products to apply coupon: {coupon_with_discounted_products.code}.",
        )

    def test_get_discount_with_coupon_only_for_first_time_order_and_customer_has_previous_order(
        self,
    ):
        customer = UserFactory()
        OrderFactory(customer=customer, status=Order.Status.shipped, payment_captured_datetime=timezone.now())
        self.client.force_authenticate(user=customer)
        coupon_first_time_order = CouponFactory(first_time_order=True)
        self.get_discount_data["discount_code"] = coupon_first_time_order.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_first_time_order.code} is valid only for customers without previous orders.",
        )

    def test_get_discount_with_coupon_only_for_existing_purchasers_as_new_user(self):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        coupon_only_existing_purchasers = CouponFactory(only_existing_purchasers=True)
        self.get_discount_data["discount_code"] = coupon_only_existing_purchasers.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_only_existing_purchasers.code} is not valid for new customers.",
        )
        self.assertEqual(customer.orders.count(), 0)

    def test_get_discount_with_coupon_only_for_existing_purchasers_as_user_with_previous_order(
        self,
    ):
        customer = UserFactory()
        OrderFactory(customer=customer, payment_captured_datetime=timezone.now())
        self.client.force_authenticate(user=customer)
        coupon_only_existing_purchasers = CouponFactory(only_existing_purchasers=True)
        self.get_discount_data["discount_code"] = coupon_only_existing_purchasers.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_only_existing_purchasers.code,
                "amount_off": coupon_only_existing_purchasers.amount_off,
                "percent_off": coupon_only_existing_purchasers.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 1)

    def test_get_discount_with_active_and_infinite_coupon(self):
        coupon_infinite = CouponFactory(type=Coupon.Type.infinite, max_redemptions=1)
        self.get_discount_data["discount_code"] = coupon_infinite.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )
        coupon_infinite.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_infinite.code,
                "amount_off": coupon_infinite.amount_off,
                "percent_off": coupon_infinite.percent_off,
            },
        )

    def test_get_discount_with_active_and_expring_coupon(self):
        coupon_expiring = CouponFactory(type=Coupon.Type.expiring, max_redemptions=3)
        OrderFactory(
            customer=self.user, status=Order.Status.shipped, coupon=coupon_expiring
        )
        OrderFactory(
            customer=self.user, status=Order.Status.shipped, coupon=coupon_expiring
        )
        self.get_discount_data["discount_code"] = coupon_expiring.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )
        coupon_expiring.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_expiring.code,
                "amount_off": coupon_expiring.amount_off,
                "percent_off": coupon_expiring.percent_off,
            },
        )

    @mock.patch("django.utils.timezone.now")
    def test_get_discount_with_correct_time_range(self, mock_timezone_now):
        mock_timezone_now.return_value = datetime.datetime(
            year=2022, month=3, day=10, tzinfo=pytz.UTC
        )
        coupon_time_range_correct = CouponFactory(
            start_duration_range=datetime.datetime(
                year=2022, month=3, day=1, tzinfo=pytz.UTC
            ),
            end_duration_range=datetime.datetime(
                year=2022, month=3, day=30, tzinfo=pytz.UTC
            ),
            max_redemptions=1,
        )
        self.get_discount_data["discount_code"] = coupon_time_range_correct.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )
        coupon_time_range_correct.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_time_range_correct.code,
                "amount_off": coupon_time_range_correct.amount_off,
                "percent_off": coupon_time_range_correct.percent_off,
            },
        )

    def test_get_discount_with_user_that_is_allowed_to_use_coupon(self):
        customer = UserFactory()
        coupon_with_allowed_customers = CouponFactory(
            allowed_customers=(customer,), max_redemptions=1
        )
        self.client.force_authenticate(user=customer)
        self.get_discount_data["discount_code"] = coupon_with_allowed_customers.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )
        coupon_with_allowed_customers.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_with_allowed_customers.code,
                "amount_off": coupon_with_allowed_customers.amount_off,
                "percent_off": coupon_with_allowed_customers.percent_off,
            },
        )
        self.assertIn(coupon_with_allowed_customers, customer.coupons.all())
        self.assertIn(customer, coupon_with_allowed_customers.allowed_customers.all())

    def test_get_discount_with_product_that_is_able_to_obtain_discount(self):
        coupon_with_discounted_products = CouponFactory(
            discounted_products=(self.otc_product,)
        )
        self.get_discount_data["discount_code"] = coupon_with_discounted_products.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_with_discounted_products.code,
                "amount_off": coupon_with_discounted_products.amount_off,
                "percent_off": coupon_with_discounted_products.percent_off,
            },
        )
        self.assertIn(coupon_with_discounted_products, self.otc_product.coupons.all())
        self.assertIn(
            self.otc_product, coupon_with_discounted_products.discounted_products.all()
        )

    def test_get_discount_with_discounted_and_not_discounted_products_in_bag(self):
        order_product_2 = OrderProductFactory(product=self.rx_product)
        order_product_2_data = {
            "quantity": order_product_2.quantity,
            "frequency": order_product_2.frequency,
            "product_uuid": order_product_2.product.uuid,
            "price": order_product_2.product.price,
            "subscription_price": order_product_2.product.subscription_price,
        }

        coupon_with_discounted_products = CouponFactory(
            discounted_products=(self.otc_product,),
            percent_off=20.00,
        )
        self.get_discount_data["products"].append(order_product_2_data)
        self.get_discount_data["discount_code"] = coupon_with_discounted_products.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_with_discounted_products.code,
                "amount_off": int(
                    self.otc_product.price
                    * coupon_with_discounted_products.percent_off
                    / 100
                ),
                "percent_off": 0,
            },
        )
        self.assertIn(coupon_with_discounted_products, self.otc_product.coupons.all())
        self.assertIn(
            self.otc_product, coupon_with_discounted_products.discounted_products.all()
        )

    def test_get_discount_with_discounted_products_but_use_the_refill_product(self):
        order_product_refill = OrderProductFactory(
            product=self.otc_product.refill_product
        )
        order_product_refill_data = {
            "quantity": order_product_refill.quantity,
            "frequency": order_product_refill.frequency,
            "product_uuid": order_product_refill.product.uuid,
            "price": order_product_refill.product.price,
            "subscription_price": order_product_refill.product.subscription_price,
        }
        coupon_with_discounted_products = CouponFactory(
            discounted_products=(self.otc_product,)
        )
        self.get_discount_data["discount_code"] = coupon_with_discounted_products.code
        self.get_discount_data["products"] = [order_product_refill_data]
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_with_discounted_products.code,
                "amount_off": coupon_with_discounted_products.amount_off,
                "percent_off": coupon_with_discounted_products.percent_off,
            },
        )
        self.assertIn(coupon_with_discounted_products, self.otc_product.coupons.all())
        self.assertIn(
            self.otc_product, coupon_with_discounted_products.discounted_products.all()
        )

    def test_get_discount_with_coupon_only_for_first_time_order_and_customer_has_not_previous_order(
        self,
    ):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        coupon_first_time_order = CouponFactory(first_time_order=True)
        self.get_discount_data["discount_code"] = coupon_first_time_order.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_first_time_order.code,
                "amount_off": coupon_first_time_order.amount_off,
                "percent_off": coupon_first_time_order.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 0)

    def test_get_discount_with_coupon_only_for_first_time_order_and_customer_has_previous_order_refunded(
        self,
    ):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        OrderFactory(customer=customer, status=Order.Status.refunded)
        coupon_first_time_order = CouponFactory(first_time_order=True)
        self.get_discount_data["discount_code"] = coupon_first_time_order.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_first_time_order.code,
                "amount_off": coupon_first_time_order.amount_off,
                "percent_off": coupon_first_time_order.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 1)
        self.assertEqual(int(customer.orders.first().status), Order.Status.refunded)
        self.assertEqual(
            customer.orders.filter(
                ~Q(status=Order.Status.refunded)
                & ~Q(status=Order.Status.cancelled)
                & ~Q(status=Order.Status.pending_payment)
            ).count(),
            0,
        )

    def test_get_discount_with_coupon_only_for_first_time_order_and_customer_has_previous_order_cancelled(
        self,
    ):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        OrderFactory(customer=customer, status=Order.Status.cancelled)
        coupon_first_time_order = CouponFactory(first_time_order=True)
        self.get_discount_data["discount_code"] = coupon_first_time_order.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_first_time_order.code,
                "amount_off": coupon_first_time_order.amount_off,
                "percent_off": coupon_first_time_order.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 1)
        self.assertEqual(int(customer.orders.first().status), Order.Status.cancelled)
        self.assertEqual(
            customer.orders.filter(
                ~Q(status=Order.Status.refunded)
                & ~Q(status=Order.Status.cancelled)
                & ~Q(status=Order.Status.pending_payment)
            ).count(),
            0,
        )

    def test_get_discount_with_coupon_only_for_first_time_order_and_customer_has_order_has_pending_payment_status(
        self,
    ):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        OrderFactory(customer=customer, status=Order.Status.pending_payment)
        coupon_first_time_order = CouponFactory(first_time_order=True)
        self.get_discount_data["discount_code"] = coupon_first_time_order.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_first_time_order.code,
                "amount_off": coupon_first_time_order.amount_off,
                "percent_off": coupon_first_time_order.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 1)
        self.assertEqual(
            int(customer.orders.first().status), Order.Status.pending_payment
        )
        self.assertEqual(
            customer.orders.filter(
                ~Q(status=Order.Status.refunded)
                & ~Q(status=Order.Status.cancelled)
                & ~Q(status=Order.Status.pending_payment)
            ).count(),
            0,
        )

    def test_get_discount_with_coupon_for_discounted_products_not_in_existing_plans_or_orders(self):
        customer = UserFactory()
        self.client.force_authenticate(user=customer)
        order = OrderFactory(customer=customer, payment_captured_datetime=timezone.now())
        OrderProductFactory(
            order=order, product=self.rx_product
        )
        coupon_discounted_products_not_in_existing_plans_or_orders = CouponFactory(
            discounted_products_not_in_existing_plans_or_orders=True,
            discounted_products=(self.otc_product,),
        )
        self.get_discount_data["discount_code"] = coupon_discounted_products_not_in_existing_plans_or_orders.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "discount_code": coupon_discounted_products_not_in_existing_plans_or_orders.code,
                "amount_off": coupon_discounted_products_not_in_existing_plans_or_orders.amount_off,
                "percent_off": coupon_discounted_products_not_in_existing_plans_or_orders.percent_off,
            },
        )
        self.assertEqual(customer.orders.count(), 1)

    def test_get_discount_with_coupon_for_discounted_products_in_existing_order(
        self,
    ):
        customer = UserFactory()
        order = OrderFactory(customer=customer, payment_captured_datetime=timezone.now())
        OrderProductFactory(
            order=order, product=self.otc_product
        )
        self.client.force_authenticate(user=customer)
        coupon_discounted_products_not_in_existing_plans_or_orders = CouponFactory(
            discounted_products_not_in_existing_plans_or_orders=True,
            discounted_products=(self.otc_product,),
        )
        self.get_discount_data["discount_code"] = coupon_discounted_products_not_in_existing_plans_or_orders.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_discounted_products_not_in_existing_plans_or_orders.code} "
            f"is not valid if you've previously purchased one of the discounted products.",
        )
        self.assertEqual(customer.orders.count(), 1)

    def test_get_discount_with_coupon_for_discounted_products_in_existing_plan(
        self,
    ):
        customer = UserFactory()
        SubscriptionFactory(
            customer=customer, product=self.otc_product, is_active=True
        )
        self.client.force_authenticate(user=customer)
        coupon_discounted_products_not_in_existing_plans_or_orders = CouponFactory(
            discounted_products_not_in_existing_plans_or_orders=True,
            discounted_products=(self.otc_product,),
        )
        self.get_discount_data["discount_code"] = coupon_discounted_products_not_in_existing_plans_or_orders.code
        response = self.client.post(
            path=self.get_discount_url, data=self.get_discount_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("detail"),
            f"Coupon: {coupon_discounted_products_not_in_existing_plans_or_orders.code} "
            f"is not valid if you've subscribed to one of the discounted products.",
        )
        self.assertEqual(customer.orders.count(), 0)

class AuthorizePaymentViewTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory(payment_processor_customer_id="cus_abcd")
        cls.order = OrderFactory(purchased_datetime=None)
        cls.order_with_stripe_customer = OrderFactory(
            customer=cls.user, purchased_datetime=None
        )
        cls.paid_order = OrderFactory(purchased_datetime=timezone.now())
        cls.order_url = reverse(
            "payment_new:authorize-payment", kwargs={"order_uuid": cls.order.uuid}
        )
        cls.order_with_stripe_customer_url = reverse(
            "payment_new:authorize-payment",
            kwargs={"order_uuid": cls.order_with_stripe_customer.uuid},
        )
        cls.paid_order_url = reverse(
            "payment_new:authorize-payment", kwargs={"order_uuid": cls.paid_order.uuid}
        )
        cls.invalid_url = reverse(
            "payment_new:authorize-payment",
            kwargs={"order_uuid": "11111111-1111-1111-1111-111111111111"},
        )
        cls.payload = {"token": "tok_visa"}
        cls.stripe_error = stripe.error.StripeError("", "")
        cls.invalid_request_error = stripe.error.InvalidRequestError("", "")
        cls.stripe_customer = stripe.Customer(id="cus_abcd")
        cls.stripe_card = stripe.Card(id="card_old")
        cls.stripe_card.fingerprint = "cardold"
        cls.new_stripe_card = stripe.Card(id="card_new")
        cls.new_stripe_card.fingerprint = "newcard"
        cls.stripe_token = stripe.Token(id="tok_visa")
        cls.stripe_token.card = cls.new_stripe_card
        cls.payment_intent = stripe.PaymentIntent(id="pi_random")
        cls.klaviyo_exception = klaviyo.exceptions.KlaviyoAPIException(
            status_code=400, response=requests.Response()
        )

    def setUp(self):
        self.mock_customer_create = mock.patch(
            "payment_new.services.stripe_service.stripe.Customer.create"
        ).start()
        self.mock_customer_retrieve = mock.patch(
            "payment_new.services.stripe_service.stripe.Customer.retrieve"
        ).start()
        self.mock_list_sources = mock.patch(
            "payment_new.services.stripe_service.stripe.Customer.list_sources"
        ).start()
        self.mock_token_retrieve = mock.patch(
            "payment_new.services.stripe_service.stripe.Token.retrieve"
        ).start()
        self.mock_create_source = mock.patch(
            "payment_new.services.stripe_service.stripe.Customer.create_source"
        ).start()
        self.mock_payment_intent_create = mock.patch(
            "payment_new.services.stripe_service.stripe.PaymentIntent.create"
        ).start()
        self.mock_klaviyo_client = mock.patch(
            "db_analytics.services.klaviyo_client"
        ).start()
        self.mock_get_charge_id = mock.patch(
            "payment_new.services.stripe_service.StripeService.get_charge_id_from_payment_intent"
        ).start()

        self.addCleanup(mock.patch.stopall)

    def test_order_does_not_exist(self):
        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.invalid_url, self.payload)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_order_has_been_paid_before(self):
        self.client.force_authenticate(user=self.paid_order.customer)
        response = self.client.post(self.paid_order_url, self.payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_stripe_customer_invalid(self):
        self.mock_customer_create.side_effect = self.stripe_error
        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_stripe_customer_invalid(self):
        self.mock_customer_retrieve.side_effect = self.stripe_error
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_with_stripe_customer_url, self.payload)

        self.mock_customer_create.assert_not_called()
        self.mock_customer_retrieve.assert_called_once()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_not_existing_stripe_customer(self):
        self.mock_customer_retrieve.side_effect = self.invalid_request_error
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.side_effect = self.stripe_error
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_with_stripe_customer_url, self.payload)

        self.user.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_called_once()
        self.assertIsNotNone(self.user.payment_processor_customer_id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_list_sources_invalid(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.assertIsNotNone(self.order.customer.payment_processor_customer_id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_list_sources_invalid(self):
        self.mock_customer_retrieve.return_value = self.stripe_customer
        self.mock_list_sources.side_effect = stripe.error.StripeError("", "")

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_with_stripe_customer_url, self.payload)

        self.order_with_stripe_customer.customer.refresh_from_db()

        self.mock_customer_create.assert_not_called()
        self.mock_customer_retrieve.assert_called_once()
        self.mock_list_sources.assert_called_once()
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_token_retrieve_invalid(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [self.stripe_card]
        self.mock_token_retrieve.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order_with_stripe_customer.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_token_retrieve_invalid(self):
        self.mock_customer_retrieve.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [self.stripe_card]
        self.mock_token_retrieve.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_with_stripe_customer_url, self.payload)

        self.mock_customer_create.assert_not_called()
        self.mock_customer_retrieve.assert_called_once()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_create_source_invalid(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [self.stripe_card]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order_with_stripe_customer.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_called_once()
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_create_source_invalid(self):
        self.mock_customer_retrieve.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [self.stripe_card]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_token_retrieve.return_value.card = self.new_stripe_card
        self.mock_create_source.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.order_with_stripe_customer_url, self.payload)

        self.order_with_stripe_customer.customer.refresh_from_db()

        self.mock_customer_create.assert_not_called()
        self.mock_customer_retrieve.assert_called_once()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_called_once()
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_intent_existing_card_invalid(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [
            self.new_stripe_card,
        ]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.return_value = self.stripe_card
        self.mock_payment_intent_create.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.refresh_from_db()
        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_not_called()
        self.mock_payment_intent_create.assert_called_once()
        self.assertIsNotNone(self.order.customer.payment_processor_customer_id)
        self.assertIsNone(self.order.payment_processor_charge_id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_intent_new_card_invalid(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [
            self.stripe_card,
        ]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.return_value = self.stripe_card
        self.mock_payment_intent_create.side_effect = self.stripe_error

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.refresh_from_db()
        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_called_once()
        self.mock_payment_intent_create.assert_called_once()
        self.assertIsNotNone(self.order.customer.payment_processor_customer_id)
        self.assertIsNone(self.order.payment_processor_charge_id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_intent_existing_card(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [
            self.new_stripe_card,
        ]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.return_value = self.stripe_card
        self.mock_payment_intent_create.return_value = self.payment_intent
        self.mock_get_charge_id.return_value = self.payment_intent.id
        self.mock_klaviyo_client.Public.track.side_effect = self.klaviyo_exception

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.refresh_from_db()
        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_not_called()
        self.mock_payment_intent_create.assert_called_once()
        self.assertFalse(self.order.is_klaviyo_migrated)
        self.assertIsNotNone(
            self.order_with_stripe_customer.customer.payment_processor_customer_id
        )
        self.assertIsNotNone(self.order.payment_processor_charge_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_payment_intent_new_card(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [
            self.stripe_card,
        ]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.return_value = self.stripe_card
        self.mock_payment_intent_create.return_value = self.payment_intent
        self.mock_get_charge_id.return_value = self.payment_intent.id
        self.mock_klaviyo_client.Public.track.side_effect = self.klaviyo_exception

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.refresh_from_db()
        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_called_once()
        self.mock_payment_intent_create.assert_called_once()
        self.mock_klaviyo_client.Public.track.assert_called_once()
        self.assertFalse(self.order.is_klaviyo_migrated)
        self.assertIsNotNone(self.order.customer.payment_processor_customer_id)
        self.assertIsNotNone(self.order.payment_processor_charge_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_klaviyo_service(self):
        self.mock_customer_create.return_value = self.stripe_customer
        self.mock_list_sources.return_value.data = [
            self.stripe_card,
        ]
        self.mock_token_retrieve.return_value = self.stripe_token
        self.mock_create_source.return_value = self.stripe_card
        self.mock_payment_intent_create.return_value = self.payment_intent
        self.mock_get_charge_id.return_value = self.payment_intent.id
        self.mock_klaviyo_client.Public.track.return_value.status_code = 200

        self.client.force_authenticate(user=self.order.customer)
        response = self.client.post(self.order_url, self.payload)

        self.order.refresh_from_db()
        self.order.customer.refresh_from_db()

        self.mock_customer_create.assert_called_once()
        self.mock_customer_retrieve.assert_not_called()
        self.mock_list_sources.assert_called_once()
        self.mock_token_retrieve.assert_called_once()
        self.mock_create_source.assert_called_once()
        self.mock_payment_intent_create.assert_called_once()
        self.mock_klaviyo_client.Public.track.assert_called()
        self.assertTrue(self.order.is_klaviyo_migrated)
        self.assertIsNotNone(self.order.customer.payment_processor_customer_id)
        self.assertIsNotNone(self.order.payment_processor_charge_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CouponViewSetTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.coupon_list_url = reverse("payment_new:coupon-list")
        cls.customer = UserFactory()
        cls.product = ProductFactory()

    def setUp(self):
        self.create_coupon_data = {
            "code": "NEW_CODE",
            "amount_off": 500,
            "max_redemptions": 3,
        }
        self.update_coupon_data = {
            "code": "UPDATED_CODE",
            "amount_off": 1000,
            "max_redemptions": 5,
            "first_time_order": True,
        }

    def test_get_coupons_list_without_api_key(self):
        response = self.client.get(path=self.coupon_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_coupons_list_with_api_key(self):
        CouponFactory()
        response = self.client.get(
            path=self.coupon_list_url, **{"HTTP_API_KEY": self.api_key}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_coupon_without_api_key(self):
        response = self.client.post(
            path=self.coupon_list_url, data=self.create_coupon_data
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_coupon_with_api_key(self):
        response = self.client.post(
            path=self.coupon_list_url,
            data=self.create_coupon_data,
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Coupon.objects.count(), 1)
        coupon = Coupon.objects.first()
        self.assertEqual(coupon.code, self.create_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.create_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.create_coupon_data.get("max_redemptions")
        )

    def test_create_coupon_with_amount_off_and_percent_off(self):
        self.create_coupon_data["percent_off"] = 25.0
        response = self.client.post(
            path=self.coupon_list_url,
            data=self.create_coupon_data,
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data.get("non_field_errors")[0],
            "You cannot set both amount_off and percent_off.",
        )
        self.assertEqual(Coupon.objects.count(), 0)

    def test_create_coupon_with_allowed_customers(self):
        response = self.client.post(
            path=self.coupon_list_url,
            data={
                "code": "NEW_CODE",
                "amount_off": 500,
                "max_redemptions": 3,
                "allowed_customers": [self.customer.email],
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Coupon.objects.count(), 1)
        coupon = Coupon.objects.first()
        self.assertEqual(coupon.code, self.create_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.create_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.create_coupon_data.get("max_redemptions")
        )
        self.assertEqual(list(coupon.allowed_customers.all()), [self.customer])
        self.assertEqual(list(self.customer.coupons.all()), [coupon])

    def test_create_coupon_with_discounted_products(self):
        response = self.client.post(
            path=self.coupon_list_url,
            data={
                "code": "NEW_CODE",
                "amount_off": 500,
                "max_redemptions": 3,
                "discounted_products": [self.product.id],
            },
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Coupon.objects.count(), 1)
        coupon = Coupon.objects.first()
        self.assertEqual(coupon.code, self.create_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.create_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.create_coupon_data.get("max_redemptions")
        )

    def test_create_coupon_for_first_time_order(self):
        first_time_order_coupon_data = {
            "code": "CODE_FIRST_TIME",
            "amount_off": 500,
            "max_redemptions": 3,
            "first_time_order": True,
        }
        response = self.client.post(
            path=self.coupon_list_url,
            data=first_time_order_coupon_data,
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Coupon.objects.count(), 1)
        coupon = Coupon.objects.first()
        self.assertEqual(coupon.code, first_time_order_coupon_data.get("code"))
        self.assertEqual(
            coupon.amount_off, first_time_order_coupon_data.get("amount_off")
        )
        self.assertEqual(
            coupon.max_redemptions, first_time_order_coupon_data.get("max_redemptions")
        )
        self.assertTrue(coupon.first_time_order)

    def test_update_coupon_without_api_key(self):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data=self.update_coupon_data,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_coupon_with_api_key(self):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data=self.update_coupon_data,
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertTrue(coupon.first_time_order)

    def test_update_coupon_with_allowed_customers_but_coupon_had_no_allowed_customers_previously(
        self,
    ):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data={
                "code": "UPDATED_CODE",
                "amount_off": 1000,
                "max_redemptions": 5,
                "allowed_customers": [self.customer.email],
            },
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertEqual(list(coupon.allowed_customers.all()), [self.customer])
        self.assertEqual(list(self.customer.coupons.all()), [coupon])

    def test_update_coupon_with_allowed_customers_but_coupon_had_allowed_customers_previously(
        self,
    ):
        customer_2 = UserFactory(email="test_coupon_email@mail.com")
        coupon = CouponFactory(
            **self.create_coupon_data, allowed_customers=(customer_2,)
        )
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data={
                "code": "UPDATED_CODE",
                "amount_off": 1000,
                "max_redemptions": 5,
                "allowed_customers": [customer_2.email, self.customer.email],
            },
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertEqual(
            set(coupon.allowed_customers.all()), {self.customer, customer_2}
        )
        self.assertEqual(list(self.customer.coupons.all()), [coupon])
        self.assertEqual(list(customer_2.coupons.all()), [coupon])

    def test_update_coupon_with_allowed_customers_but_remove_one_customer(
        self,
    ):
        customer_2 = UserFactory(email="test_coupon_email@mail.com")
        coupon = CouponFactory(
            **self.create_coupon_data, allowed_customers=(customer_2, self.customer)
        )
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data={
                "code": "UPDATED_CODE",
                "amount_off": 1000,
                "max_redemptions": 5,
                "allowed_customers": [self.customer.email],
            },
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertEqual(set(coupon.allowed_customers.all()), {self.customer})
        self.assertEqual(list(self.customer.coupons.all()), [coupon])
        self.assertEqual(list(customer_2.coupons.all()), [])

    def test_update_coupon_with_discounted_products(
        self,
    ):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data={
                "code": "UPDATED_CODE",
                "amount_off": 1000,
                "max_redemptions": 5,
                "discounted_products": [self.product.id],
            },
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertEqual(list(coupon.discounted_products.all()), [self.product])
        self.assertEqual(list(self.product.coupons.all()), [coupon])

    def test_update_coupon_with_discounted_products_but_remove_one_product(
        self,
    ):
        product_2 = ProductFactory()
        coupon = CouponFactory(
            **self.create_coupon_data, discounted_products=(self.product, product_2)
        )
        response = self.client.patch(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            data={
                "code": "UPDATED_CODE",
                "amount_off": 1000,
                "max_redemptions": 5,
                "discounted_products": [self.product.id],
            },
            **{"HTTP_API_KEY": self.api_key},
        )
        coupon.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon.code, self.update_coupon_data.get("code"))
        self.assertEqual(coupon.amount_off, self.update_coupon_data.get("amount_off"))
        self.assertEqual(
            coupon.max_redemptions, self.update_coupon_data.get("max_redemptions")
        )
        self.assertEqual(list(coupon.discounted_products.all()), [self.product])
        self.assertEqual(list(self.product.coupons.all()), [coupon])

    def test_delete_coupon_without_api_key(self):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.delete(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id})
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Coupon.objects.count(), 1)

    def test_delete_coupon_with_api_key(self):
        coupon = CouponFactory(**self.create_coupon_data)
        response = self.client.delete(
            path=reverse("payment_new:coupon-detail", kwargs={"pk": coupon.id}),
            **{"HTTP_API_KEY": self.api_key},
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Coupon.objects.count(), 0)
