import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { history } from 'src/history';
import megaphoneIcon from 'src/assets/images/megaphoneIcon.svg';
import backArrowIcon from 'src/assets/images/left-arrow.svg';
import { colors, fontSize, breakpoints } from 'src/variables';
import { getMostRecentVisitRequest, getPendingOrCreateVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {getConsentToTelehealth, getUserData} from 'src/features/user/selectors/userSelectors';
import { userYearlyVisitNoChanges } from 'src/features/dashboard/constants/userActionItemText';
import { getMedicalVisit, getMedicalVisitErrorMessage, isVisitFetchSuccess, isVisitBeingFetched } from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import { isVisitExpired, isVisitValid, requireYearlyMedicalVisitUpdate } from 'src/features/dashboard/helpers/userStatuses';
import {CustomSpinner} from "src/common/components/CustomSpinner";
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';

const ComponentWrapper = styled.div`
  max-width: 356px;
  height: 100%;
  padding-top: 8rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  ${breakpoints.sm} {
    justify-content: start;
    padding-top: 5rem;
  }
`;

const ErrorMessageWrapper = styled.div`
  max-width: 50%;
  height: 100%;
  padding: 200px 30px 0 30px;
  align-items: center;
  margin: auto;
  display: flex;
  flex-direction: column;
  ${breakpoints.sm} {
    max-width: 250px;
    justify-content: start;
    padding-top: 125px;
  }
`;

const MegaphoneIcon = styled.img`
  width: 74px;
  height: 72px;
  margin-bottom: 20px;
`;

const ThanksHeader = styled.p`
  color: ${colors.darkModerateBlue};
  font-size: ${fontSize.hugeMobile};
  font-weight: 800;
`;

const StyledContent = styled.p`
  font-size: ${fontSize.big};
  text-align: center;
`;

const BackToAccountWrapper = styled.div`
  cursor: pointer;
  margin-top: 4rem;
  display: flex;

  ${breakpoints.sm} {
    position: absolute;
    bottom: 2rem;
  }
`;

const BackIcon = styled.img`
  margin-right: 0.5rem;
  width: 13px;
  height: 20px;
`;

const ButtonContent = styled.p`
  font-size: ${fontSize.medium};
  margin: 0;
`;

const ShareButton = styled.button`
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
`;

class WelcomeBack extends React.Component {

  componentDidMount() {
    const { consentToTelehealth, getMostRecentVisitRequest, getPendingOrCreateVisitRequest, user, visit, visitFetching, rxSubscription } = this.props;

    if (visit && !visit.id && !visitFetching) {
      getMostRecentVisitRequest();
    } else {
      const requireVisitUpdate = requireYearlyMedicalVisitUpdate(rxSubscription, visit);

      if (requireVisitUpdate) {
        getPendingOrCreateVisitRequest(user.id, userYearlyVisitNoChanges, consentToTelehealth);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { consentToTelehealth, getPendingOrCreateVisitRequest, user, visit, visitFetchSuccess, rxSubscription} = this.props;

    if (!prevProps.visitFetchSuccess && visitFetchSuccess) {
      const requireVisitUpdate = requireYearlyMedicalVisitUpdate(rxSubscription, visit);
      if (requireVisitUpdate) {
        getPendingOrCreateVisitRequest(user.id, userYearlyVisitNoChanges, consentToTelehealth);
      }
    }
  }

  goToPage = (page, e) => {
    e.preventDefault();
    history.push(page);
  };

  render() {
    const { visit, visitErrorMessage, visitFetching } = this.props;
    const visitExpired = isVisitExpired(visit);
    const visitValid = isVisitValid(visit); // medical provider has already evaluated the visit
    const welcomeMessage = visitValid ? 'Your Skin Profile is already up to date.' : 'We’ll let your provider know. In the meantime, don’t glow it alone.';

    return (
      <div>
        {visitFetching && (
          <CustomSpinner spinning={visitFetching} blur={true}/>
        )}
        {!visitFetching && visit && visit.id && !visitExpired && (
          <ComponentWrapper>
            {visitErrorMessage && <MessageBannerAlert text={visitErrorMessage} color="danger"/>}
            {!visitErrorMessage && (
              <React.Fragment>
                <MegaphoneIcon src={megaphoneIcon}/>
                <ThanksHeader>Thank You!</ThanksHeader>
                <StyledContent>{welcomeMessage}</StyledContent>
                <ShareButton onClick={e => this.goToPage('/sharing-program', e)}>
                  Invite Friends
                </ShareButton>
                <BackToAccountWrapper onClick={e => this.goToPage('/user-dashboard/my-plan', e)}>
                  <BackIcon src={backArrowIcon}/>
                  <ButtonContent>Back to account</ButtonContent>
                </BackToAccountWrapper>
              </React.Fragment>
            )}
          </ComponentWrapper>
        )}
        {!visitFetching && (visit && !visit.id || visitErrorMessage || visit && visit.id && visitExpired) && (
          <ErrorMessageWrapper>
            <StyledContent>
              Unable to update visit. Please contact support@dearbrightly.com.
            </StyledContent>
          </ErrorMessageWrapper>
        )}
      </div>
    )}
}

const mapStateToProps = state => ({
  consentToTelehealth: getConsentToTelehealth(state),
  rxSubscription: getMostRecentRxSubscription(state),
  user: getUserData(state),
  visit: getMedicalVisit(state),
  visitErrorMessage: getMedicalVisitErrorMessage(state),
  visitFetching: isVisitBeingFetched(state),
  visitFetchSuccess: isVisitFetchSuccess(state),
});

export default connect(
  mapStateToProps,
  {
    getMostRecentVisitRequest,
    getPendingOrCreateVisitRequest,
  },
)(WelcomeBack);
