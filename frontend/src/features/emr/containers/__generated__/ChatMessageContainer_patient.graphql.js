/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type ChatMessageComposer_patient$ref = any;
type ChatMessage_message$ref = any;
type ChatMessage_patient$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ChatMessageContainer_patient$ref: FragmentReference;
declare export opaque type ChatMessageContainer_patient$fragmentType: ChatMessageContainer_patient$ref;
export type ChatMessageContainer_patient = {|
  +id: string,
  +allChatMessages: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: ChatMessage_message$ref,
      |}
    |}>
  |},
  +$fragmentRefs: ChatMessageComposer_patient$ref & ChatMessage_patient$ref,
  +$refType: ChatMessageContainer_patient$ref,
|};
export type ChatMessageContainer_patient$data = ChatMessageContainer_patient;
export type ChatMessageContainer_patient$key = {
  +$data?: ChatMessageContainer_patient$data,
  +$fragmentRefs: ChatMessageContainer_patient$ref,
};
*/


const node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "ChatMessageContainer_patient",
  "type": "UserType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    (v0/*: any*/),
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "allChatMessages",
      "storageKey": null,
      "args": null,
      "concreteType": "ChatMessagesConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "ChatMessagesEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "ChatMessageType",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "kind": "FragmentSpread",
                  "name": "ChatMessage_message",
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
      "name": "ChatMessageComposer_patient",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "ChatMessage_patient",
      "args": null
    }
  ]
};
})();
// prettier-ignore
(node/*: any*/).hash = '92819afb8f397247fff86d952f92406a';
module.exports = node;
