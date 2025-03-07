from datetime import datetime
import django_filters
from django_filters.filters import CharFilter, ChoiceFilter, NumberFilter
from users.models import User, VacationDays
from django_filters import DateFilter

def date_joined_datetime_filter(queryset, name, value):
    filter_datetime = datetime.strptime(value, "%Y-%m-%d").date()
    return queryset.filter(
        date_joined__day=filter_datetime.day,
        date_joined__month=filter_datetime.month,
        date_joined__year=filter_datetime.year
    )

def rx_status_filter(queryset, name, value):
    filtered_user_ids = []
    for user in User.objects.all():
        if value == user.rx_status:
            filtered_user_ids.append(user.id)
    filtered_users = User.objects.filter(id__in=filtered_user_ids)
    return filtered_users

class UserFilter(django_filters.FilterSet):
    date_joined = CharFilter(method=date_joined_datetime_filter)
    email = CharFilter(field_name='email', lookup_expr='contains')
    end_date = DateFilter(field_name='date_joined',lookup_expr=('lt'))
    first_name = CharFilter(field_name='first_name', lookup_expr='contains')
    last_name = CharFilter(field_name='last_name', lookup_expr='contains')
    rx_status = CharFilter(method=rx_status_filter)
    start_date = DateFilter(field_name='date_joined',lookup_expr=('gt'),)
    uuid = CharFilter(field_name='uuid', lookup_expr='contains')

    class Meta:
        model = User
        fields = ('date_joined', 'email', 'end_date', 'first_name', 'uuid', 'last_name', 'start_date')

class VacationDaysFilter(django_filters.FilterSet):
    end_date = DateFilter(field_name="end_date", lookup_expr=("gte"))

    class Meta:
        model = VacationDays
        fields = ("end_date", "medical_provider_id")
