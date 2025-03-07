/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ChatMessageComposer_patient$ref: FragmentReference;
declare export opaque type ChatMessageComposer_patient$fragmentType: ChatMessageComposer_patient$ref;
export type ChatMessageComposer_patient = {|
  +uuid: any,
  +$refType: ChatMessageComposer_patient$ref,
|};
export type ChatMessageComposer_patient$data = ChatMessageComposer_patient;
export type ChatMessageComposer_patient$key = {
  +$data?: ChatMessageComposer_patient$data,
  +$fragmentRefs: ChatMessageComposer_patient$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "ChatMessageComposer_patient",
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
(node/*: any*/).hash = 'b0321010dd51df40eca00c2db85efe8e';
module.exports = node;
