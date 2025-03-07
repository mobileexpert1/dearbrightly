from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.tests.factories import UserFactory


class LoginAsUserTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = UserFactory(email="test_admin@db.com", is_staff=True)
        cls.user = UserFactory(email="test_user@db.com")
        cls.login_as_user_url = reverse("customers:login-as-user")
        cls.login_as_user_data = {
            "email": cls.user.email,
        }
        cls.products_url = reverse("products:products-list")

    def test_login_as_user_unauthenticated(self):
        response = self.client.post(
            path=self.login_as_user_url, data=self.login_as_user_data
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_as_user_with_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=self.login_as_user_url, data=self.login_as_user_data
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_as_user_with_admin(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            path=self.login_as_user_url, data=self.login_as_user_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.wsgi_request.user, self.user)

    def test_login_as_user_with_invalid_data(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            path=self.login_as_user_url, data={"email": "invalid_email"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("email")[0], "Enter a valid email address.")

    def test_login_as_user_with_email_that_does_not_belong_to_any_user(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            path=self.login_as_user_url, data={"email": "invalid_email@db.com"}
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get("detail"), "Not found.")
