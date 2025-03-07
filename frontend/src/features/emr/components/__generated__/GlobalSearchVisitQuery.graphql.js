/**
 * @flow
 * @relayHash 0d5b1b969287aef0b13ba3854016bc9e
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SearchVisitResult_visit$ref = any;
export type GlobalSearchVisitQueryVariables = {|
  search?: ?string
|};
export type GlobalSearchVisitQueryResponse = {|
  +searchVisits: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: SearchVisitResult_visit$ref,
      |}
    |}>
  |}
|};
export type GlobalSearchVisitQuery = {|
  variables: GlobalSearchVisitQueryVariables,
  response: GlobalSearchVisitQueryResponse,
|};
*/


/*
query GlobalSearchVisitQuery(
  $search: String
) {
  searchVisits(search: $search) {
    edges {
      node {
        id
        ...SearchVisitResult_visit
      }
    }
  }
}

fragment SearchVisitResult_visit on VisitType {
  id
  visitId
  status
  service
  createdDatetime
  patient {
    id
    fullName
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "search",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "search",
    "variableName": "search"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "GlobalSearchVisitQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchVisits",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "VisitSearchResultConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitSearchResultEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "VisitType",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "FragmentSpread",
                    "name": "SearchVisitResult_visit",
                    "args": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "GlobalSearchVisitQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchVisits",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "VisitSearchResultConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitSearchResultEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "VisitType",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "visitId",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "status",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "service",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "createdDatetime",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "patient",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "UserType",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "fullName",
                        "args": null,
                        "storageKey": null
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "GlobalSearchVisitQuery",
    "id": null,
    "text": "query GlobalSearchVisitQuery(\n  $search: String\n) {\n  searchVisits(search: $search) {\n    edges {\n      node {\n        id\n        ...SearchVisitResult_visit\n      }\n    }\n  }\n}\n\nfragment SearchVisitResult_visit on VisitType {\n  id\n  visitId\n  status\n  service\n  createdDatetime\n  patient {\n    id\n    fullName\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '4d58f301b05d6dfb823628a5038339d5';
module.exports = node;
