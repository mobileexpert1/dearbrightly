from django.urls import path

from users_new.views import LoginAsUserAPIView


app_name = "customers"

urlpatterns = [
    path("login-as-user", LoginAsUserAPIView.as_view(), name="login-as-user"),
]
