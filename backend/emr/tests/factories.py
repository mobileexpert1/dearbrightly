from factory.django import DjangoModelFactory
from emr.models import (
    PatientPrescription,
    Questionnaire,
    ServiceChoices,
    Prescription,
    Pharmacy,
)
from dearbrightly.models import FeatureFlag
from django.utils import timezone
from factory import fuzzy, Sequence, SubFactory
import mock

class QuestionnaireFactory(DjangoModelFactory):
    class Meta:
        model = Questionnaire

    version = Sequence(lambda n: n + 1)
    sappira_id = Sequence(lambda n: n + 1)
    service = fuzzy.FuzzyChoice([choice[0] for choice in ServiceChoices.choices])
    questions = []

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        mock.patch('emr.models.Questionnaire.clean')
        return super()._create(model_class, *args, **kwargs)


class PrescriptionFactory(DjangoModelFactory):
    class Meta:
        model = Prescription

    sappira_id = Sequence(lambda n: n + 1)
    rxcui = fuzzy.FuzzyText(length=7)

    days_supply = fuzzy.FuzzyInteger(100)
    refills = fuzzy.FuzzyInteger(100)
    quantity = fuzzy.FuzzyInteger(100)
    directions = fuzzy.FuzzyText(length=16)
    pharmacy_notes = fuzzy.FuzzyText(length=16)


class PharmacyFactory(DjangoModelFactory):
    class Meta:
        model = Pharmacy

    name = fuzzy.FuzzyText(length=16)
    store_name = fuzzy.FuzzyText(length=16)

class PatientPrescriptionFactory(DjangoModelFactory):
    class Meta:
        model = PatientPrescription

    pharmacy = SubFactory(PharmacyFactory)

class FeatureFlagFactory(DjangoModelFactory):
    class Meta:
        model = FeatureFlag
    start_date = timezone.now()
