/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type PatientPrescription_prescription$ref: FragmentReference;
declare export opaque type PatientPrescription_prescription$fragmentType: PatientPrescription_prescription$ref;
export type PatientPrescription_prescription = {|
  +prescription: {|
    +displayName: ?string,
    +daysSupply: number,
    +quantity: number,
    +dispenseUnit: ?string,
    +refills: number,
  |},
  +prescribedDatetime: any,
  +$refType: PatientPrescription_prescription$ref,
|};
export type PatientPrescription_prescription$data = PatientPrescription_prescription;
export type PatientPrescription_prescription$key = {
  +$data?: PatientPrescription_prescription$data,
  +$fragmentRefs: PatientPrescription_prescription$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "PatientPrescription_prescription",
  "type": "PatientPrescriptionType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
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
        }
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
};
// prettier-ignore
(node/*: any*/).hash = 'aeef7567649e19aa62e5b64b0df893e4';
module.exports = node;
