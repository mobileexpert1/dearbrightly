/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type MedicalNote_note$ref: FragmentReference;
declare export opaque type MedicalNote_note$fragmentType: MedicalNote_note$ref;
export type MedicalNote_note = {|
  +creator: {|
    +fullName: ?string
  |},
  +body: ?string,
  +createdDatetime: any,
  +$refType: MedicalNote_note$ref,
|};
export type MedicalNote_note$data = MedicalNote_note;
export type MedicalNote_note$key = {
  +$data?: MedicalNote_note$data,
  +$fragmentRefs: MedicalNote_note$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "MedicalNote_note",
  "type": "NoteType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
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
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'bd3459026cec057b564525bdf7a2e5a0';
module.exports = node;
