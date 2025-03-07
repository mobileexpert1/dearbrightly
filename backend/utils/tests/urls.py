from django.urls import path, include
from rest_framework import routers

from dearbrightly import settings
from dearbrightly.settings import API_NAME
from dearbrightly.views import AuthRequiredGraphQLView
from utils.tests.schema import schema
from utils.tests.views import ReporterViewSet

router = routers.SimpleRouter()
router.register("reporters", ReporterViewSet, base_name="reporter")

urlpatterns = [
    path('api/graphql', AuthRequiredGraphQLView.as_view(graphiql=settings.DEBUG, schema=schema),
         name=API_NAME),
    path('auth/', include('authentication.urls', namespace='auth')),
] + router.urls
