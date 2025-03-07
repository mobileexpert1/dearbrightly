import React from 'react';
import {
  ModalHeader,
  ModalBody,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import cancelArrows from 'src/assets/images/cancelArrows.svg';
import {getProductNames} from "../helpers/getProductNames";
import DBDatePicker from 'src/components/DatePicker';
import { Title } from './EditActivePlanModal';
import BlackMinusIcon from 'src/assets/images/blackMinusIcon.svg';
import BlackPlusIcon from 'src/assets/images/blackPlusIcon.svg';
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import moment from 'moment';
import {
  StyledModal,
  ModalCloseIcon,
  ProductName,
  ColumnContainer,
  StyledButton,
  Amount,
  Text,
  SubText,
  Description,
  StyledDropdown,
  ButtonContainer,
} from 'src/features/dashboard/components/EditActivePlanModal';
import styled from "react-emotion";
import {colors} from "src/variables";


const buttonAbsolutePosition = {
  top: '1.5rem',
  right: '1.5rem',
  zIndex: 999
};

export const SubscriptionBundleNames = styled.div`
  font-size: 9px;
  color: ${colors.facebookBlue};
`;

const DropdownMenuStyled = styled(DropdownMenu)`
  width: 80%;
`
class AddToPlanModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: this.props.isMobile,
      isRefillDropdownOpen: false,
      isShipmentDropdownOpen: false,
      quantity: 1,
      frequency: 3,
      nextShipDate: moment(),
    };
  }

  savePlanSettings = () => {
    const { updateOrCreateSubscriptionRequest, toggleAddToPlanModal, user } = this.props;
    const { nextShipDate, frequency, quantity } = this.state;
    const requestPayload = {
      customerUuid: user.id,
      productUuid: this.props.recommendedProduct.id,
      frequency,
      currentPeriodEndDatetime: nextShipDate,
      quantity,
      isActive: true
    };

    updateOrCreateSubscriptionRequest(requestPayload);
    toggleAddToPlanModal();
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

  changeNextShipmentDate = (date) => {
    this.setState({ nextShipDate: date});
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

  render() {
    const { toggleAddToPlanModal, isVisible, recommendedProduct } = this.props;
    const recommendedProductName = recommendedProduct ? recommendedProduct.name : null;
    const isRxProduct = recommendedProduct.productType === 'Rx';

    return (
      <StyledModal isOpen={isVisible}>
        <ModalHeader style={{ borderBottom: 'none' }}>
          <ModalCloseIcon
            src={cancelArrows}
            onClick={toggleAddToPlanModal}
            style={buttonAbsolutePosition}
          />
        </ModalHeader>
        <ModalBody>
          <ProductName className="mb-4">{recommendedProductName}</ProductName>
          {recommendedProduct.productType !== 'Rx' && (
              <div>
                <Text className="mb-2">Quantity</Text>
                <ColumnContainer className="mb-4">
                  <StyledButton onClick={() => this.changeAmount(-1)}>
                    <img src={BlackMinusIcon} />
                  </StyledButton>
                  <Amount>{this.state.quantity}</Amount>
                  <StyledButton onClick={() => this.changeAmount(1)}>
                    <img src={BlackPlusIcon} />
                  </StyledButton>
                </ColumnContainer>
              </div>
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
            <DropdownMenuStyled container="body">
              <DropdownItem onClick={() => this.changeInterval(2)}>Every 2 months</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => this.changeInterval(3)}>Every 3 months</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => this.changeInterval(4)}>Every 4 months</DropdownItem>
            </DropdownMenuStyled>
          </StyledDropdown>
          <Text className="mb-2">Next shipment date</Text>
          <StyledDropdown
            isOpen={this.state.isShipmentDropdownOpen}
            toggle={this.handleShipmentDropdownToggle}
            className="mb-4"
          >
            <DropdownToggle caret>{this.formatDate(this.state.nextShipDate)}</DropdownToggle>
            <DropdownMenuStyled container="body">
              <DropdownItem onClick={() => {
                        this.setState(() => ({selectedDropdown: "Ship now"}))
                        this.changeNextShipmentDate(new Date())}}>
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
              {!isRxProduct && Object.keys(this.props.subscriptionBundleOptions).map((key, index) => {
                return (
                  <React.Fragment>
                    <DropdownItem divider />
                    <DropdownItem
                      onClick={() =>{
                        this.setState(() => ({selectedDropdown: "Bundle"}))
                        this.changeNextShipmentDate(key)
                      }}
                    >
                      Bundle with existing order - {' '}
                      {this.formatDate(key)}
                      <SubscriptionBundleNames>{getProductNames(this.props.subscriptionBundleOptions[key])}</SubscriptionBundleNames>
                    </DropdownItem>
                  </React.Fragment>
                );
              })}
            </DropdownMenuStyled>
          </StyledDropdown>
          {this.state.selectedDropdown === 'Select a date' && (<div>
                <Title className="mb-2">Select date</Title>
                <DBDatePicker
                  initialDate={this.calendarDate(this.state.nextShipDate)}
                  todayInputLabel="Ship now"
                  className="mb-4"
                  showTodayInputLabel={true}
                  dayPickerInputProps={{
                    onDayChange: this.onDayChange
                  }}
                  style={{
                    width: "80%",
                    fontSize: 12,
                    marginBottom: '1.5rem',
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
            <StandardOutlineBlueButton active={true} onClick={toggleAddToPlanModal}>
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
export default AddToPlanModal;
