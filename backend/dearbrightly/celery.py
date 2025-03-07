from __future__ import absolute_import

import os


from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dearbrightly.settings")

app = Celery("dearbrightly")
app.config_from_object('dearbrightly.celeryconfig')

app.autodiscover_tasks()
