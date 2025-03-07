import datetime
from typing import Optional

from django import test
from django.utils import timezone
from mock import patch

from users.models import User
from users.tests.factories import UserFactory
from utils.models import Log
from utils.phi_utils import ProtectedHealthInformationLogRegistry


class MultipleAccessedObjectLogCreationTestCase(test.TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.REGISTRY = ProtectedHealthInformationLogRegistry()
        cls.user_1 = UserFactory()
        cls.user_2 = UserFactory()
        cls.user_3 = UserFactory()
        cls.expected_phi_log_data = (
            '[PHI logger] log: [1] user: [1] model: [User] '
            '<Read> [full_name] from [1, 2, 3] objects'
        )
        cls.field = 'full_name'
        cls.operation = Log.READ

    def setUp(self):
        # Class keeps the same object reference for model_log_registry
        self.REGISTRY.clean()

    def _add_obj_entry(
            self,
            instance: User,
            field: str = None,
            timestamp: datetime.datetime = timezone.now(),
            user: Optional[User] = None
    ):
        user = user if user else self.user_1
        field = field if field else self.field
        self.REGISTRY.add_model_entry(  # todo: check me
            model_name=User.__name__,
            instance_id=instance.pk,
            field=field,
            operation=self.operation,
            user=user,
            timestamp=timestamp,
            extra='',
        )

    @patch('utils.models.logger')
    def test_log_entry_creation(self, mock_logger):
        self._add_obj_entry(self.user_1)
        self._add_obj_entry(self.user_2)
        self._add_obj_entry(self.user_3)
        self.REGISTRY.create_logs()

        self.assertEqual(Log.objects.count(), 1)
        mock_logger.info.assert_called_once()
        mock_logger.info.called_with(self.expected_phi_log_data)

    def test_log_entry_creation_with_field_variants(self):
        self._add_obj_entry(self.user_1, 'first_name')
        self._add_obj_entry(self.user_2, 'first_name')
        self._add_obj_entry(self.user_3, 'first_name')
        self._add_obj_entry(self.user_3, 'last_name')
        self.REGISTRY.create_logs()

        log_1 = Log.objects.get(fields='first_name')
        log_2 = Log.objects.get(fields='first_name, last_name')

        self.assertEqual(Log.objects.count(), 2)
        self.assertEqual(
            log_1.accessed_object_ids, str([self.user_1.pk, self.user_2.pk])
            )
        self.assertEqual(
            log_2.accessed_object_ids, str([self.user_3.pk])
        )

    def test_log_entry_creation_with_mixed_variant_order(self):
        self._add_obj_entry(self.user_1, 'first_name')
        self._add_obj_entry(self.user_1, 'last_name')
        self._add_obj_entry(self.user_2, 'last_name')
        self._add_obj_entry(self.user_2, 'first_name')
        self.REGISTRY.create_logs()

        self.assertEqual(Log.objects.count(), 1)
