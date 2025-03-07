from requests.exceptions import RequestException, HTTPError
from rest_framework.exceptions import APIException
from utils.logger_utils import logger
from django.conf import settings
from typing import List, Optional, Tuple
from subscriptions.models import Subscription
from users.models import User
from orders.models import Order
from products.models import Product
from db_shopify.serializers import (
    RechargeSubscriptionSerializer,
    ShopifyShippingDetailsSerializer
)
from users.serializers import ShippingDetailsSerializer, PaymentDetailsSerializer
from db_shopify.services.services import ShopifyService
from django.db.models import QuerySet
from db_shopify.exceptions import SubscriptionUpdateException
from localflavor.us.us_states import STATE_CHOICES
from django.db import transaction
import requests
import json
from django.db.models import Q


class RechargeSubscriptionService:
    HEADERS = {
        "Content-Type": "application/json",
        "X-Recharge-Version": settings.RECHARGE_API_VERSION,
        "X-Recharge-Access-Token": settings.RECHARGE_API_TOKEN,
    }

    @classmethod
    def parse_recharge_user_id(cls, user: User) -> Optional[User]:
        recharge_customer = None
        try:
            recharge_customer = cls.get_customer_request(email=user.email)
        except APIException as error:
            logger.error(
                f"[RechargeSubscriptionService][parse_recharge_user_id] "
                f"Unable to retrieve recharge user with error: {error}"
            )

        if recharge_customer:
            user.recharge_user_id = recharge_customer.get("id")
            user.save(update_fields=["recharge_user_id"])
            logger.debug(
                f"[RechargeSubscriptionService][parse_recharge_user_id] "
                f"Customer ID: {user.id} " 
                f"Recharge Customer ID: {user.recharge_user_id} "
            )
            return user
        else:
            logger.error(
                f"[RechargeSubscriptionService][parse_recharge_user_id] "
                f"Recharge customer not found for user ID: {user.id}"
            )
            return user
    
    @classmethod
    def update_subscription_with_recharge_subscription_data(cls, user: User, order: Order) -> None:
        try:
            subscriptions = cls.retrieve_subscriptions_request(
                recharge_user_id=user.recharge_user_id,
            )
        except APIException as error:
            error_message = f"Unable to retrieve recharge subscriptions"
            logger.error(
                f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
                f"{error_message} for customer: {user.id} with error: {error}"
            )
            raise APIException(error_message)
        # logger.debug(
        #     f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
        #     f"subscriptions: {subscriptions}"
        # )
        for recharge_subscription in subscriptions:
            product = Product.objects.filter(sku=recharge_subscription.get("sku")).last()

            # logger.debug(
            #     f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
            #     f"recharge_subscription: {recharge_subscription}. product: {product.id}"
            # )

            if product and recharge_subscription.get("status") == "active":
                try:
                    recharge_address = cls.get_address_request(
                        recharge_address_id=recharge_subscription.get("address_id")
                    )
                except APIException as error:
                    error_message = f"Unable to retrieve shipping address"
                    logger.error(
                        f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
                        f"{error_message} for customer: {user.id} with error: {error}"
                    )
                    raise APIException(error_message)

                subscription_data = {
                    "recharge_subscription_id": recharge_subscription.get("id"),
                    "recharge_address_id": recharge_subscription.get("address_id"),
                    "shipping_details": cls._map_recharge_address_to_shipping_details(
                        recharge_address=recharge_address.get("address")
                    ),
                    "recharge_payment_method_id": recharge_address.get("address").get("payment_method_id"),
                    "quantity": recharge_subscription.get("quantity"),
                    "frequency": ShopifyService._get_frequency_in_months(
                        interval_unit=recharge_subscription.get("order_interval_unit"),
                        interval_frequency=recharge_subscription.get("order_interval_frequency"),
                    ),
                    "is_active": True,
                    "current_period_start_datetime": recharge_subscription.get("next_charge_scheduled_at"),
                    "current_period_end_datetime": recharge_subscription.get("next_charge_scheduled_at"),
                    "product": product.pk,
                    "customer": user.pk,
                }
                with transaction.atomic():
                    subscription = user.subscriptions.filter(Q(recharge_subscription_id=recharge_subscription.get("id")) |
                                                             (Q(product=product) & Q(payment_processor_card_id__isnull=True))).last()
                    order_item = order.order_items.filter(product=product).last() if order else None
                    if not subscription:
                        serializer = RechargeSubscriptionSerializer(data=subscription_data)
                        serializer.is_valid(raise_exception=True)
                        subscription = serializer.save()
                        logger.debug(
                            f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
                            f"Recharge Subscription ID: {subscription.recharge_subscription_id} "
                            f"Subscription ID: {subscription.id} "
                            f"Customer ID: {user.id}"
                        )
                    else:
                        serializer = RechargeSubscriptionSerializer(subscription, data=subscription_data, partial=True)
                        serializer.is_valid(raise_exception=True)
                        serializer.save()
                        logger.debug(
                            f"[RechargeSubscriptionService][update_subscription_with_recharge_subscription_data] "
                            f"Recharge Subscription ID: {subscription.recharge_subscription_id} "
                            f"Updated Subscription ID: {subscription.id} "
                            f"Customer ID: {user.id}"
                        )
                    if order_item:
                        order_item.subscription = subscription
                        order_item.save(update_fields=['subscription'])

    @staticmethod
    def _map_shipping_details_to_recharge_address(shipping_details: dict) -> dict:
        return {
            "first_name": shipping_details.get("first_name"),
            "last_name": shipping_details.get("last_name"),
            "address1": shipping_details.get("address_line1"),
            "address2": shipping_details.get("address_line2"),
            "city": shipping_details.get("city"),
            "country_code": shipping_details.get("country") if shipping_details.get("country") else "US",
            "province": shipping_details.get("state"),
            "zip": shipping_details.get("postal_code"),
            "phone": shipping_details.get("phone"),
        }

    @staticmethod
    def _map_recharge_address_to_shipping_details(recharge_address: dict) -> dict:
        return {
            "first_name": recharge_address.get("first_name"),
            "last_name": recharge_address.get("last_name"),
            "address_line1": recharge_address.get("address1"),
            "address_line2": recharge_address.get("address2"),
            "city": recharge_address.get("city"),
            "country": recharge_address.get("country_code"),
            "state": RechargeSubscriptionService._get_province_code(
                province=recharge_address.get("province")
            ),
            "postal_code": recharge_address.get("zip"),
            "phone": ShopifyShippingDetailsSerializer.clean_phone_number(phone_number=recharge_address.get("phone"))
        }

    @staticmethod
    def _get_province_code(province: str) -> str:
        if len(province) == 2:
            return province.upper()
        else:
            state_dict = {state[1]: state[0] for state in STATE_CHOICES}
            state_abbreviation = state_dict.get(province)
            return state_abbreviation

    @classmethod
    def update_recharge_address(
        cls, recharge_address_id: int, shipping_details_data: dict, customer_id: int
    ) -> None:
        shipping_details_serializer = ShippingDetailsSerializer(data=shipping_details_data)
        shipping_details_serializer.is_valid(raise_exception=True)
        try:
            response = cls.update_address_request(
                recharge_address_id=recharge_address_id,
                address_data=cls._map_shipping_details_to_recharge_address(
                    shipping_details=shipping_details_serializer.validated_data
                ),
            )
        except APIException as error:
            error_message = f"Unable to update shipping details. "
            if error.detail:
                error_message += error.detail
            logger.error(
                f"[RechargeSubscriptionService][update_recharge_address] "
                f"{error_message} with error: {error} "
                f"for Customer ID: {customer_id}"
            )
            raise SubscriptionUpdateException(detail=error_message)
        logger.debug(
            f"[RechargeSubscriptionService][update_recharge_address] "
            f"Recharge address ID: {recharge_address_id} updated for Customer ID: {customer_id}"
        )
        recharge_address_data = response.get("address")
        shipping_details_data = cls._map_recharge_address_to_shipping_details(
            recharge_address=recharge_address_data
        )
        return {
            "id": recharge_address_data.get("id"),
            "shipping_details": ShippingDetailsSerializer(shipping_details_data).data
        }
    
    @staticmethod
    def _get_frequency_in_months(interval_unit: str, interval_frequency: int) -> int:
        frequency = interval_frequency
        if interval_unit == "day":
            frequency = round(interval_frequency / 30)
        elif interval_unit == "week":
            frequency = round(interval_frequency / 4)
        return frequency

    @classmethod
    def update_subscription(cls, subscription: Subscription, validated_data: dict) -> None:
        data = {**validated_data}
        if subscription.is_active == True and validated_data.get("is_active") == False:
            data.update({"status": "cancelled"})
        elif subscription.is_active == False and validated_data.get("is_active") == True:
            data.update({"status": "active"})
        try:
            cls.update_subscription_request(
                recharge_subscription_id=subscription.recharge_subscription_id,
                **data,
            )
            logger.debug(
                f"[RechargeSubscriptionService][update_subscription] "
                f"Recharge subscription ID: {subscription.recharge_subscription_id} updated"
            )
            new_current_period_end_datetime = validated_data.get("current_period_end_datetime")
            if new_current_period_end_datetime and new_current_period_end_datetime != subscription.current_period_end_datetime:
                cls.change_charge_date_request(
                    recharge_subscription_id=subscription.recharge_subscription_id,
                    set_charge_date=str(new_current_period_end_datetime.date()),
                )
                logger.debug(
                    f"[RechargeSubscriptionService][update_subscription] "
                    f"Recharge subscription ID: {subscription.recharge_subscription_id} charge date updated"
                )
        except APIException as error:
            logger.error(
                f"[RechargeSubscriptionService][update_subscription] "
                f"Unable to update subscription with error: {error} "
                f"for Customer ID: {subscription.customer.id}"
            )
            raise SubscriptionUpdateException()

    @classmethod
    def create_subscription(cls, user: User, validated_data: dict, recharge_address_id: str) -> Tuple[int, int]:
        product_uuid = validated_data.get("product").get("uuid")
        try:
            product = Product.objects.get(uuid=product_uuid)
        except Product.DoesNotExist:
            logger.error(f"[RechargeSubscriptionService][create_subscription] product: {product_uuid} not found")
            raise APIException("Unable to create subscription")
        shopify_product_variant_id = ShopifyService.get_shopify_product_variant_id(product_sku=product.sku)
        next_charge_scheduled_at = validated_data.get("current_period_end_datetime")
        subscription_data = {
            "address_id": recharge_address_id,
            "charge_interval_frequency": 30 * validated_data.get("frequency"),
            "next_charge_scheduled_at": str(next_charge_scheduled_at.date()),
            "order_interval_frequency": 30 * validated_data.get("frequency"),
            "order_interval_unit": "day",
            "quantity": validated_data.get("quantity"),
            "external_variant_id": {"ecommerce": str(shopify_product_variant_id)},
            "sku": product.sku,
        }
        try:
            response = RechargeSubscriptionService.create_subscription_request(subscription_data=subscription_data)
        except APIException as error:
            logger.error(f"[RechargeSubscriptionService][create_subscription] {error}")
            raise APIException("Unable to create subscription")
        subscription_id = response.get("subscription").get("id")
        logger.debug(
            f"[RechargeSubscriptionService][create_subscription] "
            f"Recharge Subscription ID: {subscription_id} created "
            f"For customer ID: {user.id}"
        )
        return subscription_id

    @classmethod
    def bundle_customer_shopify_subscription_dates(
        cls,
        latest_current_period_end_datetime,
        shopify_subscriptions_to_bundle: List[Subscription],
    ) -> None:
        for subscription in shopify_subscriptions_to_bundle:
            try:
                cls.change_charge_date_request(
                    recharge_subscription_id=subscription.recharge_subscription_id,
                    set_charge_date=str(latest_current_period_end_datetime.date()),
                )
            except APIException as error:
                error_message = f"Unable to bundle recharge subscriptions with error: {error}"
                logger.error(f"[RechargeSubscriptionService][bundle_customer_shopify_subscription_dates] {error_message}")
                raise APIException(error_message)
            else:
                subscription.current_period_end_datetime = latest_current_period_end_datetime
                subscription.save(update_fields=["current_period_end_datetime"])

    @classmethod
    def get_customer_payment_methods(cls, recharge_user_id: int) -> dict:
        try:
            response = cls.list_payments_request(
                customer_id=recharge_user_id
            )
        except APIException as error:
            error_message = "Unable to retrieve payment methods"
            logger.error(
                f"[RechargeSubscriptionService][get_customer_payment_methods] "
                f"{error_message} with error: {error}"
            )
            raise APIException(error_message)
        payment_methods = [{"id": payment_method.get("id"), "card": payment_method.get("payment_details")} 
                           for payment_method in response.get("payment_methods")]
        return payment_methods

    @classmethod
    def migrate_subscriptions_on_payment_method_update(
        cls, stripe_card: dict, subscriptions: "QuerySet[Subscription]"
    ) -> None:
        for subscription in subscriptions:
            recharge_subscription_id = subscription.recharge_subscription_id
            try:
                cls.cancel_subscription_request(recharge_subscription_id=recharge_subscription_id)
            except APIException as error:
                error_message = f"Unable to update payment method"
                logger.error(
                    f"[RechargeSubscriptionService][migrate_subscriptions_from_recharge_on_payment_method_update] {error_message} "
                    f"Unable to cancel recharge subscription with error {error}"
                )
                raise APIException(error_message)
            else:
                subscription.recharge_payment_method_id = None
                subscription.recharge_address_id = None
                subscription.recharge_subscription_id = None
                subscription.payment_processor_card_id = stripe_card.get("id")
                subscription.save(
                    update_fields=["recharge_payment_method_id", "recharge_address_id",
                                   "recharge_subscription_id", "payment_processor_card_id"]
                )

    @classmethod
    def get_customer_request(cls, email: str) -> Optional[dict]:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/customers",
            headers=cls.HEADERS,
            params={"email": email},
        )
        return response.get("customers")[0] if response.get("customers") else None

    @classmethod
    def retrieve_subscriptions_request(cls, recharge_user_id: int) -> Optional[List[dict]]:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/subscriptions",
            headers=cls.HEADERS,
            params={"customer_id": recharge_user_id},
        )
        return response.get("subscriptions")

    @classmethod
    def retrieve_subscription_by_id_request(cls, recharge_subscription_id: int) -> dict:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/subscriptions/{recharge_subscription_id}",
            headers=cls.HEADERS,
        )
        return response

    @classmethod
    def update_subscription_request(cls, recharge_subscription_id: int, **kwargs) -> dict:
        data = {}
        if kwargs.get("quantity"):
            data.update({"quantity": kwargs.get("quantity")})
        if kwargs.get("frequency"):
            data.update({
                "order_interval_unit": "day",
                "charge_interval_frequency": kwargs.get("frequency") * 30,
                "order_interval_frequency": kwargs.get("frequency") * 30,
            })
        if kwargs.get("status"):
            data.update({"status": kwargs.get("status")})
        response = cls._make_request(
            method="PUT",
            path=f"{settings.RECHARGE_API_URI}/subscriptions/{recharge_subscription_id}",
            headers=cls.HEADERS,
            payload=data,
        )
        return response
    
    @classmethod
    def change_charge_date_request(cls, recharge_subscription_id: int, set_charge_date: str) -> dict:
        response = cls._make_request(
            method="POST",
            path=f"{settings.RECHARGE_API_URI}/subscriptions/{recharge_subscription_id}/set_next_charge_date",
            headers=cls.HEADERS,
            payload={
                "date": set_charge_date,
            }
        )
        return response

    @classmethod
    def create_subscription_request(cls, subscription_data: dict) -> dict:
        response = cls._make_request(
            method="POST",
            path=f"{settings.RECHARGE_API_URI}/subscriptions",
            headers=cls.HEADERS,
            payload=subscription_data,
        )
        return response

    @classmethod
    def cancel_subscription_request(cls, recharge_subscription_id: int) -> dict:
        response = cls._make_request(
            method="POST",
            path=f"{settings.RECHARGE_API_URI}/subscriptions/{recharge_subscription_id}/cancel",
            headers=cls.HEADERS,
            payload={
                "cancellation_reason": "other reason",
            },
        )
        return response

    @classmethod
    def update_address_request(cls, recharge_address_id: int, address_data: dict) -> dict:
        response = cls._make_request(
            method="PUT",
            path=f"{settings.RECHARGE_API_URI}/addresses/{recharge_address_id}",
            headers=cls.HEADERS,
            payload=address_data,
        )
        return response 

    @classmethod
    def get_address_request(cls, recharge_address_id: int) -> dict:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/addresses/{recharge_address_id}",
            headers=cls.HEADERS,
        )
        return response
    
    @classmethod
    def get_payment_method_request(cls, recharge_payment_method_id: int) -> dict:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/payment_methods/{recharge_payment_method_id}",
            headers=cls.HEADERS,
        )
        return response

    @classmethod
    def list_payments_request(cls, customer_id: int) -> dict:
        response = cls._make_request(
            method="GET",
            path=f"{settings.RECHARGE_API_URI}/payment_methods",
            headers=cls.HEADERS,
            params={"customer_id": customer_id},
        )
        return response

    @classmethod
    def _make_request(
        cls, 
        method: str, 
        path: str, 
        headers: dict, 
        params: dict = None, 
        payload: dict = None, 
    ) -> dict:
        try:
            response = requests.request(
                method=method,
                url=path,
                headers=headers,
                params=params,
                json=payload,
            )
            response.raise_for_status()
        except HTTPError as error:
            error_message = json.loads(response.text)
            if error_message.get("errors") and isinstance(error_message.get("errors"), dict):
                error_message = ' '.join([error for error in error_message.get("errors").values()])
            else:
                error_message = json.dumps(error_message)
            logger.error(
                f"[RechargeSubscriptionService][make_request] {error_message}"
            )
            raise APIException(detail=error_message)
        except RequestException as error:
            error_message = f"Request failed with error: {error}"
            logger.error(
                f"[RechargeSubscriptionService][make_request] {error_message}"
            )
            raise APIException(detail=error_message)
        return response.json()
