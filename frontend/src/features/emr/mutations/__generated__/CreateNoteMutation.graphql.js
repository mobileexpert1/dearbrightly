/**
 * @flow
 * @relayHash 763645b1da3fa851923cb625d77bd490
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type MedicalNoteContainer_patient$ref = any;
export type CreateNoteMutationInput = {|
  patientUuid: string,
  body: string,
  clientMutationId?: ?string,
|};
export type CreateNoteMutationVariables = {|
  input: CreateNoteMutationInput
|};
export type CreateNoteMutationResponse = {|
  +createNote: ?{|
    +note: ?{|
      +id: string,
      +body: ?string,
      +patient: ?{|
        +$fragmentRefs: MedicalNoteContainer_patient$ref
      |},
    |}
  |}
|};
export type CreateNoteMutation = {|
  variables: CreateNoteMutationVariables,
  response: CreateNoteMutationResponse,
|};
*/


/*
mutation CreateNoteMutation(
  $input: CreateNoteMutationInput!
) {
  createNote(input: $input) {
    note {
      id
      body
      patient {
        ...MedicalNoteContainer_patient
        id
      }
    }
  }
}

fragment MedicalNoteContainer_patient on UserType {
  ...MedicalNoteComposer_patient
  medicalNotes {
    edges {
      node {
        id
        ...MedicalNote_note
      }
    }
  }
}

fragment MedicalNoteComposer_patient on UserType {
  uuid
}

fragment MedicalNote_note on NoteType {
  creator {
    fullName
    id
  }
  body
  createdDatetime
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "CreateNoteMutationInput!",
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
  "name": "body",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "CreateNoteMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createNote",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateNoteMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "note",
            "storageKey": null,
            "args": null,
            "concreteType": "NoteType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "patient",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "MedicalNoteContainer_patient",
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
    "name": "CreateNoteMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createNote",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateNoteMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "note",
            "storageKey": null,
            "args": null,
            "concreteType": "NoteType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "patient",
                "storageKey": null,
                "args": null,
                "concreteType": "UserType",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "uuid",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "medicalNotes",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "NoteTypeConnection",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "edges",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "NoteTypeEdge",
                        "plural": true,
                        "selections": [
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "name": "node",
                            "storageKey": null,
                            "args": null,
                            "concreteType": "NoteType",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              {
                                "kind": "LinkedField",
                                "alias": null,
                                "name": "creator",
                                "storageKey": null,
                                "args": null,
                                "concreteType": "UserType",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "fullName",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  (v2/*: any*/)
                                ]
                              },
                              (v3/*: any*/),
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
                    ]
                  },
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
    "name": "CreateNoteMutation",
    "id": null,
    "text": "mutation CreateNoteMutation(\n  $input: CreateNoteMutationInput!\n) {\n  createNote(input: $input) {\n    note {\n      id\n      body\n      patient {\n        ...MedicalNoteContainer_patient\n        id\n      }\n    }\n  }\n}\n\nfragment MedicalNoteContainer_patient on UserType {\n  ...MedicalNoteComposer_patient\n  medicalNotes {\n    edges {\n      node {\n        id\n        ...MedicalNote_note\n      }\n    }\n  }\n}\n\nfragment MedicalNoteComposer_patient on UserType {\n  uuid\n}\n\nfragment MedicalNote_note on NoteType {\n  creator {\n    fullName\n    id\n  }\n  body\n  createdDatetime\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'ef330ea2b8148411634c5b874c3673d7';
module.exports = node;
