from rest_framework.routers import DefaultRouter

from users.views import (
    AdminUserViewSet, 
    UserViewSet, 
    MedicalProviderStatesUpdateViewset,
    VacationDaysViewset,
)

app_name = 'users'

router = DefaultRouter(trailing_slash=False)
router.register('customers', UserViewSet, base_name='customers')
router.register('admin/customers', AdminUserViewSet, base_name='admin_customers')
router.register('medical-providers/states-update', MedicalProviderStatesUpdateViewset, base_name='medical-providers-states-update')
router.register('medical-providers/vacation-days', VacationDaysViewset, base_name='medical-providers-vacation-days')

urlpatterns = router.urls
