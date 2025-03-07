import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import continueArrowIcon from 'src/assets/images/rightArrow.svg';
import { history } from 'src/history';
import { colors, fontSize, breakpoints } from 'src/variables';
import {
  getMedicalVisit,
  getMedicalVisitErrorMessage,
  isVisitFetchSuccess,
  isVisitBeingFetched,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import { scrollToTop } from 'src/common/helpers/scrollToTop';
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
const backgroundPhoto = 'https://d17yyftwrkmnyz.cloudfront.net/DearBrightly_7755.jpg';
import { requireYearlyMedicalVisitUpdate, isVisitPendingProviderReview } from 'src/features/dashboard/helpers/userStatuses';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { fetchSubscriptionsRequest } from 'src/features/subscriptions/actions/subscriptionsActions';
import { getMostRecentVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';

const ComponentWrapper = styled.div`
  display: flex;
  display:-webkit-flex;
  flex-direction: row-reverse; 
  height:auto;

  ${breakpoints.sm} {
    flex-direction: column;
  }
`;

const ColumnWrapper = styled.div`
  display: flex;
  display:-webkit-flex;
  padding-top: 100px;
  margin: 7rem;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  height:auto;
  width: 100%;

  ${breakpoints.xxl} {
    margin: 4rem auto;
  }

  ${breakpoints.sm} {
    margin: 0 auto 2rem;
    max-width: 356px;
    justify-content: start;
    padding-top: 120px;
  }
`;


const PhotoWrapper = styled.div`
  flex-basis: 100%;
`;

const PhotoContainer = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: top;
  max-height: 800px;
`;


const SkinProfileUpToDateSubHeader = styled.p`
  font-size: ${fontSize.biggest};
  text-align: left;
  max-width:25rem;
  line-height: 28px;

  ${breakpoints.sm} {
    text-align: center;
    font-size: ${fontSize.biggest};
    max-width: 14rem;
    line-height: 29px;
  }
`;

const UpdateSkinProfileHeader = styled.p`
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

const StyledContent = styled.p`
  font-size: ${fontSize.normal};
  text-align: left;
  margin: 1rem 0;
  line-height: 24px;
  max-width: 17rem;

  ${breakpoints.sm} {
    margin: 0 1rem 1rem;
    text-align: center;
  }
`;

const BackIcon = styled.img`
  margin-left: 0.5rem;
  width: 13px;
  height: 20px;
`;

const ContinueToSkinProfileButton = styled.button`
  cursor: pointer;
  background-color: ${colors.darkModerateBlue};
  width: 261px;
  height: 54px;
  color: ${colors.clear};
  border-radius: 4px;
  border: none;
  font-weight: 800;
  font-size: ${fontSize.medium};

  :hover {
    background: ${colors.blumineLight};
  }
  
  :disabled {
    opacity: 0.6;
  }
`;

const ContentWrapper = styled.div`
  margin-left: 6rem;
  margin-right: 6rem;

  ${breakpoints.md} {
    margin-left: 3rem;
    margin-right: 3rem
  }

  ${breakpoints.sm} {
    display: flex;
    display:-webkit-flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
  }
`;

class UpdateYourSkinProfile extends React.Component {

  componentDidMount() {
    const { getMostRecentVisitRequest, fetchSubscriptionsRequest, mostRecentSubscription, visit, visitFetching, user } = this.props;

    scrollToTop();

    if (visit && !visit.id && !visitFetching) {
      getMostRecentVisitRequest();
    }

    if (!mostRecentSubscription && user && user.id) {
      fetchSubscriptionsRequest(user.id);
    }
  }

  goToSkinProfile = () => {
    const path = '/user-dashboard/skin-profile';
    history.push(path);
  }

  goToProducts = () => {
    history.push('/products');
  }

  render() {
    const { rxSubscription, visit, visitErrorMessage } = this.props;
    const showYearlyVisitRequired = requireYearlyMedicalVisitUpdate(rxSubscription, visit);
    const visitPendingProviderReview = isVisitPendingProviderReview(visit);

    return (
      (visit && visit.id) ? (
        <ComponentWrapper>
          {visitErrorMessage && <MessageBannerAlert text={visitErrorMessage} color="danger"/>}
          <ColumnWrapper>

            {/* No expiring visit and current visit has been reviewed and a prescription has been administered to the patient */}
            {!showYearlyVisitRequired && (
              visit.status === 'Provider Rx Submitted' ||
              visit.status === 'Provider Signed') &&
            (
              <ContentWrapper>
                <UpdateSkinProfileHeader>You're all set!</UpdateSkinProfileHeader>
                <SkinProfileUpToDateSubHeader>Your Skin Profile is already up to date.</SkinProfileUpToDateSubHeader>
              </ContentWrapper>
            )}

            {/* No expiring visit and current visit is complete (user-initiated responses only).
            If the skin profile is complete the visit can be pending provider review or pending payment and not yet queued for the medical provider. */}
            {!showYearlyVisitRequired && (
              visit.skinProfileStatus === 'Complete' ||
              visit.skinProfileStatus === 'No Changes User Specified' ||
              (visit.skinProfileStatus === 'No Changes No User Response' && visitPendingProviderReview)) &&
            (
              <ContentWrapper>
                <UpdateSkinProfileHeader>You're all set!</UpdateSkinProfileHeader>
                <SkinProfileUpToDateSubHeader>Your Skin Profile is already up to date. Your provider will be reviewing
                  your visit soon.</SkinProfileUpToDateSubHeader>
              </ContentWrapper>
            )}

            {/* Expiring visit or visit has been created, but is not complete.
            Or, if the Skin Profile is "complete", but the user did not initiate the Skin Profile completion. */}
            {(showYearlyVisitRequired || (
              visit.skinProfileStatus === 'Not Started' ||
              visit.skinProfileStatus === 'Pending Questionnaire' ||
              visit.skinProfileStatus === 'Pending Photos' ||
              (visit.skinProfileStatus === 'No Changes No User Response' && !visitPendingProviderReview) ||
              visit.skinProfileStatus === 'Incomplete User Response')) &&
            (
              <ContentWrapper>
                <UpdateSkinProfileHeader>It’s time to update your Skin Profile</UpdateSkinProfileHeader>
                <StyledContent>
                  This is your chance to give your provider the latest updates on any medical or skin
                  changes, or new skin goals.
                </StyledContent>
                <ContinueToSkinProfileButton onClick={this.goToSkinProfile} disabled={visitErrorMessage}>
                  Continue <BackIcon src={continueArrowIcon}/>
                </ContinueToSkinProfileButton>
              </ContentWrapper>
            )}
          </ColumnWrapper>
          <PhotoWrapper>
            <PhotoContainer src={backgroundPhoto}/>
          </PhotoWrapper>
        </ComponentWrapper>

      ) : (
        // No visit ever created -- user never purchased anything
        <div style={{ textAlign: 'center', paddingBottom: '100px' }}>
          <h4 style={{ padding:'20px', paddingTop:'100px'}}>Uh oh! Looks like you have not completed a purchase. </h4>
          <ContinueToSkinProfileButton onClick={this.goToProducts}>
            Go To Products <BackIcon src={continueArrowIcon}/>
          </ContinueToSkinProfileButton>
        </div>
      )
    )
  };
}

const mapStateToProps = state => ({
  user: getUserData(state),
  rxSubscription: getMostRecentRxSubscription(state),
  visit: getMedicalVisit(state),
  visitErrorMessage: getMedicalVisitErrorMessage(state),
  visitFetching: isVisitBeingFetched(state),
  visitFetchSuccess: isVisitFetchSuccess(state),
});

export default connect(
  mapStateToProps,
  {
    fetchSubscriptionsRequest,
    getMostRecentVisitRequest,
  },
)(UpdateYourSkinProfile);
