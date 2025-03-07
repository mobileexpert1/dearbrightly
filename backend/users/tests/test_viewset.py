from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import PasswordResetToken
from users.tests.factories import UserFactory
from factory.faker import faker

class UserViewSetTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.old_password = 'DearbrightlyGo1'
        cls.new_password = 'GoGoPowerRangers2'

        cls.login_url = reverse('auth:auth-login')
        cls.reset_password_url = reverse('users:customers-reset_password')
        cls.reset_password_token_url = reverse('users:customers-reset_password_token')
        cls.reset_password_confirm_url = reverse(
            'users:customers-reset_password_confirm'
        )
        cls.user = UserFactory()
        cls.admin = UserFactory(is_superuser=True)
        cls.user_detail_url = reverse(
            'users:customers-detail', kwargs={'uuid': cls.user.uuid}
        )
        cls.admin_detail_url = reverse(
            'users:customers-detail', kwargs={'uuid': cls.admin.uuid}
        )
        cls.unused_phone_number = faker.Faker().numerify("812#######")

    @override_settings(SAPPIRA_DISABLED=True)
    def setUp(self):
        self.user = UserFactory(password=self.old_password)
        self.token = PasswordResetToken.objects.create(user=self.user)

        self.change_password_data = {
            'old_password': self.old_password,
            'new_password_1': self.new_password,
            'new_password_2': self.new_password,
        }

        self.change_password_url = reverse(
            'users:customers-change_password', args=(self.user.uuid,)
        )
        self.detail_url = reverse('users:customers-detail', args=(self.user.uuid,))

    @override_settings(SAPPIRA_DISABLED=True)
    def test_change_password_success(self):
        self.client.post(
            path=self.login_url,
            data={'email': self.user.email, 'password': self.old_password},
        )
        response = self.client.post(
            path=self.change_password_url, data=self.change_password_data
        )
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.check_password(self.new_password))

    @override_settings(SAPPIRA_DISABLED=True)
    def test_change_password_failure(self):
        self.client.post(
            path=self.login_url,
            data={'email': self.user.email, 'password': self.old_password},
        )
        self.change_password_data['old_password'] = 'WrongPassword'
        response = self.client.post(
            path=self.change_password_url, data=self.change_password_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_reset_password_send_email(self):
        response = self.client.post(
            path=self.reset_password_url,
            data={'email': self.user.email},
            HTTP_HOST='localhost',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            not PasswordResetToken.objects.filter(
                key=self.token.key, user=self.user
            ).exists()
        )

    def test_reset_password_token_is_valid(self):
        response = self.client.post(
            path=self.reset_password_token_url, data={'token': self.token}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_token_is_invalid(self):
        response = self.client.post(
            path=self.reset_password_token_url, data={'token': 'FakeToken'}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_reset_password_confirm(self):
        reset_password_data = {
            'token': self.token,
            'password': self.new_password,
            'reset_password_confirm': self.new_password,
        }

        response = self.client.patch(
            path=self.reset_password_confirm_url, data=reset_password_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @override_settings(SAPPIRA_DISABLED=True)
    def test_partial_update_sappira_user(self):
        self.client.post(
            path=self.login_url,
            data={'email': self.user.email, 'password': self.old_password},
        )
        response = self.client.patch(self.detail_url, data={'first_name': 'Jane'})
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.first_name, 'Jane')

    def test_get_user_info_as_unauthenticated_user(self):
        response = self.client.get(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_info_valid(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_info_invalid(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.admin_detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_info_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.user_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_unused_phone_number(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": self.unused_phone_number,
                },
            },
            format="json",
        )
        self.user.shipping_details.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.shipping_details.phone, self.unused_phone_number)

    def test_partial_update_phone_number_no_change(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": self.user.shipping_details.phone,
                },
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_existing_phone_number(self):
        self.client.force_authenticate(user=self.user)
        existing_user = UserFactory()
        existing_user.save()
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": existing_user.shipping_details.phone,
                },
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["detail"]), "An Account with this phone number already exists.")

    def test_partial_update_new_user_existing_phone_number(self):
        self.client.force_authenticate(user=self.user)
        existing_user = UserFactory()
        existing_user.save()
        self.user.shipping_details.phone = None
        self.user.shipping_details.save()
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": existing_user.shipping_details.phone,
                },
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["detail"]), "An Account with this phone number already exists.")

    def test_partial_update_new_user_unused_phone_number(self):
        self.client.force_authenticate(user=self.user)
        self.user.shipping_details.phone = None
        self.user.shipping_details.save()
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": self.unused_phone_number,
                },
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_existing_phone_number_inactive_user(self):
        self.client.force_authenticate(user=self.user)
        existing_user = UserFactory(is_active=False)
        existing_user.save()
        response = self.client.patch(
            path=self.detail_url,
            data={
                "shipping_details": {
                    "phone": existing_user.shipping_details.phone,
                },
            },
            format="json",
        )
        self.user.shipping_details.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.shipping_details.phone, existing_user.shipping_details.phone)
