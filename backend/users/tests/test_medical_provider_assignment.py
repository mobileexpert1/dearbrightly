from django.test import TestCase, override_settings
from users.tests.factories import (
    MedicalProviderUserFactory, 
    GroupFactory, 
    UserFactory,
    ShippingDetailsFactory,
)
from emr_new.tests.factories import VisitFactory
from unittest.mock import patch
from django.utils import timezone
from users.tests.factories import VacationDaysFactory
from rest_framework.test import APITestCase
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from dateutil.relativedelta import relativedelta

class MedicalProviderAssignmentTestCase(TestCase):
    fixtures = ["emr_question_ids", "emr_questionnaire_initial_20200102.json"]

    @classmethod
    def setUpTestData(cls):
        cls.medical_providers = GroupFactory(name="Medical Provider")
        cls.customers = GroupFactory(name="Customers")

    def setUp(self):
        self.shipping_details = ShippingDetailsFactory(state="CA")
        self.default_medical_provider = MedicalProviderUserFactory(
            email="dearbrightly.test+medical_provider@gmail.com",
            states=["CA", "IL", "MA"],
            groups=(self.medical_providers,),
        )
        self.medical_provider = MedicalProviderUserFactory(
            states=["CA", "IL", "MA"],
            groups=(self.medical_providers,),
        )
        self.other_medical_provider = MedicalProviderUserFactory(
            states=["AL", "CA", "CT"],
            groups=(self.medical_providers,),
        )
        self.patient = UserFactory(
            shipping_details=self.shipping_details,
            groups=(self.customers,)
        )
        self.other_patient = UserFactory(
            shipping_details=self.shipping_details,
            groups=(self.customers,)
        )

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_no_medical_provider_assigned_to_patients_state(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        self.patient.shipping_details.state = "NY"
        self.patient.shipping_details.save()
        VisitFactory(patient=self.patient)

        medical_provider = self.patient.get_medical_provider()
        self.assertEqual(self.default_medical_provider.id, medical_provider.id)

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_no_multiple_providers_for_state(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        self.patient.shipping_details.state = "CT"
        self.patient.shipping_details.save()
        VisitFactory(patient=self.patient)

        medical_provider = self.patient.get_medical_provider()
        self.assertEqual(self.other_medical_provider.id, medical_provider.id)

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_without_previous_visits(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        VisitFactory(patient=self.patient)

        medical_provider = self.patient.get_medical_provider()
        self.assertTrue(self.medical_provider.medical_provider_visits.count())
        self.assertFalse(self.other_medical_provider.medical_provider_visits.count())
        self.assertEqual(self.other_medical_provider.id, medical_provider.id)

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_earliest_created_datetime(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        VisitFactory(patient=self.patient)

        medical_provider_mock.return_value.medical_provider = self.other_medical_provider
        VisitFactory(patient=self.other_patient, created_datetime=timezone.now() - timezone.timedelta(days=1))

        medical_provider = self.patient.get_medical_provider()
        self.assertEqual(self.other_medical_provider.id, medical_provider.id)

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_vacation_days(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        VisitFactory(patient=self.patient, created_datetime=timezone.now() - timezone.timedelta(days=1))

        medical_provider_mock.return_value.other_medical_provider = self.medical_provider
        VisitFactory(patient=self.other_patient)

        VacationDaysFactory(
            medical_provider=self.medical_provider,
            start_date=timezone.now() - timezone.timedelta(days=2),
            end_date=timezone.now() + timezone.timedelta(days=2),
        )

        medical_provider = self.patient.get_medical_provider()
        self.assertEqual(self.other_medical_provider.id, medical_provider.id)

    @override_settings(DEBUG=True)
    @patch("users.models.User")
    def test_get_medical_provider_vacation_days_both_providers(self, medical_provider_mock):
        medical_provider_mock.return_value.medical_provider = self.medical_provider
        VisitFactory(patient=self.patient, created_datetime=timezone.now() - timezone.timedelta(days=1))

        medical_provider_mock.return_value.other_medical_provider = self.medical_provider
        VisitFactory(patient=self.other_patient)

        VacationDaysFactory(
            medical_provider=self.medical_provider,
            start_date=timezone.now() - timezone.timedelta(days=1),
            end_date=timezone.now() + timezone.timedelta(days=1),
        )

        VacationDaysFactory(
            medical_provider=self.other_medical_provider,
            start_date=timezone.now() - timezone.timedelta(days=2),
            end_date=timezone.now() + timezone.timedelta(days=2),
        )

        medical_provider = self.patient.get_medical_provider()
        self.assertEqual(self.medical_provider.id, medical_provider.id)

class TestMedicalProviderStatesUpdateTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.list_medical_providers_url = reverse("users:medical-providers-states-update-list")
        cls.medical_providers = GroupFactory(name="Medical Provider")

    def setUp(self):
        self.medical_provider = MedicalProviderUserFactory(
            first_name="Dearbrightly",
            last_name="Medical Provider",
            states=["CA", "IL", "MA"],
            groups=(self.medical_providers,),
        )
        self.detail_medical_provider_url = reverse(
            "users:medical-providers-states-update-detail", 
            args=(self.medical_provider.id,),
        )
        self.expected_response = {
            "id": self.medical_provider.id,
            "fullName": self.medical_provider.get_full_name(),
            "states": self.medical_provider.states,
        }

    def test_get_medical_providers_unauthenticated(self):
        response = self.client.get(
            path=self.list_medical_providers_url,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_medical_providers(self):
        response = self.client.get(
            path=self.list_medical_providers_url,
            HTTP_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(response.data[0], self.expected_response)

    def test_update_medical_provider_states(self):
        new_states = ["CA", "NY"]
        response = self.client.put(
            path=self.detail_medical_provider_url,
            data={
                "states": new_states,
            },
            HTTP_API_KEY=self.api_key,
        )
        self.expected_response["states"] = new_states
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("states"), new_states)

    def test_update_medical_provider_states_empty_list(self):
        new_states = []
        response = self.client.put(
            path=self.detail_medical_provider_url,
            data={
                "states": new_states,
            },
            HTTP_API_KEY=self.api_key,
        )

        self.expected_response["states"] = new_states
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("states"), new_states)

    def test_partial_update_medical_provider_states(self):
        new_states = ["CA", "NY"]
        response = self.client.patch(
            path=self.detail_medical_provider_url,
            data={
                "states": new_states,
            },
            HTTP_API_KEY=self.api_key,
        )
        self.expected_response["states"] = new_states
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("states"), new_states)

class TestVacationDaysViewset(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.vacation_days_list_url = reverse("users:medical-providers-vacation-days-list")
        cls.medical_providers = GroupFactory(name="Medical Provider")
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.todays_date = timezone.now()

    def setUp(self):
        self.default_medical_provider = MedicalProviderUserFactory(
            email="dearbrightly.test+medical_provider@gmail.com",
            groups=(self.medical_providers,),
        )
        self.data = {
            "medical_provider": self.default_medical_provider.id,
            "start_date": "2023-01-30",
            "end_date": "2023-02-10",
        }
        self.vacation_days = VacationDaysFactory(
            medical_provider=self.default_medical_provider,
            start_date=self.todays_date,
            end_date=self.todays_date,
        )
    def test_create_vacation_days_no_api_key(self):
        response = self.client.post(
            path=self.vacation_days_list_url,
            data=self.data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_vacation_days(self):
        response = self.client.post(
            path=self.vacation_days_list_url,
            data=self.data,
            HTTP_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_vacation_days_filter_by_month(self):
        response = self.client.get(
            path=self.vacation_days_list_url,
            data={
                "medical_provider_id": self.default_medical_provider.id,
                "end_date": self.todays_date.date(),
            },
            HTTP_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_vacation_days_filter_by_month_previous_month(self):
        end_date = self.todays_date - relativedelta(months=1)
        response = self.client.get(
            path=self.vacation_days_list_url,
            data={
                "medical_provider_id": self.default_medical_provider.id,
                "end_date": end_date.date(),
            },
            HTTP_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_vacation_days_filter_by_month_next_month(self):
        end_date = self.todays_date + relativedelta(months=1)
        response = self.client.get(
            path=self.vacation_days_list_url,
            data={
                "medical_provider_id": self.default_medical_provider.id,
                "end_date": end_date.date(),
            },
            HTTP_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
