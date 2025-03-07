from rest_framework import status
from rest_framework.exceptions import APIException

class InvalidDiscountCodeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This discount code is not valid for the items in your cart"
    default_code = "bad_request"

class SubscriptionUpdateException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Unable to update your subscription."
    default_code = "bad_request"

class UnauthorizedWebhookException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Unauthorized"
    default_code = "unauthorized"
