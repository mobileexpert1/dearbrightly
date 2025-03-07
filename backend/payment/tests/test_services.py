from django.conf import settings
from django.test import TestCase, RequestFactory, override_settings
from utils.logger_utils import logger
from emr.models import Visit


class PaymentServiceTestCase(TestCase):
    factory = RequestFactory()
    fixtures = ['customers.json', 'shipping_details.json', 'groups.json', 'medical_provider_user.json',
                'emr_pharmacies.json', 'emr_prescriptions.json', 'products.json', 'set_products.json',
                'emr_question_ids.json', 'emr_questionnaire_answers.json', 'emr_visits.json', 'emr_patient_prescriptions.json',
                'orders.json', 'order_products.json', 'order_items.json', 'subscriptions_order_product_subscriptions.json',
                'subscriptions_order_item_subscriptions.json', 'emr_snippets.json', 'emr_questionnaire_initial_20200102.json',
                'emr_questionnaire_initial_20200418.json', 'emr_questionnaire_initial_20200904.json',
                'emr_questionnaire_returning_20200102.json', 'emr_questionnaire_returning_female_20200308.json',
                'emr_questionnaire_returning_male_20200327.json', 'emr_questionnaires_sappira_legacy.json']

    # upon order status completion, capture order payment
    @override_settings(TEST_MODE=True)
    def test_order_status_update_handler(self):
        incomplete_visit = Visit.objects.filter(
            patient__email='dearbrightly.test+incomplete_initial_visit@gmail.com').latest('created_datetime')
        incomplete_visit.skin_profile_status = Visit.SkinProfileStatus.complete
        incomplete_visit.save()

        incomplete_visit.refresh_from_db()

        self.assertTrue(incomplete_visit.status, Visit.Status.skin_profile_complete)

        # Test that the order has been paid
        order = incomplete_visit.orders.latest('created_datetime')
        #logger.debug(f'[test_order_status_update_handler] order: {order.__dict__}.')

        self.assertTrue(order.payment_captured_datetime)
