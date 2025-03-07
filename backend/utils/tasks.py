from __future__ import absolute_import
import logging

from dearbrightly.celery import app
from users.models import User


logger = logging.getLogger(__name__)


@app.task(name="utils.tasks.save_log_to_database")
def save_log_to_database(user_id: int, **log_model_fields) -> None:
    from utils.models import Log

    user = User.objects.get(id=user_id)
    log = Log(user=user, **log_model_fields)
    log.save()
    logger.info(f'[Celery] {str(log)}')


@app.task(name="utils.tasks.test_task")
def test_task():
    from utils.models import Log
    from django.utils import timezone

    Log(user=User.objects.first(), action="Test", model_name="Log", fields="none", timestamp=timezone.now(),
        extra="").save()

    logger.info(f'[Celery] test celery task fulfilled')
