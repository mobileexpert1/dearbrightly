import os
import boto3
import json
import logging
from django.conf import settings
from utils.logger_utils import logger
from boto3.s3.transfer import S3Transfer
from botocore.exceptions import ClientError
from rest_framework.exceptions import APIException

transfer = S3Transfer(boto3.client('s3',
                                   'us-west-2',
                                   aws_access_key_id=settings.AWS_ACCESS_KEY,
                                   aws_secret_access_key=settings.AWS_SECRET_KEY))

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)

def upload_daily_digest_file():
    bucket = 'daily-digest-logs'
    file_path = os.path.join(settings.BASE_DIR, 'daily-digest.txt')
    transfer.upload_file(file_path, bucket, 'daily_digest.txt', extra_args={'ACL': 'public-read'})

"""
phone_number is a string, message is a string 
"""
def send_text_sms(phone_number, message):
    message_id = sns_wrapper.publish_text_message(phone_number, message)
    return message_id

#========================SNS CLASS WRAPPER FOR TEXT MESSAGING===========================================
"""based off of this: https://docs.aws.amazon.com/code-samples/latest/catalog/python-sns-sns_basics.py.html"""

class SNSWrapper:
    def __init__(self, sns_resource):
        """
        :param sns_resource: A Boto3 Amazon SNS resource.
        """
        self.sns_resource = sns_resource
    
    def publish_text_message(self, phone_number, message):
        """
        Publishes a text message directly to a phone number without need for a
        subscription.

        :param phone_number: The phone number that receives the message. This must be
                             in E.164 format. For example, a United States phone
                             number might be +12065550101.
        :param message: The message to send.
        :return: The ID of the message.
        """
        if not phone_number:
            logger.error("[aws_s3_utils][SNSWrapper] Unable to send text message, phone number not provided.")
            return

        if not message:
            logger.error("[aws_s3_utils][SNSWrapper] Unable to send text message, no message provided.")
            return

        try:
            response = self.sns_resource.meta.client.publish(
                PhoneNumber=phone_number, Message=message)
            message_id = response.get('MessageId', None)
            logger.error(f'[aws_s3_utils][SNSWrapper] Response: {response}')
            #logger.info("[aws_s3_utils][SNSWrapper] Published message to %s.", phone_number)
        except ClientError as e:
            error_message = f'Unable to send text message to {phone_number}. Error: {e}.'
            logger.error(error_message)
            raise APIException(error_message)
        else:
            return message_id
#=======================================================================================
sns_resource = boto3.resource('sns', 'us-west-2', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                              aws_secret_access_key=settings.AWS_SECRET_KEY )
                                              
sns_wrapper = SNSWrapper(sns_resource)




