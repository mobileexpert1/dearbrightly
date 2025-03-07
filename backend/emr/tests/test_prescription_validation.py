from django.test import TestCase, override_settings
from emr_new.tests.factories import PrescriptionFactory
from emr.tests.factories import FeatureFlagFactory, PatientPrescriptionFactory
from emr.models import Visit
from unittest.mock import patch
from emr.services import DoseSpotService
from emr_new.services.curexa_service import CurexaService
from orders.tests.factories import OrderFactory, OrderProductFactory, OrderItemFactory
from emr.models import Flag
from django.utils import timezone
from users.tests.factories import MedicalProviderUserFactory
from emr.models import PatientPrescription
from users.models import User
from products.tests import ProductFactory
from products.models import Product
from rest_framework import status

class PrescriptionValidationTestCase(TestCase):
    fixtures = ['customers.json', 'shipping_details.json', 'groups.json', 'medical_provider_user.json',
                'emr_pharmacies.json', 'emr_prescriptions.json', 'products.json', 'set_products.json',
                'emr_question_ids.json', 'emr_questionnaire_answers.json', 'emr_visits.json', 'emr_patient_prescriptions.json',
                'orders.json', 'order_products.json', 'order_items.json', 'subscriptions_order_product_subscriptions.json',
                'subscriptions_order_item_subscriptions.json', 'emr_snippets.json', 'emr_questionnaire_initial_20200102.json',
                'emr_questionnaire_initial_20200418.json', 'emr_questionnaire_initial_20200904.json',
                'emr_questionnaire_returning_20200102.json', 'emr_questionnaire_returning_female_20200308.json',
                'emr_questionnaire_returning_male_20200327.json', 'emr_questionnaires_sappira_legacy.json']

    @classmethod
    def setUpTestData(cls):
        cls.visit = Visit.objects.filter(patient__email="dearbrightly.test+returning_user_valid_rx@gmail.com").last()
        cls.patient = cls.visit.patient  

    def setUp(self):
        self.feature_flag = FeatureFlagFactory(
            name="Nourisil Formula",
        )
        self.expected_trial_tretinoin_percentage = "0.015"
        self.expected_refill_tretinoin_percentage = "0.03"
        self.trial_pracasil_prescription = PrescriptionFactory(
            quantity=15,
            refills=0,
            exact_name=f"Tretinoin {self.expected_trial_tretinoin_percentage}%/Hyaluronic Acid 0.5% in Pracasil",
            display_name=f"1. {self.expected_trial_tretinoin_percentage}% - All (Pracasil)"
        )
        self.trial_nourisil_prescription = PrescriptionFactory(
            quantity=15,
            refills=0,
            exact_name=f"Tretinoin {self.expected_trial_tretinoin_percentage}%/Hyaluronic Acid 0.5% in Nourisil",
            display_name=f"1. {self.expected_trial_tretinoin_percentage}% - All (Nourisil)"
        )
        self.refill_pracasil_prescription = PrescriptionFactory(
            quantity=25,
            refills=6,
            exact_name=f"Tretinoin {self.expected_refill_tretinoin_percentage}%/Hyaluronic Acid 0.5% in Pracasil",
            display_name=f"2. {self.expected_refill_tretinoin_percentage}% - Normal (Pracasil)"
        )
        self.refill_nourisil_prescription = PrescriptionFactory(
            quantity=25,
            refills=6,
            exact_name=f"Tretinoin {self.expected_refill_tretinoin_percentage}%/Hyaluronic Acid 0.5% in Nourisil",
            display_name=f"2. {self.expected_refill_tretinoin_percentage}% - Normal (Nourisil)"
        )

        self.expected_invalid_refill_flag_body = f"Patient needs updated Nourisil formula for: {self.refill_pracasil_prescription.display_name}."
        self.expected_invalid_trial_flag_body = f"Patient needs updated Nourisil formula for: {self.trial_pracasil_prescription.display_name}."
        self.medical_provider_factory = MedicalProviderUserFactory()
        self.patient_trial_pracasil_prescription = PatientPrescriptionFactory(
            patient=self.patient,
            medical_provider=self.medical_provider_factory,
            prescription=self.trial_pracasil_prescription,
            visit=self.visit,
            status=PatientPrescription.Status.pharmacy_verified,
        )
        self.patient_trial_nourisil_prescription = PatientPrescriptionFactory(
            patient=self.patient,
            medical_provider=self.medical_provider_factory,
            prescription=self.trial_nourisil_prescription,
            visit=self.visit,
            status=PatientPrescription.Status.pharmacy_verified,
        )
        self.patient_refill_pracasil_prescription = PatientPrescriptionFactory(
            patient=self.patient,
            medical_provider=self.medical_provider_factory,
            prescription=self.refill_pracasil_prescription,
            visit=self.visit,
            status=PatientPrescription.Status.pharmacy_verified,
        )
        self.patient_refill_nourisil_prescription = PatientPrescriptionFactory(
            patient=self.patient,
            medical_provider=self.medical_provider_factory,
            prescription=self.refill_nourisil_prescription,
            visit=self.visit,
            status=PatientPrescription.Status.pharmacy_verified,
        )

        self.product = ProductFactory(product_type=Product.Type.rx)
        self.trial_order = OrderFactory(
            emr_medical_visit=self.visit,
        )
        self.trial_order_product = OrderProductFactory()
        self.trial_order_item = OrderItemFactory(
            order=self.trial_order,
            product=self.product,
            order_product=self.trial_order_product,
            is_refill=False,
        )
        
        self.refill_order = OrderFactory(
            emr_medical_visit=self.visit,
        )
        self.product = ProductFactory(product_type=Product.Type.rx)
        self.refill_order_product = OrderProductFactory()
        self.refill_order_item = OrderItemFactory(
            order=self.refill_order,
            product=self.product,
            order_product=self.refill_order_product,
            is_refill=True,
        )
        
    @override_settings(DEBUG=True)
    @patch.object(Visit, "get_latest_trial_prescription")
    @patch.object(Visit, "get_latest_refill_prescription")
    @patch.object(User, "has_valid_rx")
    @patch.object(CurexaService, "_curexa_post_request")
    def test_validate_prescription_invalid_trial_prescription_name(
        self,
        curexa_mock,
        user_has_valid_rx_mock,
        latest_refill_prescription_mock,
        latest_trial_prescription_mock,
    ):
        curexa_mock.return_value = None
        user_has_valid_rx_mock.return_value = True
        latest_trial_prescription_mock.return_value = self.patient_trial_pracasil_prescription
        latest_refill_prescription_mock.return_value = self.patient_refill_pracasil_prescription

        response = CurexaService().create_curexa_order(order=self.trial_order)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, self.expected_invalid_trial_flag_body)
        try:
            flag = Flag.objects.latest("created_datetime")
        except Flag.DoesNotExist:
            self.fail("Flag not created")
        self.assertEqual(flag.body, self.expected_invalid_trial_flag_body)

    @override_settings(DEBUG=True)
    @patch.object(Visit, "get_latest_trial_prescription")
    @patch.object(Visit, "get_latest_refill_prescription")
    @patch.object(User, "has_valid_rx")
    @patch.object(CurexaService, "_curexa_post_request")
    def test_validate_prescription_invalid_refill_prescription_name(
        self,
        curexa_mock,
        user_has_valid_rx_mock,
        latest_refill_prescription_mock,
        latest_trial_prescription_mock,
    ):
        curexa_mock.return_value = None
        user_has_valid_rx_mock.return_value = True
        latest_trial_prescription_mock.return_value = self.patient_trial_pracasil_prescription
        latest_refill_prescription_mock.return_value = self.patient_refill_pracasil_prescription

        response = CurexaService().create_curexa_order(order=self.refill_order)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, self.expected_invalid_refill_flag_body)
        try:
            flag = Flag.objects.latest("created_datetime")
        except Flag.DoesNotExist:
            self.fail("Flag not created")
        self.assertEqual(flag.body, self.expected_invalid_refill_flag_body)

    def test_get_tretinoin_percentage(self):
        self.assertEqual(self.expected_trial_tretinoin_percentage, self.patient_trial_pracasil_prescription.get_tretinoin_strength())

    def test_compare_tretinoin_values(self):
        is_same_tretinoin_strength = self.patient_trial_pracasil_prescription.get_tretinoin_strength() == self.patient_trial_nourisil_prescription.get_tretinoin_strength()
        self.assertTrue(is_same_tretinoin_strength)

    @override_settings(DEBUG=True)
    def test_is_valid_refill_nourisil_tretinoin_strength(
        self,
    ):
        prescription_tretinoin_value = "0.1"
        self.trial_pracasil_prescription.exact_name = f"Tretinoin {prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Pracasil"
        self.trial_pracasil_prescription.save()
        self.trial_nourisil_prescription.exact_name = f"Tretinoin {prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Nourisil"
        self.trial_nourisil_prescription.save()
        is_valid_tretinoin_value = DoseSpotService().is_valid_refill_nourisil_tretinoin_strength(
            visit=self.visit,
        )
        self.assertTrue(is_valid_tretinoin_value)

    @override_settings(DEBUG=True)
    def test_is_valid_refill_nourisil_tretinoin_strength_non_matching_values(
        self,
    ):
        pracasil_prescription_tretinoin_value = "0.05"
        nourisil_prescription_tretinoin_value = "0.1"
        self.patient_refill_pracasil_prescription.prescription.exact_name = f"Tretinoin {pracasil_prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Pracasil"
        self.patient_refill_pracasil_prescription.prescription.save()
        self.patient_refill_nourisil_prescription.prescription.exact_name = f"Tretinoin {nourisil_prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Nourisil"
        self.patient_refill_nourisil_prescription.prescription.save()
        is_valid_tretinoin_value = DoseSpotService().is_valid_refill_nourisil_tretinoin_strength(
            visit=self.visit,
        )
        self.expected_invalid_refill_flag_body_invalid_tretinoin = \
            f"Tretinoin % for updated Nourisil Rx [{nourisil_prescription_tretinoin_value}] " \
            f"does not match previous Pracasil Rx [{pracasil_prescription_tretinoin_value}]."
        try:
            flag = Flag.objects.latest("created_datetime")
        except Flag.DoesNotExist:
            self.fail("Flag not created")
        self.assertFalse(is_valid_tretinoin_value)
        self.assertEqual(flag.body, self.expected_invalid_refill_flag_body_invalid_tretinoin)

    @override_settings(DEBUG=True)
    def test_is_valid_refill_nourisil_tretinoin_strength_feature_flag_disabled(
        self,
    ):
        self.feature_flag.end_date = timezone.now()
        self.feature_flag.save()
        pracasil_prescription_tretinoin_value = "0.05"
        nourisil_prescription_tretinoin_value = "0.1"
        self.patient_trial_pracasil_prescription.prescription.exact_name = f"Tretinoin {pracasil_prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Pracasil"
        self.patient_trial_pracasil_prescription.prescription.save()
        self.patient_trial_nourisil_prescription.prescription.exact_name = f"Tretinoin {nourisil_prescription_tretinoin_value}%/Hyaluronic Acid 0.5% in Nourisil"
        self.patient_trial_nourisil_prescription.prescription.save()
        is_valid_tretinoin_value = DoseSpotService().is_valid_refill_nourisil_tretinoin_strength(
            visit=self.visit,
        )
        self.assertTrue(is_valid_tretinoin_value)
