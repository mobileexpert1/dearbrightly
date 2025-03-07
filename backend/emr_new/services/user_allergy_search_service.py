from emr.models import QuestionnaireAnswers
from difflib import SequenceMatcher
from users.models import User
from io import StringIO
from django.core.mail import EmailMessage
from django.conf import settings
from smtplib import SMTPException
from utils.logger_utils import logger
import re
import csv

class UserAllergySearchService:
    FIELDNAMES = ["user_id", "exact_match_found", "allergies_response"]
    RESPONSES_FOUND_MESSAGE = f"The results are available in the attachment"
    RESPONSES_NOT_FOUND_MESSAGE = f"No answers found for this ingredient"

    @classmethod
    def find_users_potentially_allergic_to_ingredient(
        cls,
        ingredient: str,
        exact_match_only: bool
    ):
        allergy_response_found = False
        csv_data_file = StringIO()
        csv_writer = csv.DictWriter(csv_data_file, fieldnames=cls.FIELDNAMES)
        csv_writer.writeheader()
        questionnaire_answers = QuestionnaireAnswers.objects.filter(
            patient__isnull=False
        ).select_related(
            "questionnaire",
            "patient"
        ).values_list(
            "questionnaire__question_ids__allergies_question_id",
            "answers",
            "patient__id"
        )
        for allergies_question_id, answers, patient_id in questionnaire_answers:
            if not allergies_question_id:
                continue

            allergies_response = None
            for answer in answers:
                try:
                    if int(answer["question_id"]) == allergies_question_id:
                        allergies_response = answer["value"]
                        break
                except ValueError as error:
                    logger.error(
                        f"[UserAllergySearchService][find_users_potentially_allergic_to_ingredient]"
                        f"error: {str(error)}"
                    )

            if allergies_response and isinstance(allergies_response, str):
                allergies_response = cls._remove_whitespaces(
                    text=allergies_response
                )
                cleaned_allergies_response = cls._clean_text_data(
                    text=allergies_response
                )
                ingredient_found = False
                exact_match_found = False
                if cls._check_for_word_occurence(
                    cleaned_text=cleaned_allergies_response,
                    searched_word=ingredient
                ):
                    ingredient_found = True
                    exact_match_found = True
                elif not exact_match_only:
                    if cls._check_for_similar_word_occurence(
                        cleaned_text=cleaned_allergies_response,
                        searched_word=ingredient
                    ):
                        ingredient_found = True
                if ingredient_found:
                    allergy_response_found = True
                    csv_writer.writerow(
                        cls._create_data_item(
                            user_id=patient_id,
                            exact_match_found=exact_match_found,
                            allergies_response=allergies_response
                        )
                    )

        if allergy_response_found:
            return csv_data_file.getvalue()
        return None

    @classmethod
    def send_allergy_answers_email(
        cls, 
        ingredient: str,
        email_to: str, 
        csv_data: str
    ) -> None:
        if csv_data is None:
            message = cls.RESPONSES_NOT_FOUND_MESSAGE
        else:
            message = cls.RESPONSES_FOUND_MESSAGE

        email = EmailMessage(
            subject=f"User allergy search response for the {ingredient} ingredient",
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_to],
        )
        if csv_data is not None:
            email.attach(
                filename="ingredient_search_results.csv", 
                content=csv_data, 
                mimetype="text/csv"
            )
        try:
            email.send()    
        except SMTPException as error:
            logger.error(
                f"[UserAllergySearch][send_allergy_answers_email] Unable to send allergy answers email"
                f"error: {str(error)}"
            )

    @staticmethod
    def _check_for_word_occurence(
        cleaned_text: str, 
        searched_word: str
    ) -> bool:
        if searched_word in cleaned_text:
            return True
        return False

    @staticmethod
    def _check_for_similar_word_occurence(
        cleaned_text: str, 
        searched_word: str,
        acceptable_similarity_ratio: float = 0.85
    ) -> bool:
        tokens = cleaned_text.split(" ")
        for token in tokens:
            if SequenceMatcher(None, token, searched_word).quick_ratio() > acceptable_similarity_ratio:
                return True
        return False

    @staticmethod
    def _remove_whitespaces(
        text: str
    ) -> str:
        return re.sub(r"^\s+|\s+$", "", text)

    @staticmethod
    def _clean_text_data(
        text: str
    ) -> list:
        return re.sub(r"[^\w\s]", "", text).lower()
    
    @staticmethod
    def _create_data_item(
        user_id: int,
        exact_match_found: bool,
        allergies_response: str
    ) -> dict:
        return {
            "user_id": user_id,
            "exact_match_found": exact_match_found,
            "allergies_response": allergies_response
        }
