from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status

from authentication.tests.fixtures import user_data, user_credentials, user_data_2
from users.models import User


class BaseTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.register_url = reverse('auth:auth-register')
        cls.login_url = reverse('auth:auth-login')
        cls.logout_url = reverse('auth:auth-logout')

    def setUp(self):
        self.user = User.objects.create_user(**user_data)


class AuthenticationViewSetTestCase(BaseTestCase):
    @override_settings(SAPPIRA_DISABLED=True)
    def test_register(self):
        response = self.client.post(path=self.register_url, data=user_data_2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_login(self):
        response = self.client.post(path=self.login_url, data=user_credentials)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_logout(self):
        self.client.post(path=self.login_url, data=user_credentials)
        response = self.client.post(path=self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
