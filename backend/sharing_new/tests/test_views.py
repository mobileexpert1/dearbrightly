from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory

from users.models import User


class TestSharingApiView(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory
        self.get_referral_code_url = reverse("sharing_new:get_referral_code")
        self.user = User.objects.create(
            password="password", first_name="user", email="user@test.test"
        )
        self.second_user = User.objects.create(
            password="password",
            first_name="user",
            last_name="name",
            email="user1@test.test",
        )
        self.data = {
            "communication_method": 3,
            "email_reminder_interval_in_days": None,
            "email_type": None,
            "entry_point": 2,
            "referrer_email": None,
        }

    def test_sharing_code(self):
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], "230000")

    def test_sharing_code_different_communication_method(self):
        self.data["communication_method"] = 5
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], "250000")

    def test_sharing_code_different_email_reminder_interval_in_days(self):
        self.data["email_reminder_interval_in_days"] = 1
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], "23001")

    def test_sharing_code_different_email_type(self):
        self.data["email_type"] = 1
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], "23100")

    def test_sharing_code_different_referrer_email(self):
        self.data["referrer_email"] = "test@test.test"
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], "230000")

    def test_sharing_code_existing_email(self):
        self.data["referrer_email"] = self.user.email
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["code"], (self.user.first_name + "230000").lower()
        )

    def test_sharing_code_authenticated_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], self.user.sharing_code + "230000")

    def test_sharing_code_multiple_users_with_same_name(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["code"], self.user.sharing_code + "230000")

        self.client.force_authenticate(user=self.second_user)
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["code"], self.second_user.sharing_code + "230000"
        )

    def test_sharing_code_no_communication_method(self):
        self.data.pop("communication_method")
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sharing_code_no_email_reminder_interval_in_days(self):
        self.data.pop("email_reminder_interval_in_days")
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sharing_code_no_email_type(self):
        self.data.pop("email_type")
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sharing_code_no_entry_point(self):
        self.data.pop("entry_point")
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sharing_code_no_referrer_email(self):
        self.data.pop("referrer_email")
        response = self.client.post(
            self.get_referral_code_url, data=self.data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
