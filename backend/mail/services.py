from django.conf import settings
from datetime import date, timedelta
from rest_framework.exceptions import APIException
from mail.templates import \
    OrderUpdateMail, \
    ErrorNotificationMail, \
    UserNotificationMail, \
    UserEmail, \
    GenericMail
from smtplib import SMTPException
from utils.logger_utils import logger
from mail.constants import \
    USER_EMAIL_INFO_SIGN_UP, \
    USER_EMAIL_INFO_EMPTY_CART, \
    USER_EMAIL_INFO_ABANDONED_CART, \
    USER_EMAIL_INFO_INCOMPLETE_SKIN_PROFILE, \
    USER_EMAIL_INFO_INCOMPLETE_PHOTOS, \
    USER_EMAIL_INFO_INCOMPLETE_PHOTO_ID, \
    USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_NEW_USER, \
    USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER, \
    USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE, \
    USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE_NO_RESPONSE, \
    USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_INCOMPLETE_RESPONSE, \
    USER_EMAIL_INFO_ORDER_CANCELATION_SKIN_PROFILE_EXPIRED, \
    USER_EMAIL_INFO_ORDER_SHIPPED_TRIAL, \
    USER_EMAIL_INFO_ORDER_SHIPPED, \
    USER_EMAIL_INFO_ORDER_TRACKING_UPDATE, \
    USER_EMAIL_INFO_ORDER_ARRIVED, \
    USER_EMAIL_INFO_PROVIDER_MESSAGE, \
    USER_EMAIL_INFO_CHECK_IN, \
    USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_NEW_USER, \
    USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_NEW_USER, \
    USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_RETURNING_USER, \
    USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_RETURNING_USER, \
    USER_EMAIL_INFO_ANNUAL_VISIT, \
    USER_EMAIL_INFO_PAYMENT_FAILURE, \
    USER_EMAIL_INFO_ORDER_CONFIRMATION_SHIP_NOW, \
    USER_EMAIL_INFO_ORDER_CONFIRMATION_RESUME, \
    USER_EMAIL_INFO_ORDER_CONFIRMATION,\
    USER_EMAIL_INFO_SUBSCRIPTION_PAYMENT_FAILURE,\
    USER_EMAIL_INFO_SUBSCRIPTION_CANCEL_PAYMENT_FAILURE,\
    USER_EMAIL_INFO_TERMS_OF_USE_UPDATE,\
    USER_EMAIL_INFO_ORDER_CONFIRMATION_PAYMENT_DETAIL_UPDATED,\
    USER_EMAIL_INFO_UPCOMING_ORDER_PAYMENT_DETAIL_UPDATED,\
    USER_EMAIL_INFO_PRIVACY_POLICY_UPDATE
from utils import uri_utils
from sharing.models import Sharing

class MailService:

    @staticmethod
    def send_order_notification_email(order, notification_type=None, data=None):
        notes = ''
        order_update_notification = ''

        logger.debug(
            f'[send_order_notification_email] '
            f'Order {order.id}. '
            f'Notification type: {notification_type}. '
            f'Data: {data}')

        if notification_type:
            order_update_notification = notification_type
        else:
            if order.order_type == order.OrderType.otc:
                order_update_notification = 'OTC ONLY'
            else:
                # if order.includes_moisturizer():
                #     order_update_notification = 'INCLUDE MOISTURIZER '
                # if order.contains_set:
                #     order_update_notification += 'SET '
                if order.is_refill:
                    order_update_notification += 'REFILL '

        if data:
            notes = data

        if len(order_update_notification) == 0:
            logger.debug(
                f'[send_order_notification_email] No order notification email needs to be sent for order {order.id}')
            return

        logger.debug(
            f'[send_order_notification_email] Sending order notification for order {order.id}. '
            f'Notification: {order_update_notification}. Notes: {notes}')

        try:
            OrderUpdateMail(date=order.purchased_datetime,
                            order_id=order.order_number,
                            customer_name=order.customer.get_full_name(),
                            customer_id=order.customer.id,
                            customer_email=order.customer.email,
                            order_total=order.total_amount,
                            order_refill_status=order.is_refill,
                            notification=order_update_notification,
                            notes=notes). \
                send(to_email=settings.SUPPORT_LOGS_EMAIL)
        except SMTPException as error:
            logger.error(f'[send_order_notification_email] Unable to send order notification email '
                         f'for {order.id} with error: {str(error)}')

    @staticmethod
    def send_user_notification_email(user, notification=None, data=None):
        logger.debug(
            f'[send_user_notification_email] '
            f'Notification: {notification}. '
            f'Data: {data}')

        try:
            UserNotificationMail(user_id=user.id, user_email=user.email, notification=notification, notes=data).send(to_email=settings.SUPPORT_LOGS_EMAIL)
        except SMTPException as error:
            logger.error(f'[send_user_notification_email] Unable to send user notification email '
                         f'for {data} with error: {str(error)}')

    @staticmethod
    def send_error_notification_email(notification=None, data=None):
        logger.debug(
            f'[send_error_notification_email] '
            f'Notification: {notification}. '
            f'Data: {data}')

        try:
            ErrorNotificationMail(notification=notification, notes=data).send_error_notification()
        except SMTPException as error:
            logger.error(f'[send_error_notification_email] Unable to send order notification email '
                         f'for {data} with error: {str(error)}')


    # ------------- New Email Format ------------- #
    @staticmethod
    def send_user_email_sign_up(user):
        kwargs = {'opt_out_tag': 'new_user_sign_up'}
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SIGN_UP, 0, **kwargs)


    @staticmethod
    def send_user_emails_empty_cart(empty_cart_users):
        kwargs = {'opt_out_tag': 'empty_cart'}
        return MailService()._send_user_emails__user_date_joined_time_interval(
            users=empty_cart_users, email_info=USER_EMAIL_INFO_EMPTY_CART, **kwargs)


    @staticmethod
    def send_user_emails_abandoned_cart(abandoned_cart_orders):
        kwargs = {'opt_out_tag': 'abandoned_cart'}
        return MailService._send_user_emails__order_created_time_interval(
            orders=abandoned_cart_orders, email_info=USER_EMAIL_INFO_ABANDONED_CART, **kwargs)


    @staticmethod
    def send_user_emails_incomplete_skin_profile(pending_orders):
        return MailService()._send_user_emails__order_purchased_time_interval(pending_orders, USER_EMAIL_INFO_INCOMPLETE_SKIN_PROFILE)


    @staticmethod
    def send_user_emails_incomplete_photos(pending_orders):
        return MailService._send_user_emails__order_purchased_time_interval(pending_orders, USER_EMAIL_INFO_INCOMPLETE_PHOTOS)

    @staticmethod
    def send_user_emails_order_cancellation_skin_profile_expired(pending_orders):
        return MailService._send_user_emails(pending_orders, USER_EMAIL_INFO_ORDER_CANCELATION_SKIN_PROFILE_EXPIRED)

    # TODO (Alda) - Implement this
    @staticmethod
    def send_user_emails_incomplete_photo_id(pending_orders):
        return MailService._send_user_emails__order_purchased_time_interval(pending_orders, USER_EMAIL_INFO_INCOMPLETE_PHOTO_ID)


    @staticmethod
    def send_user_email_skin_profile_completion_new_user(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_NEW_USER, 0)


    @staticmethod
    def send_user_email_skin_profile_completion_returning_user(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER, 0)


    @staticmethod
    def send_user_email_skin_profile_completion_returning_user_no_change(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE, 0)


    @staticmethod
    def send_user_email_skin_profile_completion_returning_user_no_change_no_response(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE_NO_RESPONSE, 0)

    @staticmethod
    def send_user_email_skin_profile_completion_returning_user_incomplete_response(user):
        return MailService()._send_user_email(user,
                                              USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_INCOMPLETE_RESPONSE,
                                              0)

    @staticmethod
    def send_user_email_order_shipped_trial(order, tracking_number, tracking_uri):
        return MailService.send_user_shipment_notification(order=order, tracking_number=tracking_number,
                                                           tracking_uri=tracking_uri, is_update=False,
                                                           email_info=USER_EMAIL_INFO_ORDER_SHIPPED_TRIAL)

    @staticmethod
    def send_user_email_order_shipped(order, tracking_number, tracking_uri):
        return MailService.send_user_shipment_notification(order=order, tracking_number=tracking_number,
                                                           tracking_uri=tracking_uri, is_update=False,
                                                           email_info=USER_EMAIL_INFO_ORDER_SHIPPED)

    @staticmethod
    def send_user_email_order_tracking_update(order, tracking_number, tracking_uri):
        return MailService.send_user_shipment_notification(order=order, tracking_number=tracking_number,
                                                           tracking_uri=tracking_uri, is_update=True,
                                                           email_info=USER_EMAIL_INFO_ORDER_TRACKING_UPDATE)


    # TODO (Alda) - Need to implement
    @staticmethod
    def send_user_email_order_arrived(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_ORDER_ARRIVED, 0)


    @staticmethod
    def send_user_email_provider_message(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_PROVIDER_MESSAGE, 0)


    @staticmethod
    def send_user_emails_check_in(completed_orders):
        kwargs = {'opt_out_tag': 'check_in'}
        return MailService()._send_user_emails__payment_captured_time_interval(completed_orders,
                                                                               USER_EMAIL_INFO_CHECK_IN,
                                                                               **kwargs)

    # TODO (Alda) - Implement this
    @staticmethod
    def send_user_email_upcoming_subscription_order_rx_updated_new_user(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_NEW_USER, 0, subscription=subscription)


    @staticmethod
    def send_user_email_upcoming_subscription_order_rx_unchanged_new_user(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_NEW_USER, 0, subscription=subscription)


    # TODO (Alda) - Implement this
    @staticmethod
    def send_user_email_upcoming_subscription_order_rx_updated_returning_user(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_RETURNING_USER, 0, subscription=subscription)


    @staticmethod
    def send_user_email_upcoming_subscription_order_rx_unchanged_returning_user(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_RETURNING_USER, 0, subscription=subscription)


    @staticmethod
    def send_user_emails_annual_visit(active_subscriptions_requiring_yearly_visit):
        return MailService._send_user_emails__subscriptions_upcoming_time_interval(active_subscriptions_requiring_yearly_visit, USER_EMAIL_INFO_ANNUAL_VISIT)


    @staticmethod
    def send_user_emails_annual_visit_order_payment_complete(users):
        return MailService()._send_users_email(users, USER_EMAIL_INFO_ANNUAL_VISIT, 0)


    @staticmethod
    def send_user_email_payment_failure(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_PAYMENT_FAILURE, 0)

    @staticmethod
    def send_user_email_subscription_payment_failure(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SUBSCRIPTION_PAYMENT_FAILURE, 0)

    @staticmethod
    def send_user_email_subscription_cancel_payment_failure(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_SUBSCRIPTION_CANCEL_PAYMENT_FAILURE, 0)

    @staticmethod
    def send_user_email_order_confirmation_ship_now(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_ORDER_CONFIRMATION_SHIP_NOW, 0, subscription)


    @staticmethod
    def send_user_email_order_confirmation_resume(user, subscription):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_ORDER_CONFIRMATION_RESUME, 0, subscription)


    @staticmethod
    def send_user_email_order_confirmation_payment_detail_updated(user):
        return MailService()._send_user_email_with_address(user, USER_EMAIL_INFO_ORDER_CONFIRMATION_PAYMENT_DETAIL_UPDATED, 0)


    @staticmethod
    def send_user_email_order_confirmation(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_ORDER_CONFIRMATION, 0)


    @staticmethod
    def send_user_email_upcoming_order_payment_detail_updated(user):
        return MailService()._send_user_email(user, USER_EMAIL_INFO_UPCOMING_ORDER_PAYMENT_DETAIL_UPDATED, 0)


    # helper method to force send user email
    @staticmethod
    def test_send_user_email(user, email_info, **kwargs):
        intervals_in_days = email_info.get('time_intervals_in_days')
        for interval_in_day in intervals_in_days:
            MailService._send_user_email(user=user,
                                         email_info=email_info,
                                         interval_in_days=interval_in_day,
                                         **kwargs)

    @staticmethod
    def send_sharing_program_email(request, email_info, **kwargs):
        intervals_in_days = email_info.get('time_intervals_in_days')
        for interval_in_day in intervals_in_days:
            MailService._send_sharing_program_email(request=request,
                                                    email_info=email_info,
                                                    interval_in_days=interval_in_day,
                                                    **kwargs)

    @staticmethod
    def send_user_email_terms_of_use_update(user):
        kwargs = {'supress_bcc_email': True}
        return MailService()._send_user_email(user, USER_EMAIL_INFO_TERMS_OF_USE_UPDATE, 0, **kwargs)

    @staticmethod
    def send_user_email_privacy_policy_update(user):
        kwargs = {'supress_bcc_email': True}
        return MailService()._send_user_email(user, USER_EMAIL_INFO_PRIVACY_POLICY_UPDATE, 0, **kwargs)

    # Send user emails to all orders (at all intervals)
    @staticmethod
    def _send_user_emails(orders, email_info):
        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            user_emails = orders.order_by('created_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. orders: {orders}')

            for order in orders:
                MailService._send_user_email(user=order.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days)
        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__order_purchased_time_interval(orders, email_info):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__order_created_time_interval] time: {todays_date - timedelta(days=interval_in_days)}')
            orders_at_interval = orders.filter(
                purchased_datetime__date=todays_date - timedelta(days=interval_in_days))
            user_emails = orders_at_interval.order_by('created_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__order_created_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. pending orders: {orders_at_interval}')

            for pending_order_at_interval in orders_at_interval:
                MailService._send_user_email(user=pending_order_at_interval.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days)
        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__order_created_time_interval(orders, email_info, **kwargs):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__order_created_time_interval] time: {todays_date - timedelta(days=interval_in_days)}')
            orders_at_interval = orders.filter(
                created_datetime__date=todays_date - timedelta(days=interval_in_days))
            user_emails = orders_at_interval.order_by('created_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__order_created_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. pending orders: {orders_at_interval}.')

            for pending_order_at_interval in orders_at_interval:
                MailService._send_user_email(user=pending_order_at_interval.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)
        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__payment_captured_time_interval(orders, email_info, **kwargs):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__payment_captured_time_interval] time: {todays_date - timedelta(days=interval_in_days)}')
            orders_at_interval = orders.filter(
                payment_captured_datetime__date=todays_date - timedelta(days=interval_in_days))
            user_emails = orders_at_interval.order_by('payment_captured_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__payment_captured_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. completed orders: {orders_at_interval}.')

            for completed_order_at_interval in orders_at_interval:
                MailService._send_user_email(user=completed_order_at_interval.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)
        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__user_date_joined_time_interval(users, email_info, **kwargs):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__user_date_joined_time_interval] time: {todays_date - timedelta(days=interval_in_days)}')
            users_at_interval = users.filter(date_joined__date=todays_date - timedelta(days=interval_in_days))
            user_emails = users_at_interval.order_by('date_joined').values_list('email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__user_date_joined_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. pending users: {users_at_interval}.')

            for pending_user_at_interval in users_at_interval:
                MailService._send_user_email(user=pending_user_at_interval,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)

        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__subscriptions_upcoming_time_interval(subscriptions, email_info, **kwargs):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__subscriptions_upcoming_time_interval] time: {todays_date + timedelta(days=interval_in_days)}')

            upcoming_subscription_orders_at_interval = subscriptions.filter(
                current_period_end_datetime__date=todays_date + timedelta(days=interval_in_days))
            user_emails = upcoming_subscription_orders_at_interval.order_by('current_period_end_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__subscriptions_upcoming_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. Subscriptions requiring yearly visit: {upcoming_subscription_orders_at_interval}.')

            for upcoming_subscription_order_at_interval in upcoming_subscription_orders_at_interval:
                MailService._send_user_email(user=upcoming_subscription_order_at_interval.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)
        # Need this just for debugging
        return user_emails_str

    @staticmethod
    def _send_user_emails__subscriptions_cancelled_time_interval(subscriptions, email_info, **kwargs):
        todays_date = date.today()

        intervals_in_days = email_info.get('time_intervals_in_days')
        user_emails_str = ''
        for interval_in_days in intervals_in_days:
            logger.debug(f'[_send_user_emails__subscription_cancelled_time_interval] time: {todays_date - timedelta(days=interval_in_days)}')
            subscriptions_cancelled_at_interval = subscriptions.filter(
                cancel_datetime__date=todays_date - timedelta(days=interval_in_days))
            user_emails = subscriptions_cancelled_at_interval.order_by('cancel_datetime').values_list(
                'customer__email')

            # Need this just for debugging
            if user_emails:
                user_emails_list = ', '.join([c[0] for c in user_emails])
                user_emails_str += f'{interval_in_days} days: {user_emails_list};'

            logger.debug(
                f'[_send_user_emails__subscription_cancelled_time_interval] user_emails_str: {user_emails_str}. '
                f'interval_in_days: {interval_in_days}. Cancelled subscriptions: {subscriptions_cancelled_at_interval}.')

            for subscription_cancelled_at_interval in subscriptions_cancelled_at_interval:
                MailService._send_user_email(user=subscription_cancelled_at_interval.customer,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)
        # Need this just for debugging
        return user_emails_str


    @staticmethod
    def _send_users_email(users, email_info, interval_in_days, **kwargs):
        user_emails = users.values_list('email')
        user_emails_list = ''
        # Need this just for debugging
        if user_emails:
            user_emails_list = ', '.join([c[0] for c in user_emails])
            logger.debug(
                f'[_send_users_email] user_emails_list: {user_emails_list}.')

            for user in users:
                MailService._send_user_email(user=user,
                                             email_info=email_info,
                                             interval_in_days=interval_in_days,
                                             **kwargs)
        return user_emails_list

    @staticmethod
    def _send_user_email(user, email_info, interval_in_days, **kwargs):
        try:
            email_type = email_info.get('email_type')
            email_intervals = email_info.get('time_intervals_in_days')
            email_details = email_intervals.get(interval_in_days)

            opt_out_tag = None
            unsubscribe_url = None
            sharing_page_url = None
            bcc_email = settings.SUPPORT_LOGS_EMAIL
            if kwargs:
                opt_out_tag = kwargs.get('opt_out_tag', None)
                supress_bcc = kwargs.get('supress_bcc_email', None)
                if supress_bcc:
                    bcc_email = None

                if opt_out_tag:
                    unsubscribe_token = user.unsubscribe_token()
                    unsubscribe_url = uri_utils.generate_absolute_url(request=None, path=f'user-unsubscribe/{user.email}/{unsubscribe_token}')
                    kwargs['unsubscribe_url'] = unsubscribe_url

                sharing_page_url = None
                if email_details.get('INSERT_SHARING_COMPONENT') or email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'):
                    sharing_page_url = MailService._generate_email_sharing_page_url(user=user, email_type=email_type, interval_in_days=interval_in_days)

            logger.debug(f"[_send_user_email] Sending user {user.id} email: {email_type}.")
            
            UserEmail(
                subject_line=email_details.get('SUBJECT_LINE'),
                first_name=user.first_name,
                lead_in_text=email_details.get('LEAD_IN_TEXT'),
                body=email_details.get('BODY'),
                unsubscribe_url=unsubscribe_url,
                sharing_page_url=sharing_page_url,
                insert_sharing_component=email_details.get('INSERT_SHARING_COMPONENT'),
                insert_emphatic_sharing_component=email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT')
            ).send_multipart(user=user, bcc_email=bcc_email, email_type=email_type, **kwargs)
        except SMTPException as error:
            logger.debug(f'[_send_user_email] Unable to send '
                         f'{email_type} email for {user.id} with error: {str(error)}')
            raise APIException(f'{email_type} not sent for: {user.email}. Error: {error}.')

    @staticmethod
    def _send_sharing_program_email(request, email_info, interval_in_days, **kwargs):
        from users.models import User

        try:
            email_type = email_info.get('email_type')
            email_intervals = email_info.get('time_intervals_in_days')
            email_details = email_intervals.get(interval_in_days)

            opt_out_tag = None
            unsubscribe_url = None
            referrer = None
            referee_email = None

            if kwargs:
                opt_out_tag = kwargs.get('opt_out_tag', None)
                referee_email = kwargs.get('referee_email', None)
                user = User.objects.filter(email=referee_email).first()
                referrer = kwargs.get('referrer', None)
                sharing_code = MailService._generate_sharing_code(**kwargs)
                referee_sharing_page_url = uri_utils.generate_absolute_url(request=request, path=f'invite/{sharing_code}')

                # TODO (Alda) - improve hacky fix
                cta_button = email_details.get('BODY')[1]
                cta_button['CTA_BUTON_URL'] = referee_sharing_page_url

                if opt_out_tag and user:
                    unsubscribe_token = user.unsubscribe_token()
                    unsubscribe_url = uri_utils.generate_absolute_url(request=request,
                                                                      path=f'user-unsubscribe/{user.email}/{unsubscribe_token}')
                    kwargs['unsubscribe_url'] = unsubscribe_url

            referrer_first_name = referrer.first_name if referrer.first_name else 'Your friend'
            referrer_full_name = referrer.get_full_name() if referrer.get_full_name() else "Your friend"

            logger.debug(f"[_send_sharing_program_email] Sending email: {email_type}. Day interval: {interval_in_days}. "
                         f"Email body: {email_details.get('BODY')}. opt_out_tag: {opt_out_tag}. "
                         f"referee_sharing_page_url: {referee_sharing_page_url}. "
                         f"referee_email: {referee_email}. sharing_code: {sharing_code}. "
                         f"user: {user}. Referrer full name: {referrer_full_name}.")

            UserEmail(
                subject_line=email_details.get('SUBJECT_LINE').format(referrer_first_name=referrer_first_name),
                lead_in_text=email_details.get('LEAD_IN_TEXT').format(referrer_first_name=referrer_first_name),
                body=email_details.get('BODY'),
                unsubscribe_url=unsubscribe_url,
                signature=' '
            ).send_multipart(user=user, from_name=referrer_full_name, to_email=referee_email, bcc_email=settings.SUPPORT_LOGS_EMAIL, **kwargs)

        except SMTPException as error:
            logger.debug(f'[_send_sharing_program_email] Unable to send '
                         f'{email_type} email for {referrer.email} with error: {str(error)}')
            raise APIException(f'{email_type} not sent for: {referrer.email}. Error: {error}.')

    @staticmethod
    def _send_user_email_with_address(user, email_info, interval_in_days, subscription=None):
        try:
            email_type = email_info.get('email_type')
            email_intervals = email_info.get('time_intervals_in_days')
            email_details = email_intervals.get(interval_in_days)
            ship_date = subscription.current_period_end_datetime.strftime("%m-%d-%Y") if subscription else None

            sharing_page_url = None
            if email_details.get('INSERT_SHARING_COMPONENT') or email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'):
                sharing_page_url = MailService._generate_email_sharing_page_url(user=user, email_type=email_type, interval_in_days=interval_in_days)

            logger.debug(f"[_send_user_email_with_address] Sending email: {email_type}. Day interval: {interval_in_days}. "
                         f"Email body: {email_details.get('BODY')}. sharing_page_url: {sharing_page_url}.")
            if subscription and subscription.shipping_details:
                UserEmail(
                    subject_line=email_details.get('SUBJECT_LINE'),
                    first_name=user.first_name,
                    lead_in_text=email_details.get('LEAD_IN_TEXT'),
                    body=email_details.get('BODY'),
                    name=f'{user.first_name} {user.last_name}',
                    address_line1=subscription.shipping_details.address_line1,
                    address_line2=subscription.shipping_details.address_line2 if subscription.shipping_details.address_line2 else "",
                    city=subscription.shipping_details.city,
                    zip=subscription.shipping_details.postal_code,
                    state=subscription.shipping_details.state,
                    ship_date=ship_date,
                    insert_sharing_component = email_details.get('INSERT_SHARING_COMPONENT'),
                    insert_emphatic_sharing_component = email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'),
                    sharing_page_url=sharing_page_url,
                ).send_multipart(user=user, bcc_email=settings.SUPPORT_LOGS_EMAIL, email_type=email_type)
            else:
                UserEmail(
                    subject_line=email_details.get('SUBJECT_LINE'),
                    first_name=user.first_name,
                    lead_in_text=email_details.get('LEAD_IN_TEXT'),
                    body=email_details.get('BODY'),
                    name=f'{user.first_name} {user.last_name}',
                    ship_date=ship_date,
                    insert_sharing_component = email_details.get('INSERT_SHARING_COMPONENT'),
                    insert_emphatic_sharing_component = email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'),
                    sharing_page_url=sharing_page_url,
                ).send_multipart(user=user, bcc_email=settings.SUPPORT_LOGS_EMAIL, email_type=email_type)
        except SMTPException as error:
            logger.debug(f'[_send_user_email] Unable to send '
                         f'{email_type} email for {user.id} with error: {str(error)}')
            raise APIException(f'{email_type} not sent for: {user.email}. Error: {error}.')

    @staticmethod
    def send_user_shipment_notification(order, tracking_number, tracking_uri, is_update, email_info=None):
        user = order.customer

        if not email_info:
            email_info = USER_EMAIL_INFO_ORDER_SHIPPED_TRIAL
            if is_update:
                email_info = USER_EMAIL_INFO_ORDER_TRACKING_UPDATE
            if order.is_refill or not order.is_rx_order():
                email_info = USER_EMAIL_INFO_ORDER_SHIPPED

        email_type = email_info.get('email_type')
        email_intervals = email_info.get('time_intervals_in_days')
        email_details = email_intervals.get(0)

        sharing_page_url = None
        if email_details.get('INSERT_SHARING_COMPONENT') or email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'):
            sharing_page_url = MailService._generate_email_sharing_page_url(user=user, email_type=email_type)

        products = None
        if not order.is_rx_order():
            products = order.get_shopping_bag_product_data()

        logger.debug(f'[MailService][send_user_shipment_notification] '
                     f'Order: {order.id}. '
                     f'Tracking Number: {tracking_number}. '
                     f'Tracking URI: {tracking_uri}.'
                     f'Is update: {is_update}. '
                     f'sharing_page_url: {sharing_page_url}. '
                     f'products: {products}.')
        try:
            UserEmail(
                subject_line=email_details.get('SUBJECT_LINE'),
                first_name=user.first_name,
                lead_in_text=email_details.get('LEAD_IN_TEXT'),
                body=email_details.get('BODY'),
                name=f'{order.customer.first_name} {order.customer.last_name}',
                address_line1=order.shipping_details.address_line1,
                address_line2=order.shipping_details.address_line2,
                city=order.shipping_details.city,
                zip=order.shipping_details.postal_code,
                state=order.shipping_details.state,
                tracking_uri=tracking_uri,
                tracking_number=tracking_number,
                shipping_carrier=order.shipping_carrier,
                insert_sharing_component=email_details.get('INSERT_SHARING_COMPONENT'),
                insert_emphatic_sharing_component=email_details.get('INSERT_EMPHATIC_SHARING_COMPONENT'),
                sharing_page_url=sharing_page_url,
                products=products
            ).send_multipart(user=user, bcc_email=settings.SUPPORT_LOGS_EMAIL, email_type=email_type)
        except SMTPException as error:
            logger.debug(f'[_send_user_email] Unable to send '
                         f'{email_type} email for {user.email} with error: {str(error)}.')
            notes = f'Customer Email: {user.email}. Tracking Number: {tracking_number}.'
            MailService.send_error_notification_email(notification='UNABLE TO SEND TRACKING INFO TO CUSTOMER',
                                                      data=notes)
    @staticmethod
    def _generate_sharing_code(**kwargs):
        entry_point = kwargs.get('entry_point', None)
        entry_point_email_type = kwargs.get('email_type', None)
        entry_point_email_reminder_interval_in_days = kwargs.get('email_reminder_interval_in_days', None)
        referrer = kwargs.get('referrer', None)
        referee_email = kwargs.get('referee_email', None)

        logger.debug(f"[_generate_sharing_code] kwargs: {kwargs}. referee_email: {referee_email}. "
                     f"entry_point: {entry_point}. entry_point_email_type: {entry_point_email_type}. "
                     f"entry_point_email_reminder_interval_in_days: {entry_point_email_reminder_interval_in_days}.")

        sharing_code = Sharing.get_code(referrer=referrer,
                                        entry_point=entry_point,
                                        communication_method=Sharing.CommunicationMethod.email,
                                        email_type=entry_point_email_type,
                                        email_reminder_interval_in_days=entry_point_email_reminder_interval_in_days
                                        )
        return sharing_code

    @staticmethod
    def _generate_email_sharing_page_url(user, email_type=0, interval_in_days=0):
        formatted_entry_point = "{:01d}".format(Sharing.EntryPoint.email)
        formatted_email_type = "{:02d}".format(email_type)
        formatted_interval_in_days = "{:02d}".format(interval_in_days)
        sharing_page_url = uri_utils.generate_absolute_url(request=None,
                                                           path=f'sharing-program?re={user.email}&ep={formatted_entry_point}&et={formatted_email_type}&i={formatted_interval_in_days}')
        return sharing_page_url


    @staticmethod
    def send_email(message_body, topic, to_email):
        logger.debug(f'[send_email] body: {message_body} topic: {topic} to_email: {to_email}')

        try:
            GenericMail(message_body=message_body, topic=topic).send(to_email=to_email)
        except SMTPException as error:
            logger.error(f'[send_user_feedback_email] Unable to send user feedback email '
                         f'for {message_body} with error: {str(error)}')
