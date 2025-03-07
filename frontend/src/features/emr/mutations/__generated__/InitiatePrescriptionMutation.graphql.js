/**
 * @flow
 * @relayHash be05d18d326f13ae38496b65a2c8d6bb
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type InitiatePrescriptionMutationInput = {|
  patientUuid: string,
  clientMutationId?: ?string,
|};
export type InitiatePrescriptionMutationVariables = {|
  input: InitiatePrescriptionMutationInput
|};
export type InitiatePrescriptionMutationResponse = {|
  +initiatePrescription: ?{|
    +prescriptionUrl: ?string
  |}
|};
export type InitiatePrescriptionMutation = {|
  variables: InitiatePrescriptionMutationVariables,
  response: InitiatePrescriptionMutationResponse,
|};
*/


/*
mutation InitiatePrescriptionMutation(
  $input: InitiatePrescriptionMutationInput!
) {
  initiatePrescription(input: $input) {
    prescriptionUrl
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "InitiatePrescriptionMutationInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "initiatePrescription",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "InitiatePrescriptionMutationPayload",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "prescriptionUrl",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "InitiatePrescriptionMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "InitiatePrescriptionMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "InitiatePrescriptionMutation",
    "id": null,
    "text": "mutation InitiatePrescriptionMutation(\n  $input: InitiatePrescriptionMutationInput!\n) {\n  initiatePrescription(input: $input) {\n    prescriptionUrl\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'bd589325458c07e418aff67c5cac0c6f';
module.exports = node;
