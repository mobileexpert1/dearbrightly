from django.contrib.auth.models import Group
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from mock import patch
from rest_framework import status
from payment.services.services import Service as PaymentService
from django.utils import timezone
from datetime import timedelta
from users.models import User, MedicalProviderUser
from utils.logger_utils import logger
from django.test.client import RequestFactory
from emr.models import Visit, ChatMessage
from emr.views import update_patients_prescriptions
from emr.tests.fixtures.patient_prescriptions import valid_dosespot_rxs
from emr.services import DoseSpotService
from orders.models import Order
from django.db.models import Q
from emr.services import CurexaService
from emr.tests.fixtures.patient_prescriptions import valid_dosespot_rxs, invalid_dosepot_rxs, \
    refill_dosespot_rx, trial_dosespot_rx

class BaseTestCase(TestCase):
    @classmethod
    @override_settings(DEBUG=True)
    def setUpTestData(cls):
        cls.update_prescription = reverse('emr:update_patients_prescriptions')


    @override_settings(DEBUG=True)
    def setUp(self):
        self.datetime_now = timezone.now()
        self.medical_provider = User.objects.get(email='dearbrightly.test+medical_provider@gmail.com')
        print(f'[EmrServiceTestCase] medical_provider: {self.medical_provider.__dict__}.')

class EmrServiceTestCase(BaseTestCase):
    factory = RequestFactory()
    fixtures = ['customers.json', 'shipping_details.json', 'groups.json', 'medical_provider_user.json',
                'emr_pharmacies.json', 'emr_prescriptions.json', 'products.json', 'set_products.json',
                'emr_question_ids.json', 'emr_questionnaire_answers.json', 'emr_visits.json', 'emr_patient_prescriptions.json',
                'orders.json', 'order_products.json', 'order_items.json', 'subscriptions_order_product_subscriptions.json',
                'subscriptions_order_item_subscriptions.json', 'emr_snippets.json', 'emr_questionnaire_initial_20200102.json',
                'emr_questionnaire_initial_20200418.json', 'emr_questionnaire_initial_20200904.json',
                'emr_questionnaire_returning_20200102.json', 'emr_questionnaire_returning_female_20200308.json',
                'emr_questionnaire_returning_male_20200327.json', 'emr_questionnaires_sappira_legacy.json']

# mock get_patients_prescriptions such that new rx is created for the following cases:
    # 1. new rx
    # 2. invalid rx
    # 3. order pending curexa order, but updated rx (TODO)
    # 4. yearly visit, new rx
    @override_settings(TEST_MODE=True)
    # TODO - stub get_patients_prescriptions if this starts breaking
    @patch('emr.services.DoseSpotService.get_patients_prescriptions')
    def test_update_patients_prescriptions_new_user_rx(self, mock_get_patients_prescriptions):

        mock_get_patients_prescriptions.return_value = valid_dosespot_rxs

        Visit.objects.filter(patient__email='dearbrightly.test+new_user_visit_pending_rx@gmail.com').update(
            status=Visit.Status.pending_prescription
        )
        visit_new_user_rx = Visit.objects.get(patient__email='dearbrightly.test+new_user_visit_pending_rx@gmail.com')

        update_prescription_request = self.factory.post(path=self.update_prescription)
        update_prescription_request.user = self.medical_provider
        # Unable to call the api view update_patients_prescriptions directly
        DoseSpotService().update_patients_prescriptions(update_prescription_request)

        prescriptions = visit_new_user_rx.prescriptions.all()
        trial_prescription = visit_new_user_rx.get_latest_trial_prescription()
        refill_prescription = visit_new_user_rx.get_latest_refill_prescription()
        #print(f'[test_update_patients_prescriptions_nex_user_rx] prescriptions: {prescriptions}.')
        self.assertEqual(len(prescriptions), 2)
        self.assertTrue(trial_prescription)
        self.assertTrue(refill_prescription)

        visit_new_user_rx.refresh_from_db()
        self.assertEqual(visit_new_user_rx.status, Visit.Status.provider_rx_submitted)

        order = visit_new_user_rx.get_pending_order()
        #print(f'[test_update_patients_prescriptions_nex_user_rx] order: {order.__dict__}.')
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)

        # Check that the medical provider email was sent
        chat_message = ChatMessage.objects.latest('created_datetime')
        greeting = chat_message.body.split(' ', 1)[0]
        self.assertEqual(greeting, '<p>Hey')

    # Medical provider updates the Rx with the refill Rx after a refill order fails to push out because of an invalid Rx
    @override_settings(TEST_MODE=True)
    @patch('emr.services.DoseSpotService.get_patients_prescriptions')
    def test_update_patients_prescriptions_invalid_refill_rx(self, mock_get_patients_prescriptions):
        mock_get_patients_prescriptions.return_value = refill_dosespot_rx

        Visit.objects.filter(patient__email='dearbrightly.test+invalid_refill_rx@gmail.com').update(
            status=Visit.Status.pending_prescription
        )
        visit_invalid_refill_rx = Visit.objects.get(patient__email='dearbrightly.test+invalid_refill_rx@gmail.com')

        update_prescription_request = self.factory.post(path=self.update_prescription)
        update_prescription_request.user = self.medical_provider
        # Unable to call the api view update_patients_prescriptions directly
        DoseSpotService().update_patients_prescriptions(update_prescription_request)

        prescriptions = visit_invalid_refill_rx.prescriptions.all()
        trial_prescription = visit_invalid_refill_rx.get_latest_trial_prescription()
        refill_prescription = visit_invalid_refill_rx.get_latest_refill_prescription()
        # print(f'[test_update_patients_prescriptions_invalid_refill_rx] prescriptions: {prescriptions}.')
        self.assertEqual(len(prescriptions), 3)
        self.assertTrue(trial_prescription)
        self.assertTrue(refill_prescription)

        visit_invalid_refill_rx.refresh_from_db()
        self.assertEqual(visit_invalid_refill_rx.status, Visit.Status.provider_signed)

        order = visit_invalid_refill_rx.get_pending_order()
        #print(f'[test_update_patients_prescriptions_invalid_refill_rx] order: {order.__dict__}.')
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)

    # medical provider updates yearly visit with a refill rx
    @override_settings(TEST_MODE=True)
    @patch('emr.services.DoseSpotService.get_patients_prescriptions')
    def test_update_patients_prescriptions_returning_user_valid_rx(self, mock_get_patients_prescriptions):
        mock_get_patients_prescriptions.return_value = refill_dosespot_rx

        # user id 8
        patient = User.objects.get(email='dearbrightly.test+returning_user_valid_rx@gmail.com')

        patient.patient_visits.filter(Q(service='Short Repeat Visit Male') |
                                      Q(service='Short Repeat Visit Female') |
                                      Q(service='Repeat Visit')) \
            .update(
            status=Visit.Status.pending_prescription
        )

        returning_user_valid_rx = patient.patient_visits.filter(Q(service='Short Repeat Visit Male') |
                                                                Q(service='Short Repeat Visit Female') |
                                                                Q(service='Repeat Visit')).latest('created_datetime')


        update_prescription_request = self.factory.post(path=self.update_prescription)
        update_prescription_request.user = self.medical_provider
        # Unable to call the api view update_patients_prescriptions directly
        DoseSpotService().update_patients_prescriptions(update_prescription_request)

        prescriptions = returning_user_valid_rx.prescriptions.all()
        refill_prescription = returning_user_valid_rx.get_latest_refill_prescription()

        patient = returning_user_valid_rx.patient
        self.assertTrue(patient.rx_status, User.RxStatus.active)

        #print(f'[test_update_patients_prescriptions_returning_user_valid_rx] prescriptions: {prescriptions}.')
        self.assertEqual(len(prescriptions), 1)
        self.assertTrue(refill_prescription)

        returning_user_valid_rx.refresh_from_db()
        self.assertEqual(returning_user_valid_rx.status, Visit.Status.provider_rx_submitted)

        order = returning_user_valid_rx.get_pending_order()
        #print(f'[test_update_patients_prescriptions_returning_user_valid_rx] order: {order.__dict__}.')
        self.assertEqual(int(order.status), Order.Status.pending_pharmacy)

        # Check that the medical provider email was sent
        chat_message = ChatMessage.objects.latest('created_datetime')
        greeting = chat_message.body.split(' ', 1)[0]
        self.assertEqual(greeting, '<p>Hey')

    # Test that handle when an order is paid: the visit is queued or the order is pushed to Curexa (if valid rx)
    @override_settings(TEST_MODE=True)
    @patch.object(CurexaService, 'cancel_curexa_order')
    def test_order_status_update_handler(self, mock):
        user = User.objects.get(email='dearbrightly.test+new_user_skin_profile_complete@gmail.com')
        order = user.orders.first()
        order.status = Order.Status.payment_complete
        order.purchased_datetime = self.datetime_now
        order.payment_captured_datetime = self.datetime_now
        order.save()
        visit = user.patient_visits.first()
        # check that new user visit with skin profile complete are queued after payment
        self.assertEqual(visit.status, Visit.Status.provider_pending)

        user_valid_rx = User.objects.get(email='dearbrightly.test+new_user_rx@gmail.com')
        order_valid_rx = user_valid_rx.orders.latest('created_datetime')
        order_valid_rx.status = Order.Status.payment_complete
        order_valid_rx.purchased_datetime = self.datetime_now
        order_valid_rx.payment_captured_datetime = self.datetime_now
        order_valid_rx.save()
        # orders with valid visit/rx should be pushed to Curexa
        self.assertEqual(order_valid_rx.status, Order.Status.pending_pharmacy)

        user_pending_pharmacy = User.objects.get(email='dearbrightly.test+pending_pharmacy@gmail.com')
        order_pending_pharmacy = user_pending_pharmacy.orders.latest('created_datetime')
        order_pending_pharmacy.status = Order.Status.cancelled
        order_pending_pharmacy.save()
        order_pending_pharmacy.status = Order.Status.cancelled
        order_pending_pharmacy.save()
        # check that pending pharmacy orders are canceled
        self.assertTrue(mock.called)

