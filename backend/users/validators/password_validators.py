import re

from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import APIException


def validate_password(password):
    try:
        django_validate_password(password)
    except DjangoValidationError as error:
        raise APIException(' '.join(error))


class NumberPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('\d', password):
            raise DjangoValidationError('The password must contain at least one number.', code='password_no_number')

    def get_help_text(self):
        return 'Your password must contain at least one number.'


class UppercasePasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise DjangoValidationError('The password must contain at least one uppercase letter.')

    def get_help_text(self):
        return 'Your password must contain at least one uppercase letter.'


class LowercasePasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[a-z]', password):
            raise DjangoValidationError('The password must contain at least one lowercase letter.')

    def get_help_text(self):
        return 'Your password must contain at least one lowercase letter.'
