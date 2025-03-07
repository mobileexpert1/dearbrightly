import React from 'react';
import styled from 'react-emotion';
import {connect} from 'react-redux';
import {Popover} from 'reactstrap';

import notificationIcon from 'src/assets/images/notificationBell.svg';
import notificationPlainIcon from 'src/assets/images/notificationIcon.svg';
import exclamationMark from 'src/assets/images/exclamationMark.svg';

import {history} from 'src/history';
import {
  displayUserNotification,
  getUserSkinProfileAction,
  isUserSkinProfileActionRequired,
  requireYearlyMedicalVisitUpdate,
  isVisitPhotoIdRejected,
  isVisitPhotosRejected,
  isUserPendingCheckout,
} from 'src/features/dashboard/helpers/userStatuses';
import {breakpoints, colors, fontSize} from 'src/variables';
import {
  userActionItemCTAText,
  userActionItemText,
  userYearlyVisitNoChanges,
} from 'src/features/dashboard/constants/userActionItemText';
import {getOrder} from 'src/features/orders/selectors/orderSelectors';
import {hasUnreadMessages} from 'src/features/user/selectors/userSelectors';
import {isOrderPendingPayment} from 'src/features/orders/helpers/orderStatuses';


const IconWrapper = styled.div`
  margin: 0;
  padding-left: ${props => (props.isUserDashboardView ? '1rem' : '0')};
  cursor: pointer;
  display: inline-block;
  ${breakpoints.md} {
    margin-right: 10px;
  }
`;

const StyledPopover = styled(Popover)`
  min-width: 341px;
  top: 32px !important;
  div:nth-child(n + 2) {
    border-top: 1px solid rgba(0, 0, 0, 0.2);
  }
`;

const NotificationWrapper = styled.div`
  display: flex;
  padding: 20px;
`;

const NotificationIcon = styled.svg`
  background-image:  url('${props => props.iconSrc}') ;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
`;

const NotificationMessageWrapper = styled.span`
  display: flex;
  flex-direction: column;
`;

const NotificationDotContainer = styled.div`
  display: flex;
  vertical-align: middle;
`;

const NotificationDot = styled.div`
  text-align: center;
  margin-left: 2px;
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background-color: ${colors.mulberry};
`;

const ExclamationMarkIcon = styled.svg`
  background-image:  url('${props => props.iconSrc}') ;
  width: 32px;
  height: 20px;
  background-repeat: no-repeat;
  padding-right: 20px;
`;

const NotificationMessage = styled.p`
  padding: 3px;
`;

const ActionButton = styled.button`
  cursor: pointer;
  min-width: 100px;
  height: 40px;
  background: ${colors.blumine};
  color: ${colors.white};
  border-radius: 4px;
  font-size: ${fontSize.small};
  line-height: 17px;
  font-weight: 600;
  border: none;
  width: fit-content;
  padding-left: 16px;
  padding-right: 16px;

  :hover {
    background: ${colors.blumineLight};
  }
`;

const ButtonsWrapper = styled.span`
  padding-right: 3px;
`;

const NotificationButton = styled.button`
  cursor: pointer;
  width: ${props => (props.smallButton ? '69px' : '165px')};
  height: 40px;
  background: ${colors.mulberryOpacity};
  border-radius: 4px;
  margin: ${props => (props.smallButton ? '6px 3px' : '6px 10px')};
  border: none;
  color: ${colors.mulberry};

  ${breakpoints.sm} {
    margin-left: ${props => !props.smallButton && '32px'};
  }

  :hover {
    background: ${colors.mulberry};
    color: ${colors.clear};
  }
`;

const ButtonText = styled.span`
  font-weight: 600;
  font-size: ${fontSize.small};
`;

const NotificationBubbleMobile = styled.div`
  display: block;
  @media (min-width: 280px) and (max-width: 992px) {
    display: none;
  }
`

class UserNotificationsContainer extends React.Component {
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


  toggle = () => {
    this.setState(previousState => ({
      popoverOpen: !previousState.popoverOpen,
    }));
  }

  handleCreateYearlyVisit = noChanges => {
    const path = noChanges ? '/welcome-back' : '/update-skin-profile';
    history.push(path);
  };

  goToAccountDetailsPayment = () => {
    this.goToPage(`/user-dashboard/my-account`, 'Action button', 3);
  }

  goToMessages = () => {
    this.goToPage(`/user-dashboard/messages`,'Action button');
  }

  goToReturningUserSkinProfile = () => {
    this.goToPage(
      '/user-dashboard/skin-profile',
      'Action button',
    )
  }

  goToEditPhotos = () => {
    this.goToPage(
      '/user-dashboard/edit-photos',
      'Action button',
    );
  };

  goToAction = (e) => {
    e.preventDefault();

    const { navigateOrderCheckout, pendingCheckoutOrder, user, visit, userHasUnreadMessages } = this.props;
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
    } else if (userHasUnreadMessages) {
      this.goToMessages();
    }
  }

  render() {
    const { visit, user, pendingCheckoutOrder, rxSubscription, isUserDashboardView, userHasUnreadMessages } = this.props;
    const { popoverOpen } = this.state;
    const userSkinProfileAction = getUserSkinProfileAction(user, visit);
    const userSkinProfileActionText = userSkinProfileAction.actionText;
    const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit);
    const isPendingCheckoutPayment = isOrderPendingPayment(pendingCheckoutOrder);
    const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;
    const isRxSubscriptionActive = rxSubscription ? rxSubscription.isActive : false;
    const userPendingCheckout = isUserPendingCheckout(pendingCheckoutOrder, visit);

    let ctaText = '';
    let actionText = '';

    if (userPendingCheckout) {
      if (isPendingCheckoutPayment) {
        ctaText = userActionItemCTAText.updatePayment;
        actionText = userActionItemText.updatePaymentDetails;
      } else {
        ctaText = userSkinProfileAction.ctaText;
        actionText = userSkinProfileAction.actionText;
      }
    } else if (userSkinProfileActionRequired) {
      ctaText = userSkinProfileAction.ctaText;
      actionText = userSkinProfileAction.actionText;
    } else if (requirePaymentDetailUpdate) {
      ctaText = userActionItemCTAText.updatePayment;
      actionText = userActionItemText.updatePaymentDetails;
    } else if (userHasUnreadMessages) {
      ctaText = userActionItemText.newMessageFromProvider;
      actionText = userActionItemCTAText.checkMessages;
    }

    const showYearlyVisitRequired = requireYearlyMedicalVisitUpdate(rxSubscription, visit);
    const noChanges = userYearlyVisitNoChanges;
    const displayNotification = displayUserNotification(user, visit, rxSubscription, pendingCheckoutOrder);

    return (
      <IconWrapper isUserDashboardView={isUserDashboardView} onMouseEnter={this.onHover} onMouseLeave={this.onHoverLeave} id="Popover1" style={{background: "white"}}>
        {isUserDashboardView && (<NotificationIcon iconSrc={displayNotification ? notificationIcon : notificationPlainIcon} />)}
        {(!isUserDashboardView && displayNotification) ? (<NotificationDotContainer>{this.props.children ? this.props.children : null}<NotificationDot /></NotificationDotContainer>) : ((!isUserDashboardView) ? <NotificationBubbleMobile>Account</NotificationBubbleMobile> : null)}
        {displayNotification && (
          <StyledPopover
            toggle={this.toggle}
            placement="bottom-end"
            title=""
            target="Popover1"
            isOpen={popoverOpen}
            delay={{ show: 200, hide: 1000 }}
            trigger="hover focus"
          >
            {showYearlyVisitRequired && isRxSubscriptionActive && (
              <NotificationWrapper>
                <ExclamationMarkIcon iconSrc={exclamationMark} />
                <NotificationMessageWrapper id={"notification-message-wrapper"}>
                  <NotificationMessage id={"notification-message"}>{userSkinProfileActionText}</NotificationMessage>
                  <ButtonsWrapper id={"buttons-wrapper"}>
                    <NotificationButton smallButton onClick={() => this.handleCreateYearlyVisit()}>
                      <ButtonText>{userActionItemCTAText.yearlyVisitYes}</ButtonText>
                    </NotificationButton>
                    <NotificationButton
                      smallButton
                      onClick={() => this.handleCreateYearlyVisit(noChanges)}
                    >
                      <ButtonText>{userActionItemCTAText.yearlyVisitNo}</ButtonText>
                    </NotificationButton>
                  </ButtonsWrapper>
                </NotificationMessageWrapper>
              </NotificationWrapper>
            )}

            {!showYearlyVisitRequired && (
              <NotificationWrapper>
                <ExclamationMarkIcon iconSrc={exclamationMark} />
                <NotificationMessageWrapper>
                  <NotificationMessage>
                    {actionText}
                  </NotificationMessage>
                  <ActionButton onClick={
                    e => this.goToAction(e)
                  }>
                    {ctaText}
                  </ActionButton>
                </NotificationMessageWrapper>
              </NotificationWrapper>
            )}

          </StyledPopover>
        )}
      </IconWrapper>
    );
  }
}

const mapStateToProps = state => ({
  pendingCheckoutOrder: getOrder(state),
  userHasUnreadMessages: hasUnreadMessages(state),
});

export const UserNotifications = connect(
  mapStateToProps,
  {},
)(UserNotificationsContainer);
