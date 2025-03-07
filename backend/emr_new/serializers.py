from collections import OrderedDict

from rest_framework import serializers
from rest_framework.fields import SkipField
from rest_framework.relations import PKOnlyObject

from emr.models import (
    PatientPrescription,
)
from orders.models import Order, OrderProduct
from users.models import User

class UserAllergySearchSerializer(serializers.Serializer):
    ingredient = serializers.CharField(max_length=30)
    exact_match_only = serializers.BooleanField(default=False)
    email = serializers.EmailField()

class SendReplacementOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    replacement_reason = serializers.CharField(required=False)
    replacement_responsible_party = serializers.IntegerField(min_value=1, max_value=5)


class CurexaOrderSerializer(serializers.ModelSerializer):
    address_to_name = serializers.SerializerMethodField()
    address_to_street1 = serializers.ReadOnlyField(
        source="shipping_details.address_line1"
    )
    address_to_street2 = serializers.ReadOnlyField(
        source="shipping_details.address_line2"
    )
    address_to_city = serializers.ReadOnlyField(source="shipping_details.city")
    address_to_state = serializers.ReadOnlyField(source="shipping_details.state")
    address_to_zip = serializers.ReadOnlyField(source="shipping_details.postal_code")
    address_to_country = serializers.ReadOnlyField(
        source="shipping_details.country.code"
    )
    address_to_phone = serializers.ReadOnlyField(source="shipping_details.phone")
    notes = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField()
    patient_first_name = serializers.ReadOnlyField(source="customer.first_name")
    patient_last_name = serializers.ReadOnlyField(source="customer.last_name")
    patient_dob = serializers.SerializerMethodField()
    patient_gender = serializers.SerializerMethodField()
    patient_known_allergies = serializers.SerializerMethodField()
    patient_other_medications = serializers.SerializerMethodField()
    shipping_method = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "address_to_name",
            "address_to_street1",
            "address_to_street2",
            "address_to_city",
            "address_to_state",
            "address_to_zip",
            "address_to_country",
            "address_to_phone",
            "notes",
            "order_id",
            "patient_id",
            "patient_first_name",
            "patient_last_name",
            "patient_dob",
            "patient_gender",
            "patient_known_allergies",
            "patient_other_medications",
            "shipping_method",
        ]

    def get_order_id(self, order):
        return str(order.id)

    def get_patient_id(self, order):
        return str(order.customer.id)

    def get_patient_gender(self, order):
        if order.customer.gender == User.Gender.none:
            return None
        return order.customer.gender

    def get_shipping_method(self, order):
        return "usps_first"

    def get_address_to_name(self, order):
        return order.shipping_details.get_full_name()

    def get_patient_dob(self, order):
        if order.customer.dob:
            return order.customer.dob.strftime("%Y%m%d")
        return None

    def get_patient_known_allergies(self, order):
        allergies = None
        if order.emr_medical_visit:
            if order.emr_medical_visit.questionnaire_answers:
                allergies = (
                    order.emr_medical_visit.questionnaire_answers.get_allergies_response()
                )
            else:
                questionnaire_answers = order.customer.questionnaire_answers.all()
                if questionnaire_answers:
                    latest_questionnaire_answers = questionnaire_answers.latest(
                        "created_datetime"
                    )
                    if latest_questionnaire_answers:
                        allergies = (
                            latest_questionnaire_answers.get_allergies_response()
                        )
        return allergies

    def get_patient_other_medications(self, order):
        medication_response = None
        if order.emr_medical_visit:
            if order.emr_medical_visit.questionnaire_answers:
                medication_response = (
                    order.emr_medical_visit.questionnaire_answers.get_medication_response()
                )
            else:
                questionnaire_answers = order.customer.questionnaire_answers.all()
                if questionnaire_answers:
                    latest_questionnaire_answers = questionnaire_answers.latest(
                        "created_datetime"
                    )
                    if latest_questionnaire_answers:
                        medication_response = (
                            latest_questionnaire_answers.get_medication_response()
                        )
        return medication_response

    def get_notes(self, obj):
        return "Dear Brightly"

    def to_representation(self, instance):
        ret = OrderedDict()
        for field in self._readable_fields:
            try:
                attribute = field.get_attribute(instance)
            except SkipField:
                continue
            if attribute in [None, ""]:
                continue
            check_for_none = (
                attribute.pk if isinstance(attribute, PKOnlyObject) else attribute
            )
            ret[field.field_name] = (
                None if check_for_none is None else field.to_representation(attribute)
            )
        if not ret.get("patient_gender"):
            ret.pop("patient_gender")

        return ret


class CurexaPrescriptionSerializer(serializers.ModelSerializer):
    days_supply = serializers.ReadOnlyField(source="prescription.days_supply")
    is_refill = serializers.SerializerMethodField()
    medication_name = serializers.ReadOnlyField(source="prescription.exact_name")
    medication_sig = serializers.ReadOnlyField(source="prescription.directions")
    non_child_resistant_acknowledgment = serializers.SerializerMethodField()
    prescribing_doctor = serializers.SerializerMethodField()
    rx_id = serializers.ReadOnlyField(source="dosespot_id")
    quantity_dispensed = serializers.ReadOnlyField(source="prescription.quantity")

    def get_prescribing_doctor(self, obj):
        return obj.medical_provider.get_full_name()

    def get_is_refill(self, obj):
        return self.context.get("is_refill")

    # TODO (Alda) - Ask users if they want this?
    def get_non_child_resistant_acknowledgment(self, obj):
        return True

    class Meta:
        model = PatientPrescription
        fields = [
            "days_supply",
            "is_refill",
            "medication_name",
            "medication_sig",
            "non_child_resistant_acknowledgment",
            "prescribing_doctor",
            "rx_id",
            "quantity_dispensed",
        ]


class CurexaOTCSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="product.name")
    weight = serializers.SerializerMethodField()

    def get_weight(self, obj):
        return [{"value": obj.product.weight, "units": "ounces"}]

    class Meta:
        model = OrderProduct
        fields = ["name", "quantity", "weight"]
