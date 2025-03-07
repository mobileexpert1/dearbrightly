import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from "react-emotion";
import UpdatePhotoMutation from 'src/features/emr/mutations/UpdatePhotoMutation';
import { isVisitSkinProfileComplete } from 'src/features/dashboard/helpers/userStatuses';

const PHOTO_TYPES = {
  "RIGHT_SIDE_OF_FACE": "Right Face",
  "LEFT_SIDE_OF_FACE": "Left Face",
  "FRONT_OF_FACE": "Front Face",
  "PHOTO_ID": "Photo ID",
}

const Wrapper = styled('div')`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  margin: 0;
`;

const ImagePreviewWrapper = styled('div')`
  border: solid 1px #c8c8c8;
  padding: 5px 10px 5px 10px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  img {
   height: 100px;
   width: 100px;
  }
  height: 160px;
`;

const ImgPreviewHeader = styled('div')`
  margin-top: 5px;
`;

const ImagePreviewImg= styled('img')`
  width:100%;
  height:100%;
  object-fit: cover;
  overflow: hidden;
`;

const PhotoTitle = styled('div')`
  margin-top: 15px;
`;

const PhotosLabel = styled('div')`
  font-size: 14px;
  float: left;
`;

const RetakePhotoButton = styled.button`
  float: right;
  border: none;
  padding: 0;
  font-size: 14px;
  background: #ffffff;
  color: #ff0000;
  &:focus {
    box-shadow: none;
    outline: 0;
  }
  &:hover {
    background-color: #fff;
    color: #dfdfdf;
    cursor: pointer;
  }
`;

const RetakePhotoButtonHoverTextContainer = styled.span`
  background-color: #E0E0E0;
  position: absolute;
  display: none;
  overflow: hidden;
  color: #000;
  padding: 5px;
  border-radius: 0.25rem;
  font-family: sans-serif;
  font-size: 9px;
  ${RetakePhotoButton}:hover & {
    display: flex;
  }
}
`

const UndoRetakePhotoButton = styled.button`
  float: right;
  border: none;
  font-size: 14px;
  background: #ffffff;
  color: #007BFF;
  &:focus {
    box-shadow: none;
    outline: 0;
  }
  &:hover {
    background-color: #fff;
    color: #dfdfdf;
    cursor: pointer;
}
`;

const UndoRetakePhotoButtonHoverTextContainer = styled.span`
  background-color: #cfcfcf;
  position: absolute;
  display: none;
  overflow: hidden;
  color: #000;
  padding: 5px;
  border-radius: 0.25rem;
  font-family: sans-serif;
  font-size: 9px;
  ${UndoRetakePhotoButton}:hover & {
    display: flex;
  }
}
`

const RetakePhotoLabel = styled('div')`
  font-size: 12px;
  color: #ff0000;
  text-align: center;
  margin-top: 5px;
`;

class VisitPhotosContainer extends React.Component {

  togglePhotoModalView = (imgSrc, imgTitle) => {
    this.props.togglePhotoModalView(imgSrc, imgTitle);
  }

  _updatePhotoRetake = (id, retake) => {

    // Add confirmation modal for requiring user photo retake to avoid accidentally hitting the button
    var confirmed = false;
    if (retake) {
      confirmed = window.confirm("Are you sure you want to have the user retake this photo?");
    }

    if (confirmed || !retake) {
      UpdatePhotoMutation(
        id,
        retake,
        (resp) => {
          this.setState({body: ''})
          if (this.props.onSuccess) {
            this.props.onSuccess()
          }
        },
        (err) => {
          this.setState({error: err})
        }
      )
    }

  }


  render() {
    const { visitPhotos } = this.props.visit;
    const visitSkinProfileComplete = isVisitSkinProfileComplete(this.props.visit);

    if (!this.props.display) {
      return <span></span>
    }

    return (
      <div>
        <Wrapper style={{width: "100%"}}>
          {visitPhotos.edges.map((p, index) => {
            const photoType = p.node.photoType
            return (
              <ImagePreviewWrapper key={p.node.photoFile}>
                <ImgPreviewHeader>
                  <PhotosLabel>{PHOTO_TYPES[photoType]}</PhotosLabel>
                  {!p.node.photoRejected && visitSkinProfileComplete && (
                    <RetakePhotoButton
                      id={"RetakePhotoButton"}
                      onClick={() => this._updatePhotoRetake(p.node.photoId, true) }>
                      <i className="fa fa-window-close" aria-hidden="true"></i>
                      <RetakePhotoButtonHoverTextContainer
                        id={"RetakePhotoButtonHoverTextContainer"}>
                        Reject user photo
                      </RetakePhotoButtonHoverTextContainer>
                    </RetakePhotoButton>
                  )}
                  {p.node.photoRejected && (
                    <UndoRetakePhotoButton id={"UndoRetakePhotoButton"} onClick={() => this._updatePhotoRetake(p.node.photoId, false)}>
                      <i className="fa fa-undo" aria-hidden="true"></i>
                      <UndoRetakePhotoButtonHoverTextContainer
                        id={"UndoRetakePhotoButtonHoverTextContainer"}>
                        Undo photo reject
                      </UndoRetakePhotoButtonHoverTextContainer>
                    </UndoRetakePhotoButton>
                  )}
                </ImgPreviewHeader>

                <ImagePreviewImg id={p.node.photoType}
                                 onClick={() => this.props.togglePhotoModalView(visitPhotos.edges, index)}
                                 src={p.node.photoFile} />

                {p.node.photoRejected && (
                  <RetakePhotoLabel>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i> retake requested
                  </RetakePhotoLabel>
                )}
              </ImagePreviewWrapper>
            )
          })}
        </Wrapper>
      </div>
    );
  }
}

export default createFragmentContainer(
  VisitPhotosContainer,
  {
    visit: graphql`
      fragment VisitPhotosContainer_visit on VisitType {
        id
        skinProfileStatus
        visitPhotos {
          edges {
            node {
              photoId
              photoData
              photoFile
              photoType
              photoRejected
            }
          }
        }
      }`
  }
)
