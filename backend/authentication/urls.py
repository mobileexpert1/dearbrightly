from rest_framework.routers import DefaultRouter
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import refresh_jwt_token
from authentication.views import AuthenticationViewSet
from django.urls import path, include
from authentication import views as authentication_views

app_name = 'authentication'

router = DefaultRouter(trailing_slash=False)
router.register('', AuthenticationViewSet, base_name='auth')

urlpatterns = [
    path('token-auth/', obtain_jwt_token),
    path('token-refresh/', refresh_jwt_token),
    path('', include(router.urls)),
]

#urlpatterns = router.urls
