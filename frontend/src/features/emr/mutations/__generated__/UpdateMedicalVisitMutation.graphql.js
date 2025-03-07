/**
 * @flow
 * @relayHash 5f6eab9b47140c5cfacbf0776edd8cb8
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type VisitStatus = "PENDING" | "PENDING_PRESCRIPTION" | "PROVIDER_AWAITING_USER_INPUT" | "PROVIDER_CANCELLED" | "PROVIDER_PENDING_ACTION" | "PROVIDER_RX_DENIED" | "PROVIDER_RX_SUBMITTED" | "PROVIDER_SIGNED" | "SKIN_PROFILE_COMPLETE" | "SKIN_PROFILE_PENDING" | "%future added value";
export type UpdateMedicalVisitMutationInput = {|
  id: string,
  status?: ?string,
  medicalProviderId?: ?string,
  clientMutationId?: ?string,
|};
export type UpdateMedicalVisitMutationVariables = {|
  input: UpdateMedicalVisitMutationInput
|};
export type UpdateMedicalVisitMutationResponse = {|
  +updateVisit: ?{|
    +visit: ?{|
      +id: string,
      +status: VisitStatus,
      +medicalProvider: ?{|
        +fullName: ?string
      |},
    |}
  |}
|};
export type UpdateMedicalVisitMutation = {|
  variables: UpdateMedicalVisitMutationVariables,
  response: UpdateMedicalVisitMutationResponse,
|};
*/


/*
mutation UpdateMedicalVisitMutation(
  $input: UpdateMedicalVisitMutationInput!
) {
  updateVisit(input: $input) {
    visit {
      id
      status
      medicalProvider {
        fullName
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
    "name": "input",
    "type": "UpdateMedicalVisitMutationInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "status",
  "args": null,
  "storageKey": null
},
v4 = {
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
    "name": "UpdateMedicalVisitMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "updateVisit",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateMedicalVisitMutationPayload",
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
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "medicalProvider",
                "storageKey": null,
                "args": null,
                "concreteType": "MedicalProviderUserType",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
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
    "name": "UpdateMedicalVisitMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "updateVisit",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateMedicalVisitMutationPayload",
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
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "medicalProvider",
                "storageKey": null,
                "args": null,
                "concreteType": "MedicalProviderUserType",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/)
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "mutation",
    "name": "UpdateMedicalVisitMutation",
    "id": null,
    "text": "mutation UpdateMedicalVisitMutation(\n  $input: UpdateMedicalVisitMutationInput!\n) {\n  updateVisit(input: $input) {\n    visit {\n      id\n      status\n      medicalProvider {\n        fullName\n        id\n      }\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '36e92c286a2b490fc83481008c5b5024';
module.exports = node;
