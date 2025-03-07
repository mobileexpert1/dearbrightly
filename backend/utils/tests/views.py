from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from utils.phi_utils import PHIViewSetLoggingMixin
from utils.tests.models import Reporter
from utils.tests.serializers import ReporterSerializer


class ReporterViewSet(PHIViewSetLoggingMixin, ModelViewSet):
    queryset = Reporter.objects.all()
    serializer_class = ReporterSerializer

    @action(methods=('post',), detail=True, url_path="action-detail")
    def action_detail(sef, request, pk):
        return Response(data={'detail': True})

    @action(methods=('get',), detail=False)
    def action(self, request):
        return Response(data={'detail': False})
