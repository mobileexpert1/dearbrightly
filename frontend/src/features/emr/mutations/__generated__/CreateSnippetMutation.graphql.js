/**
 * @flow
 * @relayHash 108fcac5f155945d103ab1893b185d30
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SnippetEntry_snippet$ref = any;
export type CreateSnippetMutationInput = {|
  name: string,
  body: string,
  clientMutationId?: ?string,
|};
export type CreateSnippetMutationVariables = {|
  input: CreateSnippetMutationInput
|};
export type CreateSnippetMutationResponse = {|
  +createSnippet: ?{|
    +snippet: ?{|
      +id: string,
      +$fragmentRefs: SnippetEntry_snippet$ref,
    |}
  |}
|};
export type CreateSnippetMutation = {|
  variables: CreateSnippetMutationVariables,
  response: CreateSnippetMutationResponse,
|};
*/


/*
mutation CreateSnippetMutation(
  $input: CreateSnippetMutationInput!
) {
  createSnippet(input: $input) {
    snippet {
      id
      ...SnippetEntry_snippet
    }
  }
}

fragment SnippetEntry_snippet on SnippetType {
  name
  body
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "CreateSnippetMutationInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "CreateSnippetMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createSnippet",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateSnippetMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "snippet",
            "storageKey": null,
            "args": null,
            "concreteType": "SnippetType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "kind": "FragmentSpread",
                "name": "SnippetEntry_snippet",
                "args": null
              }
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "CreateSnippetMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "createSnippet",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateSnippetMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "snippet",
            "storageKey": null,
            "args": null,
            "concreteType": "SnippetType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "mutation",
    "name": "CreateSnippetMutation",
    "id": null,
    "text": "mutation CreateSnippetMutation(\n  $input: CreateSnippetMutationInput!\n) {\n  createSnippet(input: $input) {\n    snippet {\n      id\n      ...SnippetEntry_snippet\n    }\n  }\n}\n\nfragment SnippetEntry_snippet on SnippetType {\n  name\n  body\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '16fe6b0abfc37f465ca95c97cac9eacb';
module.exports = node;
