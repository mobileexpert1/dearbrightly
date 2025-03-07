/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
export type VisitService = "INITIAL_VISIT" | "REPEAT_VISIT" | "SHORT_REPEAT_VISIT_FEMALE" | "SHORT_REPEAT_VISIT_MALE" | "%future added value";
export type VisitStatus = "PENDING" | "PENDING_PRESCRIPTION" | "PROVIDER_AWAITING_USER_INPUT" | "PROVIDER_CANCELLED" | "PROVIDER_PENDING_ACTION" | "PROVIDER_RX_DENIED" | "PROVIDER_RX_SUBMITTED" | "PROVIDER_SIGNED" | "SKIN_PROFILE_COMPLETE" | "SKIN_PROFILE_PENDING" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type SearchVisitResult_visit$ref: FragmentReference;
declare export opaque type SearchVisitResult_visit$fragmentType: SearchVisitResult_visit$ref;
export type SearchVisitResult_visit = {|
  +id: string,
  +visitId: ?string,
  +status: VisitStatus,
  +service: VisitService,
  +createdDatetime: any,
  +patient: ?{|
    +id: string,
    +fullName: ?string,
  |},
  +$refType: SearchVisitResult_visit$ref,
|};
export type SearchVisitResult_visit$data = SearchVisitResult_visit;
export type SearchVisitResult_visit$key = {
  +$data?: SearchVisitResult_visit$data,
  +$fragmentRefs: SearchVisitResult_visit$ref,
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
  "name": "SearchVisitResult_visit",
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
          "name": "fullName",
          "args": null,
          "storageKey": null
        }
      ]
    }
  ]
};
})();
// prettier-ignore
(node/*: any*/).hash = '86e36d3ade2436bfb4ab082ade3276f8';
module.exports = node;
