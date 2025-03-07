/**
 * @flow
 * @relayHash db9210f03a1a25694c9df030a73cdf36
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type VisitQuestionnaireAnswers_visit$ref = any;
export type VisitQuestionnaireAnswersRefetchQueryVariables = {|
  visitId: string
|};
export type VisitQuestionnaireAnswersRefetchQueryResponse = {|
  +visit: ?{|
    +$fragmentRefs: VisitQuestionnaireAnswers_visit$ref
  |}
|};
export type VisitQuestionnaireAnswersRefetchQuery = {|
  variables: VisitQuestionnaireAnswersRefetchQueryVariables,
  response: VisitQuestionnaireAnswersRefetchQueryResponse,
|};
*/


/*
query VisitQuestionnaireAnswersRefetchQuery(
  $visitId: ID!
) {
  visit(id: $visitId) {
    ...VisitQuestionnaireAnswers_visit
    id
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
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "visitId",
    "type": "ID!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "visitId"
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
  "name": "fullName",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "createdDatetime",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "VisitQuestionnaireAnswersRefetchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "visit",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "VisitType",
        "plural": false,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "VisitQuestionnaireAnswers_visit",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "VisitQuestionnaireAnswersRefetchQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "visit",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "VisitType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/)
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
              (v2/*: any*/)
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
              (v2/*: any*/)
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
              (v2/*: any*/)
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
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "creator",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "UserType",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v2/*: any*/)
                        ]
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "body",
                        "args": null,
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "category",
                        "args": null,
                        "storageKey": null
                      },
                      (v2/*: any*/)
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
    "name": "VisitQuestionnaireAnswersRefetchQuery",
    "id": null,
    "text": "query VisitQuestionnaireAnswersRefetchQuery(\n  $visitId: ID!\n) {\n  visit(id: $visitId) {\n    ...VisitQuestionnaireAnswers_visit\n    id\n  }\n}\n\nfragment VisitQuestionnaireAnswers_visit on VisitType {\n  id\n  uuid\n  visitId\n  service\n  medicalProvider {\n    id\n    fullName\n  }\n  skinProfileStatus\n  status\n  createdDatetime\n  questionnaireAnswers {\n    answers\n    id\n  }\n  questionnaire {\n    questions\n    id\n  }\n  patient {\n    id\n  }\n  allFlags {\n    edges {\n      node {\n        ...Flag_flag\n        id\n      }\n    }\n  }\n}\n\nfragment Flag_flag on FlagType {\n  flagId\n  creator {\n    fullName\n    id\n  }\n  body\n  createdDatetime\n  category\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'c965f5809973afcc15493b78e7d8ba7a';
module.exports = node;
