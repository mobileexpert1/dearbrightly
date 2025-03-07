import json
from django.utils import timezone
from datetime import timedelta
from utils.logger_utils import logger
from rest_framework.exceptions import ValidationError


def get_user(request, uuid):
    from users.models import User
    if request.user.is_anonymous:
        raise ValidationError('User is anonymous.')
    if uuid != request.user.uuid:
        raise ValidationError('User with given id is different than logged in.')
    return User.objects.get(uuid=uuid)

def get_pretty_print(json_object):
    return json.dumps(json_object, sort_keys=True, indent=4, separators=(',', ': '))