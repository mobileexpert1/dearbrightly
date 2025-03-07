/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type MedicalNoteComposer_patient$ref: FragmentReference;
declare export opaque type MedicalNoteComposer_patient$fragmentType: MedicalNoteComposer_patient$ref;
export type MedicalNoteComposer_patient = {|
  +uuid: any,
  +$refType: MedicalNoteComposer_patient$ref,
|};
export type MedicalNoteComposer_patient$data = MedicalNoteComposer_patient;
export type MedicalNoteComposer_patient$key = {
  +$data?: MedicalNoteComposer_patient$data,
  +$fragmentRefs: MedicalNoteComposer_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "MedicalNoteComposer_patient",
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
(node/*: any*/).hash = '8f073daf88e2c951996166ab7f64c220';
module.exports = node;
