/**
 * @flow
 * @relayHash 80d99a0df8167711abcef2401e290d75
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type UpdateVisitMedicalProviderModalQueryVariables = {||};
export type UpdateVisitMedicalProviderModalQueryResponse = {|
  +allMedicalProviders: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +fullName: ?string,
      |}
    |}>
  |}
|};
export type UpdateVisitMedicalProviderModalQuery = {|
  variables: UpdateVisitMedicalProviderModalQueryVariables,
  response: UpdateVisitMedicalProviderModalQueryResponse,
|};
*/


/*
query UpdateVisitMedicalProviderModalQuery {
  allMedicalProviders {
    edges {
      node {
        id
        fullName
      }
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "allMedicalProviders",
    "storageKey": null,
    "args": null,
    "concreteType": "MedicalProviderUserTypeConnection",
    "plural": false,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "edges",
        "storageKey": null,
        "args": null,
        "concreteType": "MedicalProviderUserTypeEdge",
        "plural": true,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "node",
            "storageKey": null,
            "args": null,
            "concreteType": "MedicalProviderUserType",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "id",
                "args": null,
                "storageKey": null
              },
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
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "UpdateVisitMedicalProviderModalQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": (v0/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "UpdateVisitMedicalProviderModalQuery",
    "argumentDefinitions": [],
    "selections": (v0/*: any*/)
  },
  "params": {
    "operationKind": "query",
    "name": "UpdateVisitMedicalProviderModalQuery",
    "id": null,
    "text": "query UpdateVisitMedicalProviderModalQuery {\n  allMedicalProviders {\n    edges {\n      node {\n        id\n        fullName\n      }\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '39c6de0d2aa574df54a9715771329bdc';
module.exports = node;
