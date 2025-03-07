from django.test import override_settings
from rest_framework import test
from rest_framework.reverse import reverse

from users.models import User
from utils.models import Log
from utils.tests.models import Reporter


@override_settings(ROOT_URLCONF="utils.tests.urls")
class PHIViewSetLoggingMixinModelViewSetTestCase(test.APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser("admin@example.com", "Zaq12wsx")
        self.client.post(path=reverse('auth:auth-login'), data={'email': "admin@example.com", "password": "Zaq12wsx"})

    def test_create_logs_after_list_request(self):
        with self.subTest("With no objects in the database"):
            self.client.get(reverse("reporter-list"))

            self.assertEqual(Log.objects.filter(action=Log.READ).count(), 0)

        with self.subTest("With one object in the database"):
            Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

            self.client.get(reverse("reporter-list"))
            self.assertEqual(Log.objects.filter(action=Log.READ).count(), 1)
            self.assertEqual(Log.objects.first().fields, "id, first_name, last_name, extra")

        with self.subTest("With multiple objects in the database"):
            Reporter.objects.create(first_name="Robert", last_name="Taylor")
            Reporter.objects.create(first_name="John", last_name="Robinson")

            self.client.get(reverse("reporter-list"))
            self.assertEqual(Log.objects.filter(action=Log.READ).count(), 4)

    def test_create_logs_after_list_detail_request(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

        self.client.get(reverse("reporter-detail", args=[reporter.pk]))
        self.assertEqual(Log.objects.first().fields, "id, first_name, last_name, extra")
        self.assertEqual(Log.objects.first().object_id, reporter.pk)
        self.assertEqual(Log.objects.filter(action=Log.READ).count(), 1)

    def test_create_logs_after_create_request(self):
        reporter_data = {
            "first_name": "Robert",
            "last_name": "Johnson",
            "extra": "Extra"
        }

        self.client.post(reverse("reporter-list"), data=reporter_data)
        self.assertEqual(Log.objects.filter(action=Log.CREATED).count(), 1)

    def test_create_logs_after_patch_request(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

        reporter_updated_data = {
            "first_name": "Robert"
        }

        self.client.patch(reverse("reporter-detail", args=[reporter.pk]), data=reporter_updated_data)
        self.assertEqual(Log.objects.filter(action=Log.UPDATED).count(), 1)

    def test_create_logs_after_put_request(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

        reporter_updated_data = {
            "first_name": "Robert",
            "last_name": "Taylor",
            "extra": "Extra updated"
        }

        self.client.put(reverse("reporter-detail", args=[reporter.pk]), data=reporter_updated_data)
        self.assertEqual(Log.objects.filter(action=Log.UPDATED).count(), 1)

    def test_create_logs_after_request_to_detail_action(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

        self.client.post(reverse("reporter-action-detail", args=[reporter.pk]))
        self.assertEqual(Log.objects.filter(action=Log.CREATED).count(), 1)
        self.assertEqual(Log.objects.first().fields, "detail")

    def test_create_logs_after_request_to_action(self):
        Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

        self.client.get(reverse("reporter-action"))
        self.assertEqual(Log.objects.filter(action=Log.READ).count(), 1)
        self.assertEqual(Log.objects.first().fields, "detail")
