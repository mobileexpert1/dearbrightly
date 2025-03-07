/**
 * @flow
 * @relayHash de15de8ffe81d025574ec65f29d81cc3
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type PhotoPhotoType = "FRONT_OF_FACE" | "LEFT_SIDE_OF_FACE" | "PHOTO_ID" | "RIGHT_SIDE_OF_FACE" | "%future added value";
export type UpdatePhotoMutationInput = {|
  id: string,
  photoRejected?: ?boolean,
  clientMutationId?: ?string,
|};
export type UpdatePhotoMutationVariables = {|
  input: UpdatePhotoMutationInput
|};
export type UpdatePhotoMutationResponse = {|
  +updatePhoto: ?{|
    +photo: ?{|
      +photoData: ?string,
      +photoFile: string,
      +photoType: PhotoPhotoType,
      +photoRejected: boolean,
    |}
  |}
|};
export type UpdatePhotoMutation = {|
  variables: UpdatePhotoMutationVariables,
  response: UpdatePhotoMutationResponse,
|};
*/


/*
mutation UpdatePhotoMutation(
  $input: UpdatePhotoMutationInput!
) {
  updatePhoto(input: $input) {
    photo {
      photoData
      photoFile
      photoType
      photoRejected
      id
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "UpdatePhotoMutationInput!",
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
  "name": "photoData",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "photoFile",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "photoType",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "photoRejected",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "UpdatePhotoMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "updatePhoto",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePhotoMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "photo",
            "storageKey": null,
            "args": null,
            "concreteType": "PhotoType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "UpdatePhotoMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "updatePhoto",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePhotoMutationPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "photo",
            "storageKey": null,
            "args": null,
            "concreteType": "PhotoType",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "id",
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
    "name": "UpdatePhotoMutation",
    "id": null,
    "text": "mutation UpdatePhotoMutation(\n  $input: UpdatePhotoMutationInput!\n) {\n  updatePhoto(input: $input) {\n    photo {\n      photoData\n      photoFile\n      photoType\n      photoRejected\n      id\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'd8b4f2519074a660ac66ab208ac57422';
module.exports = node;
