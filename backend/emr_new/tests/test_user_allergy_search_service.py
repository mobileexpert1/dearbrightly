from rest_framework.test import APITestCase
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from emr_new.tests.factories import (
    QuestionIdsFactory,
    QuestionnaireFactory,
    QuestionnaireAnswersFactory
)
from users.tests.factories import GroupFactory, UserFactory
from factory.faker import faker
from django.core import mail
from emr_new.services.user_allergy_search_service import UserAllergySearchService
from io import StringIO
from unittest.mock import patch
import csv

class UserAllergySearchViewTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.ingredient = "niacinamide"
        cls.ingredient_name_misspelling = "nicinamide"
        cls.test_to_email = "test@test.com"
        cls.csv_attachment_name = "ingredient_search_results.csv"
        cls.random_text_value = faker.Faker().sentence()
        cls.customers = GroupFactory(name="Customers")
        cls.api_key = settings.DEARBRIGHTLY_API_KEY
        cls.url = reverse(f"emr_new:user-allergy-search")
        cls.customer = UserFactory(
            first_name="Dear Brightly",
            last_name="User",
            groups=(cls.customers,)
        )
        cls.question_ids = QuestionIdsFactory()
        cls.questionnaire = QuestionnaireFactory(
            question_ids=cls.question_ids
        )

    def setUp(self):
        self.post_data = {
            "ingredient": self.ingredient,
            "exact_match_only": False,
            "email": self.test_to_email
        }
        self.questionnaire_answer_no_match = QuestionnaireAnswersFactory(
            patient=self.customer,
            questionnaire=self.questionnaire,
            answers=self.create_allergies_answers(
                value=self.random_text_value,
                allergies_question_id=self.questionnaire.question_ids.allergies_question_id
            )
        )
        self.questionnaire_answer_exact_match = QuestionnaireAnswersFactory(
            patient=self.customer,
            questionnaire=self.questionnaire,
            answers=self.create_allergies_answers(
                value=f"{self.random_text_value} {self.ingredient}", 
                allergies_question_id=self.questionnaire.question_ids.allergies_question_id
            )
        )
        self.questionnaire_answer_include_name_variants = QuestionnaireAnswersFactory(
            patient=self.customer,
            questionnaire=self.questionnaire,
            answers=self.create_allergies_answers(
                value=f"{self.random_text_value} {self.ingredient_name_misspelling}", 
                allergies_question_id=self.questionnaire.question_ids.allergies_question_id
            )
        )
        self.csv_data_file = StringIO()
        self.fieldnames = ["user_id", "exact_match_found", "allergies_response"]
        self.csv_writer = csv.DictWriter(self.csv_data_file, fieldnames=self.fieldnames)
        self.csv_writer.writeheader()
        self.csv_writer.writerow(
            self.create_expected_response(
                user=self.customer,
                exact_match_found=True,
                allergies_response=self.questionnaire_answer_exact_match.answers[0]["value"]
            ),
        )
        self.expected_csv_file_contents_exact_match_only = self.csv_data_file.getvalue()
        self.csv_writer.writerow(
            self.create_expected_response(
                user=self.customer,
                exact_match_found=False,
                allergies_response=self.questionnaire_answer_include_name_variants.answers[0]["value"]
            )
        )
        self.expected_csv_file_contents = self.csv_data_file.getvalue()

    def create_allergies_answers(
        self,
        value: str, 
        allergies_question_id: int
    ) -> list:  
        return [{
            "value": value,
            "question_id": allergies_question_id
        }]

    def create_expected_response(
        self,
        user: UserFactory,
        exact_match_found: bool,
        allergies_response: str
    ) -> dict:
        return {
            "user_id": user.id,
            "exact_match_found": exact_match_found,
            "allergies_response": allergies_response
        }

    @patch("emr_new.tasks.find_users_potentially_allergic_to_ingredient.delay")
    def test_user_allergy_search_without_api_key(self, celery_task_mock):
        celery_task_mock.return_value = None
        response = self.client.post(
            path=self.url,
            data=self.post_data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("emr_new.tasks.find_users_potentially_allergic_to_ingredient.delay")
    def test_user_allergy_search_invalid_exact_match_only(self, celery_task_mock):
        celery_task_mock.return_value = None
        self.post_data["exact_match_only"] = "invalid_type"
        response = self.client.post(
            path=self.url,
            data=self.post_data,
            **{"HTTP_API_KEY": self.api_key}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch("emr_new.tasks.find_users_potentially_allergic_to_ingredient.delay")
    def test_user_allergy_search_invalid_email(self, celery_task_mock):
        celery_task_mock.return_value = None
        self.post_data["email"] = "not_an_email"
        response = self.client.post(
            path=self.url,
            data=self.post_data,
            **{"HTTP_API_KEY": self.api_key}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_allergy_search_send_email_with_attachment(self):
        UserAllergySearchService.send_allergy_answers_email(
            ingredient=self.ingredient,
            email_to=self.test_to_email,
            csv_data=self.expected_csv_file_contents
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].attachments[0][0], self.csv_attachment_name)
        self.assertEqual(mail.outbox[0].attachments[0][1], self.expected_csv_file_contents)

    def test_user_allergy_search_send_email_no_answers_found(self):
        UserAllergySearchService.send_allergy_answers_email(
            ingredient=self.ingredient,
            email_to=self.test_to_email,
            csv_data=None
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].attachments, [])
        self.assertEqual(mail.outbox[0].body, UserAllergySearchService.RESPONSES_NOT_FOUND_MESSAGE)

    def test_user_allergy_search_default_with_name_variants(self):
        csv_data = UserAllergySearchService.find_users_potentially_allergic_to_ingredient(
            ingredient=self.ingredient,
            exact_match_only=False
        )
        self.assertEqual(csv_data, self.expected_csv_file_contents)

    def test_user_allergy_search_exact_match_only(self):
        csv_data = UserAllergySearchService.find_users_potentially_allergic_to_ingredient(
            ingredient=self.ingredient,
            exact_match_only=True
        )
        self.assertEqual(csv_data, self.expected_csv_file_contents_exact_match_only)

    def test_user_allergy_search_invalid_spaces(self):
        answer_with_invalid_spaces = f"{self.random_text_value}{self.ingredient}"
        self.questionnaire_answer_exact_match.answers[0]["value"] = answer_with_invalid_spaces
        self.questionnaire_answer_exact_match.save()

        csv_data = UserAllergySearchService.find_users_potentially_allergic_to_ingredient(
            ingredient=self.ingredient,
            exact_match_only=True
        )
        self.assertIn(answer_with_invalid_spaces, csv_data)

    def test_user_allergy_search_invalid_punctuations(self):
        answer_with_invalid_punctuations = f"{self.random_text_value} ,{self.ingredient}"
        self.questionnaire_answer_exact_match.answers[0]["value"] = answer_with_invalid_punctuations
        self.questionnaire_answer_exact_match.save()

        csv_data = UserAllergySearchService.find_users_potentially_allergic_to_ingredient(
            ingredient=self.ingredient,
            exact_match_only=True
        )
        self.assertIn(answer_with_invalid_punctuations, csv_data)
        
