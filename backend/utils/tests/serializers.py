from rest_framework.serializers import ModelSerializer

from utils.tests.models import Reporter


class ReporterSerializer(ModelSerializer):
    class Meta:
        model = Reporter
        fields = "__all__"
