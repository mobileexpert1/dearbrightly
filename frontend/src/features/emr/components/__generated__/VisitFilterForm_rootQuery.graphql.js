/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type VisitFilterForm_rootQuery$ref: FragmentReference;
declare export opaque type VisitFilterForm_rootQuery$fragmentType: VisitFilterForm_rootQuery$ref;
export type VisitFilterForm_rootQuery = {|
  +allVisitStatusChoices: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +value: ?string
      |}
    |}>
  |},
  +allServiceChoices: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +value: ?string
      |}
    |}>
  |},
  +$refType: VisitFilterForm_rootQuery$ref,
|};
export type VisitFilterForm_rootQuery$data = VisitFilterForm_rootQuery;
export type VisitFilterForm_rootQuery$key = {
  +$data?: VisitFilterForm_rootQuery$data,
  +$fragmentRefs: VisitFilterForm_rootQuery$ref,
};
*/


const node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "value",
    "args": null,
    "storageKey": null
  }
];
return {
  "kind": "Fragment",
  "name": "VisitFilterForm_rootQuery",
  "type": "Query",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "allVisitStatusChoices",
      "storageKey": null,
      "args": null,
      "concreteType": "VisitStatusConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "VisitStatusEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "VisitStatusChoiceType",
              "plural": false,
              "selections": (v0/*: any*/)
            }
          ]
        }
      ]
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "allServiceChoices",
      "storageKey": null,
      "args": null,
      "concreteType": "ServiceChoiceConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "ServiceChoiceEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "ServiceChoiceType",
              "plural": false,
              "selections": (v0/*: any*/)
            }
          ]
        }
      ]
    }
  ]
};
})();
// prettier-ignore
(node/*: any*/).hash = '904b0ee222bb0b707d120e53a3aa0776';
module.exports = node;
