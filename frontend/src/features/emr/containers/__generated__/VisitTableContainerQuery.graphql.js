/**
 * @flow
 * @relayHash b74b424d035c3d4a2952b9a867bc09c1
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type VisitFilterForm_rootQuery$ref = any;
type VisitTable_rootQuery$ref = any;
export type VisitTableContainerQueryVariables = {|
  count: number,
  cursor?: ?string,
  status?: ?string,
  service?: ?string,
  state?: ?string,
|};
export type VisitTableContainerQueryResponse = {|
  +allVisits: ?{|
    +edgeCount: ?number
  |},
  +$fragmentRefs: VisitTable_rootQuery$ref & VisitFilterForm_rootQuery$ref,
|};
export type VisitTableContainerQuery = {|
  variables: VisitTableContainerQueryVariables,
  response: VisitTableContainerQueryResponse,
|};
*/


/*
query VisitTableContainerQuery(
  $count: Int!
  $cursor: String
  $status: String
  $service: String
  $state: String
) {
  allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {
    edgeCount
  }
  ...VisitTable_rootQuery_4j9PKk
  ...VisitFilterForm_rootQuery
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

fragment VisitFilterForm_rootQuery on Query {
  allVisitStatusChoices {
    edges {
      node {
        value
      }
    }
  }
  allServiceChoices {
    edges {
      node {
        value
      }
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
  "name": "edgeCount",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "fullName",
  "args": null,
  "storageKey": null
},
v8 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "value",
    "args": null,
    "storageKey": null
  }
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "VisitTableContainerQuery",
    "type": "Query",
    "metadata": null,
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
          (v5/*: any*/)
        ]
      },
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
      },
      {
        "kind": "FragmentSpread",
        "name": "VisitFilterForm_rootQuery",
        "args": null
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "VisitTableContainerQuery",
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
          (v5/*: any*/),
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "totalCount",
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
                  (v6/*: any*/),
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
                      (v6/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "userId",
                        "args": null,
                        "storageKey": null
                      },
                      (v7/*: any*/),
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
                          (v6/*: any*/)
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
                      (v7/*: any*/),
                      (v6/*: any*/)
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
                              (v6/*: any*/)
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
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "allVisitStatusChoices",
        "storageKey": null,
        "args": null,
        "concreteType": "VisitStatusConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitStatusEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "VisitStatusChoiceType",
                "plural": false,
                "selections": (v8/*: any*/)
              }
            ]
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "allServiceChoices",
        "storageKey": null,
        "args": null,
        "concreteType": "ServiceChoiceConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "ServiceChoiceEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "ServiceChoiceType",
                "plural": false,
                "selections": (v8/*: any*/)
              }
            ]
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "VisitTableContainerQuery",
    "id": null,
    "text": "query VisitTableContainerQuery(\n  $count: Int!\n  $cursor: String\n  $status: String\n  $service: String\n  $state: String\n) {\n  allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {\n    edgeCount\n  }\n  ...VisitTable_rootQuery_4j9PKk\n  ...VisitFilterForm_rootQuery\n}\n\nfragment VisitTable_rootQuery_4j9PKk on Query {\n  allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {\n    totalCount\n    edgeCount\n    edges {\n      node {\n        id\n        ...VisitRow_visit\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment VisitFilterForm_rootQuery on Query {\n  allVisitStatusChoices {\n    edges {\n      node {\n        value\n      }\n    }\n  }\n  allServiceChoices {\n    edges {\n      node {\n        value\n      }\n    }\n  }\n}\n\nfragment VisitRow_visit on VisitType {\n  id\n  visitId\n  status\n  service\n  createdDatetime\n  patient {\n    id\n    userId\n    fullName\n    shippingDetails {\n      state\n      id\n    }\n  }\n  medicalProvider {\n    fullName\n    id\n  }\n  allFlags {\n    edges {\n      node {\n        category\n        id\n      }\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'b8346bb3396afdfc75ff6a47bf4bf75d';
module.exports = node;
