from django import test
from django.test import override_settings

from users.models import User
from utils.client import GraphQLClient
from utils.models import Log
from utils.tests.models import Reporter, Article


@override_settings(ROOT_URLCONF="utils.tests.urls")
class PhiResolversTestCase(test.TestCase):
    def setUp(self):
        self.client = GraphQLClient()
        self.admin_user = User.objects.create_superuser("admin@example.com", "Zaq12wsx")
        self.client.login(username=self.admin_user.email, password="Zaq12wsx")

        self.reporter = Reporter.objects.create(first_name="Jennifer", last_name="Johnson")

    def test_create_log_after_query(self):
        query = """
            query {
                allReporters {
                    edges {
                        node {
                            firstName
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 1)

    def test_create_log_after_query_with_custom_resolver(self):
        query = """
            query {
                allReporters {
                    edges {
                        node {
                            fullName
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 1)

    def test_create_one_log_for_many_fields(self):
        query = """
            query {
                allReporters {
                    edges {
                        node {
                            firstName
                            lastName
                            fullName
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 1)
        self.assertEqual(Log.objects.first().fields, "first_name, last_name, full_name")

    def test_create_one_log_for_one_instance(self):
        Reporter.objects.create(first_name="James", last_name="Taylor")

        query = """
            query {
                allReporters {
                    edges {
                        node {
                            firstName
                            lastName
                            fullName
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 2)

    def test_create_log_for_foreign_key(self):
        Reporter.objects.all().delete()
        Reporter.objects.create(first_name="Jennifer", last_name="Johnson")
        Article.objects.create(reporter=Reporter.objects.first(), headline="Article headline")

        query = """
            query {
                allReporters {
                    edges {
                        node {
                            fullName
                            articles {
                                edges {
                                    node {
                                        headline
                                    }
                                }
                            }
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 2)

    def test_create_log_only_for_fields_specified_in_phi_fields(self):
        self.reporter.extra = "Extra"
        self.reporter.save()

        query = """
            query {
                allReporters {
                    edges {
                        node {
                            extra
                        }
                    }
                }
            }
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 0)

    def test_log_instance_fields_are_filled_correctly(self):
        query = """
            query {
                allReporters {
                    edges {
                        node {
                            firstName
                            lastName
                            fullName
                        }
                    }
                }
            }
        """

        self.client.query(query)
        log = Log.objects.first()

        self.assertEqual(log.action, Log.READ)
        self.assertEqual(log.object_id, self.reporter.pk)
        self.assertEqual(log.model_name, "Reporter")
        self.assertEqual(log.fields, "first_name, last_name, full_name")

    def test_do_not_duplicate_fields_for_one_to_many_rel(self):
        Article.objects.create(reporter=self.reporter, headline="Article headline")
        Article.objects.create(reporter=self.reporter, headline="Article 2 headline")

        query = """
            query {
                allArticles {
                    edges {
                        node {
                            reporter {
                                fullName
                            }
                        }
                    }
                }
            }       
        """

        self.client.query(query)
        self.assertEqual(Log.objects.count(), 1)
        self.assertEqual(Log.objects.first().fields, "full_name")
