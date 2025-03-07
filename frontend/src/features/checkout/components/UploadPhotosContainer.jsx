import React, { Component } from 'react';
import styled from 'react-emotion';
import { Alert } from 'reactstrap';
import connect from 'react-redux/lib/connect/connect';
import {
  isUploadingPhoto,
  isUploadPhotoSuccess,
  getPhotoErrorMessage,
  getMedicalVisitErrorMessage,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { sendQuestionnairePhotoRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { scrollToTop } from 'src/common/helpers/scrollToTop';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import { colors, breakpoints, fontSize } from 'src/variables';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { UploadPhotoStep } from './UploadPhotoStep';
import { TipsComponent } from './TipsComponent';
import { getVisitPhotoFile } from 'src/common/constants/medicalVisits';
import { GTMUtils } from 'src/common/helpers/gtmUtils';


const Wrapper = styled('div')`
  background: ${colors.white};
  height: 100%;
`;

const AlertContainer = styled('div')`
  display: flex;
  justify-content: center;
  position: fixed;
  left: 0;
  right: 0;
  margin: 30px auto 40px;
  width: 60%;

  .alert {
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }
`;

const UploadBlock = styled('div')`
  flex-basis: 100%;
  flex: 1;
  background: ${colors.white};
  width: fit-content;
  max-width:419px;
  padding: '11px';
  border-radius: 4px;
  height: fit-content;
  align-items: center; 
  margin-left: '375px'};
  
  ${breakpoints.md} {
    margin-left: 0;
  }  
  ${breakpoints.xs} {
    padding: 0;
    height: 100vh;
    position: relative;
    padding-top: '4rem';
  }
`;

const ImageList = styled('div')`
  margin: 0;
  display: flex;
  ${breakpoints.xs} {
    height: 100%;
    position: relative;
  }
`;

const Content = styled('div')`
  padding: 0;
  display: flex;
  align-items: top;
  justify-content: center;
  overflow-y: scroll;
  
  &.photo-container-height {
    height: calc(100% - 75px);
  }
  margin-top: ${props => props.isUpdatePhotosOptional ? 0 : '24px'};
  margin-left: ${props => props.showTips && !props.isMobile ? '229px' : 'auto'}; 
  ${breakpoints.xs} {
    height: calc(100vh - 4rem);
    padding: 0;
    position: relative;
  }
`;


const IndicatorContent = styled.div`
  text-align: left;
  margin-left: 100px;
  font-size: ${fontSize.normal};
  color: ${colors.mulberry};

  ${breakpoints.sm} {
    text-align: right;
    margin-right: 2rem;
    font-size: ${fontSize.small};
    margin-bottom: 5px;
  }
`;

class UploadPhotos extends Component {
  state = {
    isCameraViewOn: false,
    photoStepNumber: 0,
    // ---- For Dropzone Image Previews ----
    // Webcam image captures are in Base64String.
    // File drag and drops are in File format.
    imageCaptureBase64: null,
    showError: false,
    errorMessage: '',
    isMobile: isMobileDevice(),
    totalNumberOfPhotoSteps: this.props.photoTypes.length,
  }

  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageCapture = this.webcam.getScreenshot();

    this.setState(
      {
        imageCaptureBase64: imageCapture,
      },
      () => this.toggleModal(),
    );
  };

  toggleModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState(prevState => ({
      isCameraViewOn: !prevState.isCameraViewOn,
      showError: false,
      // imageCaptureBase64: null,
    }));
  };

  onDrop = (value, field) => {
    const file = value[0];
    const reader = new FileReader();
    reader.onload = event => {
      this.setState({
        imageCaptureBase64: event.target.result,
        showError: false,
      });
    };

    reader.readAsDataURL(file);
  };

  componentDidMount() {
    scrollToTop();
  }

  componentDidUpdate(prevProps) {
    const { onSubmitLastImage, isUploadPhotoSuccess } = this.props;
    const { photoStepNumber, totalNumberOfPhotoSteps } = this.state;
    const isLastStep = (photoStepNumber + 1) === totalNumberOfPhotoSteps;

    if (!prevProps.isUploadPhotoSuccess && isUploadPhotoSuccess) {
      if (isLastStep) {
        if (onSubmitLastImage) {
          onSubmitLastImage();
        }
        return;
      }

      this.setState(prevState => {
        return { photoStepNumber: prevState.photoStepNumber + 1 };
      });
    }
  }


  uploadPhoto = stepCount => {
    const { photoTypes, sendQuestionnairePhotoRequest, user, visit } = this.props;
    const { imageCaptureBase64 } = this.state;
    // const allPhotosUploaded = isAllVisitPhotosUploadComplete(visit);
    //
    // if (!allPhotosUploaded) {
    //   return this.setState({
    //     showError: true,
    //     errorMessage: 'Please upload all required photos before proceeding.',
    //   });
    // }

    // TODO - Remove as this is handled by the visitErrorMessage?
    if (!visit.uuid) {
      return this.setState({
        showError: true,
        errorMessage: 'Unable to upload photos at this time. Please log back in and try again.',
      });
    }

    const photoType = photoTypes[stepCount].type;
    sendQuestionnairePhotoRequest({
      photo_type: photoType,
      photo_file: imageCaptureBase64,
      visitUuid: visit.uuid,
      patient: user.id,
    });

    this.setState({
      imageCaptureBase64: null,
    });
  };

  nextPhotoStep = e => {
    const { photoStepNumber } = this.state;
    if (e) {
      e.preventDefault();
    }

    GTMUtils.trackCall('upload-photos_continue_click');

    this.uploadPhoto(photoStepNumber);
  };

  skipUploadPhotoStep = () => {
    const { onSubmitLastImage } = this.props;
    const { photoStepNumber, totalNumberOfPhotoSteps } = this.state;
    const isLastStep = (photoStepNumber + 1) === totalNumberOfPhotoSteps;


    if (isLastStep) {
      if (onSubmitLastImage) {
        onSubmitLastImage();
      }
    }

    this.setState(prevState => ({
      photoStepNumber: prevState.photoStepNumber + 1,
      imageCaptureBase64: null,
    }));
  };

  render() {
    const {
      errorMessage,
      isMobile,
      isCameraViewOn,
      showError,
      photoStepNumber,
      imageCaptureBase64,
      totalNumberOfPhotoSteps,
    } = this.state;

    const {
      photoTypes,
      isUploadingPhoto,
      uploadPhotoErrorMessage,
      visitErrorMessage,
      visit,
    } = this.props;

    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: 'user',
    };

    const clearFaceImageData = () => {
      this.setState({
        imageCaptureBase64: null,
      });
    };

    // load the saved photo (if it exists)
    const currentPhotoType = photoTypes[photoStepNumber] ? photoTypes[photoStepNumber].type : null;
    const savedVisitPhoto = getVisitPhotoFile(currentPhotoType, visit);

    const isUpdatePhotosOptional = savedVisitPhoto !== null || visit.skinProfileStatus === 'Complete';
    const isLastStep = photoStepNumber === totalNumberOfPhotoSteps;
    const isIdPhotoStep = currentPhotoType === 'Photo ID';
    const showTips = !isIdPhotoStep;

    const isYearlyVisit = visit && visit.id ? visit.service.includes('Repeat') : false;

    return (
      <CustomSpinner spinning={isUploadingPhoto} blur={true}>
        <Wrapper id={"wrapper"} isYearlyVisit={isYearlyVisit}>
          {isUpdatePhotosOptional && (
              <IndicatorContent>Optional</IndicatorContent>
          )}
          <Content
            id={"content"}
            isMobile={isMobile}
            isUpdatePhotosOptional={isUpdatePhotosOptional}
            showTips={showTips}
            isLastStep={isLastStep}
            className="photo-container-height"
          >
            {uploadPhotoErrorMessage && (
              <AlertContainer>
                <Alert color="danger"> {uploadPhotoErrorMessage} </Alert>
              </AlertContainer>
            )}
            {showError && (
              <AlertContainer>
                <Alert color="danger"> {errorMessage}</Alert>
              </AlertContainer>
            )}
            {visitErrorMessage && (
              <AlertContainer>
                <Alert color="danger"> {visitErrorMessage}</Alert>
              </AlertContainer>
            )}

            <UploadBlock id={"upload-block"}>
              <ImageList id={"image-list"}>
                {photoTypes.map(
                  (photoType, index) =>
                    photoStepNumber === index && (
                      <UploadPhotoStep
                        id={"upload-photo-step"}
                        key={photoType.alt}
                        isMobile={isMobile}
                        photoType={photoType}
                        base64PhotoFile={imageCaptureBase64}
                        isCameraViewOn={isCameraViewOn}
                        videoConstraints={videoConstraints}
                        onDrop={this.onDrop}
                        toggleModal={this.toggleModal}
                        setRef={this.setRef}
                        capture={this.capture}
                        nextPhotoStep={this.nextPhotoStep}
                        isUploadingPhoto={isUploadingPhoto}
                        clearFaceImageData={() => clearFaceImageData()}
                        isUpdatePhotosOptional={isUpdatePhotosOptional}
                        skipUploadPhotoStep={() => this.skipUploadPhotoStep()}
                        savedVisitPhoto={savedVisitPhoto && savedVisitPhoto.preview ? savedVisitPhoto.preview : savedVisitPhoto}
                        isYearlyVisit={isYearlyVisit}
                      />
                    ),
                )}
              </ImageList>
            </UploadBlock>
            {showTips && <TipsComponent/>}
          </Content>
        </Wrapper>
      </CustomSpinner>
    );
  }
}

//TODO - Pass these states and actions down from HOC
export const UploadPhotosContainer = connect(
  state => ({
    isUploadingPhoto: isUploadingPhoto(state),
    isUploadPhotoSuccess: isUploadPhotoSuccess(state),
    uploadPhotoErrorMessage: getPhotoErrorMessage(state),
    visitErrorMessage: getMedicalVisitErrorMessage(state),
  }),
  {
    sendQuestionnairePhotoRequest,
  },
)(UploadPhotos);
