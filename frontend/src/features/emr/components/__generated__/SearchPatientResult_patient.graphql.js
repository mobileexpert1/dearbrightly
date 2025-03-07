/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type SearchPatientResult_patient$ref: FragmentReference;
declare export opaque type SearchPatientResult_patient$fragmentType: SearchPatientResult_patient$ref;
export type SearchPatientResult_patient = {|
  +id: string,
  +userId: ?string,
  +firstName: ?string,
  +lastName: ?string,
  +email: string,
  +$refType: SearchPatientResult_patient$ref,
|};
export type SearchPatientResult_patient$data = SearchPatientResult_patient;
export type SearchPatientResult_patient$key = {
  +$data?: SearchPatientResult_patient$data,
  +$fragmentRefs: SearchPatientResult_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "SearchPatientResult_patient",
  "type": "UserType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "userId",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "firstName",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "lastName",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "email",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'a6779624e9bf968e1f2c985568350941';
module.exports = node;
