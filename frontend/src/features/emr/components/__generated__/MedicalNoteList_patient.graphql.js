/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type MedicalNoteComposer_patient$ref = any;
type MedicalNote_note$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type MedicalNoteList_patient$ref: FragmentReference;
declare export opaque type MedicalNoteList_patient$fragmentType: MedicalNoteList_patient$ref;
export type MedicalNoteList_patient = {|
  +medicalNotes: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: MedicalNote_note$ref,
      |}
    |}>
  |},
  +$fragmentRefs: MedicalNoteComposer_patient$ref,
  +$refType: MedicalNoteList_patient$ref,
|};
export type MedicalNoteList_patient$data = MedicalNoteList_patient;
export type MedicalNoteList_patient$key = {
  +$data?: MedicalNoteList_patient$data,
  +$fragmentRefs: MedicalNoteList_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "MedicalNoteList_patient",
  "type": "UserType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "medicalNotes",
      "storageKey": null,
      "args": null,
      "concreteType": "NoteTypeConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "NoteTypeEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "NoteType",
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
                  "name": "MedicalNote_note",
                  "args": null
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "kind": "FragmentSpread",
      "name": "MedicalNoteComposer_patient",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '77acca19f8aff117829acf54a7581c5e';
module.exports = node;
