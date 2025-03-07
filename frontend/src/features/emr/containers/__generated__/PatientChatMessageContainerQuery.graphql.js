/**
 * @flow
 * @relayHash 2893dfac15a8e1ef6b47e006ce88271c
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ChatMessageContainer_patient$ref = any;
export type PatientChatMessageContainerQueryVariables = {|
  patientId: string
|};
export type PatientChatMessageContainerQueryResponse = {|
  +patient: ?{|
    +uuid: any,
    +$fragmentRefs: ChatMessageContainer_patient$ref,
  |}
|};
export type PatientChatMessageContainerQuery = {|
  variables: PatientChatMessageContainerQueryVariables,
  response: PatientChatMessageContainerQueryResponse,
|};
*/


/*
query PatientChatMessageContainerQuery(
  $patientId: ID!
) {
  patient(id: $patientId) {
    uuid
    ...ChatMessageContainer_patient
    id
  }
}

fragment ChatMessageContainer_patient on UserType {
  id
  ...ChatMessageComposer_patient
  ...ChatMessage_patient
  allChatMessages {
    edges {
      node {
        id
        ...ChatMessage_message
      }
    }
  }
}

fragment ChatMessageComposer_patient on UserType {
  uuid
}

fragment ChatMessage_patient on UserType {
  uuid
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
    "name": "patientId",
    "type": "ID!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "patientId"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "uuid",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v4 = [
  (v2/*: any*/),
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
  (v3/*: any*/)
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "PatientChatMessageContainerQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "patient",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UserType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "FragmentSpread",
            "name": "ChatMessageContainer_patient",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "PatientChatMessageContainerQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "patient",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UserType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "allChatMessages",
            "storageKey": null,
            "args": null,
            "concreteType": "ChatMessagesConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "ChatMessagesEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "ChatMessageType",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
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
                        "selections": (v4/*: any*/)
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "receiver",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "UserType",
                        "plural": false,
                        "selections": (v4/*: any*/)
                      }
                    ]
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
    "name": "PatientChatMessageContainerQuery",
    "id": null,
    "text": "query PatientChatMessageContainerQuery(\n  $patientId: ID!\n) {\n  patient(id: $patientId) {\n    uuid\n    ...ChatMessageContainer_patient\n    id\n  }\n}\n\nfragment ChatMessageContainer_patient on UserType {\n  id\n  ...ChatMessageComposer_patient\n  ...ChatMessage_patient\n  allChatMessages {\n    edges {\n      node {\n        id\n        ...ChatMessage_message\n      }\n    }\n  }\n}\n\nfragment ChatMessageComposer_patient on UserType {\n  uuid\n}\n\nfragment ChatMessage_patient on UserType {\n  uuid\n}\n\nfragment ChatMessage_message on ChatMessageType {\n  readDatetime\n  createdDatetime\n  body\n  sender {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n  receiver {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'd1c5d560b86a2fb63cf432093532b708';
module.exports = node;
