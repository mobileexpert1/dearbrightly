import React from 'react';
import styled from 'react-emotion';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import cancelArrows from 'src/assets/images/cancelArrows.svg';
import {getProductNames} from "../helpers/getProductNames";
import DBDatePicker from 'src/components/DatePicker';
import { colors, breakpoints, fontFamily } from 'src/variables';
import BlackMinusIcon from 'src/assets/images/blackMinusIcon.svg';
import BlackPlusIcon from 'src/assets/images/blackPlusIcon.svg';
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import moment from 'moment';
import {
  filterDateSubscriptionsMap,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import {SubscriptionBundleNames} from "src/features/dashboard/components/AddToPlanModal";

export const StyledModal = styled(Modal)`
  .modal-body {
    display: block;
    flex-direction: column;
    width: fit-content;
    margin: 0 auto;
    justify-content: center;
    padding: 1rem 4rem 4rem 4rem;
    ${breakpoints.xs} {
      padding: 1rem;
    }
  }

  .modal-content {
    margin: 0 auto;
    max-width: 42rem;
    ${breakpoints.xs} {
      min-width: 0;
      width: 100%;
      min-height: 100%;
      padding-left: 5%;
      padding-right: 5%;
    }
  }

  .modal-close {
    display: none;
  }
`;

export const ModalCloseIcon = styled.img`
  cursor: pointer;
  position: absolute;
  height: 18px;
  width: 18px;
  top: 10px;
  right: 10px;
`;

export const ProductName = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const StyledButton = styled.button`
  min-height: 1.5rem;
  height: 2.5rem;
  max-width: 3rem;
  background-color: transparent;
  font-size: 16px;
  padding: 4px 10px;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid ${colors.veryLightBlue};
  &:before {
    -webkit-text-stroke-color: ${colors.white};
    -webkit-text-stroke-width: 2px;
  }
  &:focus { 
    box-shadow: none;
    outline: none;
  }
  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const Amount = styled.div`
  border-top: 1px solid ${colors.veryLightBlue};
  border-bottom: 1px solid ${colors.veryLightBlue};
  max-width: 3rem;
  min-height: 1.5rem;
  padding: 7px 10px;
  font-size: 15px;
  font-weight: bold;
  background-color: transparent;
  text-align: center;
`;

export const Text = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

export const SubText = styled.div`
  font-size: 12px;
`;

export const Description = styled.div`
  font-size: 11px;
  color: ${colors.summaryGreen};
`;

export const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle::after {
    position: absolute;
    left: 72%;
    top: 45%;
  }
  .dropdown-toggle:hover {
    background-color: ${colors.white};
    color: ${colors.black};
  }

  .dropdown-toggle:active {
    color: ${colors.black};
    background: ${colors.white};
    border: none;
  }

  .dropdown-toggle:focus {
    border: none;
    box-shadow: none;
  }

  .btn-secondary.dropdown-toggle:focus {
    background-color: ${colors.white};
    color: ${colors.black};
  }
  .dropdown-toggle {
    background-color: ${colors.white};
    color: ${colors.black};
    font-size: 12px;
    border: 1px solid ${colors.veryLightBlue};
    border-radius: 4px;
    padding: 0.75rem;
    outline: 'none';
    width: 80%;
    text-align: left;
  }
  .dropdown-item {
    font-size: 12px;
    text-align: left;
  }
  .dropdown-divider {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;
export const Title = styled.div`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
`
export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  ${breakpoints.xs} {
    margin: 20px auto auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    text-align: center;
  }
`;

const FixedQuantityContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
`;

const QuantityRx = styled.div`
  max-width: 3rem;
  min-height: 1.5rem;
  padding: 0;
  font-size: 15px;
  font-weight: bold;
  background-color: transparent;
  margin: auto;
`;

const styles = {
  borderBottom: 'none',
};

const buttonAbsolutePosition = {
  top: '1.5rem',
  right: '1.5rem',
  zIndex: 999
};

class EditActivePlanModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: this.props.isMobile,
      isRefillDropdownOpen: false,
      isShipmentDropdownOpen: false,
      uuid: this.props.subscription && this.props.subscription.uuid,
      isActive: this.props.subscription && this.props.subscription.isActive,
      nextShipDate: this.props.subscription && this.props.subscription.currentPeriodEndDatetime,
      frequency: this.props.subscription && this.props.subscription.frequency,
      quantity: this.props.subscription && this.props.subscription.quantity,
      subscriptionBundleOptions: this.props.subscriptionBundleOptions,
      isShipNow: false,
      selectedDropdown: ""
    };
  }

  saveSubscriptionSetting = () => {
    const { toggleEditActivePlanModal } = this.props;
    toggleEditActivePlanModal();
  };

  savePlanSettings = () => {
    const {
      updateSubscriptionRequest,
      toggleEditActivePlanModal,
    } = this.props;
    const { uuid, isActive, nextShipDate, frequency, quantity, isShipNow } = this.state;
    if (isShipNow) {
      this.shipNowRequest();
    } else {
      updateSubscriptionRequest({
        uuid: uuid,
        isActive: isActive,
        frequency: frequency,
        currentPeriodEndDatetime: nextShipDate,
        quantity: quantity,
      });
    }
    toggleEditActivePlanModal();
  };

  handleRefillDropdownToggle = () => {
    this.setState({ isRefillDropdownOpen: !this.state.isRefillDropdownOpen });
  };

  handleShipmentDropdownToggle = () => {
    this.setState({ isShipmentDropdownOpen: !this.state.isShipmentDropdownOpen });
  };
  changeAmount = value => {
    const sumValue = this.state.quantity + value;
    if (sumValue >= 1) {
      this.setState({ quantity: this.state.quantity + value });
    }
  };
  changeInterval = interval => {
    this.setState({ frequency: interval });
  };
  changeNextShipmentDate = (date, isShipNow) => {
    this.setState({ nextShipDate: date, isShipNow: !!isShipNow });
  };

  formatDate = date => {
    return moment(new Date(date)).format('MM/DD/YYYY');
  };
  calendarDate = date => {
    return new Date(date)
  }
  onDayChange = (date) => {
    this.changeNextShipmentDate(date)
  }

  shipNowRequest = () => {
    const { subscription, updateSubscriptionRequest } = this.props;

    updateSubscriptionRequest({
      uuid: subscription.uuid,
      shipNow: true,
      isActive: true,
    });
  };

  render() {
    const { toggleEditActivePlanModal, isVisible, subscription, subscriptionBundleOptions} = this.props;
    const subscriptionProductName = subscription ? subscription.productName : null;
    const subscriptionQuantity = subscription ? subscription.quantity : 1;
    const subscriptionBundles = filterDateSubscriptionsMap(subscriptionBundleOptions, subscription.currentPeriodEndDatetime)
    const isRxProduct = subscription.productType === 'Rx';

    return (
      <StyledModal isOpen={isVisible}>
        <ModalHeader style={styles}>
          <ModalCloseIcon
            src={cancelArrows}
            onClick={toggleEditActivePlanModal}
            style={buttonAbsolutePosition}
          />
        </ModalHeader>
        <ModalBody>
          <ProductName className="mb-4">{subscriptionProductName}</ProductName>
          <Text className="mb-2">Quantity</Text>

          {subscription.productType === "Rx" ? (
              <ColumnContainer className="mb-4">
                <FixedQuantityContainer>
                  <QuantityRx>{subscriptionQuantity}</QuantityRx>
                </FixedQuantityContainer>
              </ColumnContainer>
          ) : (
              <ColumnContainer className="mb-4">
                <StyledButton onClick={() => this.changeAmount(-1)}>
                  <img src={BlackMinusIcon} />
                </StyledButton>
                <Amount>{this.state.quantity}</Amount>
                <StyledButton onClick={() => this.changeAmount(1)}>
                  <img src={BlackPlusIcon} />
                </StyledButton>
              </ColumnContainer>
          )}
          <Text className="mb-2">Refill frequency</Text>
          <SubText className="mb-2">
            Refill frequency kicks in after the next shipment date.
          </SubText>
          <StyledDropdown
            isOpen={this.state.isRefillDropdownOpen}
            toggle={this.handleRefillDropdownToggle}
            className="mb-4"
          >
            <DropdownToggle caret>Every {this.state.frequency} months</DropdownToggle>
            <DropdownMenu style={{width: "80%"}} container="body">
              <DropdownItem onClick={() => this.changeInterval(2)}>Every 2 months</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => this.changeInterval(3)}>Every 3 months</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => this.changeInterval(4)}>Every 4 months</DropdownItem>
            </DropdownMenu>
          </StyledDropdown>
          <Text className="mb-2">Next shipment date</Text>
          <StyledDropdown
            isOpen={this.state.isShipmentDropdownOpen}
            toggle={this.handleShipmentDropdownToggle}
            className="mb-4"
          >
            <DropdownToggle caret>{this.formatDate(this.state.nextShipDate)}</DropdownToggle>
            <DropdownMenu style={{width: "80%"}} container="body">
              <DropdownItem
                onClick={() => {
                  this.setState(() => ({selectedDropdown: "Ship now"}))
                  this.changeNextShipmentDate(new Date())
                }
                }
              >
                Ship now
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                onClick={() =>
                  this.setState(() => ({selectedDropdown: "Select a date"}))
                }
              >
                Choose date
              </DropdownItem>
              {!isRxProduct && Object.keys(subscriptionBundles).map((key, index) => {
                console.log(key)
                return (
                  <React.Fragment>
                    <DropdownItem divider />
                    <DropdownItem
                      onClick={() => {
                        this.setState(() => ({selectedDropdown: "Bundle"}))
                        this.changeNextShipmentDate(key)}}
                    >
                      Bundle with existing order -{' '}
                      {this.formatDate(key)}
                      <SubscriptionBundleNames>{getProductNames(subscriptionBundleOptions[key])}</SubscriptionBundleNames>
                    </DropdownItem>
                  </React.Fragment>
                );
              })}
              
            </DropdownMenu>
          </StyledDropdown>
          
          {this.state.selectedDropdown === 'Select a date' && (<div className='mb-4'>
                <Title className="mb-2">Select date</Title>
                <DBDatePicker
                  initialDate={this.calendarDate(this.state.nextShipDate)}
                  todayInputLabel="Ship now"
                  showTodayInputLabel={true}
                  dayPickerInputProps={{
                    onDayChange: this.onDayChange
                  }}
                  style={{
                    width: "80%",
                    fontSize: this.state.isMobile ? 14 : 18,
                  }}
                  dayPickerProps={{
                    disabledDays: [
                      {
                        before: new Date(),
                      }]
                  }}
                />
              </div>)}
          {!isRxProduct && (
              <Description className="mb-3">
                Rx products are shipped separately.
              </Description>
          )}
          <ButtonContainer className="mb-3">
            <StandardOutlineBlueButton active={true} onClick={toggleEditActivePlanModal}>
              Cancel
            </StandardOutlineBlueButton>
            <StandardBlueButton active={true} onClick={this.savePlanSettings}>
              Save
            </StandardBlueButton>
          </ButtonContainer>
        </ModalBody>
      </StyledModal>
    );
  }
}

export default EditActivePlanModal;