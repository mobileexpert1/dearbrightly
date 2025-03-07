/**
 * @flow
 * @relayHash f0bd68073618316dc9a27e9cc9be8aba
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type CreateFlagMutationInput = {|
  visitUuid: string,
  body: string,
  clientMutationId?: ?string,
|};
export type CreateFlagMutationVariables = {|
  input: CreateFlagMutationInput
|};
export type CreateFlagMutationResponse = {|
  +createFlag: ?{|
    +flag: ?{|
      +id: string,
      +body: string,
      +createdDatetime: any,
    |}
  |}
|};
export type CreateFlagMutation = {|
  variables: CreateFlagMutationVariables,
  response: CreateFlagMutationResponse,
|};
*/


/*
mutation CreateFlagMutation(
  $input: CreateFlagMutationInput!
) {
  createFlag(input: $input) {
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
    "type": "CreateFlagMutationInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "createFlag",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateFlagMutationPayload",
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
    "name": "CreateFlagMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "CreateFlagMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "CreateFlagMutation",
    "id": null,
    "text": "mutation CreateFlagMutation(\n  $input: CreateFlagMutationInput!\n) {\n  createFlag(input: $input) {\n    flag {\n      id\n      body\n      createdDatetime\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '45074ab7471d63bab7d1a8b0975993e3';
module.exports = node;
