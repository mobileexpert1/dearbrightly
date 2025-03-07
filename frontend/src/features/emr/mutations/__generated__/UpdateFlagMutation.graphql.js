/**
 * @flow
 * @relayHash a37863b4a3092cc3fa30d71265410e43
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type UpdateFlagMutationInput = {|
  id: string,
  clientMutationId?: ?string,
|};
export type UpdateFlagMutationVariables = {|
  input: UpdateFlagMutationInput
|};
export type UpdateFlagMutationResponse = {|
  +updateFlag: ?{|
    +flag: ?{|
      +id: string,
      +body: string,
      +createdDatetime: any,
    |}
  |}
|};
export type UpdateFlagMutation = {|
  variables: UpdateFlagMutationVariables,
  response: UpdateFlagMutationResponse,
|};
*/


/*
mutation UpdateFlagMutation(
  $input: UpdateFlagMutationInput!
) {
  updateFlag(input: $input) {
    flag {
      id
      body
      createdDatetime
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "UpdateFlagMutationInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "updateFlag",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateFlagMutationPayload",
    "plural": false,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "flag",
        "storageKey": null,
        "args": null,
        "concreteType": "FlagType",
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
            "name": "body",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "createdDatetime",
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
    "name": "UpdateFlagMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "UpdateFlagMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "UpdateFlagMutation",
    "id": null,
    "text": "mutation UpdateFlagMutation(\n  $input: UpdateFlagMutationInput!\n) {\n  updateFlag(input: $input) {\n    flag {\n      id\n      body\n      createdDatetime\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'a9be5fe6777d25ec5868c93d399c5bd6';
module.exports = node;
