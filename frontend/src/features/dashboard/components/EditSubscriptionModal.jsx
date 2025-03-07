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
  Collapse,
} from 'reactstrap';
import { ModalTitle } from 'src/features/dashboard/shared/styles';
import cancelArrows from 'src/assets/images/cancelArrows.svg';
import {getProductNames} from "../helpers/getProductNames";
import { StyledInput } from 'src/features/dashboard/shared/myAccountStyles';
import { colors, breakpoints, fontSize, mobileFirstBreakpoints, fontFamily } from 'src/variables';
import BlackMinusIcon from 'src/assets/images/blackMinusIcon.svg';
import BlackPlusIcon from 'src/assets/images/blackPlusIcon.svg';
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import listOfStates from 'src/common/helpers/listOfStates.js';
import { MessageBar } from 'src/features/dashboard/shared/components/Messages';
import { updateCustomerDataRequest } from 'src/features/customers/actions/customersActions';
import { connect } from 'react-redux';
import { updateCreditCardRequest } from 'src/features/checkout/actions/paymentActions';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { injectStripe } from 'react-stripe-elements';
import CardInfoSection from 'src/features/checkout/components/CardInfoSection';
import {
  getPaymentErrorMessage,
  isCreditCardUpdateSuccess,
  isCreditCardUpdating,
} from 'src/features/checkout/selectors/paymentSelectors';
import { getUser } from 'src/features/user/selectors/userSelectors';
import { CustomSpinner } from 'src/common/components/CustomSpinner';
import {
  filterDateSubscriptionsMap,
  getSubscriptionsErrorMessage
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { 
  clearSubscriptionErrorMessage,
  updateSubscriptionsRequest,
  updateShippingDetailsRequest,
} from 'src/features/subscriptions/actions/subscriptionsActions';
import moment from 'moment';
import {addDays} from "src/common/helpers/formatTimestamp";
import {SubscriptionBundleNames} from "src/features/dashboard/components/AddToPlanModal";
import { isSubscriptionUpdateSuccess, updateShippingDetailsError } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { getUpdateAccountDetailsErrorMessage } from "src/features/user/selectors/userSelectors";
import { clearPaymentErrorMessage } from 'src/features/checkout/actions/paymentActions';
import { clearUserError } from 'src/features/user/actions/userActions';

const STRIPE_KEY = getEnvValue('STRIPE_KEY_PUBLISHABLE');
const stripeCardInfoSection = React.createRef();
const CreditCardSection = injectStripe(
  React.forwardRef((props, ref) => {
    return (
      <CardInfoSection
        colStyle={{ paddingLeft: 0, paddingRight: 0 }}
        onCardInfoChange={props.onCardInfoChange}
        isUpdatePayment={true}
        fontSize={14}
      />
    );
  }),
);


const ErrorMessage = styled('p')`
  color: ${colors.red};
  padding: 5px 0;
`;

const StyledModal = styled(Modal)`
  .modal-body {
    display: block;
    flex-direction: column;
    width: fit-content;
    margin: 0 auto;
    justify-content: center;
    padding: 0 3rem;
    ${breakpoints.xs} {
      padding: 1rem;
    }
  }

  .modal-content {
    margin: 0 auto;
    max-width: 42rem;
    min-width: 37.5rem;
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

const StyledModalTitle = styled(ModalTitle)`
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
`;

const ModalCloseIcon = styled.img`
  cursor: pointer;
  position: absolute;
  height: 18px;
  width: 18px;
  top: 10px;
  right: 10px;
  z-index: 999;
`;

const Subtitle = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: ${colors.facebookBlue};
`;

const SectionSubtitle = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SingleProductName = styled.div`
  font-size: 16px;
  color: ${colors.facebookBlue};
`;

const Column = styled.div``;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const FixedQuantityContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
`;

const StyledButton = styled.button`
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
const AmountRx = styled.div`
max-width: 3rem;
min-height: 1.5rem;
padding: 0;
font-size: 15px;
font-weight: bold;
background-color: transparent;
margin: auto;
`;
const Amount = styled.div`
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

const Quantity = styled.div`
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 0 20px;
`;

const BreakLine = styled.div`
  height: 1px;
  border-bottom: 1px solid ${colors.darkModerateBlue};
`;

const GreyBreakLine = styled.div`
  height: 1px;
  border-bottom: 1px solid ${colors.grey};
`;

const PaymentInput = styled.div`
  margin-left: 1rem;
  margin-right: 1rem;
  ${breakpoints.xs} {
    margin: 0;
  }
`;

const CreditCardIcon = styled.img`
  max-height: 1.5rem;
  padding: 2px;
`;

const Description = styled.div`
  font-size: 11px;
  color: ${colors.summaryGreen};
`;

const ShippingAddressContainer = styled.div`
  background: ${colors.snow};
  border-radius: 5px;
  padding: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 12px;
`;

const ShippingAddressColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle::after {
    margin-left: 14rem;
    ${breakpoints.xs} {
      margin-left: 3.5rem;
    }
  }
  .dropdown-toggle:hover {
    background-color: ${colors.white};
    color: ${colors.black};
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
  }
  .dropdown-item {
    font-size: 12px;
    text-align: left;
  }
`;

const StyledDropdownMenu = styled(DropdownMenu)`
    width: 65%;
    ${breakpoints.xs} {
      width: 10%;
      min-width: 10%;
    }
`;

const ButtonContainer = styled.div`
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

const EditButton = styled.button`
  background: none;
  border: none;
  font-family: ${fontFamily.baseFont};
  text-decoration: underline;
  font-size: 13px;

  &:focus {
    outline: none;
  }
`;

const StyledSelect = styled.select`
  border: 1px solid ${colors.darkModerateBlueOpacity};
  border-radius: 4px;
  height: 3rem;

  :focus {
    border: 0.5px solid ${colors.sharkOpacity};
  }
`;

const styles = {
  borderBottom: 'none',
};

const buttonAbsolutePosition = {
  top: '1.5rem',
  right: '1.5rem',
};
const editSubDropdown = {
  fontFamily: fontFamily.baseFont
}

class EditSubscriptionModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggleCollapse = this.handleToggleCollapse.bind(this);
    this.updateCardInfo = this.updateCardInfo.bind(this);
    this.state = {
      isDropdownOpen: false,
      isExpanded: true,
      collapse: false,
      nextShipDate: this.props.shipDate,
      quantities:
        this.props.subscriptions &&
        this.props.subscriptions.reduce(
          (q, p) => ({ ...q, [p.uuid]: p.quantity }),
          {},
        ),
      isShipNow: false,
      id: this.props.user && this.props.user.id,
      shippingDetails: this.getShippingDetails(),
      cardEntry: null,
      errorMessage: '',
      isRequestPending: false,
      successMessage: '',
    };
  }

  componentDidUpdate(prevProps) {
    const { isCreditCardUpdateSuccess, toggleSubscriptionModal } = this.props;

    if (!prevProps.isCreditCardUpdateSuccess && isCreditCardUpdateSuccess) {
      toggleSubscriptionModal();    
    }
  }

  componentWillUnmount() {
    const {
      clearPaymentErrorMessage,
      clearUserError,
      clearSubscriptionErrorMessage,
      paymentErrorMessage,
      updateAccountDetailsErrorMessage,
      subscriptionsErrorMessage
    } = this.props;

    if (paymentErrorMessage) {
      clearPaymentErrorMessage();
    };

    if (updateAccountDetailsErrorMessage) {
      clearUserError();
    };

    if (subscriptionsErrorMessage) {
      clearSubscriptionErrorMessage();
    };
  }

  handleToggleCollapse = () => {
    this.setState({ collapse: !this.state.collapse });
  };

  handleToggle = () => {
    this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
  };

  handleExpand = () => {
    thi.setState({ isExpanded: !this.state.isExpanded });
  };

  handleQuantityChange = (id, quantity) => {
    this.setState({
      quantities: { ...this.state.quantities, [id]: this.state.quantities[id] + quantity },
    });
  };

  updateShippingDetails = () => {
    const { 
      updateShippingDetailsRequest,
      updateCustomerDataRequest,
      subscriptions,
      user
    } = this.props;
    const { id, shippingDetails } = this.state;
    if (shippingDetails && user && user.id && this.hasShippingDetailsDataChanged()){
      if (subscriptions[0].shippingDetails){
        let updatedShippingDetails = subscriptions[0].shippingDetails;
        Object.keys(shippingDetails).forEach(key => {
          if (updatedShippingDetails.hasOwnProperty(key)) {
            updatedShippingDetails[key] = shippingDetails[key];
          }
        });
        const data = {
          "id": updatedShippingDetails.id,
          "customerId": user.id,
          "shippingDetails": updatedShippingDetails,
          "subscriptions": subscriptions,
        };
        return updateShippingDetailsRequest({ data });
      } else {
        const payload = {
          id,
          shippingDetails,
        }
        return updateCustomerDataRequest(payload);
      }
    }
  };

  updatePlan = () => {
    const { shipDate, subscriptions, updateSubscriptionsRequest } = this.props;
    const { quantities, nextShipDate } = this.state;

    let requestPayload = [];
    Object.entries(quantities).map(async ([uuid, quantity]) => {
      let subscriptionPayload = {};
      const originalSubscription = subscriptions.find(subscription => subscription.uuid === uuid);

      const shipDateFormatted = this.formatDate(shipDate);
      const nextShipDateFormatted = this.formatDate(nextShipDate);
      if (shipDateFormatted != nextShipDateFormatted) {
        subscriptionPayload['currentPeriodEndDatetime'] = nextShipDate;
      }

      if (originalSubscription.quantity != quantity) {
        subscriptionPayload['quantity'] = quantity;
      }

      if (Object.keys(subscriptionPayload).length > 0) {
        subscriptionPayload['uuid'] = uuid;
        requestPayload.push(subscriptionPayload);
      }
    });

    if (requestPayload.length > 0) {
      return updateSubscriptionsRequest(requestPayload);
    }
  };

  changeNextShipmentDate = (date) => {
    this.setState({
      nextShipDate: date,
    });
  };

  changeDelayInDays = days => {
    const { nextShipDate } = this.state;

    const updatedShipDate = addDays(
        nextShipDate,
        days,
    );

    this.setState({
      nextShipDate: updatedShipDate,
    });
  };

  getShippingDetails = () => {
    const { shippingDetails } = this.props;
    return {
      addressLine1: shippingDetails ? shippingDetails.addressLine1 : '',
      addressLine2: shippingDetails ? shippingDetails.addressLine2 : '',
      city: shippingDetails ? shippingDetails.city : '',
      state: shippingDetails ? shippingDetails.state : '',
      postalCode: shippingDetails ? shippingDetails.postalCode : '', 
    };
  }

  hasShippingDetailsDataChanged = () => {
    const { shippingDetails } = this.state;
    const originalShippingDetails = this.getShippingDetails();
    for (const key in shippingDetails){
      if(originalShippingDetails.hasOwnProperty(key)){
        if(shippingDetails[key] !== originalShippingDetails[key]){
          return true;
        }
      }
    }
    return false;
  }

  onSave = async event => {
    event.preventDefault();
    const { cardEntry } = this.state;
    const requests = [
      this.updatePlan(),
      this.updateShippingDetails(),
    ];
    try {
      if (cardEntry && cardEntry.complete) {
        requests.push(this.updateCardInfo());
      }
      await Promise.all([...requests]);
    } catch (error) {
      console.log(error)
      const errorMsg = error.body ? error.body.detail : 'Unable to update credit card details.';
      this.setState({ errorMessage: errorMsg });
    }
  };

  onCardInfoChange = value => {
    this.setState({ cardEntry: value });
  };

  updateCardInfo = async () => {
    const { updateCreditCardRequest, userState, subscriptions } = this.props;
      return await stripeCardInfoSection.current.state.stripe.createToken()
      .then( res => updateCreditCardRequest(userState && userState.user, res.token.id, subscriptions))
      // if(paymentErrorMessage) {
      //   this.setState({ errorMessage: paymentErrorMessage });
      //   throw new Error("error thrown")
      // }
    
      //   const errorMsg = result.error ? result.error.message : 'Invalid input';
      //   console.log(errorMsg)
      //   this.setState({ errorMessage: errorMsg });
      // })
  };

  formatDate = date => {
    return moment(new Date(date)).format('MM/DD/YYYY');
  };

  render() {
    const {
      toggleSubscriptionModal,
      isVisible,
      subscriptions,
      subscriptionBundleOptions,
      updateAccountDetailsErrorMessage,
      subscriptionsErrorMessage,
      paymentErrorMessage,
      updateShippingDetailsError,
    } = this.props;
    const {
      isRequestPending,
    } = this.state;
    const {
      addressLine1,
      addressLine2,
      city,
      postalCode,
      state
    } = this.state.shippingDetails;

    const states = listOfStates();
    const containsOtcProduct = subscriptions.filter(subscription => subscription.productType == 'OTC').length > 0;
    const subscriptionBundles = subscriptionBundleOptions && filterDateSubscriptionsMap(subscriptionBundleOptions, this.props.shipDate)
    const shippingDetailsUpdateError = updateAccountDetailsErrorMessage || updateShippingDetailsError || null;

    return (
      <StyledModal isOpen={isVisible}>
        {paymentErrorMessage && <MessageBar isErrorMessage messageContent={paymentErrorMessage} />}
        <ModalHeader style={styles}>
          <ModalCloseIcon
            src={cancelArrows}
            onClick={toggleSubscriptionModal}
            style={buttonAbsolutePosition}
          />
        </ModalHeader>
        <ModalBody>
          <StyledModalTitle>Edit upcoming order</StyledModalTitle>
          <Subtitle className="mb-3">
            Updated shipment and payment method will be applied to all upcoming orders.{' '}
          </Subtitle>
          <SectionTitle className="mb-3">Products</SectionTitle>
          <form onSubmit={this.onSave}>
            <CustomSpinner spinning={isRequestPending} blur={true} animate={true}>
              <BreakLine className="mb-3" />
              {subscriptions &&
                subscriptions.map(subscription => {
                  return (
                    <React.Fragment>
                      <ProductsContainer key={subscription.uuid} className="mb-3">
                        <Column style={{alignSelf: 'center'}}>
                          <SingleProductName>{subscription.productName}</SingleProductName>
                        </Column>
                        {subscription.productType === "Rx" ? (<Column>
                          <FixedQuantityContainer>
                            <Quantity className="mb-1">Quantity</Quantity>
                            <AmountRx>{this.state.quantities[subscription.uuid]}</AmountRx>
                          </FixedQuantityContainer>
                        </Column>) : (<Column>
                          <Quantity className="mb-1">Quantity</Quantity>
                          <ColumnContainer>
                            <StyledButton
                              onClick={() => this.handleQuantityChange(subscription.uuid, -1)}
                              type="button"
                            >
                              <img src={BlackMinusIcon} />
                            </StyledButton>
                            <Amount>{this.state.quantities[subscription.uuid]}</Amount>
                            <StyledButton
                              onClick={() => this.handleQuantityChange(subscription.uuid, 1)}
                              type="button"
                            >
                              <img src={BlackPlusIcon} />
                            </StyledButton>
                          </ColumnContainer>
                        </Column>)}
                      </ProductsContainer>
                       { subscriptionsErrorMessage && <ErrorMessage> { subscriptionsErrorMessage } </ErrorMessage> }
                      <GreyBreakLine className="mb-3" />
                    </React.Fragment>
                  );
                })}
              <SectionTitle className="mb-3">Payment and shipping</SectionTitle>
              <BreakLine className="mb-3" />
              <SectionSubtitle className="mb-2">Payment method</SectionSubtitle>
              <React.Fragment>
                <PaymentInput>
                  <StripeProvider apiKey={STRIPE_KEY}>
                    <Elements>
                      <CreditCardSection
                        ref={stripeCardInfoSection}
                        setErrorMessage={msg => this.setState({ errorMessage: msg })}
                        onCardInfoChange={this.onCardInfoChange}
                        {...this.props}
                      />
                    </Elements>
                  </StripeProvider>
                  { paymentErrorMessage && <ErrorMessage>{ paymentErrorMessage }</ErrorMessage> }
                </PaymentInput>
              </React.Fragment>
              <SectionSubtitle className="mb-2">Shipping date</SectionSubtitle>
              <StyledDropdown
                isOpen={this.state.isDropdownOpen}
                toggle={this.handleToggle}
                className="mb-4"
              >
                <DropdownToggle caret>
                  {this.formatDate(this.state.nextShipDate)}
                </DropdownToggle>
                <StyledDropdownMenu size={"300px"} container="body">
                  <DropdownItem onClick={() => this.changeNextShipmentDate(new Date())}>
                    Ship now
                  </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => this.changeDelayInDays(15)}>
                      Delay 15 days
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => this.changeDelayInDays(30)}>
                      Delay 30 days
                    </DropdownItem>
                  {containsOtcProduct && subscriptionBundles && Object.keys(subscriptionBundles).map((key, index) => {
                    return (
                      <React.Fragment>
                        <DropdownItem divider />
                        <DropdownItem
                          onClick={() =>
                            this.changeNextShipmentDate(
                              key
                            )
                          }
                        >
                          Bundle with existing order - {' '}
                          {this.formatDate(key)}
                          <SubscriptionBundleNames>{getProductNames(subscriptionBundleOptions[key])}</SubscriptionBundleNames>
                        </DropdownItem>
                      </React.Fragment>
                    );
                  })}
                </StyledDropdownMenu>
              </StyledDropdown>
              {containsOtcProduct && (
                  <Description className="mb-3">
                    Rx products are shipped separately.
                  </Description>
              )}
              <SectionSubtitle className="mb-2">Shipping address</SectionSubtitle>
              <ShippingAddressContainer className="mb-3">
                <ShippingAddressColumn>
                  <Column>
                    {addressLine2 ? `${addressLine1} ${addressLine2}` : `${addressLine1}`}
                  </Column>
                  <Column>
                    {city} {state}, {postalCode}{' '}
                  </Column>
                </ShippingAddressColumn>
                <Column>
                  <EditButton onClick={this.handleToggleCollapse} type="button">
                    Edit
                  </EditButton>
                </Column>
              </ShippingAddressContainer>
              <Collapse isOpen={this.state.collapse} className="mb-3">
                <SectionSubtitle className="mb-2">Address Line 1</SectionSubtitle>
                <StyledInput
                  required
                  className="mb-2"
                  title="Address Line 1"
                  name="Address Line 1"
                  type="text"
                  value={addressLine1}
                  onChange={e => this.setState({ shippingDetails: {...this.state.shippingDetails, addressLine1: e.target.value }})}
                />
                <SectionSubtitle className="mb-2">Address Line 2</SectionSubtitle>
                <StyledInput
                  className="mb-2"
                  title="Address Line 2"
                  name="Address Line 2"
                  type="text"
                  value={addressLine2}
                  onChange={e => this.setState({ shippingDetails: {...this.state.shippingDetails, addressLine2: e.target.value }})}
                />
                <SectionSubtitle className="mb-2">City</SectionSubtitle>
                <StyledInput
                  required
                  className="mb-2"
                  title="City"
                  name="City"
                  type="text"
                  value={city}
                  onChange={e => this.setState({ shippingDetails: {...this.state.shippingDetails, city: e.target.value }})}
                />
                <SectionSubtitle className="mb-2">State</SectionSubtitle>
                <StyledSelect
                  required
                  title="State"
                  name="state"
                  value={state}
                  optionItems={listOfStates()}
                  className="mb-2"
                  onChange={e => this.setState({ shippingDetails: {...this.state.shippingDetails, state: e.target.value }})}
                >
                  {states.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.name}
                    </option>
                  ))}
                </StyledSelect>
                <SectionSubtitle className="mb-2">Zip Code</SectionSubtitle>
                <StyledInput
                  required
                  pattern="\d{5}"
                  className="mb-2"
                  title="zip code"
                  name="zip code"
                  type="text"
                  value={postalCode}
                  onChange={e => this.setState({ shippingDetails: {...this.state.shippingDetails, postalCode: e.target.value }})}
                />
              </Collapse>
               { shippingDetailsUpdateError && <ErrorMessage> { shippingDetailsUpdateError } </ErrorMessage> }
              <ButtonContainer className="mb-3">
                <StandardOutlineBlueButton
                  active={true}
                  onClick={toggleSubscriptionModal}
                  type="button"
                >
                  Cancel
                </StandardOutlineBlueButton>
                <StandardBlueButton active={true} type="submit">
                  Save
                </StandardBlueButton>
              </ButtonContainer>
            </CustomSpinner>
          </form>
        </ModalBody>
      </StyledModal>
    );
  }
}

export default connect(
  state => ({
    isCreditCardUpdateSuccess: isCreditCardUpdateSuccess(state),
    isCreditCardUpdating: isCreditCardUpdating(state),
    userState: getUser(state),
    isSubscriptionUpdateSuccess: isSubscriptionUpdateSuccess(state),
    paymentErrorMessage: getPaymentErrorMessage(state),
    subscriptionsErrorMessage: getSubscriptionsErrorMessage(state),
    updateAccountDetailsErrorMessage: getUpdateAccountDetailsErrorMessage(state),
    updateShippingDetailsError: updateShippingDetailsError(state),
  }),
  {
    clearPaymentErrorMessage,
    clearSubscriptionErrorMessage,
    clearUserError,
    updateCustomerDataRequest,
    updateCreditCardRequest,
    updateSubscriptionsRequest,
    updateShippingDetailsRequest,
  },
)(EditSubscriptionModal);
