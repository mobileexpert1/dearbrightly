import React from 'react';
import Dropzone from 'react-dropzone';
import styled, { css } from 'react-emotion';

import uploadImage from 'src/assets/images/emptied-photo.png';
import GalleryIcon from 'src/assets/images/gallery.svg';
import CameraIcon from 'src/assets/images/camera.svg';
import uploadIcon from 'src/assets/images/uploadIcon.svg';
import cameraIcon from 'src/assets/images/cameraIcon.svg';
import uploadBlueIcon from 'src/assets/images/uploadBlueIcon.svg';
import cameraBlueIcon from 'src/assets/images/cameraBlueIcon.svg';

import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import {
  UploadPhotoButton,
  UploadButtonInner,
  UploadButtonIcon,
  ButtonInnerWrapper,
} from 'src/features/dashboard/shared/styles';
import { breakpoints } from 'src/variables';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';

const ActiveDropzone = css`
  img {
    transform: scale(1.1, 1.1);
  }
`;
const UploadButton = styled('div')`
  margin-left: 10px !important;
  ${breakpoints.sm} {
    margin-left: inherit;
  }
  text-align: center;
  .db-upload-icon {
    display: block;
    height: 55px;
    width: 55px;
    background: #e6e6e6;
    border-radius: 50%;
    margin: auto;
    margin-bottom: 15px;

    &:hover {
      opacity: 0.8;
    }

    &.upload-icon {
      background: #e6e6e6 url(${GalleryIcon}) center no-repeat;
      background-size: 19px 19px;
    }
  }
`;

const CaptureSection = styled('li')`
  text-align: center;
  .capture-icon {
    display: block;
    height: 55px;
    width: 55px;
    background: #e6e6e6;
    border-radius: 50%;
    margin: auto;
    margin-bottom: 15px;

    &:hover {
      opacity: 0.8;
    }

    &.db-capture-icon {
      background: #e6e6e6 url(${CameraIcon}) center no-repeat;
      background-size: 25px 22px;
    }
  }
`;

const StyledDropZone = styled(Dropzone)`
  input {
    min-height: 0;
  }
`;

const PhotoDropzone = ({ files, onDrop, field, isUploadOptional, isPhotoEditView, toggleModal }) => {
  const mediaType = typeof files === 'string' ? 'screenshot' : 'dragged';
  const file = mediaType === 'dragged' ? files && files[0] && files[0].preview : files;
  const imageSrc = file ? file : uploadImage;

  // TODO - Fix capture button on mobile
  // The capture button does not work on mobile (permission for camera access is not being presented).
  // A temporary workaround is to use the Upload button, which has options for upload and capture.
  const { isMobile } = useDeviceDetect();

  return (
    <StyledDropZone
      id={"styled-drop-zone"}
      onDrop={e => onDrop(e, field)}
      multiple={false}
      className="dropzone"
      accept={'image/jpeg, image/png'}
      activeClassName={ActiveDropzone}
      isuploadoptional={isUploadOptional && isUploadOptional.toString()}
    >
      {isMobile && (
        <CaptureSection>
          <UploadPhotoButton isMobile={isMobile} href="#">
            <ButtonInnerWrapper>
              <UploadButtonIcon src={cameraIcon} />
              <UploadButtonInner>Camera</UploadButtonInner>
            </ButtonInnerWrapper>
          </UploadPhotoButton>
        </CaptureSection>
      )}
      {!isMobile && (
        <UploadButton id={"upload-button"}>
          <UploadPhotoButton
            isMobile={isMobile}
            href="#"
            isUploadOptional={isUploadOptional}
            isPhotoEditView={isPhotoEditView}
          >
            <ButtonInnerWrapper id={"button-inner-wrapper"}>
              <UploadButtonIcon
                src={
                  uploadIcon
                }
              />
              <UploadButtonInner id={"upload-button-inner"}>Upload</UploadButtonInner>
            </ButtonInnerWrapper>
          </UploadPhotoButton>
        </UploadButton>
      )}
    </StyledDropZone>
  );
};

export default PhotoDropzone;
