from django.contrib.auth.models import Group
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from mock import patch
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from authentication.services.authentication_service import AuthenticationService
from authentication.services.jwt_service import JWTService
from authentication.tests.fixtures import user_data, user_credentials, user_data_2
from users.models import User


class AuthenticationServiceTestCase(TestCase):
    authentication_service = AuthenticationService()
    factory = RequestFactory()

    @classmethod
    def setUpTestData(cls):
        cls.register_url = reverse('auth:auth-register')
        cls.login_url = reverse('auth:auth-login')
        cls.logout_url = reverse('auth:auth-logout')

    def setUp(self):
        self.user = User.objects.create_user(**user_data)

        self.register_request = self.factory.post(path=self.register_url, data=user_data_2)
        self.register_request.data = user_data_2
        self.register_request.session = self.client.session

        self.login_request = self.factory.post(path=self.login_url, data=user_credentials)
        self.login_request.data = user_credentials
        self.login_request.session = self.client.session

        self.logout_request = self.factory.post(path=self.logout_url)
        self.logout_request.session = self.client.session
        self.logout_request.user = self.user

    @staticmethod
    def _count_all_users():
        return User.objects.all().count()

    @staticmethod
    def _get_group(name):
        return Group.objects.get(name=name)

    @staticmethod
    def _get_user(email):
        return User.objects.get(email=email)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_register_user(self):
        self.assertEqual(self._count_all_users(), 1)
        result = self.authentication_service.register_user(self.register_request)
        self.assertEqual(self._count_all_users(), 2)
        self.assertTrue(self._get_user(user_data.get('email')).is_active)
        self.assertTrue(result.data.get('email'), user_data.get('email'))

    @override_settings(SAPPIRA_DISABLED=True)
    def test_add_user_to_group(self):
        self.authentication_service.register_user(self.register_request)
        user = self._get_user(user_data_2.get('email'))
        self.assertIn(self._get_group('Customers'), user.groups.all())

    @override_settings(SAPPIRA_DISABLED=True)
    @patch.object(JWTService, 'obtain_and_set_to_cookie_jwt_token')
    def test_login_user_authentication_failure(self, mock_jwt_token):
        user = self._get_user(user_credentials.get('email'))
        user.is_active = False
        user.save()
        with self.assertRaises(AuthenticationFailed):
            self.authentication_service.login_user(self.login_request)

    @override_settings(SAPPIRA_DISABLED=True)
    @patch.object(JWTService, 'obtain_and_set_to_cookie_jwt_token')
    def test_logout_user(self, mock_jwt_token):
        self.authentication_service.login_user(self.login_request)
        result = self.authentication_service.logout_user(self.logout_request)
        self.assertEqual(result.status_code, status.HTTP_200_OK)
