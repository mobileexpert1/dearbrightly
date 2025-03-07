from threading import Lock

from django.contrib.auth.mixins import LoginRequiredMixin
from graphene_django.views import GraphQLView

from utils.phi_utils import PHI_LOG_REGISTRY
lock = Lock()


class AuthRequiredGraphQLView(LoginRequiredMixin, GraphQLView):
    """Requests must be authenticated to use the GraphQL API."""
    login_url = '/login/'

    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql=False):
        with lock:
            registry = PHI_LOG_REGISTRY
            registry.clean()
            result = super().execute_graphql_request(request, data, query, variables, operation_name, show_graphiql)
            registry.create_logs()

        return result
