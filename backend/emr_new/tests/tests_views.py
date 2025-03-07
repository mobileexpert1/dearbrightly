import datetime
from unittest import mock

from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from emr.models import (
    Visit,
    PatientPrescription,
)
from emr.serializers import (
    CurexaOrderSerializer,
    CurexaPrescriptionSerializer,
    CurexaOTCSerializer,
)
from emr_new.services.curexa_service import CurexaService
from emr_new.tests.factories import (
    QuestionnaireFactory,
    VisitFactory,
    PrescriptionFactory,
    PharmacyFactory,
)
from emr_new.tests.utils import MockCurexaResponse
from orders.models import Order
from orders.tests.factories import OrderFactory, OrderProductFactory, OrderItemFactory
from products.models import Product
from products_new.factories import ProductFactory
from users.tests.factories import UserFactory, GroupFactory, MedicalProviderUserFactory


class CurexaSendReplacementOrderViewTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customers = GroupFactory(name="Customers")
        cls.medical_provider_group = GroupFactory(name="Medical Provider")
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.url = reverse("emr_new:send-replacement-order")
        cls.customer = UserFactory(
            first_name="Dear Brightly",
            last_name="User",
            groups=(cls.customers,),
            dob=datetime.datetime(year=1990, month=10, day=10),
            gender="female",
            payment_processor_customer_id="cus_JIHLwlWraQYZqM",
        )

        cls.medical_provider = MedicalProviderUserFactory(
            groups=(cls.medical_provider_group,), id=1654
        )

    def setUp(self) -> None:
        QuestionnaireFactory()
        self.medical_visit = VisitFactory(
            patient=self.customer,
            status=Visit.Status.provider_rx_submitted,
        )
        self.prescription = PrescriptionFactory(refills=3, quantity=25)
        self.patient_prescription = PatientPrescription.objects.create(
            status=PatientPrescription.Status.erx_sent,
            prescription=self.prescription,
            patient=self.customer,
            medical_provider=self.medical_provider,
            visit=self.medical_visit,
            pharmacy=PharmacyFactory(),
        )
        self.order = OrderFactory(
            customer=self.customer,
            status=Order.Status.payment_complete,
            emr_medical_visit=self.medical_visit,
        )
        self.product = ProductFactory(product_type=Product.Type.rx)
        self.order_product = OrderProductFactory(
            product=self.product,
        )
        self.order_item = OrderItemFactory(
            order=self.order,
            product=self.product,
            order_product=self.order_product,
            is_refill=True,
        )
        self.send_replacement_data = {
            "order_id": self.order.id,
            "replacement_reason": "Replacement reason text",
            "replacement_responsible_party": CurexaService.ReplacementResponsibleParty.DamagedPump.value,
        }

    def test_send_replacement_order_without_api_key(self):
        response = self.client.post(path=self.url, data=self.send_replacement_data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_replacement_order_with_wrong_order_id(self):
        self.send_replacement_data["order_id"] = "123"
        response = self.client.post(
            path=self.url,
            data=self.send_replacement_data,
            **{"HTTP_API_KEY": self.api_key}
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_send_replacement_order_with_wrong_replacement_responsible_party(self):
        self.send_replacement_data["replacement_responsible_party"] = 10
        response = self.client.post(
            path=self.url,
            data=self.send_replacement_data,
            **{"HTTP_API_KEY": self.api_key}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @mock.patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_send_replacement_order_with_valid_replacement_data_and_rx_product(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "success", "message": "An existing order was updated successfully."}'
        )
        response = self.client.post(
            path=self.url,
            data=self.send_replacement_data,
            **{"HTTP_API_KEY": self.api_key}
        )
        self.order.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(int(self.order.status), Order.Status.pending_pharmacy)
        self.assertTrue(self.order.patient_prescription)
        mock_curexa_post_request.assert_called_with(
            url=settings.CUREXA_ORDERS_URI,
            body={
                **CurexaOrderSerializer(self.order).data,
                "rx_items": [
                    {
                        **CurexaPrescriptionSerializer(
                            self.patient_prescription,
                            context={"is_refill": self.order.is_refill},
                        ).data,
                        "is_replacement": "true",
                        "replaced_order_id": str(self.order.id),
                        "replacement_reason": self.send_replacement_data.get(
                            "replacement_reason"
                        ),
                        "replacement_responsible_party": self.send_replacement_data.get(
                            "replacement_responsible_party"
                        ),
                    }
                ],
            },
        )

    @mock.patch("emr_new.services.curexa_service.CurexaService._curexa_post_request")
    def test_send_replacement_order_with_valid_replacement_data_and_rx_product_and_otc_product(
        self, mock_curexa_post_request
    ):
        mock_curexa_post_request.return_value = MockCurexaResponse(
            content='{"status": "success", "message": "An existing order was updated successfully."}'
        )
        self.product_otc = ProductFactory(product_type=Product.Type.otc)
        self.order_product_otc = OrderProductFactory(
            product=self.product_otc,
        )
        self.order_item_otc = OrderItemFactory(
            order=self.order,
            product=self.product_otc,
            order_product=self.order_product_otc,
        )
        response = self.client.post(
            path=self.url,
            data=self.send_replacement_data,
            **{"HTTP_API_KEY": self.api_key}
        )
        self.order.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(int(self.order.status), Order.Status.pending_pharmacy)
        self.assertTrue(self.order.patient_prescription)
        mock_curexa_post_request.assert_called_with(
            url=settings.CUREXA_ORDERS_URI,
            body={
                **CurexaOrderSerializer(self.order).data,
                "rx_items": [
                    {
                        **CurexaPrescriptionSerializer(
                            self.patient_prescription,
                            context={"is_refill": self.order.is_refill},
                        ).data,
                        "is_replacement": "true",
                        "replaced_order_id": str(self.order.id),
                        "replacement_reason": self.send_replacement_data.get(
                            "replacement_reason"
                        ),
                        "replacement_responsible_party": self.send_replacement_data.get(
                            "replacement_responsible_party"
                        ),
                    }
                ],
                "otc_items": [
                    {
                        **CurexaOTCSerializer(self.order_item_otc).data,
                        "is_replacement": "true",
                        "replaced_order_id": str(self.order.id),
                        "replacement_reason": self.send_replacement_data.get(
                            "replacement_reason"
                        ),
                        "replacement_responsible_party": self.send_replacement_data.get(
                            "replacement_responsible_party"
                        ),
                    }
                ],
            },
        )
