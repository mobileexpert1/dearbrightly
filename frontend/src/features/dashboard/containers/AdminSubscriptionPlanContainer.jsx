import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import styled from 'react-emotion';
import {Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import _ from 'lodash';

import {history} from 'src/history';
import {
  fetchSubscriptionsRequest,
  updateSubscriptionRequest,
} from 'src/features/subscriptions/actions/subscriptionsActions';
import {getAllProducts} from 'src/features/products/selectors/productsSelectors';
import {ShippingInfo} from 'src/features/checkout/components/ShippingInfo';
import {CartSummary} from 'src/features/checkout/components/CartSummary';
import {
  getMostRecentRxSubscription,
  getSubscriptionsErrorMessage,
  isFetchingSubscriptions,
  isSubscriptionFetchSuccess,
  isSubscriptionUpdateSuccess,
  isUpdatingSubscription,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {redirectToUrl} from 'src/common/actions/navigationActions';
import {getOrderTotal} from 'src/common/helpers/getOrderTotal';
import {
  daysDifference,
  formatShortTimestampDate,
  formatTimestampDateWithDaysDelta,
  formatTimestampDateWithMonthDelta,
} from 'src/common/helpers/formatTimestamp';
import {CANCEL_REASONS, FREQUENCY_OPTIONS} from 'src/common/constants/subscriptions';

import {getPendingVisitRequest} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {getMostRecentMedicalVisit} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {CustomSpinner} from "src/common/components/CustomSpinner";
import { updateOrderRequest } from 'src/features/orders/actions/ordersActions';
import { fontFamily, fontWeight } from 'src/variables';

const CartSummaryContainer = styled('div')`
  width: 325px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ShipDatePickerContainer = styled('div')`
  width: 325px;
  padding: 20px;
  border: 1px solid #000000;
  margin-bottom: 20px;
`;

const Settings = styled('div')`
  padding: 20px 0;
`;

const SaveButton = styled('button')`
  font-size: 18px;
  background: #000;
  color: #fff;
  text-transform: uppercase;
  margin-top: 20px;
  margin-bottom: 5px;
  padding: 0.5em;
  outline: none;
  width: 200px;
  background-color: #333;
  border-radius: 5px;
  height: 49px;
  vertical-align: left;
`;

const ShipNowButton = styled('button')`
  font-size: 18px;
  background: #000;
  color: #fff;
  text-transform: uppercase;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0.5em;
  outline: none;
  width: 100px;
  background-color: #333;
  border-radius: 5px;
  height: 45px;
  vertical-align: left;
`;

const UpdateButton = styled('button')`
  padding: 0;
  margin: 0;
  text-align: center;
  background-color: transparent;
  border-color: #fff;
  text-decoration: underline;
  color: #0000ee;
  height: 20px;
  font-size: 16px;
`;

const CancelReasonButtonContainer = styled('div')`
  padding-top: 10px;
  padding-bottom: 15px;
`;

const DescriptionText = styled('div')`
  p {
    font-size: 14px;
    line-height: 14px;
    margin-top: 10px;
    margin-bottom: 5px;
    color: rgb(105, 105, 105);
  }
`;

const SmallPrintText = styled('div')`
  p {
    font-size: 10px;
    line-height: 14px;
    margin-top: 10px;
    margin-bottom: 5px;
    color: rgb(105, 105, 105);
  }
`;

const Title = styled('h3')`
  text-align: left;
  margin-bottom: 20px;
  color: #000;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;


class YourPlan extends React.Component {
  constructor(props) {
    super(props);
    this.initializeStates();
    this.savePlanSettings = this.savePlanSettings.bind(this);
    this.handleDatePickerChange = this.handleDatePickerChange.bind(this);
  }

  componentDidMount() {
    const { fetchSubscriptionsRequest, getPendingVisitRequest, user } = this.props;

    if (user && user.id) {
      fetchSubscriptionsRequest(user.id);
    }

    if (user && user.id) {
      getPendingVisitRequest(user.id);
    }
  }

  componentDidUpdate(prevProps) {
    const { mostRecentSubscription } = this.props;

    if (!prevProps.mostRecentSubscription && mostRecentSubscription) {
      this.updateStates(mostRecentSubscription);
    }
  }

  initializeStates = () => {
    const { mostRecentSubscription } = this.props;

    this.state = {
      showFrequencyDropdown: false,
      showCancelReasonDropdown: false,
      cancelReason: 'Select Reason',
      frequency: mostRecentSubscription ? mostRecentSubscription.frequency : 0,
      showPlanSettings: false,
      currentPeriodEndDatetime: mostRecentSubscription
        ? mostRecentSubscription.currentPeriodEndDatetime
        : '',
      currentPeriodStartDatetime: mostRecentSubscription
        ? mostRecentSubscription.currentPeriodStartDatetime
        : '',
      isSubscriptionActive: mostRecentSubscription ? mostRecentSubscription.isActive : false,
    };
  };

  updateStates = mostRecentSubscription => {
    this.setState({
      frequency: mostRecentSubscription ? mostRecentSubscription.frequency : 0,
      currentPeriodEndDatetime: mostRecentSubscription
        ? mostRecentSubscription.currentPeriodEndDatetime
        : '',
      currentPeriodStartDatetime: mostRecentSubscription
        ? mostRecentSubscription.currentPeriodStartDatetime
        : '',
      isSubscriptionActive: mostRecentSubscription ? mostRecentSubscription.isActive : false,
    });
  };

  updateFrequency = (value, save) => {
    this.setState(
      {
        frequency: value,
      },
      () => {
        if (save) {
          this.savePlanSettings();
        }
      },
    );
  };

  updateCancelReason = (value, save) => {
    this.setState(
      {
        cancelReason: value,
      },
      () => {
        if (save) {
          this.savePlanSettings();
        }
      },
    );
  };

  getSubscriptionOrderProduct = () => {
    const { mostRecentSubscription, products } = this.props;

    if (!mostRecentSubscription) {
      return null;
    }

    const subscriptionOrderProductData = {
      frequency: mostRecentSubscription.frequency,
      isSubscriptionActive: mostRecentSubscription.isActive,
      price: mostRecentSubscription.productRefillPrice,
      productName: mostRecentSubscription.productName,
      productUuid: mostRecentSubscription.productUuid,
      quantity: 1, // subscriptions should always be 1
      type: 'Rx',
    };

    const product = _.find(products, product => product.id === mostRecentSubscription.productUuid);

    if (product) {
      subscriptionOrderProductData.image = product.image;
    }

    subscriptionOrderProductData.total = getOrderTotal([subscriptionOrderProductData]);

    return subscriptionOrderProductData;
  };

  togglePlanSettings = () => {
    this.setState({
      showPlanSettings: !this.state.showPlanSettings,
    });
  };

  stopAutoRenewal = () => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    const { cancelReason } = this.state;
    const confirmed = window.confirm(
      "Are you sure you'd like to stop your auto renewals? Your upcoming order will not be shipped.",
    );

    if (confirmed) {
      this.setState({
        isSubscriptionActive: false,
        showPlanSettings: false,
      });

      updateSubscriptionRequest({
        uuid: mostRecentSubscription.uuid,
        cancelReason: cancelReason,
        isActive: false,
      });
    } else {
      this.setState({
        isSubscriptionActive: true,
      });
    }
  };

  shipNowRequest = () => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    const confirmed = window.confirm(
      "Are you sure you'd like to ship your order today? " +
        'Your order will be billed today and shipped in 5-7 business days.',
    );

    if (confirmed) {
      updateSubscriptionRequest({
        uuid: mostRecentSubscription.uuid,
        shipNow: true,
        isActive: true,
      });
    }
  };

  delayShipmentOneMonth = () => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    const currentDelayInDays = mostRecentSubscription.delayInDays;
    const newShipmentDate = formatTimestampDateWithDaysDelta(
      new Date(mostRecentSubscription.currentPeriodEndDatetime),
      30,
    );
    const confirmed = window.confirm(
      `Are you sure you'd like to delay your next shipment for a month? Your next order will be shipped on ${newShipmentDate}.`,
    );

    if (confirmed) {
      updateSubscriptionRequest({
        uuid: mostRecentSubscription.uuid,
        delayInDays: currentDelayInDays + 30,
        isActive: true,
      });
    }
  };

  handleDatePickerChange(date) {
    this.setState({
      shipDate: date,
    });
  }

  updateShipDate = () => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    const { shipDate } = this.state;
    const confirmed = window.confirm(`Are you sure you'd like to the order to ship on ${shipDate}?`);

    const currentPeriodEndDatetime = new Date(mostRecentSubscription.currentPeriodEndDatetime);
    const delta = daysDifference(currentPeriodEndDatetime, shipDate);

    if (confirmed) {
      updateSubscriptionRequest({
        uuid: mostRecentSubscription.uuid,
        delayInDays: delta,
        isActive: true,
      });
    }
  };

  savePlanSettings = () => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    const { frequency } = this.state;

    updateSubscriptionRequest({
      uuid: mostRecentSubscription.uuid,
      frequency: frequency,
      isActive: true,
    });
  };

  toggleShowFrequencyDropdown = () => {
    this.setState({
      showFrequencyDropdown: !this.state.showFrequencyDropdown,
    });
  };

  toggleShowCancelReasonDropdown = () => {
    this.setState({
      showCancelReasonDropdown: !this.state.showCancelReasonDropdown,
    });
  };

  configurePlanSettingsButton = () => {
    const { mostRecentSubscription, user } = this.props;
    const { showPlanSettings } = this.state;
    const userRxStatus = user ? user.rxStatus : null;
    let button;

    if (!showPlanSettings) {
      if (mostRecentSubscription.isActive) {
        button = (
          <UpdateButton color="link" onClick={this.togglePlanSettings}>
            Edit frequency
          </UpdateButton>
        );
      } else if (userRxStatus != 'Expired') {
        button = (
          <UpdateButton color="primary" onClick={this.togglePlanSettings}>
            Restart your plan
          </UpdateButton>
        );
      }

      return button;
    }
  };

  updateSubscriptionPlan = newPlanProductUUID => {
    const { mostRecentSubscription, updateSubscriptionRequest } = this.props;
    updateSubscriptionRequest({
      uuid: mostRecentSubscription.uuid,
      productUuid: newPlanProductUUID,
    });
  };

  editBillingDetails = () => {
    history.push('/user-dashboard/my-account');
  };

  render() {
    const {
      cancelReason,
      showCancelReasonDropdown,
      showFrequencyDropdown,
      frequency,
      showPlanSettings,
    } = this.state;

    const {
      isAdmin,
      products,
      isUpdatingSubscription,
      mostRecentSubscription,
      updateOrderRequest,
      user,
      subscriptionErrorMessage,
      visit,
    } = this.props;
    const subscriptionOrderProduct = this.getSubscriptionOrderProduct();
    const currentPeriodEndDatetime = mostRecentSubscription
      ? mostRecentSubscription.currentPeriodEndDatetime
      : null;
    const isSubscriptionActive = mostRecentSubscription ? mostRecentSubscription.isActive : false
    let frequencySelectionValue = 'Select Month';
    if (frequency > 0) {
      frequencySelectionValue = `${frequency} months`;
    }
    const nextSubscriptionOrderShipDate =
      isSubscriptionActive && currentPeriodEndDatetime
        ? formatShortTimestampDate(new Date(currentPeriodEndDatetime))
        : null;
    const pendingRx =
      visit.id &&
      visit.status !== 'Provider Signed' &&
      visit.status !== 'Provider Rx Submitted' &&
      visit.status !== 'Provider Rx Denied' &&
      visit.status !== 'Provider Cancelled';
    const activeSubscriptionPlan = isSubscriptionActive && mostRecentSubscription;
    const noRecurringSubscriptionPlan = !mostRecentSubscription;
    const pendingSubscriptionPlan = pendingRx;
    const pausedSubscriptionPlan = !isSubscriptionActive && mostRecentSubscription;
    const hasSubscriptionDelay = mostRecentSubscription
      ? mostRecentSubscription.delayInDays > 0
      : false;
    const shippingDetails = (user && user.shippingDetails) || '';
    const userRxStatus = user ? user.rxStatus : null;
    const currentDate = new Date();

    const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;


    // Stripe sends the invoice webhook 7 days before subscription order, so need to add some buffer time from current date
    const minDateBuffer = isAdmin ? 0 : 8;
    const minDate = new Date(currentDate.setDate(currentDate.getDate() + minDateBuffer));

    const disableSubscriptionEdit = pendingSubscriptionPlan || noRecurringSubscriptionPlan;

    let subscriptionProcessingSummary = null;
    if (pendingSubscriptionPlan) {
      subscriptionProcessingSummary = `User visit is still in progress: ${visit.status}`;
      } else if (noRecurringSubscriptionPlan) {
      subscriptionProcessingSummary = 'User has no recurring plan yet.';
    }

    return (
      <CustomSpinner spinning={isUpdatingSubscription} blur={true}>
        <div>
          {subscriptionErrorMessage && <Alert color={'danger'}>{subscriptionErrorMessage}</Alert>}
          {/*{ DEBUG && mostRecentSubscription && user && (*/}
          {/*  <div>Start Date: {currentPeriodStartDatetime}. User email: {user.email}</div>*/}
          {/*) }*/}
          <DescriptionText> <b>User Rx Status:</b> {userRxStatus} </DescriptionText>
          {pausedSubscriptionPlan && (
              <p>Reason for cancellation: {mostRecentSubscription.cancelReason}</p>
            )}

          {/* Show if the user payment details needs to be updated */}
          {requirePaymentDetailUpdate && (
            <div>
              <DescriptionText>
                <b>User action required: </b>Payment detail update
              </DescriptionText>
            </div>
          )}

          {disableSubscriptionEdit && (
            <DescriptionText>
              <b>Unable to edit plan: </b>{subscriptionProcessingSummary}
            </DescriptionText>
          )}

          {/* Show Plan (and next ship date if there is one) */}
          {(activeSubscriptionPlan || pausedSubscriptionPlan) && (
            <div>
              {nextSubscriptionOrderShipDate &&
                !pausedSubscriptionPlan && (
                  <DescriptionText>
                    <b>Next order ship date:</b> {nextSubscriptionOrderShipDate}
                  </DescriptionText>
                )}

              <CartSummaryContainer>
                <CartSummary
                  products={products}
                  data={[subscriptionOrderProduct]}
                  subscriptionDetailsMode={isSubscriptionActive && !disableSubscriptionEdit}
                  parent={'yourPlanDashboard'}
                  updateSubscriptionPlan={this.updateSubscriptionPlan}
                  updateOrderRequest={updateOrderRequest}
                  showSubscription={true}
                  showPrice={true}
                />
              </CartSummaryContainer>
            </div>
          )}

          {/*Edit Subscription Section*/}
          {(activeSubscriptionPlan || pausedSubscriptionPlan) &&
            !disableSubscriptionEdit && (
              <div>
                {isAdmin &&
                  isSubscriptionActive && (
                    <div>
                      <h6>Cancel Subscription:</h6>
                      <Dropdown
                        isOpen={showCancelReasonDropdown}
                        toggle={this.toggleShowCancelReasonDropdown}
                      >
                        <DropdownToggle caret>{cancelReason}</DropdownToggle>
                        <DropdownMenu>
                          {CANCEL_REASONS.map((cancelReason, id) => {
                            return (
                              <DropdownItem key={id}>
                                <div
                                  onClick={_.partial(this.updateCancelReason, cancelReason, false)}
                                >
                                  {cancelReason}
                                </div>
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </Dropdown>
                      <CancelReasonButtonContainer>
                        <Button outline color="danger" size="sm" onClick={this.stopAutoRenewal}>
                          Submit
                        </Button>
                      </CancelReasonButtonContainer>
                    </div>
                  )}

                {isAdmin && (
                  <div>
                    <h6>Ship date:</h6>
                    <ShipDatePickerContainer>
                      <DatePicker
                        selected={this.state.shipDate}
                        onChange={this.handleDatePickerChange}
                        className="primary-border"
                        placeholderText="Click to select a date"
                        minDate={minDate}
                        isClearable={true}
                      />
                      <Button
                        className="pull-right"
                        color="secondary"
                        onClick={this.updateShipDate}
                      >
                        Update
                      </Button>
                    </ShipDatePickerContainer>
                  </div>
                )}
                <Button color="secondary" onClick={this.shipNowRequest}>
                  Ship Now
                </Button>
                <div>
                  {nextSubscriptionOrderShipDate &&
                    !hasSubscriptionDelay &&
                    !disableSubscriptionEdit && (
                      <UpdateButton onClick={this.delayShipmentOneMonth}>
                        Delay shipment 30 days
                      </UpdateButton>
                    )}
                </div>
                {/*<SubscriptionProductContainer>*/}
                {/*  <SubscriptionProduct products={products} item={subscriptionOrderProduct}/>*/}
                {/*</SubscriptionProductContainer>*/}
                <Settings>
                  {/* Show "Edit" button if user has an active plan else show "Restart" button. */}
                  {this.configurePlanSettingsButton()}

                  {/* Plan Settings */}
                  {showPlanSettings && (
                    <div>
                      Refill every:
                      <Dropdown
                        isOpen={showFrequencyDropdown}
                        toggle={this.toggleShowFrequencyDropdown}
                      >
                        <DropdownToggle caret>{frequencySelectionValue}</DropdownToggle>
                        <DropdownMenu>
                          {FREQUENCY_OPTIONS.map((frequency, id) => {
                            return (
                              <DropdownItem key={id}>
                                <div onClick={_.partial(this.updateFrequency, frequency, false)}>
                                  {frequency} months (ships{' '}
                                  {formatTimestampDateWithMonthDelta(
                                    new Date(currentPeriodEndDatetime),
                                    frequency - mostRecentSubscription.frequency,
                                  )}
                                  )
                                </div>
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </Dropdown>
                      <SaveButton color="primary" onClick={this.savePlanSettings}>
                        Save Update
                      </SaveButton>
                      <br />
                      <SmallPrintText>
                        Please contact{' '}
                        <a href="mailto:support@dearbrightly.com">support@dearbrightly.com</a> if
                        you would like to cancel your subscription.
                      </SmallPrintText>
                    </div>
                  )}
                </Settings>
                {!isAdmin && (
                  <ShippingInfo
                    showPriceBreakup={false}
                    shippingDetails={shippingDetails}
                    showEditButton={true}
                  />
                )}
              </div>
            )}
        </div>
      </CustomSpinner>
    );
  }
}

const mapStateToProps = state => ({
  isFetchingSubscriptions: isFetchingSubscriptions(state),
  isSubscriptionFetchSuccess: isSubscriptionFetchSuccess(state),
  isSubscriptionUpdateSuccess: isSubscriptionUpdateSuccess(state),
  subscriptionErrorMessage: getSubscriptionsErrorMessage(state),
  isUpdatingSubscription: isUpdatingSubscription(state),
  mostRecentSubscription: getMostRecentRxSubscription(state),
  products: getAllProducts(state),
  subscriptionsErrorMessage: getSubscriptionsErrorMessage(state),
  visit: getMostRecentMedicalVisit(state),
});

export const AdminSubscriptionPlanContainer = connect(
  mapStateToProps,
  {
    updateOrderRequest,
    fetchSubscriptionsRequest,
    getPendingVisitRequest,
    redirectToUrl,
    updateSubscriptionRequest,
  },
)(YourPlan);
