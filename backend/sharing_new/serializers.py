from django.core.validators import MinValueValidator
from rest_framework import serializers

from sharing.models import Sharing


class SharingSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    referrer_email = serializers.EmailField(allow_null=True)
    entry_point = serializers.IntegerField(
        validators=[MinValueValidator(0)], allow_null=True
    )
    communication_method = serializers.IntegerField(validators=[MinValueValidator(0)])
    email_type = serializers.IntegerField(
        validators=[MinValueValidator(0)], allow_null=True
    )
    email_reminder_interval_in_days = serializers.IntegerField(
        validators=[MinValueValidator(1)], allow_null=True
    )

    class Meta:
        model = Sharing
        fields = (
            "id",
            "referrer_email",
            "entry_point",
            "communication_method",
            "email_type",
            "email_reminder_interval_in_days",
        )
