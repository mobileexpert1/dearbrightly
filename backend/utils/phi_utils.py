import logging
import types
from functools import wraps, partial
from typing import List, Union

from django.db.models import Model
from django.utils import timezone
from graphene import relay
from graphene.types.resolver import attr_resolver
from graphene_django.registry import get_global_registry
from ipware import get_client_ip

from dearbrightly import settings
from utils.models import Log

logger = logging.getLogger(__name__)

"""
This module provides tools for logging PHI fields in Graphene.
Example usage:

class GrapheneType(DjangoObjectType, PhiObjectMixin):
    class Meta:
        model = DjangoModel
        default_resolver = phi_data_resolver

    phi_fields = ['django_model_field_1', 'django_model_field_2']

    @phi_data_logger
    def resolve_custom_field(parent, info):
        return custom_resolver_logic() 
"""


class ProtectedHealthInformationLogRegistry:
    """
    We use PHI Registry to gather all Log's model entries through the request and bulk_create them at the end.
    """

    model_log_registry = {}

    def add_model_entry(
        self, model_name, instance_id, field, operation, user, timestamp, extra
    ):
        if not self.model_log_registry.get(model_name):
            self.model_log_registry[model_name] = dict(
                user=user, instances={}, extra=extra
            )

        if not self.model_log_registry[model_name]['instances'].get(instance_id):
            self.model_log_registry[model_name]['instances'][instance_id] = dict(
                fields=[], timestamp=timestamp, operation=operation
            )

        model_fields = self.model_log_registry[model_name]['instances'][instance_id][
            'fields'
        ]
        if field not in model_fields:
            model_fields.append(field)

    def create_logs(self):
        if self.model_log_registry.keys():
            for entry in self.model_log_registry.items():
                model, data = entry
                bulk_data = {}

                for instance_id, details in data['instances'].items():
                    bulk_data.setdefault(', '.join(sorted(details['fields'])), []).append(
                        instance_id
                    )

                for mapped_field, accessed_object_ids in bulk_data.items():
                    Log.info(
                        user=data['user'],
                        action=details['operation'],
                        accessed_object_ids=accessed_object_ids,
                        model_name=model,
                        fields=mapped_field,
                        timestamp=details['timestamp'],
                        extra=data['extra'],
                    )

    def clean(self):
        self.model_log_registry.clear()


PHI_LOG_REGISTRY = ProtectedHealthInformationLogRegistry()


class PhiObjectMixin:
    """
    Indicate which fields are PHI.
    Mixin for query-able related models defined as DjangoObjectType subclass.
    """

    ALL = '__all__'
    phi_fields: Union[str, List[str]] = ALL


def _add_log_to_phi_registry(registry, attname, root, info, custom_field=False):
    if settings.ENABLE_PHI_LOGGING is False:
        return None

    graphene_obj = registry.get_type_for_model(root.__class__)
    attvalue = getattr(root, attname, Model)
    user = info.context.user

    user_ip, _ = get_client_ip(info.context)

    # don't log ForeignKey or ManyToManyRel or deleted object
    if (
        not isinstance(attvalue, Model) or custom_field is True
    ) and root.pk is not None:
        if (
            graphene_obj.phi_fields == PhiObjectMixin.ALL
            or attname in graphene_obj.phi_fields
        ):
            PHI_LOG_REGISTRY.add_model_entry(
                model_name=root.__class__.__name__,
                instance_id=root.pk,
                field=attname,
                user=user,
                timestamp=timezone.now(),
                operation=Log.READ,
                extra='User IP: ' + user_ip,
            )


def phi_data_resolver(attname, default_value, root, info, **args):
    """
    Default resolver with option for logging access to PHI fields.
    """
    registry = get_global_registry()
    _add_log_to_phi_registry(registry, attname, root, info)

    return attr_resolver(attname, default_value, root, info, **args)


class PhiDataLogger:
    """
    Intended for use as a decorator for custom fields resolvers.
    """

    def __init__(self, func):
        wraps(func)(self)
        self.registry = get_global_registry()
        self.attname = self._get_attname_from_custom_resolver(func)

    def _get_attname_from_custom_resolver(self, func):
        resolver_name = func.__name__

        if not resolver_name.startswith('resolve_'):
            raise RuntimeError('Resolver function has to start with resolve_')

        attname = resolver_name[len('resolve_') :]
        return attname

    def __call__(self, *args, **kwargs):
        root, info, *_ = args
        _add_log_to_phi_registry(
            self.registry, self.attname, root, info, custom_field=True
        )

        return self.__wrapped__(*args, **kwargs)

    def __get__(self, instance, owner):
        if instance is None:
            return self
        else:
            return types.MethodType(self, instance)


phi_data_logger = partial(PhiDataLogger)


class PhiRelayClientIdMutation(relay.ClientIDMutation):
    """
    Use this class for Mutations where you want to enable phi data logging.

    One thing you have to do is setting phi_model property to the model name of the mutated object.
    Remember also that MutationClass should start with 'Create', 'Update' or 'Delete'
    """

    phi_model: str

    @classmethod
    def get_action(cls):
        class_name = cls.__name__

        if class_name.startswith('Create'):
            return Log.CREATED
        if class_name.startswith('Update'):
            return Log.UPDATED
        if class_name.startswith('Delete'):
            return Log.DELETED
        raise RuntimeError(
            "Mutation class name has to start with 'Create', 'Update' or 'Delete'"
        )

    @classmethod
    def _get_obj_id(cls, mutated_obj, input):
        if cls.get_action() == Log.DELETED:
            id_key, *_ = input
            object_id = int(input[id_key])
        else:
            object_id = mutated_obj.pk
        return object_id

    @classmethod
    def mutate(cls, root, info, input):
        result = super().mutate(root, info, input)

        try:
            mutated_obj_name = result.phi_model
        except AttributeError:
            raise RuntimeError(
                "Mutation class has to initialize 'phi_model' property. It should contain a name of the mutated model."
            )

        mutated_obj = getattr(result, mutated_obj_name.lower())
        fields = ', '.join(list(input.keys()))
        user_ip, _ = get_client_ip(info.context)

        Log.info(
            model_name=mutated_obj.__class__.__name__,
            accessed_object_ids=cls._get_obj_id(mutated_obj, input),
            fields=fields,
            user=info.context.user,
            timestamp=timezone.now(),
            action=cls.get_action(),
            extra='User IP: ' + user_ip,
        )

        return result


class PHIViewSetLoggingMixin:
    """
    Use this mixin if you want to enable logging PHI data for ViewSet.
    Example usage:
    ViewSetClass(PHIViewSetLoggingMixin, ViewSet):
        ....
        ....
    """

    actions = ['list', 'create', 'retrieve', 'update', 'partial_update', 'destroy']

    def _create_logs_for_list_view(self, request, response):
        Log.info(
            user=request.user,
            action=Log.transform_http_method_to_action(request.method),
            model_name=self.get_queryset().model.__name__,
            accessed_object_ids=self._get_object_ids_from_payload(response.data),
            fields=', '.join(list(response.data[0].keys())),
            timestamp=timezone.now(),
        )

    @staticmethod
    def _get_object_ids_from_payload(response_data: dict) -> list:
        return [data['id'] for data in response_data]

    def _create_logs_for_action(self, request, response):
        Log.info(
            user=request.user,
            model_name=self.get_queryset().model.__name__,
            action=Log.transform_http_method_to_action(request.method),
            accessed_object_ids=0,
            fields=', '.join(list(response.data.keys())),
            timestamp=timezone.now(),
        )

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(PHIViewSetLoggingMixin, self).finalize_response(
            request, response, *args, **kwargs
        )

        if settings.ENABLE_PHI_LOGGING is False:
            return response

        if response.data:
            if self.action == 'list':
                self._create_logs_for_list_view(request, response)
            elif self.action not in self.actions:
                self._create_logs_for_action(request, response)
            else:
                Log.info(
                    user=request.user,
                    model_name=self.get_queryset().model.__name__,
                    action=Log.transform_http_method_to_action(request.method),
                    accessed_object_ids=response.data.get('id', None),
                    fields=', '.join(list(response.data.keys())),
                    timestamp=timezone.now(),
                )

        return response
