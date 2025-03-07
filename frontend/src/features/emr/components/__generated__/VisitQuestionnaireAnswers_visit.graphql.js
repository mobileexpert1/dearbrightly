/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type Flag_flag$ref = any;
export type VisitService = "INITIAL_VISIT" | "REPEAT_VISIT" | "SHORT_REPEAT_VISIT_FEMALE" | "SHORT_REPEAT_VISIT_MALE" | "%future added value";
export type VisitSkinProfileStatus = "COMPLETE" | "INCOMPLETE_USER_RESPONSE" | "NOT_STARTED" | "NO_CHANGES_NO_USER_RESPONSE" | "NO_CHANGES_USER_SPECIFIED" | "PENDING_PHOTOS" | "PENDING_QUESTIONNAIRE" | "%future added value";
export type VisitStatus = "PENDING" | "PENDING_PRESCRIPTION" | "PROVIDER_AWAITING_USER_INPUT" | "PROVIDER_CANCELLED" | "PROVIDER_PENDING_ACTION" | "PROVIDER_RX_DENIED" | "PROVIDER_RX_SUBMITTED" | "PROVIDER_SIGNED" | "SKIN_PROFILE_COMPLETE" | "SKIN_PROFILE_PENDING" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type VisitQuestionnaireAnswers_visit$ref: FragmentReference;
declare export opaque type VisitQuestionnaireAnswers_visit$fragmentType: VisitQuestionnaireAnswers_visit$ref;
export type VisitQuestionnaireAnswers_visit = {|
  +id: string,
  +uuid: any,
  +visitId: ?string,
  +service: VisitService,
  +medicalProvider: ?{|
    +id: string,
    +fullName: ?string,
  |},
  +skinProfileStatus: VisitSkinProfileStatus,
  +status: VisitStatus,
  +createdDatetime: any,
  +questionnaireAnswers: ?{|
    +answers: any
  |},
  +questionnaire: ?{|
    +questions: any
  |},
  +patient: ?{|
    +id: string
  |},
  +allFlags: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +$fragmentRefs: Flag_flag$ref
      |}
    |}>
  |},
  +$refType: VisitQuestionnaireAnswers_visit$ref,
|};
export type VisitQuestionnaireAnswers_visit$data = VisitQuestionnaireAnswers_visit;
export type VisitQuestionnaireAnswers_visit$key = {
  +$data?: VisitQuestionnaireAnswers_visit$data,
  +$fragmentRefs: VisitQuestionnaireAnswers_visit$ref,
};
*/


const node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "VisitQuestionnaireAnswers_visit",
  "type": "VisitType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    (v0/*: any*/),
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
        (v0/*: any*/),
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "fullName",
          "args": null,
          "storageKey": null
        }
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
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "createdDatetime",
      "args": null,
      "storageKey": null
    },
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
        }
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
        }
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
        (v0/*: any*/)
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
                  "kind": "FragmentSpread",
                  "name": "Flag_flag",
                  "args": null
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
})();
// prettier-ignore
(node/*: any*/).hash = '37ac15ab5b302c1846f2af87660554b1';
module.exports = node;
