import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import {
  getMedicalVisitErrorMessage,
  getSubmitConsentErrorMessage,
  isSubmittingConsentRequest,
  isSubmitConsentSuccess,
  isVisitBeingFetched,
  isVisitFetchSuccess
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {
  submitConsentRequest,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';

import optimizelyService from 'src/common/services/OptimizelyService';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { Spinner } from 'reactstrap';
import TelehealthSummary from 'src/features/checkout/components/TelehealthSummary';
import {
  getPendingOrCreateVisitRequest,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import { isVisitExpired } from 'src/features/dashboard/helpers/userStatuses';
import {getOrderErrorMessage} from "src/features/orders/selectors/orderSelectors";
import { fontFamily } from 'src/variables';

const DEBUG = getEnvValue('DEBUG');

const Container = styled('div')`
  margin: 0 auto;
  width: 100%;
  padding-top: 0px;
  font-family: ${fontFamily.baseFont};
  align-items: center;
  // display: flex;
  flex-direction: column;
`;

class TelehealthPage extends Component {
  componentDidMount() {
    const { getPendingOrCreateVisitRequest, user, visit } = this.props;

    if (user && user.id) {
      const visitExpired = isVisitExpired(visit);
      if (!visit.id || (visit.id && visitExpired)) {
        getPendingOrCreateVisitRequest(user.id, null);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {
      submitConsentSuccess,
      onTelehealthConsentSubmitSuccess,
    } = this.props;

    if (prevProps.submitConsentSuccess == false && submitConsentSuccess == true) {
      if (onTelehealthConsentSubmitSuccess) {
        onTelehealthConsentSubmitSuccess();
      }
      this.onNextStep();
    }

  }

  onNextStep = () => {
    const { onNext } = this.props;
    if (this.props.onNext) {
      onNext();
    }
  };

  // when user submits consent
  submitConsent = () => {
    const { visit } = this.props;

    if (visit.id) {
      const visit_identifier = visit && visit.uuid;

      this.props.submitConsentRequest(visit_identifier);

      // if (!DEBUG) {
      //   optimizelyService.track('questionnaire_accept_consent_to_telehealth');
      // }

      GTMUtils.trackCall('questionnaire_accept_consent_to_telehealth');
    }
  };

  render() {
    const {
      isVisitBeingFetched,
      visitErrorMessage,
      visitFetchSuccess,
      submitConsentErrorMessage,
      orderUpdateErrorMessage,
    } = this.props;

    const visitCreationFail = !visitFetchSuccess && visitErrorMessage;
    const disableSkinProfileVisit = visitCreationFail || orderUpdateErrorMessage;

    return (
      <Container>
        {orderUpdateErrorMessage && (
            <MessageBannerAlert text={orderUpdateErrorMessage} color="danger" />
        )}
        {submitConsentErrorMessage && (
          <MessageBannerAlert text={submitConsentErrorMessage} color="danger" />
        )}
        {visitErrorMessage && (
          <MessageBannerAlert text={visitErrorMessage} color="danger" />
        )}
        {!disableSkinProfileVisit &&
        !isVisitBeingFetched && (
          <TelehealthSummary submitConsent={this.submitConsent} />
        )}
        {isVisitBeingFetched && <Spinner color="primary"/>}
      </Container>
    );
  }
}

//TODO - Pass these states and actions down from HOC
export const TelehealthContainer = connect(
  state => ({
    isVisitBeingFetched: isVisitBeingFetched(state),
    visitFetchSuccess: isVisitFetchSuccess(state),
    submitConsentSuccess: isSubmitConsentSuccess(state),
    isSubmittingConsentRequest: isSubmittingConsentRequest(state),
    submitConsentErrorMessage: getSubmitConsentErrorMessage(state),
    visitErrorMessage: getMedicalVisitErrorMessage(state),
    orderUpdateErrorMessage: getOrderErrorMessage(state),
  }),
  {
    getPendingOrCreateVisitRequest,
    submitConsentRequest,
  },
)(TelehealthPage);
