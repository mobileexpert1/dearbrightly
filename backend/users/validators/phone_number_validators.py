import re
from django.conf import settings
from rest_framework.exceptions import ValidationError
from users.models import User
from users.exceptions import InvalidFieldException
from users.models import ShippingDetails

def number_is_valid(pattern, phone_number):
    return pattern.search(phone_number)

def validate_phone_number_format(phone_number):
    if not phone_number:
        raise ValidationError('No phone number provided.')

    if len(phone_number) < 10:
        raise ValidationError('Given phone number is too short. It must contain at least 10 digits.')

    if len(phone_number) > 10:
        raise ValidationError('Given phone number is too long. It must contain at most 10 digits.')

    # Valid US area codes don't start off with 0 or 1
    pattern = re.compile(r'((\([2-9][0-9][0-9]\))|(^[2-9][0-9][0-9]))[- .]?[0-9]{3}[- .]?[0-9]{4}')

    if number_is_valid(pattern, phone_number):
        return True

    raise ValidationError('Invalid US area code. Area code cannot contain a 0 or 1.')

def validate_unique_phone_number(new_shipping_details: dict, current_shipping_details: ShippingDetails, user_id: int) -> None:
    if settings.DEBUG:
        return True

    new_phone_number = new_shipping_details.get("phone") if new_shipping_details else None
    current_phone_number = current_shipping_details.phone if current_shipping_details else None
    if (
        new_phone_number
        and (current_phone_number is None or current_phone_number != new_phone_number)
        and (
            User.objects.filter(shipping_details__phone=new_phone_number)
            .exclude(id=user_id)
            .exclude(is_active=False)
            .exists()
        )
    ):
        raise InvalidFieldException("An Account with this phone number already exists.")
