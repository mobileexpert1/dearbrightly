from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class PrivateMediaStorage(S3Boto3Storage):
    location = settings.AWS_PRIVATE_MEDIA_LOCATION
    default_acl = 'private'
