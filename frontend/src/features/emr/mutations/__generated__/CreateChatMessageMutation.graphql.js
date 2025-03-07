/**
 * @flow
 * @relayHash 15fabb014ff1ecef3b0c4d5b897ffab1
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ChatMessage_message$ref = any;
export type CreateChatMessageMutationInput = {|
  receiverUuid: string,
  senderUuid: string,
  body: string,
  clientMutationId?: ?string,
|};
export type CreateChatMessageMutationVariables = {|
  input: CreateChatMessageMutationInput
|};
export type CreateChatMessageMutationResponse = {|
  +createChatMessage: ?{|
    +chatMessage: ?{|
      +$fragmentRefs: ChatMessage_message$ref
    |}
  |}
|};
export type CreateChatMessageMutation = {|
  variables: CreateChatMessageMutationVariables,
  response: CreateChatMessageMutationResponse,
|};
*/


/*
mutation CreateChatMessageMutation(
  $input: CreateChatMessageMutationInput!
) {
  createChatMessage(input: $input) {
    chatMessage {
      ...ChatMessage_message
      id
    }
  }
}

fragment ChatMessage_message on ChatMessageType {
  readDatetime
  createdDatetime
  body
  sender {
    uuid
    fullName
    profilePhotoFile
    id
  }
  receiver {
    uuid
    fullName
    profilePhotoFile
    id
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "CreateChatMessageMutationInput!",
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
v3 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "uuid",
    "args": null,
    "storageKey": null
  },
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "fullName",
    "args": null,
    "storageKey": null
  },
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "profilePhotoFile",
    "args": null,
    "storageKey": null
  },
  (v2/*: any*/)
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "CreateChatMessageMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createChatMessage",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateChatMessageMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "chatMessage",
            "storageKey": null,
            "args": null,
            "concreteType": "ChatMessageType",
            "plural": false,
            "selections": [
              {
                "kind": "FragmentSpread",
                "name": "ChatMessage_message",
                "args": null
              }
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "CreateChatMessageMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createChatMessage",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateChatMessageMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "chatMessage",
            "storageKey": null,
            "args": null,
            "concreteType": "ChatMessageType",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "readDatetime",
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
                "kind": "ScalarField",
                "alias": null,
                "name": "body",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "sender",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": (v3/*: any*/)
              },
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "receiver",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": (v3/*: any*/)
              },
              (v2/*: any*/)
            ]
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "mutation",
    "name": "CreateChatMessageMutation",
    "id": null,
    "text": "mutation CreateChatMessageMutation(\n  $input: CreateChatMessageMutationInput!\n) {\n  createChatMessage(input: $input) {\n    chatMessage {\n      ...ChatMessage_message\n      id\n    }\n  }\n}\n\nfragment ChatMessage_message on ChatMessageType {\n  readDatetime\n  createdDatetime\n  body\n  sender {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n  receiver {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '1c8c9ca0eb3c7ee4c71632f74f5653b0';
module.exports = node;
