from django import test
from django.test import override_settings

from users.models import User
from utils.client import GraphQLClient
from utils.models import Log
from utils.tests.models import Reporter


@override_settings(ROOT_URLCONF="utils.tests.urls")
class PhiMutationsTestCase(test.TransactionTestCase):
    def setUp(self):
        self.client = GraphQLClient()
        self.admin_user = User.objects.create_superuser("admin@example.com", "Zaq12wsx")
        self.client.login(username=self.admin_user.email, password="Zaq12wsx")

    def test_create_logs_after_create_mutation(self):
        mutation = """
            mutation {
                createReporter(input: { firstName: "Jennifer", lastName: "Johnson"} ) {
                    reporter {
                        fullName
                    }
                }
            }
        """

        self.client.query(mutation)

        # Create log with firstName and lastName
        self.assertEqual(Log.objects.filter(action=Log.CREATED).count(), 1)
        # Read log with fullName
        self.assertEqual(Log.objects.filter(action=Log.READ).count(), 1)

    def test_create_logs_after_update_mutation(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")
        mutation = """
            mutation {{
                updateReporter(input: {{ reporterId: {reporter_id}, firstName: "Robert", lastName: "Taylor" }} ) {{
                    reporter {{
                        fullName
                    }}
                }}
            }}
        """.format(reporter_id=reporter.id)

        self.client.query(mutation)

        self.assertEqual(Log.objects.filter(action=Log.UPDATED).count(), 1)
        self.assertEqual(Log.objects.filter(action=Log.READ).count(), 1)

    def test_create_logs_after_delete_mutation(self):
        reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")
        mutation = """
            mutation {{
                deleteReporter(input: {{ reporterId: {reporter_id} }} ) {{
                    reporter {{
                        fullName
                    }}
                }}
            }}
        """.format(reporter_id=reporter.id)

        self.client.query(mutation)

        self.assertEqual(Log.objects.filter(action=Log.DELETED).count(), 1)

    def test_logs_instances_fields_are_filled_correctly(self):
        mutation = """
            mutation {
                createReporter(input: { firstName: "Jennifer", lastName: "Johnson"} ) {
                    reporter {
                        fullName
                    }
                }
            }
        """

        self.client.query(mutation)

        read_log = Log.objects.filter(action=Log.READ).first()
        self.assertEqual(read_log.fields, "full_name")
        self.assertEqual(read_log.model_name, "Reporter")
        self.assertEqual(read_log.object_id, Reporter.objects.first().pk)

        create_log = Log.objects.filter(action=Log.CREATED).first()
        self.assertEqual(create_log.fields, "first_name, last_name")
        self.assertEqual(create_log.model_name, "Reporter")
        self.assertEqual(create_log.object_id, Reporter.objects.first().pk)
