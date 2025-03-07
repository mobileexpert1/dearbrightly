import React from 'react';
import styled from 'react-emotion';
import cameraIcon from 'src/assets/images/cameraIcon.svg';
import PhotoDropzone from 'src/features/checkout/components/PhotoDropzone';

import {
  BlueButton,
  UploadPhotoButton,
  UploadButtonInner,
  UploadButtonIcon,
  ButtonInnerWrapper,
} from 'src/features/dashboard/shared/styles';

const CameraButtonWrapper = styled.div`
  width: ${props => (props.isUploadOptional) && '50%'};
`;

const CaptureSection = styled('li')`
  text-align: center;
  margin-right: ${props => props.isUploadOptional && '10px'};

  .capture-icon {
    display: block;
    height: 55px;
    width: 55px;
    background: #e6e6e6;
    border-radius: 50%;
    margin: auto;

    &:hover {
      opacity: 0.8;
    }

    &.db-capture-icon {
      background-size: 25px 22px;
    }
  }
`;

const ButtonsWrapper = styled.div`
  width: 100%;
  height: 55px;
  display: flex;
`;

const DropzoneWrapper = styled.div`
  width: ${props => props.isMobile ? '100%' : '50%'};
`;

const SeparateLine = styled.div`
  width: 0;
  height: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  margin-top: 0.7rem;
`;

export const UploadPhotoButtons = ({
  isMobile,
  photoType,
  base64PhotoFile,
  toggleModal,
  nextPhotoStep,
  onDrop,
  clearFaceImageData,
  isUpdatePhotosOptional,
}) => (
  <React.Fragment>
    {!isMobile &&
      (base64PhotoFile ? (
          <ButtonsWrapper>
            <BlueButton
                height={'55px'}
                fontSize={'18px'}
                width={'182px'}
                onClick={e => toggleModal(e)}
                marginRight={'10px'}
                marginLeft={'5px'}
            >
              Retake
            </BlueButton>
          </ButtonsWrapper>
      ) : (
          <React.Fragment>
            <CameraButtonWrapper
              isUploadOptional={isUpdatePhotosOptional}
            >
              <CaptureSection isUploadOptional={isUpdatePhotosOptional}>
                <UploadPhotoButton
                  isMobile={isMobile}
                  href="javascript:void(0)"
                  onClick={e => toggleModal(e)}
                  isUploadOptional={isUpdatePhotosOptional}
                >
                  <ButtonInnerWrapper>
                    <UploadButtonIcon src={cameraIcon} />
                    <UploadButtonInner>Camera</UploadButtonInner>
                  </ButtonInnerWrapper>
                </UploadPhotoButton>
              </CaptureSection>
            </CameraButtonWrapper>
          </React.Fragment>
        ))}
    {base64PhotoFile ? (
        <ButtonsWrapper isMobile={isMobile}>
          {isMobile && (
              <BlueButton
                  onClick={clearFaceImageData}
                  fontSize={'18px'}
                  width={'182px'}
                  height={'55px'}
                  backBtn
                  marginRight={'10px'}
                  marginLeft={'5px'}
              >
                Retake
              </BlueButton>
          )}
          <BlueButton
              height={'55px'}
              onClick={nextPhotoStep}
              fontSize={'18px'}
              width={'182px'}
          >
            Next
          </BlueButton>
        </ButtonsWrapper>
    ) : (
        <DropzoneWrapper id={"dropzone-wrapper"} isMobile={isMobile}>
          <PhotoDropzone
            id={"photo-dropzone"}
            photoType={photoType.alt}
            field={photoType.field}
            files={base64PhotoFile}
            onDrop={onDrop}
            isPhotoTaken={base64PhotoFile}
            isUploadOptional={isUpdatePhotosOptional}
          />
        </DropzoneWrapper>
      )}
  </React.Fragment>
);