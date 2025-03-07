from rest_framework.routers import DefaultRouter

from sharing.views import SharingViewSet

app_name = 'sharing'

router = DefaultRouter(trailing_slash=False)
router.register('sharing', SharingViewSet, base_name='sharing')

urlpatterns = router.urls