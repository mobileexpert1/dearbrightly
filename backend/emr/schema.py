import graphene
from emr.queries import Query
from emr.mutations import Mutation


class Query(Query, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
