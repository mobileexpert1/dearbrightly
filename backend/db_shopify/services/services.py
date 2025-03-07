import binascii
import os
import shopify
import requests
import re
import math
import hmac
import hashlib
import base64

from django.conf import settings
from django.contrib.auth.models import Group
from django.utils import timezone, dateparse

from mail.services import MailService
from users.models import ShippingDetails
from users.models import User
from orders.models import Order, OrderItem, OrderProduct
from products.models import Product
from db_analytics.services import KlaviyoService
from orders.services.supply_chain_services import SupplyChainService
from typing import Optional, Tuple, List
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models import QuerySet

from rest_framework.exceptions import APIException, ValidationError

from db_shopify.serializers import (
    ShopifyCustomerSerializer,
    ShopifyOrderSerializer,
    ShopifyShippingDetailsSerializer,
    ShopifyOrderProductSerializer,
    ShopifyOrderItemSerializer,
)
from db_shopify.exceptions import InvalidDiscountCodeException, UnauthorizedWebhookException

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

shopify.Session.setup(api_key=settings.SHOPIFY_API_KEY, secret=settings.SHOPIFY_SECRET_KEY)
session = None

class ShopifyService:
    BASE_URL = f"https://{settings.SHOPIFY_SHOP_URL}/admin/api/{settings.SHOPIFY_API_VERSION}"

    @classmethod
    def authenticate(cls, request):
        try:
            state = binascii.b2a_hex(os.urandom(15)).decode("utf-8")
            redirect_uri = "https://be46-98-169-35-249.ngrok.io/api/v1/shopify/oauth-callback-handler"
            scopes = ['read_assigned_fulfillment_orders']

            #new_session = shopify.Session(shop_url, api_version)
            #auth_url = new_session.create_permission_url(scopes, redirect_uri, state)

            #logger.debug(f'[ShopifyService][authenticate] auth_url: {auth_url}.')
            # redirect to auth_url

            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)

        except shopify.api_version.VersionNotFoundError as error:
            logger.error(f'[ShopifyService][authenticate] VersionNotFoundError: {error}')

    @staticmethod
    def oauth_callback_handler(request):
        logger.debug(f'[ShopifyService][oauth_callback_handler] request: {request}.')

    @classmethod
    def get_shopify_cart_contents(cls, shopify_cart_id: str) -> Tuple[list, Optional[str]]:
        order_products = []
        discount_code = None
        discount = 0
        try:
            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)
            cart = shopify.Cart.find(shopify_cart_id)
        except Exception as error:
            logger.error(f"[ShopifyService][_get_shopify_cart_contents] Get shopify cart by id error: {error}")
            raise APIException("Unable to get shopify cart contents")
        else:
            if cart and hasattr(cart, "line_items"):
                for line_item in cart.line_items:
                    product = Product.objects.filter(sku=line_item.sku).last()
                    if product:
                        discounts = line_item.discounts[0] if line_item.discounts else None
                        discount_code = discounts.title if discounts else None
                        discount = float(discounts.amount) if discounts else None
                        frequency = cls.get_shopify_line_item_frequency(line_item_properties=line_item.properties)
                        order_products.append({
                            "quantity": line_item.quantity,
                            "product_uuid": str(product.uuid),
                            "frequency": frequency,
                        })
                logger.debug(
                    f"[ShopifyService][_get_shopify_cart_contents] "
                    f"Parsed shopify cart contents into list: {order_products}"
                )
        finally:
            shopify.ShopifyResource.clear_session()
        logger.debug(
            f"[ShopifyService][_get_shopify_cart_contents] "
            f"order_products: {order_products}. discount_code: {discount_code}. discount: {discount}.")
        return order_products, discount_code, int(discount*100) if discount else None

    @classmethod
    def get_shopify_line_item_frequency(cls, line_item_properties) -> int:
        interval_frequency = line_item_properties._frequency if hasattr(line_item_properties, "_frequency") else None
        interval_unit = line_item_properties._frequency_unit if hasattr(line_item_properties, "_frequency_unit") else None
        frequency = cls._get_frequency_in_months(
            interval_unit=interval_unit, interval_frequency=interval_frequency
        )
        return frequency

    @classmethod
    def get_shopify_line_item_frequency_from_webhook_data(cls, line_item_properties) -> int:
        interval_frequency = None
        interval_unit = None
        for prop in line_item_properties:
            if prop.get("name") == "_frequency":
                interval_frequency = prop.get("value")
            elif prop.get("name") == "_frequency_unit":
                interval_unit = prop.get("value")
        frequency = cls._get_frequency_in_months(
            interval_unit=interval_unit, interval_frequency=interval_frequency
        )
        return frequency

    @staticmethod
    def _get_frequency_in_months(
        interval_unit: Optional[str], interval_frequency: Optional[str]
    ) -> int:
        frequency = 0
        if interval_frequency and interval_unit:
            if isinstance(interval_frequency, str) and interval_frequency.isnumeric():
                interval_frequency = int(interval_frequency)
            frequency = interval_frequency
            if interval_unit == "day":
                frequency = round(interval_frequency / 30)
            elif interval_unit == "week":
                frequency = round(interval_frequency / 4)
        return frequency

    @classmethod
    def get_shopify_cart_contents_storefront(cls, shopify_cart_id: str) -> Tuple[list, Optional[str]]:
        order_products = []
        discount_code = None
        data = StorefrontService.get_cart(cart_id=shopify_cart_id)
        cart = data.get("cart") if data else None
        if cart:
            discount_codes = cart.get("discountCodes")
            discount_code = discount_codes[0].get("code") if discount_codes else None
            line_items = cart.get("lines").get("nodes") if cart.get("lines") else None
            if line_items:
                for line_item in line_items:
                    product = Product.objects.filter(sku=line_item.get("merchandise").get("sku")).last()
                    if product:
                        order_products.append({
                            "quantity": line_item.get("quantity"),
                            "product_uuid": str(product.uuid),
                            "frequency": line_item.get("frequency") if line_item.get("frequency") else 0,
                        })
                logger.debug(
                    f"[ShopifyService][_get_shopify_cart_contents_storefront] "
                    f"Parsed shopify cart contents into list: {order_products}"
                )
        else:
            logger.error(f"[StorefrontService][get_cart_contents_storefront] Cart is null")
            raise APIException("Unable to get shopify cart contents")
        return order_products, discount_code

    @classmethod
    def get_discount(cls, discount_code: str, order: Order, customer: User) -> dict:
        RETRIEVE_DISCOUNT_URL = f"{cls.BASE_URL}/discount_codes/lookup.json?code={discount_code}"
        RETRIEVE_DISCOUNT_HEADERS = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": settings.SHOPIFY_ACCESS_TOKEN,
        }
        try:
            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)
            response = requests.get(url=RETRIEVE_DISCOUNT_URL, headers=RETRIEVE_DISCOUNT_HEADERS)
            response.raise_for_status()
            discount_code_data = response.json()
            price_rule_id = (
                discount_code_data.get("discount_code").get("price_rule_id")
                if discount_code_data.get("discount_code") else None
            )
            price_rule = shopify.PriceRule.find(price_rule_id)

            entitled_order_products = None
            prerequisite_order_products = None
            if price_rule.target_selection == "entitled":
                shopify_product_ids = price_rule.entitled_product_ids + price_rule.prerequisite_product_ids
                shopify_product_ids_string = ",".join(map(str, shopify_product_ids))
                shopify_products = shopify.Product.find(ids=shopify_product_ids_string)

                entitled_product_uuids = cls.get_product_uuids_from_shopify_product_ids(
                    shopify_products=shopify_products, shopify_product_ids_to_return=price_rule.entitled_product_ids
                )
                prerequisite_product_uuids = cls.get_product_uuids_from_shopify_product_ids(
                    shopify_products=shopify_products, shopify_product_ids_to_return=price_rule.prerequisite_product_ids
                )
                prerequisite_order_products = order.order_products.filter(product__uuid__in=prerequisite_product_uuids)
                entitled_order_products = order.order_products.filter(product__uuid__in=entitled_product_uuids)
            elif price_rule.target_selection == "all":
                entitled_order_products = order.order_products.all()

        except Exception as error:
            logger.error(f"[ShopifyService][get_discount] Get shopify discount error: {error}")
            raise APIException("Unable to get discount code")
        else:
            cls._validate_discount_code(
                discount_code=discount_code,
                shopify_price_rule=price_rule,
                customer=customer,
                order=order,
                entitled_order_products=entitled_order_products,
                prerequisite_order_products=prerequisite_order_products,
                discount_code_data=discount_code_data,
            )
            amount_off, percent_off = cls._get_discount_value(
                price_rule=price_rule,
                entitled_order_products=entitled_order_products,
                prerequisite_order_products=prerequisite_order_products,
            )
            discount_details = {
                "discount_code": discount_code,
                "amount_off": amount_off,
                "percent_off": percent_off,
            }
        finally:
            shopify.ShopifyResource.clear_session()
        return discount_details

    @staticmethod
    def get_product_uuids_from_shopify_product_ids(shopify_products, shopify_product_ids_to_return) -> List:
        product_uuids = []
        if shopify_product_ids_to_return:
            products = [
                shopify_product for shopify_product in shopify_products
                if shopify_product.id in shopify_product_ids_to_return
            ]
            product_variants = [_product.variants for _product in products]
            product_variant_skus = [
                _product_variant.sku
                for sublist in product_variants
                for _product_variant in sublist
            ]
            product_uuids = [
                str(_product.uuid) for _product in list(map(
                    lambda sku: Product.objects.filter(sku=sku).last(),
                    product_variant_skus,
                )) if _product is not None
            ]
        return product_uuids

    @classmethod
    def _validate_discount_code(
        cls,
        discount_code: str,
        shopify_price_rule,
        customer: User,
        order: Order,
        entitled_order_products: "QuerySet[OrderProduct]",
        prerequisite_order_products: "QuerySet[OrderProduct]",
        discount_code_data: dict,
    ) -> None:
        cls._check_if_contains_entitled_products(
            discount_code=discount_code,
            entitled_order_products=entitled_order_products,
        )
        cls._check_if_code_active(
            discount_code=discount_code,
            starts_at=shopify_price_rule.starts_at,
            ends_at=shopify_price_rule.ends_at,
        )
        cls._check_discount_uses(
            discount_code=discount_code,
            usage_count=discount_code_data.get("usage_count"),
            shopify_price_rule=shopify_price_rule,
        )
        cls._check_prerequisite_quantity_range(
            shopify_price_rule=shopify_price_rule,
            entitled_order_products=entitled_order_products,
        )
        cls._check_prerequisite_subtotal_range(
            shopify_price_rule=shopify_price_rule,
            entitled_order_products=entitled_order_products,
        )
        cls._check_prerequisites_for_buy_x_get_y_discounts(
            shopify_price_rule=shopify_price_rule,
            prerequisite_order_products=prerequisite_order_products,
            entitled_order_products=entitled_order_products,
        )
        cls._check_prerequisite_customer_ids(
            discount_code=discount_code,
            shopify_price_rule=shopify_price_rule,
            customer=customer,
        )
        cls._check_once_per_customer(
            discount_code=discount_code,
            shopify_price_rule=shopify_price_rule,
            customer=customer,
            order=order,
        )

    @staticmethod
    def _check_if_contains_entitled_products(discount_code: str, entitled_order_products: "QuerySet[OrderProduct]") -> None:
        if not entitled_order_products:
            error_message = (
                f"No valid products in your cart for discount code: {discount_code}"
            )
            logger.error(
                f"[ShopifyService][_check_if_contains_entitled_products] {error_message}"
            )
            raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_if_code_active(discount_code: str, starts_at: str, ends_at: str) -> None:
        starts_at = dateparse.parse_datetime(starts_at) if starts_at else None
        ends_at = dateparse.parse_datetime(ends_at) if ends_at else None
        now = timezone.now()
        if (ends_at and not (starts_at <= now <= ends_at)) or (not ends_at and not (starts_at <= now)):
            error_message = (
                f"Discount code: {discount_code} is not active"
            )
            logger.error(
                f"[ShopifyService][_check_if_code_active] {error_message}"
            )
            raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_discount_uses(discount_code: str, usage_count: Optional[int], shopify_price_rule) -> None:
        if shopify_price_rule.usage_limit and usage_count and (
            usage_count >= shopify_price_rule.usage_limit
        ):
            error_message = (
                f"The limit of uses has been reached for discount code: {discount_code}"
            )
            logger.error(
                f"[ShopifyService][_check_discount_uses] {error_message}"
            )
            raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_prerequisite_subtotal_range(
        shopify_price_rule,
        entitled_order_products: "QuerySet[OrderProduct]",
    ) -> None:
        if shopify_price_rule.prerequisite_subtotal_range:
            subtotal = 0
            for order_product in entitled_order_products:
                    subtotal += order_product.price * order_product.quantity
            subtotal = subtotal / 100
            if not (
                subtotal >= float(shopify_price_rule.prerequisite_subtotal_range.greater_than_or_equal_to)
            ):
                error_message = (
                    f"Purchase amount does not qualify for discount"
                )
                logger.error(
                    f"[ShopifyService][_check_prerequisite_subtotal_range] {error_message}"
                )
                raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_prerequisite_quantity_range(
        shopify_price_rule,
        entitled_order_products: "QuerySet[OrderProduct]",
    ) -> None:
        if shopify_price_rule.prerequisite_quantity_range:
            quantity = 0
            for order_product in entitled_order_products:
                quantity += order_product.quantity
            if not (
                quantity >= shopify_price_rule.prerequisite_quantity_range.greater_than_or_equal_to
            ):
                error_message = (
                    f"Not enough items in your cart to qualify for discount"
                )
                logger.error(
                    f"[ShopifyService][_check_prerequisite_quantity_range] {error_message}"
                )
                raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_prerequisites_for_buy_x_get_y_discounts(
        shopify_price_rule,
        prerequisite_order_products: "QuerySet[OrderProduct]",
        entitled_order_products: "QuerySet[OrderProduct]",
    ) -> None:
        if shopify_price_rule.prerequisite_product_ids:
            if not prerequisite_order_products or not entitled_order_products:
                error_message = (
                    f"Not enough items in your cart to qualify for discount"
                )
                logger.error(
                    f"[ShopifyService][_check_prerequisites_for_buy_x_get_y_discounts] {error_message}"
                )
                raise InvalidDiscountCodeException(detail=error_message)
            elif (
                shopify_price_rule.prerequisite_to_entitlement_quantity_ratio
                and shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity
                and shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.entitled_quantity
            ):
                order_total_prerequisite_quantity = sum([order_product.quantity for order_product in prerequisite_order_products])
                order_total_entitled_quantity = sum([order_product.quantity for order_product in entitled_order_products])
                if (
                    order_total_prerequisite_quantity >= shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity
                    and order_total_entitled_quantity >= shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.entitled_quantity
                ):
                    return
                error_message = (
                    f"Not enough items in your cart to qualify for discount"
                )
                logger.error(
                    f"[ShopifyService][_check_prerequisites_for_buy_x_get_y_discounts] {error_message}"
                )
                raise InvalidDiscountCodeException(detail=error_message)
            elif shopify_price_rule.prerequisite_to_entitlement_purchase:
                subtotal = sum([order_product.price for order_product in prerequisite_order_products])
                if (subtotal / 100) < float(shopify_price_rule.prerequisite_to_entitlement_purchase.prerequisite_amount):
                    error_message = (
                        f"Purchase amount of prerequisite products does not qualify for discount"
                    )
                    logger.error(
                        f"[ShopifyService][_check_prerequisite_product_ids] {error_message}"
                    )
                    raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_prerequisite_customer_ids(
        discount_code: str,
        shopify_price_rule,
        customer: User,
    ) -> None:
        if shopify_price_rule.customer_selection == "prerequisite":
            customer_shopify_user_id = customer.shopify_user_id
            if (not customer_shopify_user_id
                or (
                    shopify_price_rule.prerequisite_customer_ids
                    and not (int(customer_shopify_user_id) in shopify_price_rule.prerequisite_customer_ids)
                )
                or (
                    shopify_price_rule.customer_segment_prerequisite_ids
                    and not (int(customer_shopify_user_id) in shopify_price_rule.customer_segment_prerequisite_ids)
                )
            ):
                error_message = (
                    f"Account is not entitled for discount code: {discount_code}"
                )
                logger.error(
                    f"[ShopifyService][_check_prerequisite_customer_ids] {error_message}"
                )
                raise InvalidDiscountCodeException(detail=error_message)

    @staticmethod
    def _check_once_per_customer(
        discount_code: str,
        shopify_price_rule,
        customer: User,
        order: Order,
    ) -> None:
        if (
            shopify_price_rule.once_per_customer
            and customer.orders.filter(discount_code=discount_code).exclude(id=order.id).exists()
        ):
            error_message = (
                f"Discount code: {discount_code} has already been used on this account"
            )
            logger.error(
                f"[ShopifyService][_check_once_per_customer] {error_message}"
            )
            raise InvalidDiscountCodeException(detail=error_message)

    @classmethod
    def _get_discount_value(
        cls,
        price_rule,
        entitled_order_products: "QuerySet[OrderProduct]",
        prerequisite_order_products: "QuerySet[OrderProduct]",
    ) -> Tuple[float, float]:
        amount_off = abs(
            cls._convert_to_positive_integer(value=price_rule.value)
        ) if price_rule.value_type == "fixed_amount" else 0
        percent_off = int(abs(float(price_rule.value))) if price_rule.value_type == "percentage" else 0
        if price_rule.allocation_method == "each":
            if amount_off > 0:
                amount_off = cls._calculate_amount_off_of_discounted_products_applied_to_each_product(
                    shopify_price_rule=price_rule,
                    entitled_order_products=entitled_order_products,
                    prerequisite_order_products=prerequisite_order_products,
                    amount_off=amount_off,
                )
            elif percent_off > 0:
                amount_off = cls._calculate_amount_off_for_percent_off_of_discounted_products_applied_to_each_product(
                    shopify_price_rule=price_rule,
                    entitled_order_products=entitled_order_products,
                    prerequisite_order_products=prerequisite_order_products,
                    percent_off=percent_off,
                )
                percent_off = 0
        elif price_rule.allocation_method == "across":
            if percent_off > 0:
                amount_off = cls._calculate_amount_off_for_percent_off_of_discounted_products_applied_across_all_products(
                    entitled_order_products=entitled_order_products,
                    percent_off=percent_off,
                )
                percent_off = 0
        return amount_off, percent_off

    @classmethod
    def _calculate_amount_off_of_discounted_products_applied_to_each_product(
        cls,
        shopify_price_rule,
        entitled_order_products: "QuerySet[OrderProduct]",
        prerequisite_order_products: "QuerySet[OrderProduct]",
        amount_off: int,
    ) -> int:
        total_amount_off = 0
        entitled_quantity = cls._get_entitled_quantity(
            prerequisite_order_products=prerequisite_order_products,
            entitled_order_products=entitled_order_products,
            shopify_price_rule=shopify_price_rule,
        )
        for order_product in entitled_order_products:
            quantity = min(entitled_quantity, order_product.quantity)
            total_amount_off += amount_off * quantity
            entitled_quantity -= quantity
            if entitled_quantity <= 0:
                break
        return total_amount_off

    @classmethod
    def _calculate_amount_off_for_percent_off_of_discounted_products_applied_to_each_product(
        cls,
        shopify_price_rule,
        entitled_order_products: "QuerySet[OrderProduct]",
        prerequisite_order_products: "QuerySet[OrderProduct]",
        percent_off: int,
    ) -> int:
        amount_off = 0
        entitled_quantity = cls._get_entitled_quantity(
            prerequisite_order_products=prerequisite_order_products,
            entitled_order_products=entitled_order_products,
            shopify_price_rule=shopify_price_rule,
        )
        for order_product in entitled_order_products:
            quantity = min(entitled_quantity, order_product.quantity)
            amount_off += (int(order_product.price * percent_off / 100) * quantity)
            entitled_quantity -= quantity
            if entitled_quantity <= 0:
                break
        return amount_off

    @staticmethod
    def _calculate_amount_off_for_percent_off_of_discounted_products_applied_across_all_products(
        entitled_order_products: "QuerySet[OrderProduct]",
        percent_off: int,
    ) -> int:
        subtotal = 0
        for order_product in entitled_order_products:
            subtotal += order_product.price * order_product.quantity
        amount_off = int(subtotal * percent_off / 100)
        return amount_off

    @staticmethod
    def _get_entitled_quantity(
        prerequisite_order_products: "QuerySet[OrderProduct]",
        entitled_order_products: "QuerySet[OrderProduct]",
        shopify_price_rule,
    ) -> int:
        order_total_quantity = sum([order_product.quantity for order_product in entitled_order_products])
        if (
            prerequisite_order_products
            and shopify_price_rule.prerequisite_to_entitlement_quantity_ratio
            and shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.entitled_quantity
            and shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity
        ):
            order_total_prerequisite_quantity = sum([order_product.quantity for order_product in prerequisite_order_products])
            max_entitled_quantity = int(math.floor(
                order_total_prerequisite_quantity / shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity
            ) * shopify_price_rule.prerequisite_to_entitlement_quantity_ratio.entitled_quantity)
            entitled_quantity = min(order_total_quantity, max_entitled_quantity)
        else:
            entitled_quantity = order_total_quantity
        return entitled_quantity

    @staticmethod
    def _get_customer_id_by_email(email: str) -> int:
        try:
            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)
            customer = shopify.Customer.find(email=email)
        except Exception as error:
            logger.error(f"[ShopifyService][_get_customer_id_by_email] Get customer id by email error: {error}")
            raise APIException("Unable to retrieve Shopify customer")
        else:
            if customer and customer[0]:
                return customer[0].id
        finally:
            shopify.ShopifyResource.clear_session()

    def get_orders(request):
        ShopifyService.authenticate(request)
        #shop = shopify.Shop.current()  # Get the current shop
        orders = shopify.Order.find()
        logger.debug(f'[ShopifyService][get_orders] orders: {orders}.')

    @classmethod
    def get_shopify_product_variant_id(cls, product_sku: str) -> int:
        try:
            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)
            products = shopify.Product.find(fields=["variants"])
        except Exception as error:
            error_message = f"Unable to retrieve shopify products"
            logger.error(
                f"[ShopifyService][get_shopify_product_variant_id] "
                f"{error_message} with error: {error}"
            )
            raise APIException(error_message)
        else:
            for product in products:
                for product_variant in product.variants:
                    if product_variant.sku == product_sku:
                        return product_variant.id
            logger.error(f"[ShopifyService][get_shopify_product_variant_id] Shopify product: {product_sku} not found")
            raise APIException("Product not found")
        finally:
            shopify.ShopifyResource.clear_session()

    @receiver(post_save, sender=Order)
    def order_status_update_handler(sender, instance, **kwargs):
        if kwargs.get("raw", True):
            return
        original_status = instance.get_original_status()
        if (
            int(instance.status) == Order.Status.shipped
            and int(original_status) != Order.Status.shipped
            and instance.is_shopify_order
        ):
            ShopifyService.create_order_fulfillment(order=instance)

    @classmethod
    def create_order_fulfillment(cls, order: Order) -> None:
        CREATE_FULFILLMENT_URL = f"{cls.BASE_URL}/fulfillments.json"
        CREATE_FULFILLMENT_HEADERS = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": settings.SHOPIFY_ACCESS_TOKEN,
        }
        try:
            session = shopify.Session(settings.SHOPIFY_SHOP_URL, settings.SHOPIFY_API_VERSION, settings.SHOPIFY_ACCESS_TOKEN)
            shopify.ShopifyResource.activate_session(session)

            fulfillment_order = shopify.FulfillmentOrders.find(order_id=order.shopify_order_id)[0]
            fulfillment_order_line_items = [{"id": item.id, "quantity": item.quantity} for item in fulfillment_order.line_items]
            line_items_by_fulfillment_order = [{
                "fulfillment_order_id": fulfillment_order.id,
                "fulfillment_order_line_items": fulfillment_order_line_items,
            }]
            response = requests.post(
                url=CREATE_FULFILLMENT_URL,
                headers=CREATE_FULFILLMENT_HEADERS,
                json={
                    "fulfillment": {
                        "order_id": order.shopify_order_id,
                        "line_items_by_fulfillment_order": line_items_by_fulfillment_order,
                        "notify_customer": False,
                        "tracking_info": {
                            "company": order.shipping_carrier,
                            "number": order.tracking_number,
                            "url": order.tracking_uri,
                        },
                    }
                },
            )
            response.raise_for_status()
            logger.debug(
                f"[ShopifyService][create_order_fulfillment] "
                f"Created fulfillment for order ID: {order.id} Shopify order ID: {order.shopify_order_id}."
            )
        except Exception as error:
            logger.error(
                f"[ShopifyService][create_order_fulfillment] "
                f"Unable to create order fulfillment for order ID: {order.id} Shopify order ID: {order.shopify_order_id} "
                f"with error: {error}.")
        finally:
            shopify.ShopifyResource.clear_session()

    @staticmethod
    def verify_webhook(data, hmac_header):
        digest = hmac.new(settings.SHOPIFY_WEBHOOK_KEY.encode("utf-8"), data, digestmod=hashlib.sha256).digest()
        computed_hmac = base64.b64encode(digest)
        return hmac.compare_digest(computed_hmac, hmac_header.encode("utf-8"))

    @classmethod
    def order_created_webhook_handler(cls, request):
        if not cls.verify_webhook(data=request.body, hmac_header=request.META.get("HTTP_X_SHOPIFY_HMAC_SHA256")):
            logger.error(
                f"[ShopifyService][order_created_webhook_handler] "
                f"Webhook hmac verification failed for request: {request.data}."
            )
            raise UnauthorizedWebhookException()
        
        shopify_webhook_dict = request.data
        logger.debug(f"[ShopifyService][order_created_webhook_handler] request: {shopify_webhook_dict}.")
        
        shopify_order_id = shopify_webhook_dict.get("id") if shopify_webhook_dict else None
        customer_data = shopify_webhook_dict.get("customer") if shopify_webhook_dict else None
        shipping_address_data = shopify_webhook_dict.get("shipping_address") if shopify_webhook_dict else None
        billing_address_data = shopify_webhook_dict.get("billing_address") if shopify_webhook_dict else None

        order = Order.objects.filter(
            shopify_order_id=shopify_order_id
        )

        if order:
            logger.debug(f"[ShopifyService][order_created_webhook_handler] Shopify order {shopify_order_id} already created.")
            return

        try:
            customer = cls._update_or_create_customer(customer_data=customer_data)

            order_shipping_details = cls._create_shipping_details(
                shipping_details_data=shipping_address_data,
            )
            customer_shipping_details = order_shipping_details
            customer_full_name = cls._get_customer_full_name(
                first_name=customer_data.get("first_name"),
                last_name=customer_data.get("last_name"),
            )
            if customer_full_name and shipping_address_data.get("name") != customer_full_name:
                customer_shipping_details = cls._create_shipping_details(
                    shipping_details_data=billing_address_data,
                )

            if not customer.shipping_details:
                customer.shipping_details = customer_shipping_details
                customer.save(update_fields=["shipping_details"])

            order = cls._create_shopify_order(
                customer=customer,
                shipping_details=order_shipping_details,
                shopify_webhook_dict=shopify_webhook_dict,
            )
            SupplyChainService().submit_order_smart_warehouse(order)
            KlaviyoService().identify(user=customer)
            KlaviyoService().track_placed_non_recurring_order_event(order=order)
        except ValidationError as error:
            customer = customer.id if customer else customer_data.get('id')
            error_msg = f"{shopify_webhook_dict}. User: {customer}. Validation error: {error}."
            logger.error(error_msg)
            MailService.send_error_notification_email(notification='SHOPIFY ORDER WEBHOOK ERROR', data=error_msg)

    @classmethod
    def _update_or_create_customer(cls, customer_data: dict) -> User:
        customer_data["opt_in_sms_app_notifications"] = cls._get_opt_in_sms_app_notifications(
            sms_marketing_consent=customer_data.get("sms_marketing_consent"),
        )
        serializer = ShopifyCustomerSerializer(data=customer_data)
        serializer.is_valid(raise_exception=True)
        validated_customer_data = serializer.validated_data
        customer = cls._get_user(customer_data=validated_customer_data)
        if not customer:
            customer = User.objects.create_user(**validated_customer_data)
            customer_group, created = Group.objects.get_or_create(name='Customers')
            customer.groups.add(customer_group)
            logger.debug(f"[ShopifyService][_update_or_create_customer] New customer with shopify ID: {customer.shopify_user_id} created")
        else:
            if not customer.first_name:
                customer.first_name = validated_customer_data.get("first_name")
            if not customer.last_name:
                customer.last_name = validated_customer_data.get("last_name")
            if not customer.opt_in_sms_app_notifications:
                customer.opt_in_sms_app_notifications = validated_customer_data.get("opt_in_sms_app_notifications")
            customer.save()
            logger.debug(f"[ShopifyService][_update_or_create_customer] Customer with shopify ID: {customer.shopify_user_id} updated")
        return customer

    @classmethod
    def _create_shipping_details(cls, shipping_details_data: Optional[dict]) -> ShippingDetails:
        if shipping_details_data:
            shipping_details_data = cls._prepare_shipping_details_data(
                shipping_details_data=shipping_details_data,
            )
        else:
            shipping_details_data = None
        serializer = ShopifyShippingDetailsSerializer(data=shipping_details_data)
        serializer.is_valid(raise_exception=True)
        shipping_details = serializer.save()
        logger.debug(f"[ShopifyService][_create_shipping_details] New shipping details with ID: {shipping_details.pk} created")
        return shipping_details

    @classmethod
    def _create_shopify_order(
        cls,
        customer: User,
        shipping_details: ShippingDetails,
        shopify_webhook_dict: dict,
    ) -> Order:
        serializer = ShopifyOrderSerializer(
            data=cls._get_order_fields(
                customer=customer,
                shipping_details=shipping_details,
                shopify_webhook_dict=shopify_webhook_dict,
                )
            )
        serializer.is_valid(raise_exception=True)
        order = Order.objects.create(**serializer.validated_data)
        cls._parse_line_items(
            line_items=shopify_webhook_dict.get("line_items"),
            order=order,
        )
        order.save()
        order.update_order_item_discount()
        logger.debug(f"[ShopifyService][_create_shopify_order] New order with ID: {order.shopify_order_id} created")
        return order

    @classmethod
    def _parse_line_items(cls, line_items: dict, order: Order) -> None:
        for line_item in line_items:
            product = Product.objects.filter(sku=line_item.get("sku")).last()
            if not product:
                error_msg = f"{line_item}. Customer: {order.customer.id}. Order: {order.id}. Product with SKU does not exist: {line_item.get('sku')}"
                logger.error(error_msg)
                MailService.send_error_notification_email(notification='SHOPIFY ORDER PARSING ERROR', data=error_msg)
            if product:
                shopify_order_product_serializer = ShopifyOrderProductSerializer(
                    data={
                        "order": order.pk,
                        "product": product.pk,
                        "quantity": line_item.get("quantity"),
                        "frequency": cls.get_shopify_line_item_frequency_from_webhook_data(
                            line_item_properties=line_item.get("properties")
                        )
                    }
                )
                shopify_order_product_serializer.is_valid(raise_exception=True)
                order_product = OrderProduct.objects.create(**shopify_order_product_serializer.validated_data)
                products = product.get_all_products()
                order_product_tax_rate = line_item.get("tax_lines")[0].get("rate") if line_item.get("tax_lines") else 0
                order_product_tax = line_item.get("tax_lines")[0].get("price") if line_item.get("tax_lines") else 0
                order_product_tax = cls._convert_to_positive_integer(value=order_product_tax) if order_product_tax else 0
                for _product in products:
                    if _product.product_type == Product.Type.otc:
                        order_item_tax_rate = order_product_tax_rate
                        order_item_tax = order_product_tax
                    else:
                        order_item_tax_rate = 0
                        order_item_tax = 0
                    shopify_order_item_serializer = ShopifyOrderItemSerializer(
                        data={
                            "order": order.pk,
                            "product": _product.pk,
                            "order_product": order_product.pk,
                            "tax_rate": order_item_tax_rate,
                            "tax": order_item_tax,
                        }
                    )
                    shopify_order_item_serializer.is_valid(raise_exception=True)
                    order_item = OrderItem.objects.create(**shopify_order_item_serializer.validated_data)
                    
    @classmethod
    def _get_order_fields(
        cls,
        customer: User,
        shipping_details: ShippingDetails,
        shopify_webhook_dict: dict,
    ) -> dict:
        shopify_order_id = shopify_webhook_dict.get("id")
        _shipping_fee_shop_money = shopify_webhook_dict.get(
            "total_shipping_price_set",
        ).get(
            "shop_money",
        ) if shopify_webhook_dict.get("total_shipping_price_set") else None
        shipping_fee = _shipping_fee_shop_money.get("amount") if _shipping_fee_shop_money else None
        shipping_fee = cls._convert_to_positive_integer(value=shipping_fee) if shipping_fee else 0
        discount_codes = shopify_webhook_dict.get("discount_codes")
        discount_code = cls._get_discount_codes_string(discount_codes=discount_codes)
        discount = shopify_webhook_dict.get("total_discounts")
        discount = cls._convert_to_positive_integer(value=discount) if discount else 0
        tax = shopify_webhook_dict.get("total_tax")
        tax = cls._convert_to_positive_integer(value=tax) if tax else 0
        purchased_datetime = shopify_webhook_dict.get("processed_at")
        payment_captured_datetime = purchased_datetime
        return {
            "customer": customer.pk,
            "shipping_details": shipping_details.pk,
            "shopify_order_id": shopify_order_id,
            "shipping_fee": shipping_fee,
            "discount": discount,
            "discount_code": discount_code,
            "tax": tax,
            "purchased_datetime": purchased_datetime,
            "payment_captured_datetime": payment_captured_datetime,
            "status": Order.Status.payment_complete,
        }

    @staticmethod
    def _get_user(customer_data: dict) -> Optional[User]:
        customer_shopify_id = customer_data.get("shopify_user_id")
        customer_email = customer_data.get("email")
        try:
            user = User.objects.get(shopify_user_id=customer_shopify_id) if customer_shopify_id else None
        except User.DoesNotExist:
            user = None
        if customer_email and not user:
            try:
                user = User.objects.get(email=customer_email)
                user.shopify_user_id = customer_shopify_id
                user.save(update_fields=["shopify_user_id"])
            except User.DoesNotExist:
                user = None
        return user

    @staticmethod
    def _prepare_shipping_details_data(shipping_details_data: dict) -> dict:
        for key, value in shipping_details_data.items():
            if value == "NULL":
                shipping_details_data[key] = None
        phone_number = shipping_details_data.get("phone")
        if phone_number:
            shipping_details_data["phone"] = ShopifyShippingDetailsSerializer.clean_phone_number(phone_number=phone_number)
        if shipping_details_data["zip"]:
            shipping_details_data["zip"] = shipping_details_data["zip"][:5]
        return shipping_details_data


    @staticmethod
    def _convert_to_positive_integer(value: str) -> int:
        try:
            value = float(value)
            value = int(value * 100)
        except ValueError as error:
            raise ValidationError(detail=error)
        return value

    @staticmethod
    def _get_discount_codes_string(discount_codes: Optional[list]) -> Optional[str]:
        if discount_codes:
            discount_codes = [discount_code.get("code") for discount_code in discount_codes]
            return ",".join(discount_codes)
        else:
            return None

    @staticmethod
    def _get_opt_in_sms_app_notifications(sms_marketing_consent: dict) -> bool:
        if sms_marketing_consent and isinstance(sms_marketing_consent, dict):
            state = sms_marketing_consent.get("state")
            if state == "subscribed":
                return True
        return False

    def _get_customer_full_name(first_name: Optional[str], last_name: Optional[str]) -> Optional[str]:
        if first_name and last_name:
            return f"{first_name} {last_name}"
        if first_name:
            return first_name
        if last_name:
            return last_name
        return None

class StorefrontService:
    URL = f"https://{settings.SHOPIFY_SHOP_URL}/api/{settings.SHOPIFY_API_VERSION}/graphql.json"
    HEADERS = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Shopify-Storefront-Private-Token": settings.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
    }

    @classmethod
    def run_query(cls, query, variables):
        response = requests.post(
            url=cls.URL,
            headers=cls.HEADERS,
            json={"query": query, "variables": variables},
        )
        response.raise_for_status()
        return response.json()

    @classmethod
    def get_cart(cls, cart_id: str) -> dict:
        query = '''
            query GetCart($cartId: ID!) {
                cart(id: $cartId) {
                    discountCodes {
                        code
                    }
                    lines(first: 10) {
                        nodes {
                            merchandise {
                                ... on ProductVariant {
                                    sku
                                }
                            }
                            quantity
                        }
                    }
                }
            }
        '''
        variables = {"cartId": cart_id}
        try:
            response = cls.run_query(query=query, variables=variables)
        except Exception as error:
            logger.error(f"[StorefrontService][get_cart] Get shopify cart by id error: {error}")
            raise APIException("Unable to get shopify cart contents")
        return response.get("data")
