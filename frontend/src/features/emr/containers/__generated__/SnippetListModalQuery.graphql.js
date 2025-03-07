/**
 * @flow
 * @relayHash 90374176cd3fe584a35fa7317da56d4b
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SnippetEntry_snippet$ref = any;
export type SnippetListModalQueryVariables = {||};
export type SnippetListModalQueryResponse = {|
  +allSnippets: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: SnippetEntry_snippet$ref,
      |}
    |}>
  |}
|};
export type SnippetListModalQuery = {|
  variables: SnippetListModalQueryVariables,
  response: SnippetListModalQueryResponse,
|};
*/


/*
query SnippetListModalQuery {
  allSnippets(last: 100) {
    edges {
      node {
        id
        ...SnippetEntry_snippet
        __typename
      }
      cursor
    }
    pageInfo {
      hasPreviousPage
      startCursor
    }
  }
}

fragment SnippetEntry_snippet on SnippetType {
  name
  body
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "__typename",
  "args": null,
  "storageKey": null
},
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "cursor",
  "args": null,
  "storageKey": null
},
v3 = {
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
      "name": "hasPreviousPage",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "startCursor",
      "args": null,
      "storageKey": null
    }
  ]
},
v4 = [
  {
    "kind": "Literal",
    "name": "last",
    "value": 100
  }
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "SnippetListModalQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": "allSnippets",
        "name": "__SnippetListModalQuery_allSnippets_connection",
        "storageKey": null,
        "args": null,
        "concreteType": "SnippetTypeConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "SnippetTypeEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "SnippetType",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/),
                  {
                    "kind": "FragmentSpread",
                    "name": "SnippetEntry_snippet",
                    "args": null
                  }
                ]
              },
              (v2/*: any*/)
            ]
          },
          (v3/*: any*/)
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SnippetListModalQuery",
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "allSnippets",
        "storageKey": "allSnippets(last:100)",
        "args": (v4/*: any*/),
        "concreteType": "SnippetTypeConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "SnippetTypeEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "SnippetType",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "name",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "body",
                    "args": null,
                    "storageKey": null
                  },
                  (v1/*: any*/)
                ]
              },
              (v2/*: any*/)
            ]
          },
          (v3/*: any*/)
        ]
      },
      {
        "kind": "LinkedHandle",
        "alias": null,
        "name": "allSnippets",
        "args": (v4/*: any*/),
        "handle": "connection",
        "key": "SnippetListModalQuery_allSnippets",
        "filters": null
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "SnippetListModalQuery",
    "id": null,
    "text": "query SnippetListModalQuery {\n  allSnippets(last: 100) {\n    edges {\n      node {\n        id\n        ...SnippetEntry_snippet\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n\nfragment SnippetEntry_snippet on SnippetType {\n  name\n  body\n}\n",
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "backward",
          "path": [
            "allSnippets"
          ]
        }
      ]
    }
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'b9e1d0e3012e24f2565e8fd87d0c0c26';
module.exports = node;
