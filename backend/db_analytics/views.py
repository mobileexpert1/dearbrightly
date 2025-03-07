from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db.models import Q
from db_analytics.services import OptimizelyService, CohortDataService, KlaviyoService
from db_analytics.permissions import Dear_Brightly_API_Key_Auth
from datetime import datetime
from rest_framework.viewsets import ViewSet
from django.shortcuts import get_object_or_404
from django.utils import timezone

optimizely_service = OptimizelyService(settings.OPTIMIZELY_PROJECT_ID)

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

class AnalyticsViewSet(ViewSet):
    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def get_acl_value(request):
        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S+00")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S+00")

        order_type = request.data.get('order_type', None)

        logger.debug(f'[get_apf_value] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}.')

        response = CohortDataService().get_acl_value(order_type=order_type,
                                                     start_time_datetime=start_time_datetime,
                                                     end_time_datetime=end_time_datetime)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def get_apf_value(request):
        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S+00")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S+00")

        order_type = request.data.get('order_type', None)

        logger.debug(f'[get_apf_value] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}.')

        response = CohortDataService().get_apf_value(order_type=order_type,
                                                     start_time_datetime=start_time_datetime,
                                                     end_time_datetime=end_time_datetime)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def get_aov_value(request):
        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S+00")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S+00")

        order_type = request.data.get('order_type', None)

        logger.debug(f'[get_aov_value] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}. '
                     f'order_type: {order_type}.')

        response = CohortDataService().get_aov_value(order_type=order_type,
                                                     start_time_datetime=start_time_datetime,
                                                     end_time_datetime=end_time_datetime)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['POST'])
    @permission_classes([AllowAny])
    def optimizely_webhook_handler(request):
        event_type = request.data.get('event')

        logger.debug(f'[optimizely_webhook_handler] Getting an Optimizely webhook {request.data}. Event type: {event_type}')

        # use CDN URL from webhook payload
        if event_type == 'project.datafile_updated':
            url = request.data.get('cdn_url')
            optimizely_service.get_client().set_client(url)
            return Response(data={'success': True}, status=status.HTTP_200_OK)

        return Response(data={'success': False}, status=status.HTTP_400_BAD_REQUEST)


    # # Gets the breakdown of how users heard about dearbrightly:
    # {
    #     "Influencer": "15.25% [52]",
    #     "Social media": "23.75% [81]",
    #     "News article": "12.32% [42]",
    #     "Internet search": "21.11% [72]",
    #     "Family/friend": "12.32% [42]",
    #     "Podcast": "6.74% [23]",
    #     "Other": "8.50% [29]",
    #     "TOTAL": 341
    # }
    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def get_how_did_you_hear_about_us_responses(request):
        from emr.models import QuestionnaireAnswers

        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%m-%d-%y")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%m-%d-%y")

        logger.debug(f'[get_how_did_you_hear_about_us_responses] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}.')

        responses = {
            'Influencer' : 0,
            'Social media' : 0,
            'News article': 0,
            'Internet search': 0,
            'Family/friend': 0,
            'Podcast': 0,
            'Radio': 0,
            'Other': 0
        }
        questionnaire_answers = QuestionnaireAnswers.objects.all()

        if start_time:
            questionnaire_answers = questionnaire_answers.filter(created_datetime__gte=start_time_datetime)

        if end_time:
            questionnaire_answers = questionnaire_answers.filter(created_datetime__lte=end_time_datetime)

        for questionnaire_answer in questionnaire_answers:
            response = questionnaire_answer.get_how_did_you_hear_about_us_response()
            logger.debug(f'[get_how_did_you_hear_about_us_responses] response: {response}. '
                         f'user: {questionnaire_answer.patient.email}')
            if response:
                responses[response] += 1

        total = 0
        for value in responses.values():
            logger.debug(f'[get_how_did_you_hear_about_us_responses] value: {value}')
            total += int(value)

        for response_key in responses.keys():
            value = int(responses[response_key])
            percentage = '{:.1f}'.format(100*value/total)
            responses[response_key] = f'{percentage}% [{value}]'

        responses['TOTAL'] = total

        return Response(data=responses, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def pregnancy_ttc_nursing_data(request):
        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%m-%d-%y")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%m-%d-%y")

        logger.debug(f'[pregnancy_ttc_nursing_data] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}.')

        response = CohortDataService().get_pregnancy_ttc_nursing_data(start_time_datetime, end_time_datetime)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def influencer_data(request):
        start_time_datetime = end_time_datetime = None
        start_time = request.data.get('start_time')
        if start_time:
            start_time_datetime = datetime.strptime(start_time, "%m-%d-%y")

        end_time = request.data.get('end_time')
        if end_time:
            end_time_datetime = datetime.strptime(end_time, "%m-%d-%y")

        logger.debug(f'[influencer_data] '
                     f'start_time_datetime: {start_time_datetime}. '
                     f'end_time_datetime: {end_time_datetime}.')

        response = CohortDataService().get_influencer_data(start_time_datetime, end_time_datetime)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def cohort_data(request):
        days = request.data.get('days')
        response = CohortDataService().get_cohort_data(days)
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['GET'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def cohort_delay_data(request):
        response = CohortDataService().get_delay_data()
        return Response(data=response, status=status.HTTP_200_OK)

    @api_view(['POST'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def test_klaviyo_events(request):
        from orders.models import Order
        from users.models import User

        order_id = request.data.get('order_id')
        email = request.data.get('email')

        if email:
            user =  get_object_or_404(User, email=email)
            KlaviyoService().identify(user)

        if order_id:
            order = get_object_or_404(Order, id=order_id)
            KlaviyoService().track_placed_order_event(order)

        return Response(status=status.HTTP_200_OK)


    @api_view(['POST'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def migrate_klaviyo_events(request):
        from orders.models import Order
        from users.models import User

        active_users = User.objects.filter(Q(is_active=True) & Q(is_klaviyo_migrated=False))
        for active_user in active_users:
            KlaviyoService().identify(active_user)

        all_purchased_orders = Order.objects.filter(Q(purchased_datetime__isnull=False) & Q(is_klaviyo_migrated=False))

        for order in all_purchased_orders:
            KlaviyoService().track_placed_order_event(order)

        for order in all_purchased_orders.filter(status='Refunded'):
            KlaviyoService().track_refunded_order_event(order)

        for order in all_purchased_orders.filter(status='Cancelled'):
            KlaviyoService().track_canceled_order_event(order)

        for order in all_purchased_orders.filter(payment_captured_datetime__isnull=False):
            KlaviyoService().track_fulfilled_order_event(order)

        return Response(status=status.HTTP_200_OK)


    @api_view(['POST'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def update_klaviyo_users(request):
        from users.models import User

        active_users = User.objects.filter(is_active=True)
        for active_user in active_users:
            KlaviyoService().update_profile(active_user)

        return Response(status=status.HTTP_200_OK)


    @api_view(['POST'])
    @permission_classes([Dear_Brightly_API_Key_Auth])
    def update_klaviyo_orders(request):
        from orders.models import Order

        all_purchased_orders = Order.objects.filter(purchased_datetime__isnull=False)
        for order in all_purchased_orders:
            KlaviyoService().track_placed_order_event(order)

        for order in all_purchased_orders.filter(status='Refunded'):
            KlaviyoService().track_refunded_order_event(order)

        for order in all_purchased_orders.filter(status='Cancelled'):
            KlaviyoService().track_canceled_order_event(order)

        for order in all_purchased_orders.filter(payment_captured_datetime__isnull=False):
            KlaviyoService().track_fulfilled_order_event(order)

        return Response(status=status.HTTP_200_OK)
