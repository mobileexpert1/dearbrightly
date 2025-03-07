/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type SnippetEntry_snippet$ref: FragmentReference;
declare export opaque type SnippetEntry_snippet$fragmentType: SnippetEntry_snippet$ref;
export type SnippetEntry_snippet = {|
  +name: string,
  +body: string,
  +$refType: SnippetEntry_snippet$ref,
|};
export type SnippetEntry_snippet$data = SnippetEntry_snippet;
export type SnippetEntry_snippet$key = {
  +$data?: SnippetEntry_snippet$data,
  +$fragmentRefs: SnippetEntry_snippet$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "SnippetEntry_snippet",
  "type": "SnippetType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "name",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "body",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'afb93e076e8995c82a0fd430f3bb8d59';
module.exports = node;
