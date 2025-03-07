/**
 * @flow
 * @relayHash ac3ae1445a90d3065f2edcf8aab3583e
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type VisitTable_rootQuery$ref = any;
export type VisitTableQueryVariables = {|
  count: number,
  cursor?: ?string,
  status?: ?string,
  service?: ?string,
  state?: ?string,
|};
export type VisitTableQueryResponse = {|
  +$fragmentRefs: VisitTable_rootQuery$ref
|};
export type VisitTableQuery = {|
  variables: VisitTableQueryVariables,
  response: VisitTableQueryResponse,
|};
*/


/*
query VisitTableQuery(
  $count: Int!
  $cursor: String
  $status: String
  $service: String
  $state: String
) {
  ...VisitTable_rootQuery_4j9PKk
}

fragment VisitTable_rootQuery_4j9PKk on Query {
  allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {
    totalCount
    edgeCount
    edges {
      node {
        id
        ...VisitRow_visit
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment VisitRow_visit on VisitType {
  id
  visitId
  status
  service
  createdDatetime
  patient {
    id
    userId
    fullName
    shippingDetails {
      state
      id
    }
  }
  medicalProvider {
    fullName
    id
  }
  allFlags {
    edges {
      node {
        category
        id
      }
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "count",
    "type": "Int!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "cursor",
    "type": "String",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "status",
    "type": "String",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "service",
    "type": "String",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "state",
    "type": "String",
    "defaultValue": null
  }
],
v1 = {
  "kind": "Variable",
  "name": "service",
  "variableName": "service"
},
v2 = {
  "kind": "Variable",
  "name": "state",
  "variableName": "state"
},
v3 = {
  "kind": "Variable",
  "name": "status",
  "variableName": "status"
},
v4 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  (v1/*: any*/),
  (v2/*: any*/),
  (v3/*: any*/)
],
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "fullName",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "VisitTableQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "FragmentSpread",
        "name": "VisitTable_rootQuery",
        "args": [
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          },
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "VisitTableQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "allVisits",
        "storageKey": null,
        "args": (v4/*: any*/),
        "concreteType": "VisitTypeConnection",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "totalCount",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "edgeCount",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitTypeEdge",
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
                  (v5/*: any*/),
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
                      (v5/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "userId",
                        "args": null,
                        "storageKey": null
                      },
                      (v6/*: any*/),
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "shippingDetails",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "ShippingDetailsType",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "state",
                            "args": null,
                            "storageKey": null
                          },
                          (v5/*: any*/)
                        ]
                      }
                    ]
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "medicalProvider",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "MedicalProviderUserType",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v5/*: any*/)
                    ]
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "allFlags",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "FlagConnection",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "edges",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "FlagEdge",
                        "plural": true,
                        "selections": [
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "name": "node",
                            "storageKey": null,
                            "args": null,
                            "concreteType": "FlagType",
                            "plural": false,
                            "selections": [
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "name": "category",
                                "args": null,
                                "storageKey": null
                              },
                              (v5/*: any*/)
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "__typename",
                    "args": null,
                    "storageKey": null
                  }
                ]
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "cursor",
                "args": null,
                "storageKey": null
              }
            ]
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "pageInfo",
            "storageKey": null,
            "args": null,
            "concreteType": "PageInfo",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "endCursor",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "hasNextPage",
                "args": null,
                "storageKey": null
              }
            ]
          }
        ]
      },
      {
        "kind": "LinkedHandle",
        "alias": null,
        "name": "allVisits",
        "args": (v4/*: any*/),
        "handle": "connection",
        "key": "VisitTable_allVisits",
        "filters": [
          "status",
          "service",
          "state"
        ]
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "VisitTableQuery",
    "id": null,
    "text": "query VisitTableQuery(\n  $count: Int!\n  $cursor: String\n  $status: String\n  $service: String\n  $state: String\n) {\n  ...VisitTable_rootQuery_4j9PKk\n}\n\nfragment VisitTable_rootQuery_4j9PKk on Query {\n  allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {\n    totalCount\n    edgeCount\n    edges {\n      node {\n        id\n        ...VisitRow_visit\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment VisitRow_visit on VisitType {\n  id\n  visitId\n  status\n  service\n  createdDatetime\n  patient {\n    id\n    userId\n    fullName\n    shippingDetails {\n      state\n      id\n    }\n  }\n  medicalProvider {\n    fullName\n    id\n  }\n  allFlags {\n    edges {\n      node {\n        category\n        id\n      }\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '333ca8052bf8bae74d260162efa28eb8';
module.exports = node;
