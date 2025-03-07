from django.urls import path

from sharing_new.views import SharingAPIView

app_name = "sharing_new"

urlpatterns = [
    path("get_referral_code", SharingAPIView.as_view(), name="get_referral_code"),
]
