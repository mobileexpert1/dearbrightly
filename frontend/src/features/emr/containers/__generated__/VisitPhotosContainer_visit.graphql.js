/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
export type PhotoPhotoType = "FRONT_OF_FACE" | "LEFT_SIDE_OF_FACE" | "PHOTO_ID" | "RIGHT_SIDE_OF_FACE" | "%future added value";
export type VisitSkinProfileStatus = "COMPLETE" | "INCOMPLETE_USER_RESPONSE" | "NOT_STARTED" | "NO_CHANGES_NO_USER_RESPONSE" | "NO_CHANGES_USER_SPECIFIED" | "PENDING_PHOTOS" | "PENDING_QUESTIONNAIRE" | "%future added value";
import type { FragmentReference } from "relay-runtime";
declare export opaque type VisitPhotosContainer_visit$ref: FragmentReference;
declare export opaque type VisitPhotosContainer_visit$fragmentType: VisitPhotosContainer_visit$ref;
export type VisitPhotosContainer_visit = {|
  +id: string,
  +skinProfileStatus: VisitSkinProfileStatus,
  +visitPhotos: ?{|
    +edges: $ReadOnlyArray<?{|
      +node: ?{|
        +photoId: ?string,
        +photoData: ?string,
        +photoFile: string,
        +photoType: PhotoPhotoType,
        +photoRejected: boolean,
      |}
    |}>
  |},
  +$refType: VisitPhotosContainer_visit$ref,
|};
export type VisitPhotosContainer_visit$data = VisitPhotosContainer_visit;
export type VisitPhotosContainer_visit$key = {
  +$data?: VisitPhotosContainer_visit$data,
  +$fragmentRefs: VisitPhotosContainer_visit$ref,
};
*/


const node/*: ReaderFragment*/ = {
  "kind": "Fragment",
  "name": "VisitPhotosContainer_visit",
  "type": "VisitType",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "skinProfileStatus",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "visitPhotos",
      "storageKey": null,
      "args": null,
      "concreteType": "PhotoConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "PhotoEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "PhotoType",
              "plural": false,
              "selections": [
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "photoId",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "photoData",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "photoFile",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "photoType",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "photoRejected",
                  "args": null,
                  "storageKey": null
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '3742bef51b7e9074b4e28b2cc3ae4ff4';
module.exports = node;
