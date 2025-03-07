import logging

from django.conf import settings
from django.db import models

from utils.tasks import save_log_to_database

logger = logging.getLogger(__name__)


class Log(models.Model):
    READ = 'Read'
    CREATED = 'Created'
    UPDATED = 'Updated'
    DELETED = 'Deleted'

    ACTIONS = (
        (READ, 'Read'),
        (CREATED, 'Created'),
        (UPDATED, 'Updated'),
        (DELETED, 'Deleted'),
    )

    user = models.ForeignKey(
        'users.User', related_name='logs', on_delete=models.CASCADE
    )
    action = models.CharField(choices=ACTIONS, max_length=7)
    object_id = models.PositiveIntegerField(null=True)
    accessed_object_ids = models.TextField(null=True)
    model_name = models.CharField(max_length=255)
    fields = models.CharField(max_length=512)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    extra = models.TextField()

    def __str__(self):
        return (
            f'log: [{self.id}] user: [{self.user.id}] model: [{self.model_name}] '
            f'<{self.action}> [{self.fields}] from '
            f'{self.object_id or self.accessed_object_ids} object/s'
        )

    @classmethod
    def info(cls, **log_model_fields) -> None:
        """
        Saves PHI Log instance in database
        Adds new PHI access entry to app logger
        """
        cls._save_log(**log_model_fields)

    @classmethod
    def _save_log(cls, **log_model_fields) -> None:
        log = cls(**log_model_fields)
        if settings.CELERY_SAVING_PHI_LOGS:
            logger.info(f'[PHI log task] {str(log)}')
            save_log_to_database.delay(
                user_id=log_model_fields.pop('user').id,
                **log_model_fields
            )
        else:
            log.save()
            logger.info(f'[PHI logger] {str(log)}')

    @property
    def user_email(self):
        return self.user.email

    @property
    def user_username(self):
        return self.user.get_full_name()

    def add_to_extra(self, field: str, content: str) -> None:
        if self.extra == '':
            self.extra = f'{field}: {content}'
        else:
            self.extra = f'{self.extra}, {field}: {content}'

    @classmethod
    def transform_http_method_to_action(cls, http_method: str):
        if http_method == 'GET':
            return cls.READ
        elif http_method == 'POST':
            return cls.CREATED
        elif http_method == 'PUT' or http_method == 'PATCH':
            return cls.UPDATED
        elif http_method == 'DELETE':
            return cls.DELETED
        raise ValueError(
            'http method must be "GET", "POST", "PUT", "PATCH" or "DELETE"'
        )
