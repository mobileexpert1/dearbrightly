/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
export type FlagCategory = "MEDICAL_ADMIN_ATTENTION" | "MEDICAL_PROVIDER_ATTENTION" | "PATIENT_MESSAGE" | "PATIENT_PHOTOS_UPDATED" | "REQUIRE_MEDICAL_ADMIN_UPDATE" | "REQUIRE_PATIENT_PHOTOS_UPDATE" | "REQUIRE_PRESCRIPTION_UPDATE" | "%future added value";
export type ShippingDetailsState = "AA" | "AE" | "AK" | "AL" | "AP" | "AR" | "AS" | "AZ" | "CA" | "CO" | "CT" | "DC" | "DE" | "FL" | "GA" | "GU" | "HI" | "IA" | "ID" | "IL" | "IN" | "KS" | "KY" | "LA" | "MA" | "MD" | "ME" | "MI" | "MN" | "MO" | "MP" | "MS" | "MT" | "NC" | "ND" | "NE" | "NH" | "NJ" | "NM" | "NV" | "NY" | "OH" | "OK" | "OR" | "PA" | "PR" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VA" | "VI" | "VT" | "WA" | "WI" | "WV" | "WY" | "%future added value";
export type VisitService = "INITIAL_VISIT" | "REPEAT_VISIT" | "SHORT_REPEAT_VISIT_FEMALE" | "SHORT_REPEAT_VISIT_MALE" | "%future added value";
export type VisitStatus = "PENDING" | "PENDING_PRESCRIPTION" | "PROVIDER_AWAITING_USER_INPUT" | "PROVIDER_CANCELLED" | "PROVIDER_PENDING_ACTION" | "PROVIDER_RX_DENIED" | "PROVIDER_RX_SUBMITTED" | "PROVIDER_SIGNED" | "SKIN_PROFILE_COMPLETE" | "SKIN_PROFILE_PENDING" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type VisitRow_visit$ref: FragmentReference;
declare export opaque type VisitRow_visit$fragmentType: VisitRow_visit$ref;
export type VisitRow_visit = {|
  +id: string,
  +visitId: ?string,
  +status: VisitStatus,
  +service: VisitService,
  +createdDatetime: any,
  +patient: ?{|
    +id: string,
    +userId: ?string,
    +fullName: ?string,
    +shippingDetails: ?{|
      +state: ?ShippingDetailsState
    |},
  |},
  +medicalProvider: ?{|
    +fullName: ?string
  |},
  +allFlags: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +category: FlagCategory
      |}
    |}>
  |},
  +$refType: VisitRow_visit$ref,
|};
export type VisitRow_visit$data = VisitRow_visit;
export type VisitRow_visit$key = {
  +$data?: VisitRow_visit$data,
  +$fragmentRefs: VisitRow_visit$ref,
};
*/


const node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "fullName",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "VisitRow_visit",
  "type": "VisitType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    (v0/*: any*/),
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
      "name": "status",
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
      "kind": "ScalarField",
      "alias": null,
      "name": "createdDatetime",
      "args": null,
      "storageKey": null
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
        (v0/*: any*/),
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "userId",
          "args": null,
          "storageKey": null
        },
        (v1/*: any*/),
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
              "name": "state",
              "args": null,
              "storageKey": null
            }
          ]
        }
      ]
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
        (v1/*: any*/)
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
                  "name": "category",
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
};
})();
// prettier-ignore
(node/*: any*/).hash = 'bc17e482fe27de7576491225923ff7ff';
module.exports = node;
