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
declare export opaque type MedicalNoteContainer_patient$ref: FragmentReference;
declare export opaque type MedicalNoteContainer_patient$fragmentType: MedicalNoteContainer_patient$ref;
export type MedicalNoteContainer_patient = {|
  +medicalNotes: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: MedicalNote_note$ref,
      |}
    |}>
  |},
  +$fragmentRefs: MedicalNoteComposer_patient$ref,
  +$refType: MedicalNoteContainer_patient$ref,
|};
export type MedicalNoteContainer_patient$data = MedicalNoteContainer_patient;
export type MedicalNoteContainer_patient$key = {
  +$data?: MedicalNoteContainer_patient$data,
  +$fragmentRefs: MedicalNoteContainer_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "MedicalNoteContainer_patient",
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
(node/*: any*/).hash = 'b8ff25c6c6a7fcaee9f151277ae35c1f';
module.exports = node;
