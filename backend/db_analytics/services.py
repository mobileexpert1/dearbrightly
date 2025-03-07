import ctypes
import hashlib
import re
from utils.logger_utils import logger
import analytics
from django.conf import settings
import requests
from optimizely import optimizely
from optimizely.logger import SimpleLogger
from datetime import date, datetime, timedelta
from django.db.models import Q
import pytz
from dateutil.relativedelta import relativedelta
import klaviyo
from django.utils import timezone
from mail.services import MailService
from django.core.exceptions import ValidationError
from emr.models import Visit
from djchoices import DjangoChoices, ChoiceItem
from utils import uri_utils
from products.models import Product
import time

from facebook_business.adobjects.serverside.custom_data import CustomData
from facebook_business.adobjects.serverside.event import Event
from facebook_business.adobjects.serverside.event_request import EventRequest
from facebook_business.adobjects.serverside.action_source import ActionSource
from facebook_business.adobjects.serverside.user_data import UserData
from facebook_business.api import FacebookAdsApi
from facebook_business.exceptions import FacebookRequestError

access_token = settings.FACEBOOK_CONVERSION_API_KEY
pixel_id = settings.FACEBOOK_PIXEL_ID

FacebookAdsApi.init(access_token=access_token)

utc=pytz.UTC

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

klaviyo_client = klaviyo.Klaviyo(public_token=settings.KLAVIYO_PUBLIC_API_TOKEN,
                                 private_token=settings.KLAVIYO_PRIVATE_API_TOKEN)

analytics.write_key = settings.SEGMENT_PYTHON_WRITE_KEY
analytics.debug = True if settings.DEBUG else False


class CohortDataService:
    class OrderType(DjangoChoices):
        otc = ChoiceItem('otc')
        fso = ChoiceItem('fso')
        otc_fso = ChoiceItem('otc_fso')
        all = ChoiceItem('all')

    def get_acl_value(self, order_type=None, start_time_datetime=None, end_time_datetime=None):
        from orders.models import Order
        from users.models import User

        orders = self._get_orders(order_type, start_time_datetime, end_time_datetime)

        unique_customers_ids = set(orders.values_list('customer__id', flat=True).distinct())
        unique_customers = User.objects.filter(pk__in=unique_customers_ids)
        total_customers = len(unique_customers)
        number_unique_customers = 0
        number_unique_customers_single_purchase = 0
        total_days_delta = 0
        for customer in unique_customers:
            orders = customer.orders.filter(status=Order.Status.shipped)
            earliest_order = orders.earliest('payment_captured_datetime')
            latest_order = orders.latest('payment_captured_datetime')
            delta = (latest_order.payment_captured_datetime - earliest_order.payment_captured_datetime) \
                if latest_order.payment_captured_datetime and earliest_order.payment_captured_datetime else timedelta(days=0)
            days_delta = delta.days
            total_days_delta += days_delta
            if days_delta > 0:
                number_unique_customers += 1
            else:
                number_unique_customers_single_purchase += 1
            # logger.debug(f'[CohortDataService][get_acl_value] '
            #              f'orders: {orders}. '
            #              f'customer: {customer.id}. '
            #              f'delta: {delta}. '
            #              f'days_delta: {days_delta}. '
            #              f'total_days_delta: {total_days_delta}. '
            #              f'number_unique_customers: {number_unique_customers}.')

        acl = total_days_delta/number_unique_customers

        logger.debug(f'[CohortDataService][get_acl_value] ******** '
                      f'orders: {orders}. '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}. '
                     f'unique_customers: {unique_customers}. '
                     f'total_days_delta: {total_days_delta}. '
                     f'total_customers: {total_customers}. '
                     f'number_unique_customers: {number_unique_customers}. '
                     f'number_unique_customers_single_purchase: {number_unique_customers_single_purchase}. '
                     f'acl: {acl}.')
        return acl


    def get_aov_value(self, order_type=None, start_time_datetime=None, end_time_datetime=None):
        orders = self._get_orders(order_type, start_time_datetime, end_time_datetime)

        orders_count = len(orders)

        total_revenue = 0
        for order in orders:
            total_revenue += order.total_amount - order.shipping_fee - order.tax

        aov = (total_revenue/orders_count)/100 if orders_count else 0

        logger.debug(f'[CohortDataService][get_aov_value] [CohortDataService][get_aov_value] ******** '
                     f'orders: {orders}. '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}. '
                     f'orders_count: {orders_count}. '
                     f'total_revenue: {total_revenue}. '
                     f'aov: {aov}.')

        return aov

    def get_apf_value(self, order_type=None, start_time_datetime=None, end_time_datetime=None):
        orders = self._get_orders(order_type, start_time_datetime, end_time_datetime)

        orders_count = len(orders)

        unique_customers = set(orders.values_list('customer__id', flat=True).distinct())
        number_of_unique_customers = len(unique_customers)

        apf = orders_count/number_of_unique_customers if number_of_unique_customers else 0

        logger.debug(f'[CohortDataService][get_apf_value] [CohortDataService][get_apf_value] ******** '
                     f'orders: {orders}. '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}. '
                     f'orders_count: {orders_count}. '
                     f'number_of_unique_customers: {number_of_unique_customers}. '
                     f'apf: {apf}.')

        return apf

    def _get_orders(self, order_type=None, start_time_datetime=None, end_time_datetime=None):
        from orders.models import Order

        if start_time_datetime and end_time_datetime:
            orders = Order.objects.filter(Q(payment_captured_datetime__gte=start_time_datetime) &
                                          Q(payment_captured_datetime__lte=end_time_datetime) &
                                          Q(status=Order.Status.shipped))
        else:
            orders = Order.objects.filter(status=Order.Status.shipped)

        if order_type == CohortDataService.OrderType.otc_fso:
            orders = orders.filter(autogenerated=False)

        if order_type == CohortDataService.OrderType.otc:
            otc_orders_only = list(filter(lambda x: x.is_otc_only(), orders))
            otc_orders_only_ids = list(map(lambda x: x.id, otc_orders_only))
            orders = Order.objects.filter(pk__in=otc_orders_only_ids)

        if order_type == CohortDataService.OrderType.fso:
            fso_orders_only = list(filter(lambda x: x.is_rx_only(), orders))
            fso_orders_only_ids = list(map(lambda x: x.id, fso_orders_only))
            orders = Order.objects.filter(pk__in=fso_orders_only_ids)

        return orders
    def get_cohort_data(self, cohort_period_in_days):
        from subscriptions.models import OrderProductSubscription
        from orders.models import Order

        EXPECTED_DELAY_IN_DAYS = 90
        EXPECTED_DELAY_IN_DAYS_TRIAL = 60
        EXPECTED_DELAY_DELTA = 10

        #global data
        todays_date = date.today()
        all_subscriptions = OrderProductSubscription.objects.all()
        active_subscriptions = all_subscriptions.filter(is_active=True)
        canceled_subscriptions = all_subscriptions.filter(is_active=False)
        earliest_subscription = all_subscriptions.earliest('created_datetime')
        years_list = range(earliest_subscription.created_datetime.year, todays_date.year+1)
        total_retention_percent = '{:.1f}'.format(100 * (active_subscriptions.count()) / all_subscriptions.count())
        all_time_total_orders = 0
        all_time_total_amount = 0
        response = {}

        #iterating over years
        for year in years_list:
            subscriptions_in_year = OrderProductSubscription.objects.filter(created_datetime__year=year)
            earliest_subscription_in_year = subscriptions_in_year.earliest('created_datetime')
            latest_subscription_in_year = subscriptions_in_year.latest('created_datetime')
            months_list = range(earliest_subscription_in_year.created_datetime.month, latest_subscription_in_year.created_datetime.month+1)

            #iterating over each month in that year
            for month in months_list:
                subscriptions_created_in_month_year = OrderProductSubscription.objects.filter(created_datetime__year=year, created_datetime__month=month)
                start_date = datetime(year, month, 1).date() + relativedelta(days=cohort_period_in_days)

                logger.debug(f'[cohort_by_quarter] ******* cohort: {month}-{year}. start_date: {start_date}. '
                             f'years_list: {years_list}. months_list: {months_list}. '
                             f'subscriptions_created_in_month_year: {subscriptions_created_in_month_year.values_list("id", flat=True)}. '
                             f'subscriptions_created_in_month_year_count: {subscriptions_created_in_month_year.count()}.')

                total_delay_in_days = 0
                total_delay_between_orders_in_days = 0
                total_delay_between_orders_in_days_count = 0
                total_delays_triggered = 0
                users_triggering_delay = 0
                subscriptions_created_in_month_year_count = 0
                total_orders = 0
                total_orders_before_cancelation = 0
                orders_count = {}
                cohort_total_amount = 0
                cohort_total_amount_canceled = 0

                #iterate over subscriptions created in that specific month, and specific year
                for subscription_created_in_month_year in subscriptions_created_in_month_year:
                    cohort_user = subscription_created_in_month_year.customer
                    #grabs all orders for that specific user that are completed
                    subscription_orders = cohort_user.orders.filter(Q(payment_captured_datetime__isnull=False) &
                                                                    Q(status=Order.Status.shipped) &
                                                                    Q(emr_medical_visit__isnull=False)).order_by('created_datetime')

                    subscriptions_created_in_month_year_count = subscriptions_created_in_month_year.count()
                    subscription_cancelation_in_month_year_count = subscriptions_created_in_month_year.filter(
                        is_active=False).count()
                    subscription_active_in_month_year_count = subscriptions_created_in_month_year_count - subscription_cancelation_in_month_year_count
                    logger.debug(f'[cohort_by_quarter] cohort: {month}-{year}. user: {cohort_user.email} [{cohort_user.id}]. subscription_orders: {subscription_orders}.')
                    is_user_trigger_delay = False
                    first_order = subscription_orders.first()

                    #iterate over each subscription in subscription_orders that are completed for that cohort user
                    for subscription_order in subscription_orders:
                        cohort_total_amount += subscription_order.subtotal - subscription_order.discount
                        if subscription_created_in_month_year.is_active == False:
                            cohort_total_amount_canceled += subscription_order.subtotal - subscription_order.discount

                        delta_date_between_orders = subscription_order.payment_captured_datetime.date() - first_order.payment_captured_datetime.date()
                        delta_between_orders_in_days = delta_date_between_orders.days

                        if delta_between_orders_in_days > 0:
                            if delta_between_orders_in_days < 100:
                                total_delay_between_orders_in_days += delta_between_orders_in_days
                                total_delay_between_orders_in_days_count += 1
                            else:
                                logger.debug(f'[cohort_by_quarter] Large delay. cohort: {month}-{year}. User: {cohort_user.email}. '
                                             f'Order: {subscription_order.id}. Delay: {delta_between_orders_in_days}.')

                        expected_delta_in_days_max = EXPECTED_DELAY_IN_DAYS
                        if first_order.discount_code == 'FIRSTTIMETRIAL':
                            expected_delta_in_days_max = EXPECTED_DELAY_IN_DAYS_TRIAL

                        if delta_between_orders_in_days > expected_delta_in_days_max + EXPECTED_DELAY_DELTA:
                            is_user_trigger_delay = True
                            total_delays_triggered += 1
                            total_delay_in_days += delta_between_orders_in_days - expected_delta_in_days_max

                        logger.debug(
                            f'[cohort_by_quarter] cohort: {month}-{year}. first_order: {first_order}. order: {subscription_order}. '
                            f'delta_between_orders_in_days: {delta_between_orders_in_days}. '
                            f'expected_delta_in_days_max: {expected_delta_in_days_max}. '
                            f'total_delay_between_orders_in_days: {total_delay_between_orders_in_days}. '
                            f'total_delays_triggered: {total_delays_triggered}. '
                            f'delta_date_between_orders: {delta_date_between_orders}. '
                            f'delay in days: {delta_between_orders_in_days - expected_delta_in_days_max}. '
                            f'total_delay_in_days: {total_delay_in_days}. '
                            f'total_delay_between_orders_in_days_count: {total_delay_between_orders_in_days_count}. '
                            f'cohort_total_amount: {cohort_total_amount}. '
                            f'cohort_total_amount_canceled: {cohort_total_amount_canceled}.')

                        first_order = subscription_order

                    total_orders += subscription_orders.count()
                    subscription_count_index = subscription_orders.count()
                    orders_count[subscription_count_index] = orders_count.get(subscription_count_index, 0) + 1

                    refills_retention = {}
                    max_number_orders = max(orders_count.keys()) if orders_count and orders_count.keys() else None
                    if max_number_orders:
                        for i in range(1, max_number_orders):
                            orders_count_index = i + 1
                            while orders_count_index <= max_number_orders:
                                refills_retention[i] = refills_retention.get(i, 0) + orders_count.get(orders_count_index, 0)
                                orders_count_index += 1
                            logger.debug(f'[cohort_by_quarter] cohort: {month}-{year}. max_number_orders: {max_number_orders}. refills retention: {refills_retention.get(i, 0)}.')
                            percent_refill_retention = '{:.2f}'.format(100*refills_retention.get(i, 0)/subscriptions_created_in_month_year_count if subscriptions_created_in_month_year_count else 0)
                            refills_retention[i] = f'{percent_refill_retention}%'

                    if subscription_count_index == 0:
                        logger.debug(f'[cohort_by_quarter] No subscription orders. '
                                     f'Cohort: {month}-{year}. User: {cohort_user.email} [{cohort_user.id}]. '
                                     f'Subscription: {subscription_created_in_month_year.id}.')

                    if subscription_created_in_month_year.is_active == False:
                        total_orders_before_cancelation += subscription_orders.count()

                    if is_user_trigger_delay:
                        users_triggering_delay += 1

                    logger.debug(
                        f'[cohort_by_quarter] cohort: {month}-{year}. cohort_user: {cohort_user.email}. '
                        f'order: {subscription_orders}. '
                        f'users_triggering_delay: {users_triggering_delay}. '
                        f'total_orders: {total_orders}. '
                        f'total_orders_before_cancelation: {total_orders_before_cancelation}. '
                        f'subscriptions_created_in_month_year_count: {subscriptions_created_in_month_year_count}. '
                        f'subscription_cancelation_in_month_year_count: {subscription_cancelation_in_month_year_count}. '
                        f'total_orders: {total_orders}. refills_retention: {refills_retention}.')

                all_time_total_amount += cohort_total_amount
                all_time_total_orders += total_orders

                retention_percent = '{:.1f}'.format(100 * ((subscriptions_created_in_month_year_count - subscription_cancelation_in_month_year_count)/subscriptions_created_in_month_year_count if subscriptions_created_in_month_year_count > 0 else 0))
                average_orders_before_cancelation = '{:.2f}'.format(total_orders_before_cancelation/subscription_cancelation_in_month_year_count if subscription_cancelation_in_month_year_count > 0 else 0)
                average_orders = '{:.2f}'.format(total_orders / subscriptions_created_in_month_year_count if subscriptions_created_in_month_year_count > 0 else 0)
                percent_users_trigger_delay = '{:.1f}'.format(100 * users_triggering_delay/subscriptions_created_in_month_year_count if subscriptions_created_in_month_year_count > 0 else 0)
                percent_delays_triggered = '{:.1f}'.format(100 * total_delays_triggered/total_orders if total_orders > 0 else 0)
                average_days_between_orders = '{:.2f}'.format(total_delay_between_orders_in_days/total_delay_between_orders_in_days_count if total_delay_between_orders_in_days_count > 0 else 0)
                average_subscription_delay = '{:.2f}'.format(total_delay_in_days / total_delays_triggered if total_delays_triggered > 0 else 0)
                cohort_ltv = '{:.2f}'.format(cohort_total_amount/(100*subscriptions_created_in_month_year_count) if subscriptions_created_in_month_year_count > 0 else 0)
                cohort_ltv_canceled = '{:.2f}'.format(cohort_total_amount_canceled/(100*subscription_cancelation_in_month_year_count) if subscription_cancelation_in_month_year_count > 0 else 0)
                cohort_ltv_active = '{:.2f}'.format((cohort_total_amount-cohort_total_amount_canceled)/(100*subscription_active_in_month_year_count) if subscription_active_in_month_year_count > 0 else 0)

                response[f'{month}-{year}'] = [f'Total: {subscriptions_created_in_month_year_count}. '
                                               f'Canceled: {subscription_cancelation_in_month_year_count}. '
                                               f'Retention: {retention_percent}%. '
                                               f'Subscription Orders: {total_orders}. '
                                               f'Avg Days Btwn Orders: {average_days_between_orders}. '
                                               f'Avg Subscription Delay: {average_subscription_delay}. '
                                               f'Order Delay Triggered: {percent_delays_triggered}% [{total_delays_triggered}]. '
                                               f'Users Triggering Delay: {percent_users_trigger_delay}% [{users_triggering_delay}]. '
                                               f'Avg Orders Before Cancel: {average_orders_before_cancelation}. '
                                               f'Avg Orders: {average_orders}. '
                                               f'Orders Count (Active): {sorted(orders_count.items())}. '
                                               f'Refills Retention: {refills_retention}. '
                                               f'LTV: ${cohort_ltv}. '
                                               f'LTV Canceled Users: ${cohort_ltv_canceled}. '
                                               f'LTV Active Users: ${cohort_ltv_active}.']

                while start_date < todays_date:
                    subscription_cancelation = subscriptions_created_in_month_year.filter(Q(is_active=False) & Q(cancel_datetime__lte=start_date))
                    subscription_cancelation_count = subscription_cancelation.count()
                    retention_count = subscriptions_created_in_month_year_count - subscription_cancelation_count
                    retention_percent = '{:.1f}'.format(100*retention_count/subscriptions_created_in_month_year_count if subscriptions_created_in_month_year_count > 0  else 0)
                    response[f'{month}-{year}'].append(f'{start_date}: {retention_percent}% [{retention_count}]')
                    logger.debug(f'[cohort_by_quarter] start_date: {start_date}. subscription_cancelation: {subscription_cancelation}. '
                                 f'subscription_cancelation_count: {subscription_cancelation_count}. '
                                 f'retention_count: {retention_count}. retention_percent: {retention_percent}. '
                                 f'response: {response}.')
                    start_date = start_date + relativedelta(days=cohort_period_in_days)

        all_time_ltv = '{:.2f}'.format(all_time_total_amount /(100 * all_subscriptions.count()) if all_subscriptions.count() > 0 else 0)
        response['All Time'] = {
            f'Total Subscriptions: {all_subscriptions.count()}. '
            f'Orders: {all_time_total_orders}. '
            f'Canceled: {canceled_subscriptions.count()}. '
            f'Retention: {total_retention_percent}%. '
            f'LTV: ${all_time_ltv}.'
        }

        logger.debug(f'[cohort_by_quarter] response: {response}.')
        MailService.send_error_notification_email(notification='COHORT DATA',
                                                  data=response)
        return response

    def get_delay_data(self):
        from subscriptions.models import OrderProductSubscription
        from orders.models import Order

        EXPECTED_DELAY_IN_DAYS = 90
        EXPECTED_DELAY_IN_DAYS_TRIAL = 60
        EXPECTED_DELAY_DELTA = 10

        todays_date = date.today()

        two_month_trial_start_date = "7-16-19"  # First day two-month trial started
        two_month_trial_start_datetime = utc.localize(datetime.strptime(two_month_trial_start_date, "%m-%d-%y"))

        all_subscriptions = OrderProductSubscription.objects.all()
        earliest_subscription = all_subscriptions.earliest('created_datetime')
        years_list = range(earliest_subscription.created_datetime.year, todays_date.year+1)

        response = {}
        for year in years_list:
            subscriptions_in_year = OrderProductSubscription.objects.filter(created_datetime__year=year)
            earliest_subscription_in_year = subscriptions_in_year.earliest('created_datetime')
            latest_subscription_in_year = subscriptions_in_year.latest('created_datetime')
            months_list = range(earliest_subscription_in_year.created_datetime.month, latest_subscription_in_year.created_datetime.month+1)

            for month in months_list:
                subscriptions_created_in_month_year = OrderProductSubscription.objects.filter(created_datetime__year=year, created_datetime__month=month)

                total_delays_triggered = 0
                total_early_ship_triggered = 0
                users_triggering_delay = 0
                users_triggering_early_ship = 0

                delays = {}
                early_ship = {}
                trial_delays = {}
                trial_early_ship = {}

                trial_days_delta_between_orders = {}
                days_delay_between_orders = {}
                total_orders = 0
                delta = 0

                for subscription_created_in_month_year in subscriptions_created_in_month_year:
                    cohort_user = subscription_created_in_month_year.customer
                    subscription_orders = cohort_user.orders.filter(Q(payment_captured_datetime__isnull=False) &
                                                                    Q(status=Order.Status.shipped) &
                                                                    Q(emr_medical_visit__isnull=False)).order_by('created_datetime')

                    subscriptions_created_in_month_year_count = subscriptions_created_in_month_year.count()

                    is_user_trigger_delay = False
                    is_user_trigger_early_ship = False
                    first_order = subscription_orders.first()
                    for subscription_order in subscription_orders:
                        delta_date_between_orders = subscription_order.payment_captured_datetime.date() - first_order.payment_captured_datetime.date()
                        delta_between_orders_in_days = delta_date_between_orders.days

                        if delta_between_orders_in_days > 0:
                            if (first_order.discount_code == 'FIRSTTIMETRIAL' or first_order.discount_code == 'TWOMONTHTRIAL7') and first_order.payment_captured_datetime > two_month_trial_start_datetime:
                                trial_days_delta_between_orders[delta_between_orders_in_days] = trial_days_delta_between_orders.get(
                                    delta_between_orders_in_days, 0) + 1

                                if delta_between_orders_in_days > EXPECTED_DELAY_IN_DAYS_TRIAL + EXPECTED_DELAY_DELTA:
                                    is_user_trigger_delay = True
                                    total_delays_triggered += 1
                                    delta = delta_between_orders_in_days - EXPECTED_DELAY_IN_DAYS_TRIAL
                                    trial_delays[delta] = trial_delays.get(delta, 0) + 1

                                if delta_between_orders_in_days < EXPECTED_DELAY_IN_DAYS_TRIAL:
                                    is_user_trigger_early_ship = True
                                    users_triggering_early_ship += 1
                                    delta = EXPECTED_DELAY_IN_DAYS_TRIAL - delta_between_orders_in_days
                                    trial_early_ship[delta] = trial_early_ship.get(delta, 0) + 1
                            else:
                                days_delay_between_orders[delta_between_orders_in_days] = days_delay_between_orders.get(
                                    delta_between_orders_in_days, 0) + 1

                                if delta_between_orders_in_days > EXPECTED_DELAY_IN_DAYS + EXPECTED_DELAY_DELTA:
                                    is_user_trigger_delay = True
                                    total_delays_triggered += 1
                                    delta += delta_between_orders_in_days - EXPECTED_DELAY_IN_DAYS
                                    delays[delta] = delays.get(delta, 0) + 1

                                if delta_between_orders_in_days < EXPECTED_DELAY_IN_DAYS:
                                    is_user_trigger_early_ship = True
                                    users_triggering_early_ship += 1
                                    delta = EXPECTED_DELAY_IN_DAYS_TRIAL - delta_between_orders_in_days
                                    early_ship[delta] = early_ship.get(delta, 0) + 1

                            logger.debug(
                                f'[cohort_by_quarter] cohort: {month}-{year}. '
                                f'user: {cohort_user.email}. '
                                f'first_order: {first_order.id}. '
                                f'subscription_order: {subscription_order.id}. '
                                f'delta_date_between_orders: {delta_date_between_orders}. '
                                f'delta_between_orders_in_days: {delta_between_orders_in_days}. '
                                f'trial_days_delta_between_orders: {trial_days_delta_between_orders}. '
                                f'days_delay_between_orders: {days_delay_between_orders}. '
                                f'trial_delays: {trial_delays}. '
                                f'delays: {delays}. '
                                f'trial_early_ship: {trial_early_ship}. '
                                f'early_ship: {early_ship}. '
                            )

                        first_order = subscription_order
                        total_orders += subscription_orders.count()

                    if is_user_trigger_delay:
                        users_triggering_delay += 1

                    if is_user_trigger_early_ship:
                        total_early_ship_triggered += 1

                response[f'{month}-{year}'] = [f'Total Orders: {total_orders}. '
                                               f'Total Subscriptions: {subscriptions_created_in_month_year_count}. '
                                               f'Delays Triggered: {total_delays_triggered}. '
                                               f'Users Triggering Delay: {users_triggering_early_ship}. '
                                               f'Early Ship Triggered: {total_early_ship_triggered}. '
                                               f'Users Triggering Early Ship: {total_early_ship_triggered}. '
                                               f'Trial Days Between Orders: {trial_days_delta_between_orders}. '
                                               f'Days Between Orders: {days_delay_between_orders}. '
                                               f'Trial Delays: {trial_delays}. '
                                               f'Delays: {delays}. '
                                               f'Trial Early Ship: {trial_early_ship}. '
                                               f'Early Ship: {early_ship}.']

        return response

    def get_pregnancy_ttc_nursing_data(self, start_time_datetime=None, end_time_datetime=None):
        responses = {
            'pregnant': 0,
            'nursing': 0,
            'ttc': 0,
            'pregnant_users': {},
            'nursing_users': {},
            'ttc_users': {}
        }
        visits = Visit.objects.all()

        if start_time_datetime:
            visits = visits.filter(created_datetime__gte=start_time_datetime)

        if end_time_datetime:
            visits = visits.filter(created_datetime__lte=end_time_datetime)

        for visit in visits:
            if not visit.questionnaire_answers:
                continue
            response = visit.questionnaire_answers.get_pregnant_nursing_ttc_response()
            questionnaire_answer_timestamp = visit.questionnaire_answers.created_datetime.strftime("%m-%d-%y")
            logger.debug(f'[get_pregnancy_ttc_nursing_data] user: {visit.patient.id}. visit: {visit.id}. '
                         f'response: {response}. questionnaire_answer_timestamp: {questionnaire_answer_timestamp}')
            if response:
                if 'pregnant' in response:
                    responses['pregnant'] += 1
                    responses['pregnant_users'][f'{visit.patient.id}'] = questionnaire_answer_timestamp
                if 'breastfeeding' in response or 'nursing' in response:
                    responses['nursing'] += 1
                    responses['nursing_users'][f'{visit.patient.id}'] = questionnaire_answer_timestamp
                if 'trying to conceive' in response:
                    responses['ttc'] += 1
                    responses['ttc_users'][f'{visit.patient.id}'] = questionnaire_answer_timestamp

        total = responses['pregnant'] + responses['nursing'] + responses['ttc']

        for response_key in ['pregnant', 'nursing', 'ttc']:
            value = int(responses[response_key])
            percentage = '{:.1f}'.format(100*value/total)
            responses[response_key] = f'{percentage}% [{value}]'

        responses['TOTAL'] = total

        logger.debug(f'[get_pregnancy_ttc_nursing_data] responses: {responses}')

        return responses


    def get_influencer_data(self, start_time_datetime=None, end_time_datetime=None):
        responses = {
        }
        visits = Visit.objects.all()

        if start_time_datetime:
            visits = visits.filter(created_datetime__gte=start_time_datetime)

        if end_time_datetime:
            visits = visits.filter(created_datetime__lte=end_time_datetime)

        for visit in visits:
            if not visit.questionnaire_answers:
                continue
            response = visit.questionnaire_answers.get_influencer_response()
            questionnaire_answer_timestamp = visit.questionnaire_answers.created_datetime.strftime("%m-%d-%y")
            logger.debug(f'[get_pregnancy_ttc_nursing_data] user: {visit.patient.id}. visit: {visit.id}. '
                         f'response: {response}. questionnaire_answer_timestamp: {questionnaire_answer_timestamp}')
            if response:
                responses[response] = 1 + responses.get(response, 0)

        total = 0
        for value in responses.values():
            logger.debug(f'[get_influencer_data] value: {value}')
            total += int(value)

        for response_key in responses.keys():
            value = int(responses[response_key])
            percentage = '{:.1f}'.format(100*value/total)
            responses[response_key] = f'{percentage}% [{value}]'

        responses['TOTAL'] = total

        logger.debug(f'[get_influencer_data] responses: {responses}')

        return responses


class OptimizelyService:

    def __init__(self, project_id):
        self.project_id = project_id
        self.client = None
        self.optimizely_end_user_id = None

    def get_client(self):
        if not self.client:
            self.set_client()
        return self.client

    def set_client(self, url=None):
        if not url:
            url = f'https://cdn.optimizely.com/datafiles/{self.project_id}.json'
            logger.debug(f'[OptimizelyService] url: {url}')

        try:
            datafile = requests.get(url).text
            self.client = optimizely.Optimizely(datafile, None, SimpleLogger())
        except requests.exceptions.RequestException as e:
            logger.error(f'[OptimizelyService][set_client] Unable to get datafile and create client: {e}')

    def get_optimizely_end_user_id(self, request):
        optimizely_end_user_id = request.COOKIES.get('optimizelyEndUserId', None)
        if optimizely_end_user_id:
            self.optimizely_end_user_id = optimizely_end_user_id
            logger.debug(f'[OptimizelyService][get_optimizely_end_user_id] '
                         f'Setting optimizely_end_user_id: {self.optimizely_end_user_id}')
        else:
            logger.error(f'[OptimizelyService][get_optimizely_end_user_id] '
                         f'Unable to set optimizely_end_user_id. Cookies: {request.COOKIES}')
        return self.optimizely_end_user_id

    def activate_and_get_variation(self, request, experiment_key):
        # Disable bucketing in debug mode
        if settings.DEBUG:
            return None

        # variation = request.COOKIES.get(experiment_key, None)
        # if variation:
        #     return variation

        if self.get_optimizely_end_user_id(request) and self.get_client():
            variation = self.get_client().activate(experiment_key, self.optimizely_end_user_id)
            # response.set_cookie(experiment_key, variation)
            logger.debug(f'[OptimizelyService][activate_and_get_variation] Activated experiment: {experiment_key}.'
                         f'Variation: {variation} assigned for user: {self.optimizely_end_user_id}.')
            return variation

        logger.error(f'[OptimizelyService][activate_and_get_variation] Unable to activate experiment: {experiment_key}. '
                     f'User ID {self.optimizely_end_user_id} or client {self.get_client()} not available.')

        return None

    def track(self, event_key, request=None):

        if settings.DEBUG:
            return None

        user_id = self.optimizely_end_user_id
        if request:
            user_id = self.get_optimizely_end_user_id(request)

        if user_id:
            self.get_client().track(event_key, user_id)
            logger.debug(f'[OptimizelyService][track] Tracking event: {event_key} for user: {user_id}')
        else:
            logger.error(f'[OptimizelyService][track] Unable to track event: {event_key}')


class KlaviyoService:

    def identify(self, user):

        if settings.TEST_MODE:
            return

        if user.is_klaviyo_migrated:
            return

        try:
            properties = self._get_customer_properties(user)
            response = klaviyo_client.Public.identify(email=user.email, properties=properties)
            logger.debug(f'[KlaviyoService][identify] properties: {properties}. response data: {response.data}.')
            if response.status_code == 200:
                user.is_klaviyo_migrated = True;
                user.save(update_fields=['is_klaviyo_migrated'])
        except klaviyo.exceptions.KlaviyoAPIException as e:
            logger.error(f'[KlaviyoService][identify] {e}')


    def update_profile(self, user):
        # Disable until we know how to get profile_id
        return

        properties = self._get_customer_properties(user)
        logger.debug(f'[KlaviyoService][update_profile] properties: {properties}.')
        try:
            klaviyo_client.Profiles.update_profile(profile_id, properties)
        except klaviyo.exceptions.KlaviyoAPIException as e:
            logger.error(f'[KlaviyoService][update_profile] {e}')


    def track_placed_order_event(self, order):
        if settings.TEST_MODE:
            return

        if order.is_klaviyo_migrated:
            return

        time = order.purchased_datetime.strftime('%s') if order.purchased_datetime else timezone.now().strftime('%s')
        #converted_back = datetime.utcfromtimestamp(int(time)).isoformat()
        #logger.debug(f'[track_placed_order_event] purchased_datetime: {order.purchased_datetime}. time: {time}. converted_back: {converted_back}')

        self._track_order_event(order=order, event='Placed Order', time=time)


    def track_placed_non_recurring_order_event(self, order):
        if settings.TEST_MODE:
            return

        if not order.is_refill:
            time = order.purchased_datetime.utcnow().timestamp() #strftime('%s')
            self._track_order_event(order=order, event='Placed Non-Recurring Order', time=time)


    def track_fulfilled_order_event(self, order):
        if settings.TEST_MODE:
            return

        time = order.payment_captured_datetime.strftime('%s') if order.payment_captured_datetime else timezone.now().strftime('%s')
        self._track_order_event(order=order, event='Fulfilled Order', time=time)


    def track_canceled_order_event(self, order):
        if settings.TEST_MODE:
            return

        time = order.payment_captured_datetime.strftime('%s') if order.payment_captured_datetime else timezone.now().strftime('%s')
        self._track_order_event(order=order, event='Cancelled Order', time=time, reason='None Specified')


    def track_refunded_order_event(self, order):
        if settings.TEST_MODE:
            return

        time = order.payment_captured_datetime.strftime('%s') if order.payment_captured_datetime else timezone.now().strftime('%s')
        self._track_order_event(order=order, event='Refunded Order', time=time, reason='None Specified')


    def track_ordered_product_event(self, order_product):
        if settings.TEST_MODE:
            return

        time = order.purchased_datetime.strftime('%s') if order.purchased_datetime else timezone.now().strftime('%s')
        self._track_ordered_product_event(self, order_product, event='Ordered Product', time=time)


    def _track_order_event(self, order, event, time, reason=None):
        from orders.models import Order
        from orders.serializers import KlaviyoOrderSerializer
        from users.serializers import KlaviyoShippingAddressSerializer

        try:
            order_properties = KlaviyoOrderSerializer(order).data
            order_properties['$event_id'] = str(order.uuid)
            order_properties['$value'] = order.total_amount/100
            #order_properties['time'] = time
            order_properties['Order Type'] = 'Recurring Subscription Order' if order.is_subscription else 'Non Recurring Order'
            order_properties['ShippingAddress'] = KlaviyoShippingAddressSerializer(order.shipping_details).data

            if reason:
                order_properties['Reason'] = reason
            customer_properties = self._get_customer_properties(order.customer)
            # logger.debug(f'[KlaviyoService][_track_order_event] order_properties: {order_properties}')
            # logger.debug(f'[KlaviyoService][_track_order_event] customer_properties: {customer_properties}')
            # logger.debug(f'[KlaviyoService][_track_order_event] event: {event}. time: {time}')
            try:
                response = klaviyo_client.Public.track(
                    event,
                    email=order.customer.email,
                    properties=order_properties,
                    customer_properties=customer_properties,
                    timestamp=time
                )
            except klaviyo.exceptions.KlaviyoAPIException as e:
                logger.error(f'[KlaviyoService][_track_order_event] {e}')
                return



            # Track Ordered Product event
            if event == 'Placed Order':
                if response.status_code == 200:
                    Order.objects.filter(pk=order.id).update(is_klaviyo_migrated=True)

                for order_product in order.order_products.all():
                    self._track_ordered_product_event(order_product=order_product,
                                                      event='Ordered Product',
                                                      customer_properties=customer_properties,
                                                      time=time
                                                      )
        except ValidationError as error:
            logger.error(f'[KlaviyoService][_track_order_event] ValidationError:{error}')
            return


    def _track_ordered_product_event(self, order_product, event, customer_properties, time):
        from orders.serializers import KlaviyoOrderProductSerializer

        try:
            order_product_properties = KlaviyoOrderProductSerializer(order_product).data
            order_product_properties['$event_id'] = str(order_product.id)
            order_product_properties['$value'] = order_product.price/100 if order_product.price else None
            #order_product_properties['time'] = time

            logger.debug(f'[KlaviyoService][_track_ordered_product_event] order_product_properties: {order_product_properties}')

            order = order_product.order

            try:
                klaviyo_client.Public.track(
                    event,
                    email=order.customer.email,
                    properties=order_product_properties,
                    customer_properties=customer_properties,
                    timestamp=time
                )
            except klaviyo.exceptions.KlaviyoAPIException as e:
                logger.error(f'[KlaviyoService][_track_ordered_product_event] {e}')
                return

        except ValidationError as error:
            logger.error(f'[KlaviyoService][_track_ordered_product_event] ValidationError:{error}')
            return


    def _get_customer_properties(self, user):
        customer_properties = {
            "$id": str(user.uuid),  # Need the ID to associate the email account with the user's uuid
            # "$email": user.email,
            # "$first_name": user.first_name if user.first_name else None,
            # "$last_name": user.last_name if user.last_name else None,
            # "$phone_number": user.shipping_details.phone if user.shipping_details and user.shipping_details.phone else None,
            # "$address1": user.shipping_details.address_line1 if user.shipping_details and user.shipping_details.address_line1 else None,
            # "$address2": user.shipping_details.address_line2 if user.shipping_details and user.shipping_details.address_line2 else None,
            # "$city": user.shipping_details.city if user.shipping_details and user.shipping_details.city else None,
            "$zip": user.shipping_details.postal_code if user.shipping_details and user.shipping_details.postal_code else None,
            "$region": user.shipping_details.state if user.shipping_details and user.shipping_details.state else None,
            "$country": user.shipping_details.country.code if user.shipping_details and user.shipping_details.country else None,
            "DateJoined" : user.date_joined.strftime('%s') if user.date_joined else None,
            "Age": user.age if user.age else None,
            "Gender": user.gender if user.gender else None,
            "Plans": self._get_plan_names(user),
            "NumberFulfilledOrders": user.get_number_fulfilled_orders(),
            "ActiveSubscriber": user.is_plan_active(),
            "PlanCancelationReasons": user.get_plan_cancelation_reasons()

        }
        customer_properties = {k: v for k, v in customer_properties.items() if v is not None}

        return customer_properties

    def _get_plan_names(self, user):
        #from orders.serializers import MAPPED_KLAVIYO_PRODUCT_NAMES

        plan_names = user.get_plan_names()
        #mapped_plan_names = []

        #if plan_names:
        #    for plan_name in plan_names:
        #        mapped_plan_name = MAPPED_KLAVIYO_PRODUCT_NAMES[plan_name]
        #        mapped_plan_names.append(mapped_plan_name)

        return plan_names #mapped_plan_names


class SegmentService:
    def on_segment_services_error(self, error, items):
        logger.error(f'[SegmentService][on_segment_services_error] Error: {error}')

    def track(self, event_name, user_id, anonymous_id=None, properties=None, user_agent=None, page_url=None):
        if settings.TEST_MODE:
            return

        logger.debug(f'[SegmentService][track] event_name: {event_name}. user_id: {user_id}. '
                     f'anonymous_id: {anonymous_id}. properties: {properties}. user_agent: {user_agent}. '
                     f'page_url: {page_url}.')
        context = {}
        if user_agent:
            context['userAgent'] = user_agent
        if page_url:
            context['page'] = {'url': page_url}

        analytics.track(user_id=user_id, event=event_name, anonymous_id=anonymous_id, properties=properties, context=context)


    def hash_code(self, user_id):
        hash = 0
        chr = None
        for el in user_id:
            chr = ord(el)
            hash = ((ctypes.c_int(hash << 5).value) - (hash)) + chr
            hash |= 0
        return ctypes.c_int(hash ^ 0).value


    def track_order_completed_event(self, order):
        if settings.TEST_MODE:
            return

        try:
            order_products = []
            for product in order.get_shopping_bag_product_data():
                order_products.append({
                    'product_id': product.get('product_uuid', None),
                    'name':  product.get('product_name', None),
                    'quantity': product.get('quantity', None),
                    'sku': product.get('sku', None),
                    'price': product.get('price', 0) / 100,
                })

            order_completed_event = {
                'order_id': order.id,
                'total': order.total_amount / 100,
                'currency': 'USD',
                'products':  order_products
            }

            customer_id_hash = self.hash_code(str(order.customer.uuid))
            logger.debug(f'[SegmentService][track_order_completed_event] customer_id_hash: {customer_id_hash}.')
            self.track(
                event_name='order_completed',
                user_id=customer_id_hash,
                anonymous_id=None,
                properties=order_completed_event,
                user_agent=None,
                page_url=None)
        except Exception as error:
            logger.error(
                f'[SegmentService][track_order_completed_event] Error: {error}.')

analytics.on_error = SegmentService().on_segment_services_error

class FacebookConversionServices:
    def track_purchase_event(self, request, user, order):
        purchase_url = uri_utils.generate_absolute_url(request=None, path='checkout')
        logger.error(f'[track_purchase_event] purchase_url: {purchase_url} ')
        self._track_event(request, user, order, "Purchase", order.uuid, purchase_url)

    def track_initiate_checkout(self, request, user, order):
        checkout_url = uri_utils.generate_absolute_url(request=None, path='checkout')
        logger.error(f'[track_initiate_checkout] checkout_url: {checkout_url} ')
        self._track_event(request, user, order, "InitiateCheckout", order.uuid, checkout_url)

    def track_add_to_cart(self, request, user, order, product_uuid):
        product_url = None
        try:
            product = Product.objects.get(uuid=product_uuid)
            product_kebab_case_name = re.sub(r'(?<!^)(?=[A-Z])', '-', product.name).lower()
            product_url = uri_utils.generate_absolute_url(request=None,
                                                          path=f'product-details/${product_kebab_case_name}')
        except Product.DoesNotExist as e:
            logger.error(f'[track_add_to_cart] product_uuid does not exist: {product_uuid} ')

        self._track_event(request, user, order, "AddToCart", product_uuid, product_url)

    def track_registration_complete(self, request, user):
        registration_complete_url = uri_utils.generate_absolute_url(request=None, path='register')
        self._track_event(request, user, None, "CompleteRegistration", user.uuid, registration_complete_url)

    def _track_event(self, request, user, order, event_name, event_id, event_source):
        logger.debug(f'[FacebookConversionServices][_track_event] '
                     f'user: {user.id}. '
                     f'order: {order}. '
                     f'event_name: {event_name}. '
                     f'event_id: {event_id}.')

        hashed_event_id = hashlib.sha256(str(event_id).encode()).hexdigest() if event_id else None
        user_data = self.get_user_data(request, user) if user else None
        custom_data = self.get_custom_data(order) if order else None

        event = Event(
            event_id=hashed_event_id,
            event_name=event_name,
            event_time=int(time.time()),
            user_data=user_data,
            custom_data=custom_data,
            action_source=ActionSource.WEBSITE,
            event_source_url=event_source
        )
        events = [event]
        event_request = EventRequest(
            events=events,
            pixel_id=pixel_id,
        )

        try:
            event_response = event_request.execute()
            logger.debug(f'[FacebookConversionServices][_track_event] '
                         f'hashed_event_id: {hashed_event_id}. '
                         f'event_name: {event_name}. '
                         f'event_response: {event_response}')
        except FacebookRequestError as error:
            logger.error(f'[FacebookConversionServices][_track_event] '
                         f'Facebook Request Error for user {user.id}: {error}.')
        except requests.exceptions.ConnectionError as error:
            logger.error(f'[FacebookConversionServices][_track_event] '
                         f'ConnectionError for user {user.id}: {error}.')

    def get_user_data(self, request, user):

        hashed_email = hashlib.sha256(user.email.encode()).hexdigest() if user and user.email else None
        hashed_phone = hashlib.sha256(user.shipping_details.phone.encode("utf-8")).hexdigest() if user and user.shipping_details and user.shipping_details.phone else None

        user_data = UserData(
            emails=[hashed_email],
            phones=[hashed_phone],
            # It is recommended to send Client IP and User Agent for Conversions API Events.
            client_ip_address=request.META.get("REMOTE_ADDR"),
            client_user_agent=request.META.get("HTTP_USER_AGENT"),
        )
        logger.debug(f'[FacebookConversionServices][get_user_data] user_data: {user_data}')
        return user_data

    def get_custom_data(self, order):
        custom_data = CustomData(
            currency="USD",
            value=order.subtotal/100,
            content_ids= [order.get_product_sku_list()] ,
            content_type="product",
        )
        logger.debug(f'[FacebookConversionServices][get_user_data] get_custom_data: {custom_data}')
        return custom_data

    def _get_latest_product_at_checkout_url(self, order):
        latest_created_product = None
        last_created_order_product = order.order_products.latest('created_datetime')
        if last_created_order_product:
            latest_created_product = last_created_order_product.product

        product_kebab_case_name = re.sub(r'(?<!^)(?=[A-Z])', '-', latest_created_product.name).lower() if latest_created_product else None
        product_url = uri_utils.generate_absolute_url(request=None, path=f'product-details/${product_kebab_case_name}')

        return product_url