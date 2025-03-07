/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type AddPatientPrescription_patient$ref: FragmentReference;
declare export opaque type AddPatientPrescription_patient$fragmentType: AddPatientPrescription_patient$ref;
export type AddPatientPrescription_patient = {|
  +uuid: any,
  +$refType: AddPatientPrescription_patient$ref,
|};
export type AddPatientPrescription_patient$data = AddPatientPrescription_patient;
export type AddPatientPrescription_patient$key = {
  +$data?: AddPatientPrescription_patient$data,
  +$fragmentRefs: AddPatientPrescription_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "AddPatientPrescription_patient",
  "type": "UserType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "uuid",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'd3e89436e961a43dd359b3e410ada8d6';
module.exports = node;
