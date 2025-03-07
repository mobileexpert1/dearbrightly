import graphene
from graphene import relay, String
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType

from utils.phi_utils import PhiObjectMixin, phi_data_resolver, phi_data_logger, PhiRelayClientIdMutation
from utils.tests.models import Reporter, Article


class ArticleType(DjangoObjectType, PhiObjectMixin):
    class Meta:
        model = Article
        default_resolver = phi_data_resolver
        only_fields = ('reporter', 'headline',)
        filter_fields = ('id',)
        interfaces = (relay.Node,)


class ReporterType(DjangoObjectType, PhiObjectMixin):
    phi_fields = ["first_name", "last_name", "articles", "full_name", ]
    articles = DjangoFilterConnectionField(ArticleType)

    class Meta:
        model = Reporter
        default_resolver = phi_data_resolver
        only_fields = ["first_name", "last_name", "articles", ]
        filter_fields = ["id", ]
        interfaces = (relay.Node,)

    full_name = String()

    @phi_data_logger
    def resolve_full_name(parent, info):
        return parent.get_full_name()


class CreateReporterMutation(PhiRelayClientIdMutation):
    class Input:
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)

    reporter = graphene.Field(ReporterType)
    phi_model = "reporter"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        new_reporter = Reporter(first_name=kwargs['first_name'], last_name=kwargs['last_name'])
        new_reporter.save()
        return CreateReporterMutation(reporter=new_reporter)


class UpdateReporterMutation(PhiRelayClientIdMutation):
    class Input:
        reporter_id = graphene.ID(required=True)

        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)

    reporter = graphene.Field(ReporterType)
    phi_model = "reporter"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        updated_reporter = Reporter.objects.get(id=kwargs['reporter_id'])

        first_name = kwargs.get('first_name') or updated_reporter.first_name
        updated_reporter.first_name = first_name

        last_name = kwargs.get('last_name') or updated_reporter.last_name
        updated_reporter.last_name = last_name

        updated_reporter.save()
        return CreateReporterMutation(reporter=updated_reporter)


class DeleteReporterMutation(PhiRelayClientIdMutation):
    class Input:
        reporter_id = graphene.ID(required=True)

    reporter = graphene.Field(ReporterType)
    phi_model = "reporter"

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        deleted_reporter = Reporter.objects.get(id=kwargs['reporter_id'])

        deleted_reporter.delete()
        return CreateReporterMutation(reporter=deleted_reporter)


class Query(graphene.ObjectType):
    all_reporters = DjangoFilterConnectionField(ReporterType)
    all_articles = DjangoFilterConnectionField(ArticleType)


class Mutation(graphene.ObjectType):
    create_reporter = CreateReporterMutation.Field()
    update_reporter = UpdateReporterMutation.Field()
    delete_reporter = DeleteReporterMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
