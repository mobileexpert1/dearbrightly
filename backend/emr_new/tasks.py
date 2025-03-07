from dearbrightly.celery import app
from emr_new.services.user_allergy_search_service import UserAllergySearchService

@app.task(name="emr_new.find_users_potentially_allergic_to_ingredient")
def find_users_potentially_allergic_to_ingredient(
    ingredient: str, 
    exact_match_only: bool, 
    email: str
    ):
    csv_data = UserAllergySearchService.find_users_potentially_allergic_to_ingredient(
        ingredient=ingredient,
        exact_match_only=exact_match_only,
    )
    UserAllergySearchService.send_allergy_answers_email(
        ingredient=ingredient,
        email_to=email,
        csv_data=csv_data
    )
