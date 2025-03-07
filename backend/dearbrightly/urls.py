"""Dearbrightly URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_swagger.views import get_swagger_view

from dearbrightly.settings import API_NAME
from dearbrightly.views import AuthRequiredGraphQLView
from emr.schema import schema as dearbrightly_graphql_schema

schema_view = get_swagger_view(title="Dearbrightly API")

vi_urlpatterns = [
    path('', include('users.urls', namespace='users')),
    path('', include('orders.urls', namespace='orders')),
    path('', include('subscriptions.urls', namespace='subscriptions')),
    path('', include('products.urls', namespace='products')),
    path('', include('sharing.urls', namespace='sharing')),
    path('analytics/', include('db_analytics.urls', namespace='db_analytics')),
    path('auth/', include('authentication.urls', namespace='auth')),
    path('payment/', include('payment.urls', namespace='payment')),
    path('mail/', include('mail.urls', namespace='mail')),
    path('sms/', include('sms.urls', namespace='sms')),
    path('shipping/', include('shipping.urls', namespace='shipping')),
    path('shopify/', include('db_shopify.urls', namespace='shopify')),
    path('', include('emr.urls', namespace='emr')),
]

urlpatterns_new = [
    path('', include('products_new.urls', namespace='products_new')),
    path('', include('users_new.urls', namespace='users_new')),
    path('', include('emr_new.urls', namespace='emr_new')),
    path('sharing/', include('sharing_new.urls', namespace='sharing_new')),
    path('payment/', include('payment_new.urls', namespace='payment_new')),
]

api_urlpatterns = [
    path('admin', admin.site.urls),
    path('v1/', include(vi_urlpatterns)),
    path('v2/', include(urlpatterns_new)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path(
        'graphql',
        AuthRequiredGraphQLView.as_view(
            graphiql=settings.DEBUG, schema=dearbrightly_graphql_schema
        ),
        name=API_NAME,
    ),
]

if settings.DEBUG:
    api_urlpatterns += [path('docs', schema_view, name='docs')]

urlpatterns = [
    path('api/', include(api_urlpatterns)),
]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
