from datetime import datetime
from django_filters import DateFilter
import django_filters
from django_filters.filters import BooleanFilter, CharFilter, ChoiceFilter, DateTimeFilter, NumberFilter
from orders.models import Order

def is_refill_filter(queryset, name, value):
    return queryset.filter(order_items__is_refill=value)

def purchased_datetime_filter(queryset, name, value):
    filter_datetime = datetime.strptime(value, "%Y-%m-%d").date()
    return queryset.filter(
        purchased_datetime__day=filter_datetime.day,
        purchased_datetime__month=filter_datetime.month,
        purchased_datetime__year=filter_datetime.year
    )

class OrderFilter(django_filters.FilterSet):
    customer_email = CharFilter(field_name='customer__email', lookup_expr='contains')
    customer_first_name = CharFilter(field_name='customer__first_name', lookup_expr='contains')
    customer_last_name = CharFilter(field_name='customer__last_name', lookup_expr='contains')
    discount_code = CharFilter(field_name='discount_code', lookup_expr='contains')
    end_date = DateFilter(field_name='purchased_datetime',lookup_expr=('lt'))
    is_refill = BooleanFilter(method=is_refill_filter)
    uuid = CharFilter(field_name='uuid', lookup_expr='contains')
    purchased_datetime = CharFilter(method=purchased_datetime_filter)
    status = ChoiceFilter(choices=Order.Status.choices)
    start_date = DateFilter(field_name='purchased_datetime',lookup_expr=('gt'),)

    class Meta:
        model = Order
        fields = ('customer_email', 'customer_first_name', 'customer_last_name', 'discount_code',
                  'end_date', 'uuid', 'is_refill', 'purchased_datetime', 'status', 'start_date')
