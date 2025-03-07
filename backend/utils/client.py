from collections import OrderedDict
from typing import Dict

from django import test
from django.http import HttpResponse
from django.urls import reverse

from dearbrightly.settings import API_NAME


class GraphQLClient(test.Client):
    url = reverse(API_NAME)

    def query(self, query: str) -> Dict[str, str]:
        response: HttpResponse = self.post(path=self.url, data={"query": query})
        return response.json(object_pairs_hook=OrderedDict)
