import React, { Component } from 'react';
import styled, { css } from 'react-emotion';
import Webcam from 'react-webcam';
import { Alert, Container, ModalBody, ModalFooter } from 'reactstrap';
import connect from 'react-redux/lib/connect/connect';

import PhotoDropzone from 'src/features/checkout/components/PhotoDropzone';
import { sendQuestionnairePhotoRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {
  isUploadingPhoto,
  isUploadPhotoSuccess,
  getPhotoErrorMessage,
  getUploadingPhotoType,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { getPendingVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';

import { scrollToTop } from 'src/common/helpers/scrollToTop';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import CameraIcon from 'src/assets/images/camera.svg';
import { colors, fontFamily } from 'src/variables';
import {
  UploadPhotoButton,
  UploadButtonInner,
  UploadButtonIcon,
  ButtonInnerWrapper,
  BlueButton,
} from 'src/features/dashboard/shared/styles';
import cameraIcon from 'src/assets/images/cameraIcon.svg';
import cameraBlueIcon from 'src/assets/images/cameraBlueIcon.svg';
import {CustomSpinner} from "src/common/components/CustomSpinner";
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');

const AlertContainer = styled('div')`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 40px;

  .alert {
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }
`;

const UploadBlock = styled('div')`
  background: ${colors.clear};
  margin: 0 auto;
  width: 300px;
  height: 350px;
  padding: 0.7rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Subheading = styled('div')`
  font-family: ${fontFamily.baseFont};
  font-size: 16px;
  line-height: 28px;
  color: #040201;
  margin: 15px 0 15px;
  text-align: center;
`;

const ImagePreviewWrapper = styled('div')`
  text-align: center;
  margin-bottom: ${props => (props.removeMargin ? 0 : '2rem')};

  img {
    width: 250px;
    height: 200px;
    overflow: hidden;
    object-fit: contain;
    &.empty-img {
      margin-top: 5rem;
      margin-bottom: 4rem;
      width: 60px;
      height: 53px;
    }
  }
`;

const ActionsWrapper = styled('div')`
  display: flex;
  justify-content: space-evenly;
  padding: 0px 15px;
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

const WebcamModalWrapper = styled('div')`
  background: #fff;
  position: absolute;
  width: 19rem;
  height: 100%;
  left: 15px;
  top: 0;
  .capture-footer {
    justify-content: space-between;
    position: absolute;
    bottom: 0;
    width: inherit;
  }
`;

const Content = styled('div')`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  background: #fff;

  &.photo-preview-height {
    min-height: 0;
    min-width: 0;
  }
`;

const PhotoHeader = styled.p`
  font-size: 20px;
  text-align: left;
  padding-top: 0.7rem;
  padding-left: 0.7rem;
`;

const PhotoHeaderWrapper = styled.div`
  border-bottom: 1px solid ${colors.darkModerateBlueOpacity};
`;

const SubmitButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RetakeWrapper = styled.div`
  position: absolute;
  width: 278px;
  height: 200px;
  background-color: white;
  opacity: ${props => !props.isUploadingPhoto && '0.6'};
  display: flex;
  justify-content: center;
`;

const RetakeText = styled.p`
  height: fit-content;
  margin: auto;
  font-size: 22px;
`;

const RetakePhotoLabel = styled('div')`
  font-size: 16px;
  color: #ff0000;
  text-align: left;
  margin-left: 5px;
`;

class PhotoEditComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      modalName: null,

      // ---- For Dropzone Image Previews ----
      // Webcam image captures are in Base64String.
      // File drag and drops are in File format.
      imageCaptureBase64: null,
      showError: false,
      errorMessage: '',
      isMobile: isMobileDevice(),
      isImageCaptured: false,
    };
  }

  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const { modalName } = this.state;
    const imageCapture = this.webcam.getScreenshot();

    this.setState(
      {
        imageCaptureBase64: imageCapture,
        isImageCaptured: true,
      },
      () => this.toggleModal(modalName),
    );

    this.submitPhoto();
  };

  toggleModal = (modalName, e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
      showError: false,
      modalName,
    }));
  };

  onDrop = value => {
    var file = value[0];
    const reader = new FileReader();
    reader.onload = event => {
      this.setState({
        imageCaptureBase64: event.target.result,
        isImageCaptured: true,
        showError: false,
      });
    };
    reader.readAsDataURL(file);
  };

  componentDidMount() {
    scrollToTop();
  }

  componentDidUpdate(prevProps) {
    const { isModalVisible, isUploadPhotoSuccess, toggleModal } = this.props;

    if (!prevProps.isUploadPhotoSuccess && isUploadPhotoSuccess) {

      if (isModalVisible) {
        toggleModal();
      }
      this.setState({
        isImageCaptured: false,
      });

      return;
    }
  }

  uploadPhoto = () => {
    const { photoType, visit, user, sendQuestionnairePhotoRequest, onSubmit } = this.props;
    const { imageCaptureBase64 } = this.state;

    if (!visit.uuid) {
      return this.setState({
        showError: true,
        errorMessage: 'Unable to upload photos at this time. Please log back in and try again.',
      });
    }

    if (imageCaptureBase64) {
      onSubmit();
      sendQuestionnairePhotoRequest({
        photo_type: photoType,
        photo_file: imageCaptureBase64,
        visitUuid: visit.uuid,
        patient: user.id,
      });
    }
  };

  submitPhoto = e => {
    if (e) {
      e.preventDefault();
    }

    GTMUtils.trackCall('upload-photos_continue_click');

    this.uploadPhoto();
  };

  cleanCapturedImage = () => {
    this.setState({ imageCaptureBase64: null, isImageCaptured: false });
  };

  render() {
    const {
      isMobile,
      isOpen,
      imageCaptureBase64,
      isImageCaptured,
    } = this.state;

    const {
      emptyPhotoSrc,
      isUploadingPhoto,
      photoType,
      description,
      photoHeader,
      isPhotoRejected,
      uploadingPhotoType,
      photoSrc,
    } = this.props;

    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: 'user',
    };

    const imgSrc =
      imageCaptureBase64 && imageCaptureBase64.preview
        ? imageCaptureBase64.preview
        : imageCaptureBase64
          ? imageCaptureBase64
          : photoSrc;

    const idPhotoType = 'Photo ID';

    return (
      <CustomSpinner spinning={isUploadingPhoto && uploadingPhotoType === photoType} blur={true}>
        <Container id={"container"}>
          <Content className="photo-preview-height">
            {/* {uploadPhotoErrorMessage && (
              <AlertContainer>
                <Alert color="danger"> {uploadPhotoErrorMessage} </Alert>
              </AlertContainer>
            )}
            {showError && (
              <AlertContainer>
                <Alert color="danger"> {errorMessage}</Alert>
              </AlertContainer>
            )} */}
            {photoHeader && (
              <PhotoHeaderWrapper>
                <PhotoHeader>{photoHeader}</PhotoHeader>
              </PhotoHeaderWrapper>
            )}
            <UploadBlock id={"upload-block"}>
              <ImagePreviewWrapper
                removeMargin={photoType === idPhotoType}
              >
                <img
                  className={!imageCaptureBase64 && !photoSrc && 'empty-img'}
                  src={imgSrc ? imgSrc : emptyPhotoSrc}
                  alt={photoType}
                />
                {isPhotoRejected &&
                  !this.state.imageCaptureBase64 && (
                    <RetakePhotoLabel>
                      <i className="fa fa-exclamation-circle" aria-hidden="true" /> retake requested
                    </RetakePhotoLabel>
                  )}
              </ImagePreviewWrapper>
              {photoType === idPhotoType && <Subheading>{description}</Subheading>}
              <ActionsWrapper id={"actions-wrapper"}>
                {!isMobile &&
                !isImageCaptured && (
                    <CaptureSection id={"capture-section"}>
                      <UploadPhotoButton
                          id={"upload-photo-button"}
                          isMobile={isMobile}
                          onClick={e => this.toggleModal('id', e)}
                          isPhotoEditView={true}
                      >
                        <ButtonInnerWrapper id={"button-inner-wrapper"}>
                          <UploadButtonIcon id={"upload-inner-icon"} src={cameraIcon} />
                          <UploadButtonInner id={"upload-inner-inner"}>Camera</UploadButtonInner>
                        </ButtonInnerWrapper>
                      </UploadPhotoButton>
                    </CaptureSection>
                )}
                {!isImageCaptured && (
                  <div>
                    <PhotoDropzone
                      id={"photo-dropzone"}
                      photoType={photoType}
                      field={photoType}
                      files={imageCaptureBase64}
                      onDrop={this.onDrop}
                      isPhotoEditView={true}
                    />
                  </div>
                )}
                {/*This is needed for opening the webcam/camera modal. PhotoDropzone is used for the file selection. */}
              </ActionsWrapper>

              {isImageCaptured && (
                <SubmitButtonsWrapper>
                  <UploadPhotoButton
                    isMobile={isMobile}
                    onClick={() => this.cleanCapturedImage()}
                    isPhotoEditView={true}
                  >
                    <ButtonInnerWrapper>
                      <UploadButtonInner>Cancel</UploadButtonInner>
                    </ButtonInnerWrapper>
                  </UploadPhotoButton>
                  <BlueButton
                    width={'130px'}
                    height={'55px'}
                    disabled={!imageCaptureBase64}
                    onClick={this.submitPhoto}
                  >
                    Submit
                  </BlueButton>
                </SubmitButtonsWrapper>
              )}
            </UploadBlock>
          </Content>
          {isOpen && (
            <WebcamModalWrapper>
              <ModalBody>
                <Webcam
                  audio={false}
                  height={250}
                  ref={this.setRef}
                  screenshotFormat="image/jpeg"
                  width={'100%'}
                  videoConstraints={videoConstraints}
                />
              </ModalBody>
              <ModalFooter className="capture-footer">
                <BlueButton
                  height={'55px'}
                  fontSize={'18px'} width={'130px'} onClick={this.toggleModal}>
                  Cancel
                </BlueButton>
                <BlueButton
                  height={'55px'}
                  fontSize={'18px'} width={'130px'} onClick={this.capture}>
                  Take
                </BlueButton>
              </ModalFooter>
            </WebcamModalWrapper>
          )}
        </Container>
      </CustomSpinner>
    );
  }
}

//TODO - Pass these states and actions down from HOC
export const PhotoEdit = connect(
  state => ({
    isUploadingPhoto: isUploadingPhoto(state),
    uploadingPhotoType: getUploadingPhotoType(state),
    isUploadPhotoSuccess: isUploadPhotoSuccess(state),
    uploadPhotoErrorMessage: getPhotoErrorMessage(state),
  }),
  {
    sendQuestionnairePhotoRequest,
    getPendingVisitRequest,
  },
)(PhotoEditComponent);
