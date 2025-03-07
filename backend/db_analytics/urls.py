from django.urls import path
from rest_framework.routers import DefaultRouter
from db_analytics.views import AnalyticsViewSet

app_name = 'AnalyticsViewSet'

router = DefaultRouter(trailing_slash=False)


urlpatterns = [
    path('webhooks/optimizely', AnalyticsViewSet.optimizely_webhook_handler, name='optimizely_webhook'),
    path('get_how_did_you_hear_about_us_responses', AnalyticsViewSet.get_how_did_you_hear_about_us_responses, name='get_how_did_you_hear_about_us_responses'),
    path('pregnancy_ttc_nursing_data', AnalyticsViewSet.pregnancy_ttc_nursing_data, name='pregnancy_ttc_nursing_data'),
    path('get_aov_value', AnalyticsViewSet.get_aov_value, name='get_aov_value'),
    path('get_apf_value', AnalyticsViewSet.get_apf_value, name='get_apf_value'),
    path('get_acl_value', AnalyticsViewSet.get_acl_value, name='get_acl_value'),
    path('influencer_data', AnalyticsViewSet.influencer_data, name='influencer_data'),
    path('cohort_data', AnalyticsViewSet.cohort_data, name='cohort_data'),
    path('test_klaviyo_events', AnalyticsViewSet.test_klaviyo_events, name='test_klaviyo_events'),
    path('migrate_klaviyo_events', AnalyticsViewSet.migrate_klaviyo_events, name='migrate_klaviyo_events'),
    path('update_klaviyo_users', AnalyticsViewSet.update_klaviyo_users, name='update_klaviyo_users'),
    path('update_klaviyo_orders', AnalyticsViewSet.update_klaviyo_orders, name='update_klaviyo_orders'),
    path('cohort_data/delays', AnalyticsViewSet.cohort_delay_data, name='cohort_delay_data'),
] + router.urls
