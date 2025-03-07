from django.urls import path
from rest_framework.routers import DefaultRouter

import sms.views as sms

app_name = 'sms'

router = DefaultRouter(trailing_slash=False)

urlpatterns = [
    path('send_sms', sms.send_sms, name='send_sms'),
] + router.urls