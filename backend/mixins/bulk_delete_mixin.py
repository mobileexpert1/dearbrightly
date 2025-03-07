import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework_extensions.bulk_operations.mixins import ListDestroyModelMixin

from orders.models import Order
from users.models import User


class ListDestroyMixin(ListDestroyModelMixin):
    def destroy_bulk(self, request, *args, **kwargs):
        uuids = json.loads(request.body)
        if not uuids:
            return Response(status=status.HTTP_404_NOT_FOUND)
        assert hasattr(self, 'bulk_model'), "You need to specify bulk_model which will be used for bulk delete action"
        self._delete_instances(uuids, request)
        return Response(data=uuids, status=status.HTTP_200_OK)

    def _delete_instances(self, uuids, request):
        if self.bulk_model == User:
            self.bulk_model.objects.filter(uuid__in=uuids).update(is_active=False)
        elif self.bulk_model == Order:
            self.bulk_model.objects.filter(uuid__in=uuids).update(is_archived=True)
        else:
            self.bulk_model.objects.filter(uuid__in=uuids).delete()

