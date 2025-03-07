/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ChatMessage_patient$ref: FragmentReference;
declare export opaque type ChatMessage_patient$fragmentType: ChatMessage_patient$ref;
export type ChatMessage_patient = {|
  +uuid: any,
  +$refType: ChatMessage_patient$ref,
|};
export type ChatMessage_patient$data = ChatMessage_patient;
export type ChatMessage_patient$key = {
  +$data?: ChatMessage_patient$data,
  +$fragmentRefs: ChatMessage_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "ChatMessage_patient",
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
(node/*: any*/).hash = 'b4978dfa83d6ab021bc9b0cdaf4eb5aa';
module.exports = node;
