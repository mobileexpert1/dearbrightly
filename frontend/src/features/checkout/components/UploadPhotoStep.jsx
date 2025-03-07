import React from 'react';
import styled from 'react-emotion';
import Webcam from 'react-webcam';
import {colors, breakpoints, fontSize, mobileFirstBreakpoints} from 'src/variables';
import { BlueButton } from 'src/features/dashboard/shared/styles';
import { UploadPhotoButtons } from './UploadPhotoButtons';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

import frontFaceIcon from 'src/assets/images/frontProfile.svg'
import leftFaceIcon from 'src/assets/images/leftProfile.svg'
import rightFaceIcon from 'src/assets/images/rightProfile.svg'
import photoIdIcon from 'src/assets/images/photoId.svg'

const Container = styled('div')`
  width: 100%;
  display: flex;
  padding: '5px';
  flex-direction: column;
  justify-content: space-evenly;
  ${breakpoints.xs} {
    padding: 0;
    height: 100vh;
    position: relative;
    justify-content: space-between;    
  }
`;

const ImageTextContainer = styled('div')`
  width: 100%;
  height: 70%;
  overflow-y: auto;  
  margin: 0 auto;
  ${mobileFirstBreakpoints.md} {
      width: 384px;
      height: 550px;
  }  
`;

const Subheading = styled('div')`
  text-align: center;
  line-height: 25px;
  color: ${colors.blumine};
  max-width: 250px;
  font-weight: 600;
  font-size: 20px;
  margin: 10px auto;
    
  @media (min-height: 676px) {   
    font-size: 24px;
    margin: 24px auto;
    line-height: 29px;
  }
`;

const IdPhotoText = styled.p`
  margin: 10px 35px 10px 35px;
  font-size: 12px;
  @media (min-height: 676px) {  
    margin: 30px; 
    font-size: 16px;
  }
`;

const SubheadingColor = styled.span`
  color: ${colors.mulberry};
`;

const ImagePreviewWrapper = styled('div')`
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-style: dashed;
  object-fit: scale-down;
  overflow: hidden;
  border-radius: 4px;
  margin: auto;
  align-items: center;
  text-align: center;
  
  width: 80%;
  height: 80%;
  margin: auto;
  width: 254px;
  height: 235px;
  @media (min-width: 360px) {   
      width: 325px;
      height: 300px;
  }
  ${mobileFirstBreakpoints.md} {
      width: 384px;
      height: 314px;
  }
  
  img {
    object-fit: scale-down;
    align-items: center;
    margin: auto;
    overflow: scroll;

    &.empty-img {
        margin-top: 20px;
        object-fit: scale-down;
        width: 80%;
        height: 80%;        
    }
  }
`;

const ActionsWrapper = styled('div')`
  display: flex;
  justify-content: space-evenly;
  padding: 0px;
  flex-direction: column;
  position: static;

  ${breakpoints.xs} {
    position: sticky;
    bottom: 0;
    width: 100%;
    left: 0;
  }
`;

const WebcamWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CaptureFooter = styled.div`
  display: flex;
  justify-content: center;  
  width: 100%;
  height: 55px;
`;

const UploadButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;  
  margin: ${props => props.isMobile && 'auto'};
  margin-top: ${props => props.extraMargin && '2rem'};
  padding: ${props => props.isOptional && '10px 0'};
  width: 100%;
  ${props => props.isOptional && `
    margin-left: -15px;
    ${breakpoints.sm} {
      margin-left: 0px !important;
    }
  `}
`;

const OptionalButton = styled.button`
  cursor: pointer;
  color: ${colors.darkModerateBlue};
  margin: auto;
  border: none;
  background: transparent;
  font-size: 14px;
  text-decoration: underline;
  &:hover {
    color: ${colors.screamingGray};
  }
`;

export const UploadPhotoStep = ({
  photoType,
  base64PhotoFile,
  isCameraViewOn,
  videoConstraints,
  toggleModal,
  nextPhotoStep,
  onDrop,
  setRef,
  capture,
  clearFaceImageData,
  isUpdatePhotosOptional,
  skipUploadPhotoStep,
  savedVisitPhoto,
  isUploadingPhoto,
  isYearlyVisit
}) => {

  const { isMobile } = useDeviceDetect();

  if (photoType) {
    let gtmQEventName = `upload_photo_view_${photoType.type.replace(/\s/g, '_').toLowerCase()}`;
    let gtmCheckoutEvents = (sessionStorage.getItem('gtmCheckoutEvents') !== null) ? JSON.parse(sessionStorage.getItem('gtmCheckoutEvents')) : [];    
    if (gtmCheckoutEvents.indexOf(gtmQEventName) == -1) {
      GTMUtils.trackCall('upload_photo_view', { 'photo_type': photoType.type.replace(/\s/g, '_').toLowerCase() });
      gtmCheckoutEvents.push(gtmQEventName);
      sessionStorage.setItem('gtmCheckoutEvents', JSON.stringify(gtmCheckoutEvents))
    }
  }

  const getUploadPhotoIcon = () => {
    const {type} =  photoType
    if (type === 'Front of face') {
      return frontFaceIcon
    } else if (type === 'Left side of face') {
      return leftFaceIcon
    } else if (type === 'Right side of face') {
      return rightFaceIcon
    } else if (type === 'Photo ID') {
      return photoIdIcon
    }
  }

  return (
    <Container id={"container"}>
      <ImageTextContainer id={"image-text-container"}>
        {/*camera view*/}
        {isCameraViewOn && (
            <WebcamWrapper>
              <Webcam
                  audio={false}
                  height={314}
                  ref={setRef}
                  screenshotFormat="image/jpeg"
                  width={384}
                  videoConstraints={videoConstraints}
              />
            </WebcamWrapper>
        )}
         {/* image preview or empty image placeholder w*/}
        {!isCameraViewOn && (
            <ImagePreviewWrapper id={"photo-preview-wrapper"}>
              <img id={"photo-icon-image"}
                   src={!isUploadingPhoto && savedVisitPhoto && !base64PhotoFile ? savedVisitPhoto : (
                       base64PhotoFile && base64PhotoFile.constructor === Array && base64PhotoFile[0]
                           ? base64PhotoFile[0].preview
                           : base64PhotoFile && base64PhotoFile.constructor !== Array
                           ? base64PhotoFile
                           : getUploadPhotoIcon()
                   )}
                   className={
                     base64PhotoFile && base64PhotoFile.constructor === Array
                         ? ''
                         : base64PhotoFile && base64PhotoFile.constructor !== Array
                         ? ''
                         : (savedVisitPhoto && !isUploadingPhoto) ? '' : 'empty-img'
                   }
                   alt={photoType.alt}
              />
            </ImagePreviewWrapper>
        )}
        {base64PhotoFile && (
            <Subheading>{photoType.confirmationText}</Subheading>
        )}
        {!base64PhotoFile && photoType.alt !== 'id' && (
            <Subheading id={"subheading"}>
              Upload a photo <br /> of the <SubheadingColor>{photoType.text}</SubheadingColor>
            </Subheading>
        )}
        {!base64PhotoFile && photoType.alt == 'id' && (
            <div>
              <Subheading id={"subheading-id"}>
                And lastly, we'll need an <SubheadingColor>ID with your photo</SubheadingColor>
              </Subheading>
              <IdPhotoText id={"id-photo-text"}>{photoType.text}</IdPhotoText>
            </div>
        )}
      </ImageTextContainer>

      <ActionsWrapper id={"actions-wrapper"}>
        <UploadButtonsWrapper id={"upload-buttons-wrapper"} isMobile={isMobile}>
          {isCameraViewOn ? (
            <CaptureFooter id={"capture-footer"}>
              <BlueButton
                height={'55px'}
                fontSize={fontSize.medium}
                width={'182px'}
                onClick={() => toggleModal()}
              >
                Cancel
              </BlueButton>
              <BlueButton
                height={'55px'}
                fontSize={fontSize.medium}
                width={'182px'}
                onClick={capture}
                marginLeft={'10px'}
              >
                Take
              </BlueButton>
            </CaptureFooter>
          ) : (
              <UploadPhotoButtons
                id={"upload-photo-buttons"}
                isMobile={isMobile}
                photoType={photoType}
                base64PhotoFile={base64PhotoFile}
                toggleModal={toggleModal}
                nextPhotoStep={nextPhotoStep}
                onDrop={onDrop}
                clearFaceImageData={clearFaceImageData}
                isUpdatePhotosOptional={isUpdatePhotosOptional}
              />
            )}
        </UploadButtonsWrapper>
        {isUpdatePhotosOptional &&
          !isCameraViewOn &&
          !base64PhotoFile && (
            <UploadButtonsWrapper isOptional>
              <OptionalButton onClick={skipUploadPhotoStep}>Skip & Continue</OptionalButton>
            </UploadButtonsWrapper>
          )}
        </ActionsWrapper>
    </Container>
  );
};