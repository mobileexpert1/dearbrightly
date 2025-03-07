/**
 * @flow
 * @relayHash 61ec8aab8fd7913282c1d96e56eb94c4
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type CreateMedicalVisitInput = {|
  userUuid: string,
  clientMutationId?: ?string,
|};
export type CreateMedicalVisitMutationVariables = {|
  input: CreateMedicalVisitInput
|};
export type CreateMedicalVisitMutationResponse = {|
  +createVisit: ?{|
    +visit: ?{|
      +id: string
    |}
  |}
|};
export type CreateMedicalVisitMutation = {|
  variables: CreateMedicalVisitMutationVariables,
  response: CreateMedicalVisitMutationResponse,
|};
*/


/*
mutation CreateMedicalVisitMutation(
  $input: CreateMedicalVisitInput!
) {
  createVisit(input: $input) {
    visit {
      id
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "CreateMedicalVisitInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "createVisit",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateMedicalVisitPayload",
    "plural": false,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "visit",
        "storageKey": null,
        "args": null,
        "concreteType": "VisitType",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
            "args": null,
            "storageKey": null
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
    "name": "CreateMedicalVisitMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "CreateMedicalVisitMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "CreateMedicalVisitMutation",
    "id": null,
    "text": "mutation CreateMedicalVisitMutation(\n  $input: CreateMedicalVisitInput!\n) {\n  createVisit(input: $input) {\n    visit {\n      id\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '844bcbe88b044fe9bb04e19ba5fb1d85';
module.exports = node;
