from django import test
from django.utils import timezone
from mock import patch

from users.tests.factories import UserFactory
from utils.models import Log


class LogModelTestCase(test.TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()

    def test_log_entry_is_created(self):
        Log.info(
            user=self.user,
            action=Log.READ,
            object_id=self.user.id,
            model_name=self.user.__class__.__name__,
            fields="name, status",
            timestamp=timezone.now(),
        )

        self.assertEqual(Log.objects.count(), 1)

    @patch("utils.models.logger")
    def test_logger_has_been_launched(self, mock_logger):
        Log.info(
            user=self.user,
            action=Log.READ,
            object_id=self.user.id,
            model_name=self.user.__class__.__name__,
            fields="name, status",
            timestamp=timezone.now(),
        )

        mock_logger.info.assert_called_once()
