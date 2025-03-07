from unittest.mock import patch

from django.contrib.auth.models import Group
from django.core import mail
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from emr.models import (
    Visit,
    Questionnaire,
    PatientPrescription,
)
from emr_new.services.curexa_service import CurexaService
from emr_new.tests.factories import (
    VisitFactory,
    PharmacyFactory,
    PrescriptionFactory,
)
from emr_new.tests.utils import MockCurexaResponse
from orders.models import Order
from orders.tests.factories import (
    OrderFactory,
    OrderProductFactory,
    OrderItemFactory,
    ProductFactory,
)
from products.models import Product
from users.tests.factories import (
    GroupFactory,
    UserFactory,
    MedicalProviderUserFactory,
    ShippingDetailsFactory,
)


class CurexaServiceTestCase(APITestCase):
    fixtures = ["emr_question_ids.json", "emr_questionnaire_initial_20200102.json"]

    @classmethod
    def setUpTestData(cls):
        cls.customers = GroupFactory()
        cls.shipping_details = ShippingDetailsFactory(
            address_line1="660 4th St.",
            address_line2="User Address",
            state="CA",
            postal_code="94107",
            phone="3123456789",
            city="San Francisco",
            country="US",
            first_name="Dear Brightly",
            last_name="User",
        )
        cls.medical_provider = MedicalProviderUserFactory(id=1654)
        cls.pharmacy = PharmacyFactory()
        cls.prescription_data = {
            "medical_provider": cls.medical_provider,
            "rxcui": "0",
            "exact_name": "Tretinoin 0.015%/Hyaluronic Acid 0.5% in Pracasil ",
            "quantity": 15,
            "days_supply": 60,
            "directions": "Apply a pea-sized drop to full face every 3rd night and increase to nightly as tolerated.",
        }

    def setUp(self):
        self.new_user = UserFactory(
            first_name="Dear Brightly",
            last_name="User",
            shipping_details=self.shipping_details,
            email="dearbrightly.test+new_user_rx@gmail.com",
            groups=[Group.objects.get(name="Customers")],
            dob=timezone.now(),
            gender="female",
            payment_processor_customer_id="cus_JIHLwlWraQYZqM",
        )
        self.new_rx = PrescriptionFactory(
            product=ProductFactory(),
        )
        self.medical_visit = VisitFactory(
            patient=self.new_user,
            consent_to_telehealth=False,
            questionnaire=Questionnaire.objects.get(pk=1),
            status=Visit.Status.provider_rx_submitted,
        )
        self.patient_prescription = PatientPrescription.objects.create(
            status=PatientPrescription.Status.erx_sent,
            prescription=PrescriptionFactory(refills=3, quantity=25),
            patient=self.new_user,
            medical_provider=self.medical_provider,
            visit=self.medical_visit,
            pharmacy=self.pharmacy,
        )
        self.order = OrderFactory(
            customer=self.new_user,
            status=Order.Status.payment_complete,
            emr_medical_visit=self.medical_visit,
        )
        self.product = ProductFactory(product_type=Product.Type.rx)
        self.order_product = OrderProductFactory()
        self.order_item = OrderItemFactory(
            order=self.order,
            product=self.product,
            order_product=self.order_product,
            is_refill=True,
        )
        self.order_with_glass_bottle = OrderFactory(
            customer=self.new_user,
            status=Order.Status.payment_complete,
            emr_medical_visit=self.medical_visit,
        )
        self.glass_bottle_product = ProductFactory(
            name="Glass bottle", product_category=Product.Category.bottle
        )
        self.order_product_for_glass_bottle = OrderProductFactory(
            product=self.glass_bottle_product
        )
        self.order_item = OrderItemFactory(
            order=self.order_with_glass_bottle,
            product=self.glass_bottle_product,
            order_product=self.order_product_for_glass_bottle,
            is_refill=True,
        )

    def test_create_curexa_order_customer_has_no_valid_rx(self):
        user_no_valid_rx = UserFactory()
        order = OrderFactory(
            customer=user_no_valid_rx,
            status=Order.Status.payment_complete,
        )
        response = CurexaService().create_curexa_order(order=order)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_curexa_order_no_medical_visit(self):
        new_user = UserFactory(
            first_name="Dear Brightly",
            last_name="User",
            shipping_details=self.shipping_details,
            email="dearbrightly.test+new_user_rx2@gmail.com",
            groups=[Group.objects.get(name="Customers")],
            dob="1990-08-23",
            gender="female",
            payment_processor_customer_id="cus_JIHLwlWraQYZqM",
        )
        PrescriptionFactory(
            product=ProductFactory(),
        )
        medical_visit = VisitFactory(
            patient=new_user,
            consent_to_telehealth=False,
            questionnaire=Questionnaire.objects.get(pk=1),
            status=Visit.Status.provider_rx_submitted,
        )
        PatientPrescription.objects.create(
            status=PatientPrescription.Status.erx_sent,
            prescription=PrescriptionFactory(refills=3, quantity=25),
            patient=new_user,
            medical_provider=self.medical_provider,
            visit=medical_visit,
            pharmacy=self.pharmacy,
        )
        order = OrderFactory(
            customer=new_user,
            status=Order.Status.payment_complete,
        )

        response = CurexaService().create_curexa_order(order=order)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    def test_create_curexa_order_without_prescription_data_and_no_prescription_for_order(
        self,
    ):
        new_user = UserFactory(
            first_name="Dear Brightly",
            last_name="User",
            shipping_details=self.shipping_details,
            email="dearbrightly.test+new_user_rx2@gmail.com",
            groups=[Group.objects.get(name="Customers")],
            dob=timezone.now(),
            gender="female",
            payment_processor_customer_id="cus_JIHLwlWraQYZqM",
        )
        PrescriptionFactory(
            product=ProductFactory(),
        )
        medical_visit = VisitFactory(
            patient=new_user,
            consent_to_telehealth=False,
            questionnaire=Questionnaire.objects.get(pk=1),
            status=Visit.Status.provider_rx_submitted,
        )
        PatientPrescription.objects.create(
            status=PatientPrescription.Status.erx_sent,
            prescription=PrescriptionFactory(refills=3, quantity=25),
            patient=new_user,
            medical_provider=self.medical_provider,
            visit=medical_visit,
            pharmacy=self.pharmacy,
        )
        order = OrderFactory(
            customer=new_user,
            status=Order.Status.payment_complete,
            emr_medical_visit=medical_visit,
        )
        product = ProductFactory(product_type=Product.Type.rx)
        order_product = OrderProductFactory()
        OrderItemFactory(
            order=order,
            product=product,
            order_product=order_product,
        )

        CurexaService().create_curexa_order(order=order)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_without_prescription_data_and_prescription_exists_for_curexa_order_creation(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse()
        order = OrderFactory(
            customer=self.new_user,
            status=Order.Status.payment_complete,
            emr_medical_visit=self.medical_visit,
        )
        product = ProductFactory(product_type=Product.Type.rx)
        order_product = OrderProductFactory()
        OrderItemFactory(
            order=order,
            product=product,
            order_product=order_product,
            is_refill=True,
        )

        response = CurexaService().create_curexa_order(order=order)
        order.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)
        self.assertTrue(order.patient_prescription)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION SUCCESS",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_without_prescription_data_and_prescription_exists_for_curexa_order_update(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "success", "message": "An existing order was updated successfully."}'
        )
        order = OrderFactory(
            customer=self.new_user,
            status=Order.Status.payment_complete,
            emr_medical_visit=self.medical_visit,
        )
        product = ProductFactory(product_type=Product.Type.rx)
        order_product = OrderProductFactory()
        OrderItemFactory(
            order=order,
            product=product,
            order_product=order_product,
            is_refill=True,
        )

        response = CurexaService().create_curexa_order(order=order)
        order.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)
        self.assertTrue(order.patient_prescription)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER UPDATE SUCCESS",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_with_prescription_data_for_curexa_order_creation(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse()
        response = CurexaService().create_curexa_order(
            order=self.order, prescription_data=self.prescription_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION SUCCESS",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_with_prescription_data_for_curexa_order_update(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "success", "message": "An existing order was updated successfully."}'
        )
        response = CurexaService().create_curexa_order(
            order=self.order, prescription_data=self.prescription_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER UPDATE SUCCESS",
            mail.outbox[0].subject,
        )

    @patch("emr_new.serializers.CurexaOrderSerializer.to_representation")
    def test_create_curexa_order_with_prescription_data_handle_AttributeError(
        self, mock_serializer_to_representation
    ):
        mock_serializer_to_representation.side_effect = AttributeError
        response = CurexaService().create_curexa_order(
            order=self.order, prescription_data=self.prescription_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_with_prescription_data_curexa_request_no_success(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "failure", "message": "Error"}'
        )

        response = CurexaService().create_curexa_order(
            order=self.order, prescription_data=self.prescription_data
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_without_prescription_data_and_prescription_exists_for_order_curexa_request_no_success(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "failure", "message": "Error"}'
        )
        CurexaService().create_curexa_order(order=self.order)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.serializers.CurexaOrderSerializer.to_representation")
    def test_create_curexa_order_for_glass_bottle_handle_AttributeError(
        self, mock_serializer_to_representation
    ):
        mock_serializer_to_representation.side_effect = AttributeError
        response = CurexaService().create_curexa_order_for_glass_bottle(
            order=self.order_with_glass_bottle,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_for_glass_bottle_and_curexa_request_no_success(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "failure", "message": "Error"}'
        )

        response = CurexaService().create_curexa_order_for_glass_bottle(
            order=self.order_with_glass_bottle
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION FAILURE",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_for_glass_bottle_for_curexa_order_update(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "success", "message": "An existing order was updated successfully."}'
        )
        response = CurexaService().create_curexa_order_for_glass_bottle(
            order=self.order_with_glass_bottle
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER UPDATE SUCCESS",
            mail.outbox[0].subject,
        )

    @patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_create_curexa_order_for_glass_bottle_for_curexa_order_creation(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse()
        response = CurexaService().create_curexa_order_for_glass_bottle(
            order=self.order_with_glass_bottle
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            f"CUREXA ORDER CREATION SUCCESS",
            mail.outbox[0].subject,
        )
