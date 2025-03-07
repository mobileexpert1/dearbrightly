import React from 'react';
import {history} from 'src/history';
import UploadPhotosCheckoutContainer from 'src/features/checkout/containers/UploadPhotosCheckoutContainer';
import {QuestionnaireContainer} from 'src/features/checkout/components/Questionnaire';
import {PhotoUploadTips} from 'src/features/checkout/components/PhotoUploadTips';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import {FRONT_FACE, LEFT_FACE, RIGHT_FACE, PHOTO_ID} from 'src/common/constants/medicalVisits';
import SkinProfileUpdateSuccessModal from 'src/features/dashboard/components/SkinProfileUpdateSuccessModal';
import { isVisitPendingProviderReview, isVisitNoUserResponse, isVisitExpired, isVisitPhotoIdUploadRequired, requireYearlyMedicalVisitUpdate } from 'src/features/dashboard/helpers/userStatuses';
import styled from "react-emotion";
import { colors, fontSize, breakpoints } from 'src/variables';
import dbStarCluster from 'src/assets/images/dbStarCluster.svg';


const Container = styled.div`
  background-color: ${colors.white};
`;

const SkinProfileCompleteContainer = styled.div`
  margin: auto;  
  margin-top: 150px;
  display: flex;
  display:-webkit-flex;
  flex-direction: column;
  align-items: center;
  ${breakpoints.sm} {
    margin-top: 75px;
  }
`;

const UpdateSkinProfileHeader = styled.p`
  margin: 5px 0px;
  color: ${colors.darkModerateBlue};
  font-size: ${fontSize.huge};
  font-weight: 800;
  text-align: left;
  max-width: 17rem;
  line-height: 46px;

  ${breakpoints.sm} {
    text-align: center;
    font-size: ${fontSize.hugeMobile};
    max-width: 14rem;
    line-height: 36px;
  }
`;

const SkinProfileUpToDateSubHeader = styled.p`
  margin: 5px 20px;
  font-size: ${fontSize.biggest};
  text-align: left;
  line-height: 28px;

  ${breakpoints.sm} {
    text-align: center;
    font-size: ${fontSize.biggest};
    line-height: 29px;
  }
`;

const DbStarClusterIcon = styled.img`
  height: 139px;
  width: 178px;
  padding: 20px 0;
`;

const UserDashboardLink = styled.p`
  margin: 10px 0 0 0;
  cursor: pointer;
  font-size: ${fontSize.small};
  color: ${colors.blumine};
  text-align: center;
  font-weight: bold;
  text-decoration: underline;
`;

export class SkinProfileContainer extends React.Component {
  state = {
    currentStep: null,
    showSkinProfileUpdateModal: false,
  };

  // no visit and visit fetched, create a new visit
  // visit is expired and pending, go to questionnaire or photo
  // visit is expired, create a new visit
  componentDidMount() {
    const { navigateOrderCheckout, pendingCheckoutOrder, visit, visitFetchSuccess } = this.props;

    if (visitFetchSuccess) {
      if (pendingCheckoutOrder && pendingCheckoutOrder.id && visit && visit.id) {
        navigateOrderCheckout();
        history.push('/user-dashboard');
      } else {
        this.handleYearlyVisit(visit);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { navigateOrderCheckout, visitFetchSuccess, isOrderFetchSuccess, pendingCheckoutOrder, visit } = this.props;

    if ((!prevProps.isOrderFetchSuccess && isOrderFetchSuccess && visit && visit.id) ||
      (!prevProps.visitFetchSuccess && visitFetchSuccess && pendingCheckoutOrder && pendingCheckoutOrder.id)) {
      navigateOrderCheckout();
      history.push('/user-dashboard');
    } else if (visitFetchSuccess && !prevProps.visitFetchSuccess) {
      this.handleYearlyVisit(visit);
    }
  }

  handleYearlyVisit = (visit) => {
    const { consentToTelehealth, getPendingOrCreateVisitRequest, user, rxSubscription } = this.props;

    if (!visit) {
      return;
    }

    if (visit.id) {
      const visitNoUserResponse = isVisitNoUserResponse(visit);
      const visitPendingProviderReview = isVisitPendingProviderReview(visit);
      const requireVisitUpdate = requireYearlyMedicalVisitUpdate(rxSubscription, visit);

      if (requireVisitUpdate) {
        getPendingOrCreateVisitRequest(user.id, 'Pending Questionnaire', consentToTelehealth);
      } else {
        if (visit.skinProfileStatus === 'Pending Questionnaire' || visitNoUserResponse && !visitPendingProviderReview) {
          this.loadQuestionnaire();
        } else if (visit.skinProfileStatus === 'Pending Photos') {
          const onlyPhotoIdRequired = isVisitPhotoIdUploadRequired(visit);
          if (onlyPhotoIdRequired) {
            this.loadPhotoId();
          } else {
            this.loadPhotoTips();
          }
        }
      }
    } else {
      getPendingOrCreateVisitRequest(user.id, null, consentToTelehealth);
    }

  }

  loadQuestionnaire = () => {
    this.setState({
      currentStep: 'skin profile',
    });
  };

  loadPhotoTips = () => {
    this.setState({
      currentStep: 'photos tips',
    });
  };

  loadPhotoUpload = () => {
    this.setState({
      currentStep: 'photos',
    });
  };

  loadPhotoId = () => {
    this.setState({
      currentStep: 'photo id',
    });
  };

  goToUserDashboard = () => {
    this.setState({
      showSkinProfileUpdateModal: true,
    })
    history.push('/user-dashboard/my-plan');
  };

  handleSkinProfileQuestionsSubmitSuccess = () => {
    this.loadPhotoTips();
  }

  goToUserDashboardPage = () => {
    history.push('/user-dashboard');
  };

  render() {
    const { currentStep, showSkinProfileUpdateModal } = this.state;
    const {
      medicalVisitError,
      user,
      visit,
    } = this.props;

    return (
      <div>
        {medicalVisitError.length > 0 ? (
          <MessageBannerAlert text={medicalVisitError} color="danger" />
        ) : (
          <Container id={"skin-profile-container"}>
            {showSkinProfileUpdateModal && (
              <SkinProfileUpdateSuccessModal onClose={() => {
                this.setState({
                  showSkinProfileUpdateModal: false
                });
                history.push('/user-dashboard/my-plan');
              }}
              />
            )}
            {currentStep === 'skin profile' && (
              <QuestionnaireContainer
                user={user}
                visit={visit}
                isUserDashboard
                isSkinProfileContainer={true}
                onSkinProfileQuestionsSubmitSuccess={this.handleSkinProfileQuestionsSubmitSuccess}
                headerHeight={0}
              />
            )}
            {currentStep === 'photos tips' && (
              <PhotoUploadTips nextStep={this.loadPhotoUpload} />
            )}
            {currentStep === 'photos' && (
              <UploadPhotosCheckoutContainer
                onSkinProfilePhotosUploadSuccess={this.goToUserDashboard}
                user={user}
                visit={visit}
                photoTypes={[FRONT_FACE, LEFT_FACE, RIGHT_FACE]}
              />
            )}
            {currentStep === 'photo id' && (
              <UploadPhotosCheckoutContainer
                onSkinProfilePhotosUploadSuccess={this.goToUserDashboard}
                user={user}
                visit={visit}
                photoTypes={[PHOTO_ID]}
              />
            )}
            {currentStep !== 'skin profile' && currentStep !== 'photos tips' && currentStep !== 'photos' && currentStep !== 'photo id' && visit.id &&
            (
              <SkinProfileCompleteContainer>
                <DbStarClusterIcon src={dbStarCluster} />
                <UpdateSkinProfileHeader>You're all set!</UpdateSkinProfileHeader>
                <SkinProfileUpToDateSubHeader>Your Skin Profile is already up to date.</SkinProfileUpToDateSubHeader>
                <UserDashboardLink onClick={this.goToUserDashboardPage}>
                  View your dashboard
                </UserDashboardLink>
              </SkinProfileCompleteContainer>
            )}
          </Container>
        )}
      </div>
    );
  }
}

