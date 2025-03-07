from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.tests.factories import UserFactory

class OptInSMSNotificationsTestCase(APITestCase):

    @override_settings(SAPPIRA_DISABLED=True)
    def setUp(self):
        self.user = UserFactory()
        self.detail_url = reverse('users:customers-detail', args=(self.user.uuid,))

    def test_partial_update_enable_sms_notifications(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            path=self.detail_url,
            data={
                "opt_in_sms_app_notifications": True,
            },
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.opt_in_sms_app_notifications, True)

    def test_partial_update_disable_sms_notifications(self):
        self.client.force_authenticate(user=self.user)
        self.user.opt_in_sms_app_notifications = True
        self.user.save()
        response = self.client.patch(
            path=self.detail_url,
            data={
                "opt_in_sms_app_notifications": False,
            },
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.opt_in_sms_app_notifications, False)
