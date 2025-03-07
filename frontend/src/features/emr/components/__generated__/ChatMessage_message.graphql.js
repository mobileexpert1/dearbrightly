/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ChatMessage_message$ref: FragmentReference;
declare export opaque type ChatMessage_message$fragmentType: ChatMessage_message$ref;
export type ChatMessage_message = {|
  +readDatetime: ?any,
  +createdDatetime: any,
  +body: string,
  +sender: ?{|
    +uuid: any,
    +fullName: ?string,
    +profilePhotoFile: ?string,
  |},
  +receiver: ?{|
    +uuid: any,
    +fullName: ?string,
    +profilePhotoFile: ?string,
  |},
  +$refType: ChatMessage_message$ref,
|};
export type ChatMessage_message$data = ChatMessage_message;
export type ChatMessage_message$key = {
  +$data?: ChatMessage_message$data,
  +$fragmentRefs: ChatMessage_message$ref,
};
*/


const node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "uuid",
    "args": null,
    "storageKey": null
  },
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "fullName",
    "args": null,
    "storageKey": null
  },
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "profilePhotoFile",
    "args": null,
    "storageKey": null
  }
];
return {
  "kind": "Fragment",
  "name": "ChatMessage_message",
  "type": "ChatMessageType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "readDatetime",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "createdDatetime",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "body",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "sender",
      "storageKey": null,
      "args": null,
      "concreteType": "UserType",
      "plural": false,
      "selections": (v0/*: any*/)
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "receiver",
      "storageKey": null,
      "args": null,
      "concreteType": "UserType",
      "plural": false,
      "selections": (v0/*: any*/)
    }
  ]
};
})();
// prettier-ignore
(node/*: any*/).hash = '267a69f93aed767b2672139153eb81b6';
module.exports = node;
