import React from 'react';
import moment from 'moment';
import styled from 'react-emotion';
import { history } from 'src/history';
import { Dropdown, DropdownMenu, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody } from 'reactstrap';
import modalCloseIcon from 'src/assets/images/closeModal.svg';
import refillIcon from 'src/assets/images/refillBlue.svg';
import shippingIcon from 'src/assets/images/shippingBlue.svg';
import trackingIcon from 'src/assets/images/trackingBlue.svg';
import pauseIcon from 'src/assets/images/pauseIcon.svg';

import { colors, breakpoints, fontSize } from 'src/variables';
import {
  BoxContainer,
  BoxHeaderWrapper,
  BoxHeader,
  BoxContentWrapper,
  BlueButton,
  PlanStatusWrapper,
  PlanStatus,
  PlanStatusIndicatorWrapper,
  PlanStatusIndicator,
} from 'src/features/dashboard/shared/styles';
import { ChangeFrequencyModal } from './ChangeFrequencyModal';

const StyledModal = styled(Modal)`
  .ant-modal-body {
    display: flex;
    flex-direction: column;
    width: fit-content;
    margin: 0 auto;
    justify-content: center;
    padding-top: 88px;
  }

  .ant-modal-content {
    margin: 0 auto;
    width: 347px;
    height: 367px;

    ${breakpoints.xs} {
      width: 90%;
    }
  }

  .ant-modal-close {
    display: none;
  }
`;

const PlanOptions = styled.div`
  display: flex;
  flex-direction: row;
  ${breakpoints.sm} {
    flex-direction: column;
  }
`;

//  width: fit-content;
const PlanOption = styled.div`
  flex: 1 0 30%;

  ${breakpoints.sm} {
    margin: 20px auto;
  }
`;

const IconBackground = styled.div`
  position: relative;
  height: 56px;
  width: 56px;
  background: ${colors.blackSqueeze};
  border-radius: 50px;
  margin-bottom: 10px;

  ${breakpoints.sm} {
    margin: 0 auto 10px;
  }
`;

const PlanIcon = styled.img`
  position: absolute;
  height: ${props => props.width};
  width: ${props => props.width};
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const OptionHeader = styled.p`
  font-size: 17px;
  line-height: 21px;
  color: ${colors.darkModerateBlue};
  margin-bottom: 5px;
  text-align: ${props => props.centered && 'center'};
 
  ${breakpoints.sm} {
    text-align: center;
  }
`;

const OptionContent = styled.p`
  font-size: 14px;
  line-height: 17px;

  ${breakpoints.sm} {
    text-align: center;
  }
`;

const OptionContentWarning = styled.p`
  font-size: 14px;
  line-height: 17px;
  color: ${colors.red};
  
  ${breakpoints.sm} {
    text-align: center;
  }
`;

const DisableShipNowReason = styled.p`
  font-size: 12px;
  line-height: 14px;
  padding: 15px 100px 0 0;
  color: ${colors.doveGray};
  font-style: italic;

  ${breakpoints.sm} {
    padding: 5px 20px;
    text-align: center;
  }
`;

const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalCloseIcon = styled.img`
  cursor: pointer;
  position: absolute;
  height: 18px;
  width: 18px;
  top: 10px;
  right: 10px;
`;

const StyledDropdown = styled(Dropdown)`
  cursor: pointer;
  margin: auto 20px;
  color: ${colors.blumine};

  ${breakpoints.sm} {
    margin: auto;
    margin-top: 30px;
    margin-bottom: 20px;
  }
`;

// Styled components does not work for Reactstrap components
const StyledDropdownToggle = {
  backgroundColor: colors.clear,
  color: colors.blumine,
  border: 'none',
  outline: 'none',
};

// Styled components does not work for Reactstrap components
const StyledDropdownItem = {
  color: colors.blumine,
  fontSize: fontSize.smallest,
};

const ButtonAndOptionWrapper = styled.div`
  display: flex;
  color: ${colors.darkModerateBlue};

  ${breakpoints.sm} {
    flex-direction: column;
    align-items: center;
  }
`;

const CancelWrapper = styled.div`
  margin: auto 30px;
  color: ${colors.blumine};

  ${breakpoints.sm} {
    margin: 30px auto;
  }
`;

const CancelContainer = styled.p`
  cursor: pointer;
  color: ${colors.blumine};
  font-size: 14px;
  line-height: 17px;

  ${breakpoints.sm} {
    margin: 0;
  }
`;

const PauseIcon = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 30px;
`;

const ModalSmallContent = styled.p`
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  margin-top: 10px;
`;

const StyledLine = styled.hr`
  display: none;

  ${breakpoints.sm} {
    display: block;
    width: 100%;
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 12.5rem;
`;

const RedirectButton = styled.p`
  cursor: pointer;
  font-size: ${fontSize.small};
  color: ${colors.veryDarkWithOpacity};
  line-height: 17px;
  margin-right: 3rem;
  text-decoration: underline;

  ${breakpoints.sm} {
    margin-right: 0;
  }
`;

const SettingsLink = styled.div`
  cursor: pointer;
  font-size: 14px;
  width: max-content;
  &:hover {
    color: ${colors.facebookBlue}
  }
  text-decoration: underline;
`

export class PlanSettingsSection extends React.Component {
  state = {
    isFrequencyModalVisible: false,
    isPauseModalVisible: false,
    isDelayDropdownOpen: false,
  };


  toggleModal = modalState => {
    this.setState(prevState => ({
      [modalState]: !prevState[modalState],
    }));
  };

  openOrderTrackingWindow = () => {
    const { order } = this.props;
    window.open(order.trackingUri);
  };

  handleShipNowClick = () => {
    const { shipNowRequest } = this.props;
    shipNowRequest();
  };

  redirectToLatestShipment = () => {
    history.push({
      pathname: '/user-dashboard/my-account',
      state: { mostRecentOrderId: this.props.order.id, activeTabId: 4 },
    });
  };

  toggleDelayDropdown = (e) => {
    e.preventDefault();

    this.setState({
      isDelayDropdownOpen: !this.state.isDelayDropdownOpen
    });
  }

  onDelayDropdownItemClicked = (e) => {
    e.preventDefault();

    if (e.currentTarget.textContent) {
      let numberPattern = /\d+/g;
      const delayDays = parseInt(e.currentTarget.textContent.match(numberPattern))
      this.props.delayShipment(delayDays);
    }
  }

  render() {
    const {
      enablePlanEdits,
      nextSubscriptionOrderShipDate,
      user,
      shipNowDisableReason,
      subscription,
      order,
      updateSubscriptionRequest,
      visit,
    } = this.props;

    const nextShipmentDate = moment.utc(nextSubscriptionOrderShipDate).local().format('LL'); //"yyyy-MM-ddTHH:mm:ss.ffffffZ"
    const shipmentFrequency = subscription.frequency;
    const isShipped = order && order.trackingUri;
    const shippingStatusText = isShipped ? 'Shipped' : 'Awaiting fulfillment';
    const frequencyModal = 'isFrequencyModalVisible';
    const pauseModal = 'isPauseModalVisible';

    const today = moment()
    const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;
    const isShipmentOverdue = moment(nextSubscriptionOrderShipDate) < today && requirePaymentDetailUpdate;
    const isShipmentPending = moment(nextSubscriptionOrderShipDate) < today && !requirePaymentDetailUpdate;

    return (
      <BoxContainer>
        <BoxHeaderWrapper>
          <BoxHeader>Plan info</BoxHeader>
          <SettingsLink onClick={this.props.showSettingsModal}>
            {"Settings"}
          </SettingsLink>
        </BoxHeaderWrapper>
        <BoxContentWrapper>
          <PlanOptions>
            <PlanOption>
              <IconBackground>
                <PlanIcon src={shippingIcon} height={'20px'} width={'21px'} />
              </IconBackground>
              <OptionHeader>Next shipment</OptionHeader>
              <Wrapper>
                {isShipmentOverdue && (
                  <OptionContentWarning>Delayed - payment overdue</OptionContentWarning>
                )}
                {isShipmentPending && (
                  <OptionContent>Preparing shipment</OptionContent>
                )}
                {!isShipmentOverdue && !isShipmentPending && (
                  <OptionContent>{nextShipmentDate}</OptionContent>
                )}
                <RedirectButton onClick={this.redirectToLatestShipment}>
                  View last shipment
                </RedirectButton>
              </Wrapper>
              <ButtonAndOptionWrapper>
                <BlueButton
                  color="secondary"
                  onClick={() => this.handleShipNowClick()}
                  disabled={!enablePlanEdits}
                >
                  Ship now
                </BlueButton>
                <StyledDropdown isOpen={this.state.isDelayDropdownOpen} toggle={this.toggleDelayDropdown}>
                  <DropdownToggle style={StyledDropdownToggle} size="sm" caret disabled={!enablePlanEdits}>
                    Delay
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem style={StyledDropdownItem} onClick={this.onDelayDropdownItemClicked}>15 days</DropdownItem>
                    <DropdownItem style={StyledDropdownItem} onClick={this.onDelayDropdownItemClicked}>30 days</DropdownItem>
                  </DropdownMenu>
                </StyledDropdown>
              </ButtonAndOptionWrapper>
              {shipNowDisableReason && (<DisableShipNowReason>Disabled: {shipNowDisableReason}</DisableShipNowReason>)}
            </PlanOption>
            <StyledLine />
            <PlanOption>
              <IconBackground>
                <PlanIcon src={trackingIcon} height={'22px'} width={'28px'} />
              </IconBackground>
              <OptionHeader>Tracking status</OptionHeader>
              <OptionContent>{shippingStatusText}</OptionContent>
              <ButtonAndOptionWrapper>
                <BlueButton
                  color="secondary"
                  onClick={this.openOrderTrackingWindow}
                  disabled={!isShipped}
                >
                  Track order
                </BlueButton>
              </ButtonAndOptionWrapper>
            </PlanOption>
            <StyledLine />
            <PlanOption>
              <IconBackground>
                <PlanIcon src={refillIcon} height={'19px'} width={'20px'} />
              </IconBackground>
              <OptionHeader>Refill</OptionHeader>
              <OptionContent>Every {shipmentFrequency} months</OptionContent>
              <ButtonAndOptionWrapper>
                <BlueButton color="secondary" onClick={() => this.toggleModal(frequencyModal)}>
                  Change frequency
                </BlueButton>
              </ButtonAndOptionWrapper>
            </PlanOption>
          </PlanOptions>
          <ChangeFrequencyModal
            isVisible={this.state.isFrequencyModalVisible}
            subscription={subscription}
            updateSubscriptionRequest={updateSubscriptionRequest}
            toggleFrequencyModal={() => this.toggleModal(frequencyModal)}
          />
          <StyledModal
            isOpen={this.state.isPauseModalVisible}
          >
            <ModalHeader>
              <ModalCloseIcon src={modalCloseIcon} onClick={() => this.toggleModal(pauseModal)} />
            </ModalHeader>
            <ModalBody>
              <CenteredContent>
                <PauseIcon src={pauseIcon} />
              </CenteredContent>
              <CenteredContent>
                <OptionHeader centered>Are you sure you want to cancel your plan?</OptionHeader>
              </CenteredContent>
              <CenteredContent>
                <ModalSmallContent>
                  Please contact our support team at <b>support@dearbrightly.com</b> to cancel your
                  plan.
                </ModalSmallContent>
              </CenteredContent>
            </ModalBody>
          </StyledModal>
        </BoxContentWrapper>
      </BoxContainer>
    );
  }
}
