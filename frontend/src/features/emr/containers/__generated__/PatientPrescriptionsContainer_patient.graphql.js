/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type PatientPrescription_prescription$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type PatientPrescriptionsContainer_patient$ref: FragmentReference;
declare export opaque type PatientPrescriptionsContainer_patient$fragmentType: PatientPrescriptionsContainer_patient$ref;
export type PatientPrescriptionsContainer_patient = {|
  +allPrescriptions: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: PatientPrescription_prescription$ref,
      |}
    |}>
  |},
  +$refType: PatientPrescriptionsContainer_patient$ref,
|};
export type PatientPrescriptionsContainer_patient$data = PatientPrescriptionsContainer_patient;
export type PatientPrescriptionsContainer_patient$key = {
  +$data?: PatientPrescriptionsContainer_patient$data,
  +$fragmentRefs: PatientPrescriptionsContainer_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "PatientPrescriptionsContainer_patient",
  "type": "UserType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "allPrescriptions",
      "storageKey": null,
      "args": null,
      "concreteType": "PatientPrescriptionConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "PatientPrescriptionEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "PatientPrescriptionType",
              "plural": false,
              "selections": [
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "id",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "FragmentSpread",
                  "name": "PatientPrescription_prescription",
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
// prettier-ignore
(node/*: any*/).hash = '982a6c61833be6b16cd62f9f84e26df0';
module.exports = node;
