import uuid
from typing import List, Union, Dict, Optional
from collections import OrderedDict

from django.db import transaction
from django.db.models import QuerySet, Q
from django.utils import timezone

from orders.models import Order, OrderProduct
from payment_new.exceptions import BadRequestException
from payment.models import Coupon
from products.models import Product
from users.models import User
from utils.logger_utils import logger


class CouponService:
    def create_coupon(
        self,
        coupon_data: OrderedDict,
        allowed_customers_emails: Optional[List[str]],
        discounted_products_ids: Optional[List[int]],
    ) -> Coupon:
        coupon = Coupon.objects.create(**coupon_data)
        if allowed_customers_emails:
            self.add_allowed_customers_to_coupon(
                coupon=coupon, allowed_customers_emails=allowed_customers_emails
            )
        if discounted_products_ids:
            self.add_discounted_products_to_coupon(
                coupon=coupon, discounted_products_ids=discounted_products_ids
            )
        return coupon

    def update_coupon(
        self,
        coupon: Coupon,
        coupon_data: OrderedDict,
        allowed_customers_emails: Optional[List[str]],
        discounted_products_ids: Optional[List[int]],
    ) -> Coupon:
        for field, value in coupon_data.items():
            setattr(coupon, field, value)
        if allowed_customers_emails:
            self.add_allowed_customers_to_coupon(
                coupon=coupon, allowed_customers_emails=allowed_customers_emails
            )
        if discounted_products_ids:
            self.add_discounted_products_to_coupon(
                coupon=coupon, discounted_products_ids=discounted_products_ids
            )

        coupon.save()
        return coupon

    @staticmethod
    def add_allowed_customers_to_coupon(
        coupon: Coupon, allowed_customers_emails: List[str]
    ) -> None:
        with transaction.atomic():
            coupon.allowed_customers.clear()
            for customer in User.objects.filter(email__in=allowed_customers_emails):
                coupon.allowed_customers.add(customer)

    @staticmethod
    def add_discounted_products_to_coupon(
        coupon: Coupon, discounted_products_ids: List[int]
    ) -> None:
        with transaction.atomic():
            coupon.discounted_products.clear()
            for product in Product.objects.filter(id__in=discounted_products_ids):
                coupon.discounted_products.add(product)

    def retrieve_coupon(
        self,
        discount_code: str,
        customer: Union[User, None],
        products: "QuerySet[Product]",
        shopping_bag_data: List[OrderedDict],
    ) -> Dict:
        coupon = Coupon.objects.filter(code=discount_code, is_active=True).first()
        if not coupon:
            error_message = f"Coupon: {discount_code} does not exist."
            logger.error(
                f"[payment_new][PaymentService][_retrieve_coupon] {error_message}"
            )
            raise BadRequestException(detail=error_message)

        self.validate_coupon(coupon=coupon, customer=customer, products=products)
        if coupon.percent_off and coupon.discounted_products.all():
            return {
                "discount_code": discount_code,
                "amount_off": self.calculate_amount_off_for_percent_off_of_discounted_products(
                    coupon=coupon, shopping_bag_data=shopping_bag_data
                ),
                "percent_off": 0,
            }
        return {
            "discount_code": discount_code,
            "amount_off": coupon.amount_off,
            "percent_off": coupon.percent_off,
        }

    def validate_coupon(
        self, coupon: Coupon, customer: Union[User, None], products: "QuerySet[Product]"
    ):
        self.check_if_the_coupon_is_only_for_the_first_time_order(
            coupon=coupon, customer=customer
        )
        self.check_if_the_coupon_is_only_for_existing_purchasers(
            coupon=coupon, customer=customer
        )
        self.check_if_user_has_any_discounted_products_in_plans_or_orders(
            coupon=coupon, customer=customer
        )
        self.check_if_the_coupon_has_reached_max_redemption_limit_per_user(
            coupon=coupon, customer=customer
        )
        self.check_if_the_coupon_time_range_is_correct(coupon=coupon)
        self.check_if_customer_is_allowed_to_use_the_coupon(
            coupon=coupon, customer=customer
        )
        self.check_if_the_coupon_works_only_with_specific_products(
            coupon=coupon, products=products
        )

    @staticmethod
    def check_if_the_coupon_is_only_for_the_first_time_order(
        coupon: Coupon, customer: Union[User, None]
    ):
        if (
            coupon.first_time_order
            and customer
            and customer.orders.filter(Q(payment_captured_datetime__isnull=False) &
                                       ~Q(status=Order.Status.cancelled) &
                                       ~Q(status=Order.Status.refunded)).exists()
        ):
            error_message = f"Coupon: {coupon.code} is valid only for customers without previous orders."
            logger.error(
                f"[payment_new][PaymentService][_check_if_the_coupon_is_only_for_the_first_time_order] {error_message}"
            )
            raise BadRequestException(detail=error_message)

    @staticmethod
    def check_if_the_coupon_has_reached_max_redemption_limit_per_user(
        coupon: Coupon, customer: User
    ) -> None:
        if (
            coupon.type == Coupon.Type.expiring
            and customer
            and coupon.max_redemptions_reached_by_customer(customer=customer)
        ):
            error_message = (
                f"Coupon: {coupon.code} has reached max redemption limit per user."
            )
            logger.error(
                f"[payment_new][PaymentService][check_if_the_coupon_has_reached_max_redemption_limit_per_user] {error_message}"
            )
            raise BadRequestException(detail=error_message)

    @staticmethod
    def check_if_the_coupon_time_range_is_correct(coupon: Coupon) -> None:
        if (
            coupon.start_duration_range
            and coupon.end_duration_range
            and not coupon.start_duration_range
            <= timezone.now()
            <= coupon.end_duration_range
        ):
            error_message = f"Coupon's: {coupon.code} time range has expired."
            logger.error(
                f"[payment_new][PaymentService][check_if_the_coupon_time_range_is_correct] {error_message}"
            )
            raise BadRequestException(detail=error_message)

    @staticmethod
    def check_if_customer_is_allowed_to_use_the_coupon(
        coupon: Coupon, customer: Union[User, None]
    ) -> None:
        if coupon.allowed_customers.all():
            if customer and customer not in coupon.allowed_customers.all():
                error_message = (
                    f"Coupon: {coupon.code} is not allowed for customer: {customer}."
                )
                logger.error(
                    f"[payment_new][PaymentService][check_if_customer_is_allowed_to_use_the_coupon] {error_message}"
                )
                raise BadRequestException(detail=error_message)

    @staticmethod
    def check_if_the_coupon_works_only_with_specific_products(
        coupon: Coupon, products: "QuerySet[Product]"
    ):
        discounted_products_with_refill_products = [
            *coupon.discounted_products.all(),
            *[product.refill_product for product in coupon.discounted_products.all()],
        ]

        if coupon.discounted_products.all():
            if coupon.require_all_products:
                if len(
                    [
                        product
                        for product in products
                        if product in discounted_products_with_refill_products
                    ]
                ) < coupon.discounted_products.count():
                    error_message = f"Your shopping cart doesn't contain the required products to apply coupon: {coupon.code}."
                    logger.error(
                        f"[payment_new][PaymentService][check_if_the_coupon_works_only_with_specific_products] {error_message}"
                    )
                    raise BadRequestException(detail=error_message)
            else:
                if not any(
                    product in discounted_products_with_refill_products for product in products
                ):
                    error_message = f"Your shopping cart doesn't contain products to apply coupon: {coupon.code}."
                    logger.error(
                        f"[payment_new][PaymentService][check_if_the_coupon_works_only_with_specific_products] {error_message}"
                    )
                    raise BadRequestException(detail=error_message)


    @staticmethod
    def calculate_amount_off_for_percent_off_of_discounted_products(
        coupon: Coupon, shopping_bag_data: List[OrderedDict]
    ) -> int:
        calculated_amount_off = 0
        discounted_products_with_refill_products = [
            *coupon.discounted_products.all(),
            *[product.refill_product for product in coupon.discounted_products.all()],
        ]
        discounted_products_uuids = [
            str(product.uuid) for product in discounted_products_with_refill_products
        ]

        for order_product in shopping_bag_data:
            order_product_uuid = order_product.get("product_uuid")
            product = Product.objects.get(uuid=uuid.UUID(order_product_uuid))
            if order_product_uuid in discounted_products_uuids:
                if order_product.get("frequency") > 0:
                    calculated_amount_off += int(
                        product.subscription_price
                        * coupon.percent_off
                        / 100
                    )
                else:
                    calculated_amount_off += int(
                        order_product.get("price") * coupon.percent_off / 100
                    )
        return calculated_amount_off

    @staticmethod
    def check_if_user_has_any_discounted_products_in_plans_or_orders(
        coupon: Coupon, customer: Union[User, None]
    ) -> bool:
        if coupon.discounted_products_not_in_existing_plans_or_orders and customer:
            if CouponService._check_if_user_has_discounted_products_in_orders(
                    discounted_products=coupon.discounted_products.all(),
                    customer=customer):

                error_message = f"Coupon: {coupon.code} is not valid if you've previously purchased one of the discounted products."
                logger.error(
                    f"[payment_new][PaymentService][check_if_user_has_any_discounted_products_in_plans_or_orders] {error_message}"
                )
                raise BadRequestException(detail=error_message)

            if CouponService._check_if_user_has_discounted_products_in_plans(
                    discounted_products=coupon.discounted_products.all(),
                    customer=customer):

                error_message = f"Coupon: {coupon.code} is not valid if you've subscribed to one of the discounted products."
                logger.error(
                    f"[payment_new][PaymentService][check_if_user_has_any_discounted_products_in_plans_or_orders] {error_message}"
                )
                raise BadRequestException(detail=error_message)
        
    @staticmethod
    def _check_if_user_has_discounted_products_in_plans(
        discounted_products: List[Product], customer: Union[User, None]
    ) -> bool:
        for discounted_product in discounted_products:
            if customer.subscriptions.filter(
                is_active=True,
                product=discounted_product
            ).exists():
                return True
        return False

    @staticmethod
    def _check_if_user_has_discounted_products_in_orders(
        discounted_products: List[Product], customer: Union[User, None]
    ) -> bool:
        for discounted_product in discounted_products:
            if OrderProduct.objects.filter(
                Q(order__customer=customer) &
                Q(product=discounted_product) &
                Q(order__payment_captured_datetime__isnull=False) &
                ~Q(order__status=Order.Status.cancelled) &
                ~Q(order__status=Order.Status.refunded)
            ).exists():
                return True
        return False

    @staticmethod
    def check_if_the_coupon_is_only_for_existing_purchasers(
        coupon: Coupon, customer: Union[User, None]
    ) -> None:
        if (
            coupon.only_existing_purchasers
            and customer
            and not customer.orders.filter(
                Q(payment_captured_datetime__isnull=False) &
                ~Q(status=Order.Status.cancelled) &
                ~Q(status=Order.Status.refunded)
            ).exists()
        ):
            error_message = f"Coupon: {coupon.code} is not valid for new customers."
            logger.error(
                f"[payment_new][PaymentService][check_if_the_coupon_is_only_for_existing_purchasers] {error_message}"
            )
            raise BadRequestException(detail=error_message)

