from rest_framework.exceptions import APIException

class InvalidFieldException(APIException):
    status_code = 400
    default_detail = 'Invalid field, try again later.'
    default_code = 'invalid_field'