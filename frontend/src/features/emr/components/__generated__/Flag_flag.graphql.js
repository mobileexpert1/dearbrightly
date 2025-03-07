/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
export type FlagCategory = "MEDICAL_ADMIN_ATTENTION" | "MEDICAL_PROVIDER_ATTENTION" | "PATIENT_MESSAGE" | "PATIENT_PHOTOS_UPDATED" | "REQUIRE_MEDICAL_ADMIN_UPDATE" | "REQUIRE_PATIENT_PHOTOS_UPDATE" | "REQUIRE_PRESCRIPTION_UPDATE" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type Flag_flag$ref: FragmentReference;
declare export opaque type Flag_flag$fragmentType: Flag_flag$ref;
export type Flag_flag = {|
  +flagId: ?string,
  +creator: {|
    +fullName: ?string
  |},
  +body: string,
  +createdDatetime: any,
  +category: FlagCategory,
  +$refType: Flag_flag$ref,
|};
export type Flag_flag$data = Flag_flag;
export type Flag_flag$key = {
  +$data?: Flag_flag$data,
  +$fragmentRefs: Flag_flag$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "Flag_flag",
  "type": "FlagType",
  "metadata": null,
  "argumentDefinitions": [],
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
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "category",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'a9ca4e184e90321c092f08be5743a82b';
module.exports = node;
