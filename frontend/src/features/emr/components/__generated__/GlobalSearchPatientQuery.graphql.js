/**
 * @flow
 * @relayHash 6ad7cf73117abb82c28e3c77987088d8
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SearchPatientResult_patient$ref = any;
export type GlobalSearchPatientQueryVariables = {|
  search?: ?string
|};
export type GlobalSearchPatientQueryResponse = {|
  +searchPatients: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: SearchPatientResult_patient$ref,
      |}
    |}>
  |}
|};
export type GlobalSearchPatientQuery = {|
  variables: GlobalSearchPatientQueryVariables,
  response: GlobalSearchPatientQueryResponse,
|};
*/


/*
query GlobalSearchPatientQuery(
  $search: String
) {
  searchPatients(search: $search) {
    edges {
      node {
        id
        ...SearchPatientResult_patient
      }
    }
  }
}

fragment SearchPatientResult_patient on UserType {
  id
  userId
  firstName
  lastName
  email
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
    "name": "GlobalSearchPatientQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPatients",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "PatientSearchResultConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "PatientSearchResultEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "FragmentSpread",
                    "name": "SearchPatientResult_patient",
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
    "name": "GlobalSearchPatientQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPatients",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "PatientSearchResultConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "PatientSearchResultEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "userId",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "firstName",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "lastName",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "email",
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
  },
  "params": {
    "operationKind": "query",
    "name": "GlobalSearchPatientQuery",
    "id": null,
    "text": "query GlobalSearchPatientQuery(\n  $search: String\n) {\n  searchPatients(search: $search) {\n    edges {\n      node {\n        id\n        ...SearchPatientResult_patient\n      }\n    }\n  }\n}\n\nfragment SearchPatientResult_patient on UserType {\n  id\n  userId\n  firstName\n  lastName\n  email\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'd15aafe8d46b4e6eab24ebc3439c7279';
module.exports = node;
