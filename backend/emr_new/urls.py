from django.urls import path

from emr_new.views import CurexaSendReplacementOrder
from emr_new.views import UserAllergySearchView

app_name = "emr_new"

urlpatterns = [
    path(
        "emr_new/curexa/send-replacement-order",
        CurexaSendReplacementOrder.as_view(),
        name="send-replacement-order",
    ),
    path(
        "emr_new/user-allergy-search",
        UserAllergySearchView.as_view(),
        name="user-allergy-search"
    )
]
