from django.urls import path
from rest_framework.routers import DefaultRouter

import mail.views as mail

app_name = 'mail'

router = DefaultRouter(trailing_slash=False)

urlpatterns = [
    path('test_send_user_email', mail.test_send_user_email, name='test_send_user_email'),
    path('send_sharing_email', mail.send_sharing_email, name='send_sharing_email'),
    path('send_email', mail.send_email, name='send_email'),
] + router.urls