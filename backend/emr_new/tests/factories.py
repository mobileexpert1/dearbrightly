from factory import SubFactory, Sequence
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyInteger, FuzzyText

from emr.models import (
    Visit,
    Prescription,
    Questionnaire,
    ServiceChoices,
    Pharmacy,
    QuestionnaireAnswers,
    QuestionIds,
)
from users.tests.factories import UserFactory


class VisitFactory(DjangoModelFactory):
    class Meta:
        model = Visit

    patient = SubFactory(UserFactory)
    skin_profile_status = Visit.SkinProfileStatus.pending_questionnaire


class PrescriptionFactory(DjangoModelFactory):
    class Meta:
        model = Prescription

    sappira_id = Sequence(lambda n: n + 1)
    rxcui = FuzzyText(length=7)

    days_supply = FuzzyInteger(100)
    refills = FuzzyInteger(100)
    quantity = FuzzyInteger(100)
    directions = FuzzyText(length=16)
    pharmacy_notes = FuzzyText(length=16)


class QuestionIdsFactory(DjangoModelFactory):
    class Meta:
        model = QuestionIds
    
    allergies_question_id = Sequence(lambda n: n + 1)


class QuestionnaireFactory(DjangoModelFactory):
    class Meta:
        model = Questionnaire

    version = Sequence(lambda n: n + 1)
    service = ServiceChoices.initial_visit
    questions = []
    description = FuzzyText(length=20)
    name = FuzzyText(length=20)
    question_ids = SubFactory(QuestionIdsFactory)


class QuestionnaireAnswersFactory(DjangoModelFactory):
    class Meta:
        model = QuestionnaireAnswers

    questionnaire = SubFactory(QuestionnaireFactory)
    answers = []


class PharmacyFactory(DjangoModelFactory):
    class Meta:
        model = Pharmacy

    name = FuzzyText(length=16)
    store_name = FuzzyText(length=16)
