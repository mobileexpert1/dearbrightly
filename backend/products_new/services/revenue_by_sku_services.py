import datetime

from django.db.models import Sum

from orders.models import Order, OrderItem, OrderProduct
from products.models import Product


class ProductRevenues:
    TRIAL = "TRIAL"
    PRIMARY = "PRIMARY"
    SUBSCRIPTION = "SUBSCRIPTION"
    PRIMARY_SUBSCRIPTION = "PRIMARY/SUBSCRIPTION"
    REFILL = "REFILL"
    OTHER = "OTHER"

    @staticmethod
    def _get_current_month_range():
        first_day = datetime.datetime.today().replace(day=1)

        return [
            datetime.datetime(year=first_day.year, month=first_day.month, day=first_day.day), datetime.datetime.now()
        ]

    def get_sku_type(self, product: Product):
        if product.product_type == Product.Type.rx:
            if product.trial_product and product.pk == product.trial_product.pk:
                return self.TRIAL

            else:
                return self.SUBSCRIPTION

        elif product.product_type == Product.Type.otc:
            if product.is_plan_product:
                return self.PRIMARY_SUBSCRIPTION

            elif product.refill_product and product.pk == product.refill_product.pk:
                return self.REFILL

        return self.OTHER

    @staticmethod
    def get_name(product: Product, category: str, price):
        product_name = product.name if "Refill" not in product.name else product.name.replace(" Refill", "")

        name = (
            f"[{product.product_type.upper()}] {product_name}"
            f" {category} - "
            f"${price / 100}"
        )

        return name

    @staticmethod
    def _get_value_or_zero(dictionary: dict, attribute) -> int:
        return dictionary.get(attribute) if dictionary.get(attribute) else 0

    def data_from_order_items(self, product: Product, price, order_items: OrderItem) -> dict:
        orders = Order.objects.filter(pk__in=order_items.values_list("order", flat=True))

        has_shipping_fees = orders.aggregate(shipping_fee_sum=Sum("shipping_fee"))["shipping_fee_sum"] > 0

        order_item_shipping_fee = 0

        order_items_data = (
            order_items.aggregate(quantity=Sum("order_product__quantity"), discount=Sum("discount"), tax=Sum("tax"))
        )

        if has_shipping_fees and order_items:
            order_item_shipping_fee = sum([order_item.order_product.shipping_fee for order_item in order_items])

        item_quantity = self._get_value_or_zero(order_items_data, "quantity")
        discount = self._get_value_or_zero(order_items_data, "discount") / 100
        taxes = self._get_value_or_zero(order_items_data, "tax") / 100
        shipping_fee = round(order_item_shipping_fee / 200, 2)
        gross_sales = item_quantity * price / 100
        net_sales = gross_sales - discount
        total_sales = round(net_sales + shipping_fee + taxes, 2)

        return {
            "product": product.pk,
            "order_quantity": orders.count(),
            "item_quantity": item_quantity,
            "price": price / 100,
            "discount": discount,
            "shipping_fee": shipping_fee,
            "taxes": taxes,
            "gross_sales": gross_sales,
            "is_hidden": product.is_hidden,
            "net_sales": net_sales,
            "total_sales": total_sales
        }

    @staticmethod
    def get_price(product, category: str) -> int:
        # rx products only available as subscription
        if product.product_type == Product.Type.rx:
            if product.trial_product and product.pk == product.trial_product.pk:
                return product.price
            else:
                return product.subscription_price

        elif category == "SUBSCRIPTION":
            return product.subscription_price

        else:
            return product.price

    def get_product_revenue_data(self, products: [Product], time_range=None, sku_categories=None):
        data = {}
        time_range = time_range if time_range else self._get_current_month_range()

        for product in products:
            sku_type = self.get_sku_type(product)

            if sku_categories and not any(category in sku_type for category in sku_categories):
                continue

            if product.product_type == Product.Type.rx:

                if sku_type == self.TRIAL and sku_categories and self.TRIAL in sku_categories or not sku_categories:
                    order_items = OrderItem.objects.filter(
                        order_product__product=product,
                        order__payment_captured_datetime__range=time_range,
                        order__status__in=[6, 13],
                    ).select_related("order_product")

                    if order_items:
                        price = self.get_price(product, sku_type)

                        data[self.get_name(product, sku_type, price)] = (
                            self.data_from_order_items(product, price, order_items)
                        )

                elif (
                        sku_type == self.SUBSCRIPTION
                        and sku_categories and self.SUBSCRIPTION in sku_categories or not sku_categories
                ):
                    order_items = OrderItem.objects.filter(
                        order_product__product=product,
                        order__payment_captured_datetime__range=time_range,
                        order__status__in=[6, 13],
                        order_product__frequency__gt=0,
                    ).select_related("order_product")

                    if order_items:
                        price = self.get_price(product, sku_type)

                        data[self.get_name(product, sku_type, price)] = (
                            self.data_from_order_items(product, price, order_items)
                        )

            elif product.product_type == Product.Type.otc:

                if sku_type == "PRIMARY/SUBSCRIPTION":
                    if sku_categories and self.PRIMARY in sku_categories or not sku_categories:
                        order_items = OrderItem.objects.filter(
                            order_product__product=product,
                            order__payment_captured_datetime__range=time_range,
                            order__status__in=[6, 13],
                            order_product__frequency=0,
                        ).select_related("order_product")

                        if order_items:
                            price = self.get_price(product, self.PRIMARY)

                            data[self.get_name(product, self.PRIMARY, price)] = self.data_from_order_items(
                                product, price, order_items
                            )

                    if sku_categories and self.SUBSCRIPTION in sku_categories or not sku_categories:
                        order_items = OrderItem.objects.filter(
                            order_product__product=product,
                            order__payment_captured_datetime__range=time_range,
                            order__status__in=[6, 13],
                            order_product__frequency__gt=0,
                        ).select_related("order_product")

                        if order_items:
                            price = self.get_price(product, self.SUBSCRIPTION)

                            data[self.get_name(product, self.SUBSCRIPTION, price)] = (
                                self.data_from_order_items(product, price, order_items)
                            )

                else:
                    if sku_categories and self.REFILL in sku_categories or not sku_categories:
                        order_items = OrderItem.objects.filter(
                            order_product__product=product,
                            order__payment_captured_datetime__range=time_range,
                            order__status__in=[6, 13],
                        ).select_related("order_product")

                        if order_items:
                            price = self.get_price(product, sku_type)

                            data[self.get_name(product, sku_type, price)] = (
                                self.data_from_order_items(product, price, order_items)
                            )

            else:
                continue

        return data
