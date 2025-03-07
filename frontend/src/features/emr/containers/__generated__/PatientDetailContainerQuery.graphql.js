/**
 * @flow
 * @relayHash e8cf10516932adcf6bc873bda37529bc
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AddPatientPrescription_patient$ref = any;
type ChatMessageContainer_patient$ref = any;
type MedicalNoteContainer_patient$ref = any;
type PatientInfo_patient$ref = any;
type PatientPrescriptionsContainer_patient$ref = any;
type VisitPhotosContainer_visit$ref = any;
type VisitQuestionnaireAnswers_visit$ref = any;
export type PatientDetailContainerQueryVariables = {|
  patientId: string
|};
export type PatientDetailContainerQueryResponse = {|
  +patient: ?{|
    +uuid: any,
    +patientVisits: ?{|
      +edges: $ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +$fragmentRefs: VisitQuestionnaireAnswers_visit$ref & VisitPhotosContainer_visit$ref,
        |}
      |}>
    |},
    +$fragmentRefs: ChatMessageContainer_patient$ref & MedicalNoteContainer_patient$ref & PatientInfo_patient$ref & PatientPrescriptionsContainer_patient$ref & AddPatientPrescription_patient$ref,
  |}
|};
export type PatientDetailContainerQuery = {|
  variables: PatientDetailContainerQueryVariables,
  response: PatientDetailContainerQueryResponse,
|};
*/


/*
query PatientDetailContainerQuery(
  $patientId: ID!
) {
  patient(id: $patientId) {
    uuid
    ...ChatMessageContainer_patient
    patientVisits {
      edges {
        node {
          id
          ...VisitQuestionnaireAnswers_visit
          ...VisitPhotosContainer_visit
        }
      }
    }
    ...MedicalNoteContainer_patient
    ...PatientInfo_patient
    ...PatientPrescriptionsContainer_patient
    ...AddPatientPrescription_patient
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

fragment VisitQuestionnaireAnswers_visit on VisitType {
  id
  uuid
  visitId
  service
  medicalProvider {
    id
    fullName
  }
  skinProfileStatus
  status
  createdDatetime
  questionnaireAnswers {
    answers
    id
  }
  questionnaire {
    questions
    id
  }
  patient {
    id
  }
  allFlags {
    edges {
      node {
        ...Flag_flag
        id
      }
    }
  }
}

fragment VisitPhotosContainer_visit on VisitType {
  id
  skinProfileStatus
  visitPhotos {
    edges {
      node {
        photoId
        photoData
        photoFile
        photoType
        photoRejected
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

fragment PatientInfo_patient on UserType {
  id
  userId
  fullName
  gender
  dob
  shippingDetails {
    addressLine1
    addressLine2
    city
    state
    postalCode
    country
    phone
    id
  }
  email
}

fragment PatientPrescriptionsContainer_patient on UserType {
  allPrescriptions {
    edges {
      node {
        id
        ...PatientPrescription_prescription
      }
    }
  }
}

fragment AddPatientPrescription_patient on UserType {
  uuid
}

fragment PatientPrescription_prescription on PatientPrescriptionType {
  prescription {
    displayName
    daysSupply
    quantity
    dispenseUnit
    refills
    id
  }
  prescribedDatetime
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

fragment Flag_flag on FlagType {
  flagId
  creator {
    fullName
    id
  }
  body
  createdDatetime
  category
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
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "createdDatetime",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "body",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "fullName",
  "args": null,
  "storageKey": null
},
v7 = [
  (v2/*: any*/),
  (v6/*: any*/),
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "profilePhotoFile",
    "args": null,
    "storageKey": null
  },
  (v3/*: any*/)
],
v8 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "creator",
  "storageKey": null,
  "args": null,
  "concreteType": "UserType",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    (v3/*: any*/)
  ]
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "PatientDetailContainerQuery",
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
            "kind": "LinkedField",
            "alias": null,
            "name": "patientVisits",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitTypeConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "VisitTypeEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "VisitType",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "kind": "FragmentSpread",
                        "name": "VisitQuestionnaireAnswers_visit",
                        "args": null
                      },
                      {
                        "kind": "FragmentSpread",
                        "name": "VisitPhotosContainer_visit",
                        "args": null
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "kind": "FragmentSpread",
            "name": "ChatMessageContainer_patient",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "MedicalNoteContainer_patient",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "PatientInfo_patient",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "PatientPrescriptionsContainer_patient",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "AddPatientPrescription_patient",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "PatientDetailContainerQuery",
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
                      (v4/*: any*/),
                      (v5/*: any*/),
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "sender",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "UserType",
                        "plural": false,
                        "selections": (v7/*: any*/)
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "receiver",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "UserType",
                        "plural": false,
                        "selections": (v7/*: any*/)
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "patientVisits",
            "storageKey": null,
            "args": null,
            "concreteType": "VisitTypeConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "VisitTypeEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "VisitType",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v2/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "visitId",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "service",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "medicalProvider",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "MedicalProviderUserType",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v6/*: any*/)
                        ]
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "skinProfileStatus",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "status",
                        "args": null,
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "questionnaireAnswers",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "QuestionnaireAnswersType",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "answers",
                            "args": null,
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ]
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "questionnaire",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "QuestionnaireType",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "questions",
                            "args": null,
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ]
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "patient",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "UserType",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/)
                        ]
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "allFlags",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "FlagConnection",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "name": "edges",
                            "storageKey": null,
                            "args": null,
                            "concreteType": "FlagEdge",
                            "plural": true,
                            "selections": [
                              {
                                "kind": "LinkedField",
                                "alias": null,
                                "name": "node",
                                "storageKey": null,
                                "args": null,
                                "concreteType": "FlagType",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "flagId",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  (v8/*: any*/),
                                  (v5/*: any*/),
                                  (v4/*: any*/),
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "category",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  (v3/*: any*/)
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "visitPhotos",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "PhotoConnection",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "LinkedField",
                            "alias": null,
                            "name": "edges",
                            "storageKey": null,
                            "args": null,
                            "concreteType": "PhotoEdge",
                            "plural": true,
                            "selections": [
                              {
                                "kind": "LinkedField",
                                "alias": null,
                                "name": "node",
                                "storageKey": null,
                                "args": null,
                                "concreteType": "PhotoType",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "photoId",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "photoData",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "photoFile",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "photoType",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  {
                                    "kind": "ScalarField",
                                    "alias": null,
                                    "name": "photoRejected",
                                    "args": null,
                                    "storageKey": null
                                  },
                                  (v3/*: any*/)
                                ]
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
                      (v3/*: any*/),
                      (v8/*: any*/),
                      (v5/*: any*/),
                      (v4/*: any*/)
                    ]
                  }
                ]
              }
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "userId",
            "args": null,
            "storageKey": null
          },
          (v6/*: any*/),
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "gender",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "dob",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "shippingDetails",
            "storageKey": null,
            "args": null,
            "concreteType": "ShippingDetailsType",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "addressLine1",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "addressLine2",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "city",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "state",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "postalCode",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "country",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "phone",
                "args": null,
                "storageKey": null
              },
              (v3/*: any*/)
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "email",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "allPrescriptions",
            "storageKey": null,
            "args": null,
            "concreteType": "PatientPrescriptionConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "PatientPrescriptionEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "PatientPrescriptionType",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "prescription",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "PrescriptionType",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "displayName",
                            "args": null,
                            "storageKey": null
                          },
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "daysSupply",
                            "args": null,
                            "storageKey": null
                          },
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "quantity",
                            "args": null,
                            "storageKey": null
                          },
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "dispenseUnit",
                            "args": null,
                            "storageKey": null
                          },
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "refills",
                            "args": null,
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ]
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "prescribedDatetime",
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
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "PatientDetailContainerQuery",
    "id": null,
    "text": "query PatientDetailContainerQuery(\n  $patientId: ID!\n) {\n  patient(id: $patientId) {\n    uuid\n    ...ChatMessageContainer_patient\n    patientVisits {\n      edges {\n        node {\n          id\n          ...VisitQuestionnaireAnswers_visit\n          ...VisitPhotosContainer_visit\n        }\n      }\n    }\n    ...MedicalNoteContainer_patient\n    ...PatientInfo_patient\n    ...PatientPrescriptionsContainer_patient\n    ...AddPatientPrescription_patient\n    id\n  }\n}\n\nfragment ChatMessageContainer_patient on UserType {\n  id\n  ...ChatMessageComposer_patient\n  ...ChatMessage_patient\n  allChatMessages {\n    edges {\n      node {\n        id\n        ...ChatMessage_message\n      }\n    }\n  }\n}\n\nfragment VisitQuestionnaireAnswers_visit on VisitType {\n  id\n  uuid\n  visitId\n  service\n  medicalProvider {\n    id\n    fullName\n  }\n  skinProfileStatus\n  status\n  createdDatetime\n  questionnaireAnswers {\n    answers\n    id\n  }\n  questionnaire {\n    questions\n    id\n  }\n  patient {\n    id\n  }\n  allFlags {\n    edges {\n      node {\n        ...Flag_flag\n        id\n      }\n    }\n  }\n}\n\nfragment VisitPhotosContainer_visit on VisitType {\n  id\n  skinProfileStatus\n  visitPhotos {\n    edges {\n      node {\n        photoId\n        photoData\n        photoFile\n        photoType\n        photoRejected\n        id\n      }\n    }\n  }\n}\n\nfragment MedicalNoteContainer_patient on UserType {\n  ...MedicalNoteComposer_patient\n  medicalNotes {\n    edges {\n      node {\n        id\n        ...MedicalNote_note\n      }\n    }\n  }\n}\n\nfragment PatientInfo_patient on UserType {\n  id\n  userId\n  fullName\n  gender\n  dob\n  shippingDetails {\n    addressLine1\n    addressLine2\n    city\n    state\n    postalCode\n    country\n    phone\n    id\n  }\n  email\n}\n\nfragment PatientPrescriptionsContainer_patient on UserType {\n  allPrescriptions {\n    edges {\n      node {\n        id\n        ...PatientPrescription_prescription\n      }\n    }\n  }\n}\n\nfragment AddPatientPrescription_patient on UserType {\n  uuid\n}\n\nfragment PatientPrescription_prescription on PatientPrescriptionType {\n  prescription {\n    displayName\n    daysSupply\n    quantity\n    dispenseUnit\n    refills\n    id\n  }\n  prescribedDatetime\n}\n\nfragment MedicalNoteComposer_patient on UserType {\n  uuid\n}\n\nfragment MedicalNote_note on NoteType {\n  creator {\n    fullName\n    id\n  }\n  body\n  createdDatetime\n}\n\nfragment Flag_flag on FlagType {\n  flagId\n  creator {\n    fullName\n    id\n  }\n  body\n  createdDatetime\n  category\n}\n\nfragment ChatMessageComposer_patient on UserType {\n  uuid\n}\n\nfragment ChatMessage_patient on UserType {\n  uuid\n}\n\nfragment ChatMessage_message on ChatMessageType {\n  readDatetime\n  createdDatetime\n  body\n  sender {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n  receiver {\n    uuid\n    fullName\n    profilePhotoFile\n    id\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'fd663022f7119440f8fae73876018025';
module.exports = node;
