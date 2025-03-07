import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { Spinner } from 'reactstrap';
import frontFaceIcon from 'src/assets/images/frontProfile.svg'
import leftFaceIcon from 'src/assets/images/leftProfile.svg'
import rightFaceIcon from 'src/assets/images/rightProfile.svg'
import photoIdIcon from 'src/assets/images/photoId.svg'
import { PhotoEdit } from 'src/features/checkout/components/PhotoEdit';
import optimizelyService from 'src/common/services/OptimizelyService';
import {
  isVisitFetchSuccess,
  isUploadPhotoSuccess,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { breakpoints, fontSize } from 'src/variables';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import {
  isVisitPhotoIdRejected,
} from 'src/features/dashboard/helpers/userStatuses';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');
const Wrapper = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;

  ${breakpoints.md} {
    margin-top: 4rem;
  }
`;

const PageHeader = styled.p`
  font-size: ${fontSize.biggest};
  padding-left: 1rem;
`;

const PhotosWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const SinglePhotoWrapper = styled.div`
  display: flex;

  ${breakpoints.md} {
    justify-content: center;
  }
`;

class EditPhotosContainer extends React.Component {
  confirmPhotoUpload = () => {
  };

  confirmPhotoIdUpload = () => {
    GTMUtils.trackCall('all_photos_uploaded_photo_edit');
    // if (!DEBUG) {
    //   optimizelyService.track('questionnaire_photos_uploaded');
    // }
  };

  render() {
    const { user, visit, visitFetchSuccess } = this.props;
    const photoFrontFace = visit.photoFrontFace && visit.photoFrontFace.photoFile;
    const photoLeftFace = visit.photoLeftFace && visit.photoLeftFace.photoFile;
    const photoRightFace = visit.photoRightFace && visit.photoRightFace.photoFile;
    const photoId = visit.photoId && visit.photoId.photoFile;
    const isPhotoIdRejected = visit.photoId && visit.photoId.photoRejected;
    const isPhotoFrontFaceRejected = visit.photoFrontFace && visit.photoFrontFace.photoRejected;
    const isPhotoLeftFaceRejected = visit.photoLeftFace && visit.photoLeftFace.photoRejected;
    const isPhotoRightFaceRejected = visit.photoRightFace && visit.photoRightFace.photoRejected;

    const visitPhotoIdRejected = isVisitPhotoIdRejected(visit);

    return visitFetchSuccess && visit && visit.id ? (
      <Wrapper>
        <React.Fragment>
          <PageHeader>Edit Photos</PageHeader>
          <PhotosWrapper>
            <PhotoEdit
              onSubmit={() => this.confirmPhotoUpload()}
              photoType={'Front of face'}
              description={'Upload a photo of the front of your face'}
              photoSrc={photoFrontFace}
              emptyPhotoSrc={frontFaceIcon}
              photoHeader={'Front'}
              isPhotoRejected={isPhotoFrontFaceRejected}
              user={user}
              visit={visit}
            />
            <PhotoEdit
              onSubmit={() => this.confirmPhotoUpload()}
              photoType={'Left side of face'}
              description={'Upload a photo of the left side of your face'}
              photoSrc={photoLeftFace}
              emptyPhotoSrc={leftFaceIcon}
              photoHeader={'Left Profile'}
              isPhotoRejected={isPhotoLeftFaceRejected}
              user={user}
              visit={visit}
            />
            <PhotoEdit
              onSubmit={() => this.confirmPhotoUpload()}
              photoType={'Right side of face'}
              description={'Upload a photo of the right side of your face'}
              photoSrc={photoRightFace}
              emptyPhotoSrc={rightFaceIcon}
              photoHeader={'Right Profile'}
              isPhotoRejected={isPhotoRightFaceRejected}
              user={user}
              visit={visit}
            />
          </PhotosWrapper>
        </React.Fragment>
        {(!photoId || visitPhotoIdRejected) && (
          <React.Fragment>
            <PageHeader>ID</PageHeader>
            <SinglePhotoWrapper>
              <PhotoEdit
                onSubmit={() => this.confirmPhotoIdUpload()}
                photoType={'Photo ID'}
                description={`In order to verify your identity, please provide a photo of your government-issued ID (e.g., a driver's license or state ID). Your provider will only use it to verify your identity.`}
                photoSrc={photoId}
                emptyPhotoSrc={photoId ? photoId : photoIdIcon}
                isPhotoRejected={isPhotoIdRejected}
                user={user}
                visit={visit}
              />
            </SinglePhotoWrapper>
          </React.Fragment>
        )}
      </Wrapper>
    ) : (
      <Spinner color="primary" />
    );
  }
}

const mapStateToProps = state => ({
  uploadPhotoSuccess: isUploadPhotoSuccess(state),
  visitFetchSuccess: isVisitFetchSuccess(state),
});

export default connect(mapStateToProps)(EditPhotosContainer);
