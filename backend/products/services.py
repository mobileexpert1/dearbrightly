from typing import List, Dict, Any, Optional

from django.db.models.aggregates import Sum, Count
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from orders.models import Order, OrderItem
from products.models import Product

class RetoolDashboardsService:
    @classmethod
    def get_revenue_data(
        cls,
        product_ids: Optional[List[int]],
        product_category: Optional[List[str]],
        start_date: Optional[str],
        end_date: Optional[str],
    ) -> List[Dict[str, Any]]:
        cls.validate_products_and_product_category(
            product_ids=product_ids, product_category=product_category
        )
        products = cls.get_products_queryset(
            product_ids=product_ids, product_category=product_category
        )

        results = (
            cls.get_revenue_results_for_product_category(
                product_category=product_category,
                start_date=start_date,
                end_date=end_date,
            )
            if product_category
            else cls.get_revenue_results_for_products(
                products=products,
                start_date=start_date,
                end_date=end_date,
            )
        )

        return results

    @classmethod
    def validate_products_and_product_category(
        cls, product_ids: Optional[List[int]], product_category: Optional[List[str]]
    ) -> None:
        if product_ids and product_category:
            raise ValidationError(
                detail="You can't use both products and product_category."
            )

    @classmethod
    def get_products_queryset(
        cls, product_ids: Optional[List[int]], product_category: Optional[List[str]]
    ) -> "Queryset[Product]":
        return (
            Product.objects.filter(id__in=product_ids)
            if product_ids
            else Product.objects.filter(product_category__in=product_category)
            if product_category
            else Product.objects.all()
        )

    @classmethod
    def get_revenue_results_for_products(
        cls,
        products: "Queryset[Product]",
        start_date: Optional[str],
        end_date: Optional[str],
    ) -> List[Dict[str, Any]]:
        results = []
        for product in products.distinct("sku"):
            order_item_queryset = cls.get_order_item_queryset_for_product(
                product=product, start_date=start_date, end_date=end_date
            )
            order_item_data = order_item_queryset.aggregate(
                quantity=Sum("order_product__quantity"),
                discounts=Sum("discount"),
                taxes=Sum("tax"),
            )
            if order_item_data.get("quantity") and order_item_data.get("quantity") > 0:
                order_item_data = cls.round_order_item_data_values(
                    order_item_data=order_item_data
                )
                shipping_sum = cls.count_shipping_fee(
                    order_item_query=order_item_queryset
                )
                gross_sales_sum = cls.count_gross_sales_for_products(order_item_queryset)
                returns_sum = cls.count_returns(order_item_queryset=order_item_queryset)
                net_sales_sum = (
                    gross_sales_sum - order_item_data.get("discounts") - returns_sum
                )
                results.append(
                    {
                        "product_name": f"{product.name} - {product.quantity} oz - ${product.price / 100}",
                        "sku": product.sku,
                        "plan_quantity": cls.count_plan_products(order_item_queryset),
                        **order_item_data,
                        "returns": returns_sum,
                        "gross_sales": gross_sales_sum,
                        "net_sales": net_sales_sum,
                        "shipping": shipping_sum,
                        "total_sales": (
                            net_sales_sum + shipping_sum + order_item_data.get("taxes")
                        ),
                    }
                )
        return results

    @classmethod
    def get_revenue_results_for_product_category(
        cls,
        product_category: "Queryset[Product]",
        start_date: Optional[str],
        end_date: Optional[str],
    ) -> List[Dict[str, Any]]:
        results = []
        for category in product_category:
            order_item_queryset = cls.get_order_item_queryset_for_product_category(
                product_category=category,
                start_date=start_date,
                end_date=end_date,
            )
            order_item_data = order_item_queryset.aggregate(
                quantity=Sum("order_product__quantity"),
                discounts=Sum("discount"),
                taxes=Sum("tax"),
            )
            if order_item_data.get("quantity") and order_item_data.get("quantity") > 0:
                order_item_data = cls.round_order_item_data_values(
                    order_item_data=order_item_data
                )
                shipping_sum = cls.count_shipping_fee(
                    order_item_query=order_item_queryset
                )
                gross_sales_sum = cls.count_gross_sales_for_products(
                    order_item_queryset=order_item_queryset
                )
                returns_sum = cls.count_returns(order_item_queryset=order_item_queryset)
                net_sales_sum = (
                    gross_sales_sum - order_item_data.get("discounts") - returns_sum
                )
                results.append(
                    {
                        "product_category": category,
                        "plan_quantity": cls.count_plan_products(order_item_queryset),
                        **order_item_data,
                        "returns": returns_sum,
                        "gross_sales": gross_sales_sum,
                        "net_sales": net_sales_sum,
                        "shipping": shipping_sum,
                        "total_sales": (
                            net_sales_sum + shipping_sum + order_item_data.get("taxes")
                        ),
                    }
                )
        return results

    @classmethod
    def get_order_item_queryset_for_product(
        cls, product: Product, start_date: Optional[str], end_date: Optional[str]
    ) -> "Queryset[OrderItem]":
        lookup = {"product": product, "order__status": Order.Status.shipped}
        if start_date:
            lookup["order__payment_captured_datetime__gte"] = start_date
        if end_date:
            lookup["order__payment_captured_datetime__lte"] = end_date

        return OrderItem.objects.filter(**lookup)

    @classmethod
    def get_order_item_queryset_for_product_category(
        cls, product_category: str, start_date: Optional[str], end_date: Optional[str]
    ) -> "Queryset[OrderItem]":
        lookup = {
            "product__product_category": product_category,
            "order__status": Order.Status.shipped,
        }
        if start_date:
            lookup["order__payment_captured_datetime__gte"] = start_date
        if end_date:
            lookup["order__payment_captured_datetime__lte"] = end_date

        return OrderItem.objects.filter(**lookup)

    @classmethod
    def round_order_item_data_values(
        cls, order_item_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            key: (cls.cents_to_dollars(cents=value) if key != "quantity" else value)
            for key, value in order_item_data.items()
        }

    @classmethod
    def count_shipping_fee(cls, order_item_query: "QuerySet[OrderItem]") -> float:
        return 0

    @classmethod
    def count_gross_sales_for_products(
        cls, order_item_queryset: "QuerySet[OrderItem]"
    ) -> float:
        return cls.cents_to_dollars(
            sum(map(lambda x: x.price * x.order_product.quantity, order_item_queryset))
        )

    @classmethod
    def count_plan_products(
        cls, order_item_queryset: "QuerySet[OrderItem]"
    ) -> float:
        return sum(x.order_product.quantity for x in order_item_queryset if x.price == x.product.subscription_price)

    @classmethod
    def count_returns(cls, order_item_queryset: "QuerySet[OrderItem]") -> float:
        return cls.cents_to_dollars(
            sum(
                [
                    order_item.order.refund_amount
                    if order_item.order.refund_amount == order_item.order.total_amount
                    else 0
                    for order_item in order_item_queryset
                ]
            )
        )

    @classmethod
    def cents_to_dollars(cls, cents: int) -> float:
        return round(cents / 100, 2)
