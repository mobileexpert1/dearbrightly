import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { Popover } from 'reactstrap';
import questionMarkIcon from 'src/assets/images/questionMarkIcon.svg';
import { history } from 'src/history';
import { colors, breakpoints, fontSize } from 'src/variables';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
//import { SkinProfileQuestionnaireProgressBar } from './SkinProfileQuestionnaireProgressBar';
import { isOrderPendingPayment } from 'src/features/orders/helpers/orderStatuses';

import {
  isUserActionRequired,
  isUserSkinProfileActionRequired,
  getUserSkinProfileAction,
  isVisitQuestionnairePending,
  isVisitSkinProfileComplete,
  requireYearlyMedicalVisitUpdate,
  isVisitPhotoIdRejected,
  isVisitPhotosRejected,
  isUserPendingCheckout,
} from 'src/features/dashboard/helpers/userStatuses';

import {
  userActionItemText,
  userActionItemCTAText,
  userYearlyVisitNoChanges,
  userActionStatus,
  userPaymentStatus,
} from 'src/features/dashboard/constants/userActionItemText';

const SkinProfileCompletionMessage = styled.p`
  padding: 20px;
  font-size: ${fontSize.medium};
  line-height: 22px;
  margin: 0;
  z-index: 1;

  ${breakpoints.xs} {
    width: ${props => !props.noPadding && '200px'};
    padding: ${props => (props.noPadding ? '14px 10px 15px' : '14px 0px 15px 19px')};
  }
`;

const SkinProfileCompletionNotificationMarker = styled.div`
  position: absolute;
  height: 100%;
  width: 5px;
  background: ${colors.darkModerateBlue};
  border-radius: 6px 0px 0px 6px;
`;

const SkinProfileCompletionContainer = styled.div`
  margin: auto;
  position: absolute;
  width: 100%;
  background: ${colors.blackSqueeze};
  height: 100%;
  z-index: 0;
  border-radius: 4px;
`;

const NotificationContainer = styled.div`
  position: relative;
  background: ${colors.white};
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem 0.5rem 0.75rem 1.5rem;
  ${breakpoints.sm} {
    flex-direction: column;
  }
`;

const NotificationMessage = styled.p`
  font-size: ${fontSize.small};
  line-height: 22px;
  margin: auto;
  text-align: left;
  ${breakpoints.sm} {
    margin: 0;
    padding-right: 10px;
  }  
`;

const NotificationMessageTitle = styled.p`
  font-weight: bold;
  font-size: ${fontSize.small};
  color: #000000;
  margin-bottom: 0.25rem;
`;

const NotificationMarker = styled.div`
  position: absolute;
  height: 100%;
  width: 5px;
  background: ${colors.mulberry};
  border-radius: 6px 0px 0px 6px;
  left: 0;
  top: 0;
`;

const NotificationButton = styled.button`
  cursor: pointer;
  width: ${props => (props.smallButton ? '69px' : '165px')};
  height: 40px;
  background: ${colors.mulberry};
  border-radius: 4px;
  margin: ${props => (props.smallButton ? '6px 3px' : '6px 10px')};
  border: none;
  color: ${colors.white};
  padding: 5px;
  font-weight: 600;
  font-size: ${fontSize.smallest};

  ${breakpoints.sm} {
    height: auto;
  }

  :hover {
    background: ${colors.mulberry};
    color: ${colors.clear};
  }
`;

const ButtonsWrapper = styled.div`
  padding-right: 3px;

  ${breakpoints.sm} {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
`;

const MessageAndIconWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const QuestionMarkIcon = styled.svg`
  cursor: pointer;
  width: 24.5px;
  height: 24.5px;
  background-image:  url('${props => props.iconSrc}') ;
  margin-top: 12px;
  margin-left: 10px;

  ${breakpoints.xs} {
    margin: 0;
  } 
`;

const StyledPopover = styled(Popover)`
  min-width: 376px;
  padding: 2rem;

  ${breakpoints.sm} {
    min-width: 200px;
    max-width: 318px;
  }
`;

const ColoredText = styled.span`
  color: ${colors.mulberry};
`;

export class UserNotificationBarComponent extends React.Component {
  state = {
    popoverOpen: false,
  };

  goToPage = (page, option, tab = null) => {
    if (tab) {
      history.push({
        pathname: '/user-dashboard/my-account',
        state: { activeTabId: tab },
      });
    } else {
      history.push(page, option);
    }
  };

  handleCreateYearlyVisit = noChanges => {
    const path = noChanges ? '/welcome-back' : '/update-skin-profile';
    history.push(path);
  };

  onHover = () => {
    this.setState({
      popoverOpen: true,
    });
  };

  onHoverLeave = () => {
    this.setState({
      popoverOpen: false,
    });
  };

  handleIconClick = () => {
    this.setState(prevState => ({
      popoverOpen: !prevState.popoverOpen,
    }));
  };

  goToAccountDetailsPayment = () => {
    this.goToPage(`/user-dashboard/my-account`, 'Action button', 3);
  };

  goToReturningUserSkinProfile = () => {
    this.goToPage('/user-dashboard/skin-profile', 'Action button');
  };

  goToEditPhotos = () => {
    this.goToPage('/user-dashboard/edit-photos', 'Action button');
  };

  goToAction = e => {
    e.preventDefault();

    const { navigateOrderCheckout, pendingCheckoutOrder, user, visit } = this.props;
    const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit);
    const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;
    const visitPhotosRejected = isVisitPhotosRejected(visit);
    const visitPhotoIdRejected = isVisitPhotoIdRejected(visit);
    const userPendingCheckout = isUserPendingCheckout(pendingCheckoutOrder, visit);

    if (userPendingCheckout) {
      navigateOrderCheckout(true);
    } else if (userSkinProfileActionRequired) {
      if (visitPhotosRejected || visitPhotoIdRejected) {
        this.goToEditPhotos();
      } else {
        this.goToReturningUserSkinProfile();
      }
    } else if (requirePaymentDetailUpdate) {
      this.goToAccountDetailsPayment();
    }
  };

  render() {
    const {
      localUserAnswers,
      user,
      visit,
      currentQuestionnaireStep,
      questionsLength,
      displayOnlySkinProfileActions,
      pendingCheckoutOrder,
      rxSubscription,
    } = this.props;
    const { popoverOpen } = this.state;

    const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;
    const visitQuestionnairePending = isVisitQuestionnairePending(visit);
    const visitSkinProfileComplete = isVisitSkinProfileComplete(visit);
    const userSkinProfileAction = getUserSkinProfileAction(user, visit);
    const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit);
    const isUserAnsweringQuestionnaire = !!localUserAnswers.length && visitQuestionnairePending;
    const isPendingCheckoutPayment = isOrderPendingPayment(pendingCheckoutOrder);
    const showYearlyVisitRequired = requireYearlyMedicalVisitUpdate(rxSubscription, visit);
    const noChanges = userYearlyVisitNoChanges;
    const rxOrderPendingCheckout =
      pendingCheckoutOrder &&
      pendingCheckoutOrder.orderType === 'Rx' &&
      isUserPendingCheckout(pendingCheckoutOrder, visit);
    const userActionRequired = isUserActionRequired(
      user,
      visit,
      rxSubscription,
      pendingCheckoutOrder,
    );
    const isSubscriptionActive = rxSubscription ? rxSubscription.isActive : false;
    const userPendingCheckout = isUserPendingCheckout(pendingCheckoutOrder, visit);

    let ctaText = '';
    let actionText = '';
    let actionStatus = '';

    if (userPendingCheckout) {
      if (isPendingCheckoutPayment) {
        ctaText = userActionItemCTAText.updatePayment;
        actionText = userActionItemText.updatePaymentDetails;
        actionStatus = userPaymentStatus;
      } else {
        ctaText = userSkinProfileAction.ctaText;
        actionText = userSkinProfileAction.actionText;
        actionStatus = userActionStatus;
      }
    } else if (userSkinProfileActionRequired) {
      ctaText = userSkinProfileAction.ctaText;
      actionText = userSkinProfileAction.actionText;
      actionStatus = userActionStatus;
    } else if (requirePaymentDetailUpdate) {
      ctaText = userActionItemCTAText.updatePayment;
      actionText = userActionItemText.updatePaymentDetails;
      actionStatus = userPaymentStatus;
    }

    return (
      <React.Fragment>
        <BoxContentWrapper className="p-0">
          {/*Display Skin Profile completion in the My Skin Profile Section*/}
          {!rxOrderPendingCheckout &&
            displayOnlySkinProfileActions &&
            visitSkinProfileComplete &&
            !userSkinProfileActionRequired && (
              <NotificationContainer>
                <SkinProfileCompletionContainer />
                <SkinProfileCompletionNotificationMarker />
                <SkinProfileCompletionMessage> Skin Profile Complete </SkinProfileCompletionMessage>
              </NotificationContainer>
            )}

          {/*User is answering the questionnaire and the answers are stored locally*/}
          {/*{isUserAnsweringQuestionnaire && (*/}
          {/*  <SkinProfileQuestionnaireProgressBar*/}
          {/*    currentQuestionnaireStep={currentQuestionnaireStep}*/}
          {/*    questionsLength={questionsLength}*/}
          {/*    visitQuestionnaireComplete={visitQuestionnaireComplete}*/}
          {/*  />*/}
          {/*)}*/}

          {/*User is not in the middle of answering the questionnaire locally, but there are Skin Profile actions for the yearly visit*/}
          {showYearlyVisitRequired &&
            isSubscriptionActive && (
              <NotificationContainer>
                <NotificationMarker />
                <MessageAndIconWrapper id={"message-and-icon-wrapper"}>
                  <NotificationMessage id={"notification-message"}>{userSkinProfileAction.actionText}</NotificationMessage>
                  <QuestionMarkIcon
                    onMouseEnter={this.onHover}
                    onMouseLeave={this.onHoverLeave}
                    onClick={this.handleIconClick}
                    id="Popover2"
                    iconSrc={questionMarkIcon}
                  />
                </MessageAndIconWrapper>
                <ButtonsWrapper id={"buttons-wrapper"}>
                  <NotificationButton
                    smallButton
                    onClick={() => this.handleCreateYearlyVisit(null)}
                  >
                    {userActionItemCTAText.yearlyVisitYes}
                  </NotificationButton>
                  <NotificationButton
                    smallButton
                    onClick={() => this.handleCreateYearlyVisit(noChanges)}
                  >
                    {userActionItemCTAText.yearlyVisitNo}
                  </NotificationButton>
                </ButtonsWrapper>
                <StyledPopover
                  placement="bottom-end"
                  title=""
                  target="Popover2"
                  isOpen={popoverOpen}
                  trigger="click"
                >
                  <p>
                    Give your provider the latest updates on any medical or skin changes, or new
                    skin goals.
                  </p>
                  <p>
                    <ColoredText>If no new updates to your Skin Profile are submitted </ColoredText>
                    at the next ship date, we'll provide your most recent information to your
                    medical provider.
                  </p>
                </StyledPopover>
              </NotificationContainer>
            )}

          {!showYearlyVisitRequired &&
            userActionRequired && (
              <NotificationContainer id={'user-notification-container'}>
                <NotificationMarker />
                <div>
                  <NotificationMessageTitle>{actionStatus}</NotificationMessageTitle>
                  <NotificationMessage id={"notification-message"}>{actionText}</NotificationMessage>
                </div>
                <NotificationButton onClick={e => this.goToAction(e)}>{ctaText}</NotificationButton>
              </NotificationContainer>
            )}
        </BoxContentWrapper>
      </React.Fragment>
    );
  }
}

export const UserNotificationBar = connect(
  null,
  {},
)(UserNotificationBarComponent);
