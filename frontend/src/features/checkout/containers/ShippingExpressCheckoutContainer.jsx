import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { Container } from 'reactstrap';
import {
  injectStripe,
  Elements,
  StripeProvider,
  PaymentRequestButtonElement,
} from 'react-stripe-elements';
import { paymentCheckoutType } from 'src/common/constants/payment';
import allowedStates from 'src/core/constants/allowedStates';
import {
  getPaymentTokenSuccess,
} from 'src/features/checkout/actions/paymentActions';
import {
  getPaymentErrorMessage,
  isPaymentSubmitting,
} from 'src/features/checkout/selectors/paymentSelectors';
import { getUser } from 'src/features/user/selectors/userSelectors';
import { getOrder, isUpdateOrderShippingDetailsSuccess } from 'src/features/orders/selectors/orderSelectors';
import { shippingValidationSchemaRules } from 'src/features/checkout/components/ShippingForm/ShippingFormRows';
import { ShippingFormRows } from 'src/features/checkout/components/ShippingForm/ShippingFormRows';
import listOfStates from 'src/common/helpers/listOfStates.js';
import { MEDICAL_VISIT_FEE, SUBSCRIPTION_DISCOUNT } from 'src/common/constants/orders';
import { klaviyoTrackStartedCheckout } from 'src/common/helpers/klaviyoUtils';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { cleanOrdersError } from 'src/features/orders/actions/ordersActions';
import { clearUserError } from 'src/features/user/actions/userActions';
import { breakpoints, fontFamily } from 'src/variables';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import { CheckoutAddressFixtures } from './checkoutAddressFixtures';
import CheckoutSubscribeSMSCheckbox from '../components/CheckoutSubscribeSMSCheckbox';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { getGTMOrderCheckoutEvent } from "src/common/helpers/getGTMOrderCheckoutEvent";

const MANUAL_TEST_MODE = getEnvValue('MANUAL_TEST_MODE');
const DEBUG = getEnvValue('DEBUG');
const STRIPE_KEY = process.env.STRIPE_KEY_PUBLISHABLE;


const Wrapper = styled('div')`
    width: 75%;
    margin: 0 auto;
    height: 100%;    
    ${breakpoints.lg} {
      width: 100%;
      margin: 0;
    }
`;

const StyledContainer = styled(Container)`
    width: 100%;
    height: calc(100% - 75px);
    margin: 0;
    overflow-y: scroll;
    padding-bottom: 100px;
    
    ${breakpoints.md} {
       padding: 0 5px;
       width: 100%;
       padding-bottom: 125px;
     }  
`
const ShippingFormContainers = styled('div')`
  @media (min-height: 750px) and (min-width: 576px) {
   padding-bottom: 30px;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: 15px;
`;

const ShippingTitle = styled('h2')`
  font-size: 20px;
  color: #000;
  letter-spacing: 0.1px;
  margin-bottom: 14px;
  font-family: ${fontFamily.baseFont};
  padding-top: 20px;
  ${breakpoints.sm} {
    padding-top: 0px;
  }
  ${breakpoints.xs} {
    padding-top: 0px;
  }
`;

const Alert = styled('div')`
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 0.75rem 1.25rem;
  margin: 10px;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-family: ${fontFamily.baseFont};
`;

const ExpressCheckoutP = styled('p')`
  text-align: center;
  margin: 0;
  padding: 0 6px;
  display: inline-block;
`;

const ExpressCheckoutLowerP = styled('p')`
  text-align: center;
  margin: 28px auto 6px;
  padding: 0 6px;
  display: inline-block;
`;

const ExpressCheckoutHr = styled('div')`
  width: 100%;
  height: 43px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 20px;
`;


// update shipping address through user input or with apple pay and ask for user confirmation
// WE NEED A NEW CONFIRMATION PAGE AS APPLE PAY DOESN'T HAVE ANOTHER STEP AFTER GETTING THE TOKEN

class _ApplePay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paymentObj: {},
      paymentRequest: {},
      canMakePayment: false,
      paymentType: paymentCheckoutType.NONE,
      hasError: false,
      errorMsg: '',
      expressCheckoutSuccess: false,
    };
  }

  componentDidMount() {
    const paymentObj = this.updatePaymentObj();
    if (!paymentObj) {
      return;
    }

    const paymentRequest = this.props.stripe.paymentRequest(paymentObj);

    paymentRequest.on('show', () => {
      const { paymentType } = this.state;
      GTMUtils.trackCall('product-details_pay_click', {
        order_id: this.props.order.id,
        payment_method: paymentCheckoutType.properties[paymentType].name,
      });
    });

    paymentRequest.on('token', ({ complete, token, ...data }) => {
      const addressData = data.shippingAddress;
      const state = addressData.region;

      const stateObj = listOfStates().filter(
        s =>
          s.name.toLowerCase() === state.toLowerCase() ||
          s.value.toLowerCase() === state.toLowerCase(),
      );
      const stateAbbrev = stateObj[0].value;

      const nameStr = addressData.recipient;
      const name = {
        first: '',
        last: '',
      };
      if (nameStr.split(' ').length == 1) {
        name.first = nameStr;
      } else if (nameStr.split(' ').length == 2) {
        name.first = nameStr.split(' ')[0];
        name.last = nameStr.split(' ')[1];
      } else if (nameStr.split(' ').length > 2) {
        name.first = nameStr.split(' ')[0];
        name.last = nameStr.split(' ')[2];
      }

      const shippingObj = {
        paymentType: this.state.paymentType,
        checkoutAsGuest: false,
        email: data.payerEmail,
        password: '',
        registerAnAccount: true,
        shippingDetails: {
          addressLine1: addressData.addressLine[0],
          addressLine2: addressData.addressLine.length > 1 ? addressData.addressLine[1] : '',
          city: addressData.city,
          country: addressData.country,
          firstName: name.first,
          lastName: name.last,
          phone: data.payerPhone
            .replace(/^\+[0-9]/, '')
            .split('')
            .filter(c => c.match(/[0-9]/))
            .join(''),
          postalCode: addressData.postalCode,
          state: stateAbbrev,
        },
      };

      this.setState({ hasError: false, errorMsg: '', expressCheckoutSuccess: true });
      this.props.onSubmitExpress(shippingObj);
      this.props.getPaymentTokenSuccess(token.id);

      complete('success');
    });

    paymentRequest.on('shippingaddresschange', event => {
      // TODO: check if isRx

      const country = event.shippingAddress.country;
      const state = event.shippingAddress.region;

      const stateObj = listOfStates().filter(
        s =>
          s.name.toLowerCase() === state.toLowerCase() ||
          s.value.toLowerCase() === state.toLowerCase(),
      );
      if (
        (country === 'US' && stateObj.length > 0 && allowedStates.includes(stateObj[0].value)) ||
        (country === 'US' && this.props.order.orderType === 'OTC')
      ) {
        this.setState({ hasError: false, errorMsg: '' });

        event.updateWith({ status: 'success', shippingOptions: this.getShippingOptions() });
      } else {
        this.setState({ hasError: true, errorMsg: "We aren't able to ship to your address" });

        event.updateWith({ status: 'invalid_shipping_address' });
      }
    });

    paymentRequest.on('cancel', () => {
      const { paymentType } = this.state;
      this.setState({
        hasError: true,
        errorMsg:
          'Oops! Something went wrong. Please try again or enter your address to pay by credit card.',
      });

      GTMUtils.trackCall('product-details_express_pay_cancel', {
        payment_method: paymentCheckoutType.properties[paymentType].name,
        order_id: this.props.order.id
      });

    });

    paymentRequest.canMakePayment().then(result => {
      // TODO - Handle Microsoft Pay?
      let paymentType = paymentCheckoutType.NONE;
      if (result) {
        if (result.googlePay) {
          paymentType = paymentCheckoutType.GOOGLE_PAY;
        } else if (result.applePay) {
          paymentType = paymentCheckoutType.APPLE_PAY;
        } else if (result.link) {
          paymentType = paymentCheckoutType.LINK;
        }
      }
      this.setState({ canMakePayment: !!result, paymentType });
    });

    this.setState({ paymentRequest });

  };


  getShippingOptions = () => {
    const orderDetails = this.props.order;

    const paymentRequestDetails = {
      medicalVisitFee: MEDICAL_VISIT_FEE,
      subscriptionDiscount: SUBSCRIPTION_DISCOUNT,
      discount: orderDetails.discount,
      tax: orderDetails.tax,
      shippingFee: orderDetails.shippingFee,
      totalAmount: orderDetails.totalAmount,
      orderItems: [],
    };

    if (paymentRequestDetails.shippingFee !== 0) {
      return [
        {
          id: 'standard-shipping',
          label: 'Standard Shipping',
          detail: 'Arrives in 5-7 business days',
          amount: paymentRequestDetails.shippingFee,
        },
      ];
    } else if (paymentRequestDetails.medicalVisitFee === 0) {
      return [
        {
          id: 'free-shipping',
          label: 'Free Shipping',
          detail: 'Arrives in 5-7 business days',
          amount: 0,
        },
      ];
    } else {
      return [
        {
          id: 'free-shipping',
          label: 'Free Shipping',
          detail: 'Arrives in 5-7 business days after your provider reviews your information',
          amount: 0,
        },
      ];
    }
  };

  updatePaymentObj = () => {
    const orderDetails = this.props.order;

    let paymentRequestDetails = {};
    let stripePaymentObj = {};

    if (!orderDetails || (orderDetails && !orderDetails.orderProducts)) {
      return null;
    }

    paymentRequestDetails = {
      medicalVisitFee: MEDICAL_VISIT_FEE,
      subscriptionDiscount: SUBSCRIPTION_DISCOUNT,
      discount: orderDetails.discount,
      tax: orderDetails.tax,
      shippingFee: orderDetails.shippingFee,
      totalAmount: orderDetails.totalAmount,
      orderItems: [],
    };

    orderDetails.orderProducts.forEach(item => {
      paymentRequestDetails.orderItems.push({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      });
    });

    // loop through and update the obj
    stripePaymentObj = {
      country: 'US',
      currency: 'usd',
      requestPayerPhone: true,
      requestPayerEmail: true,
      requestShipping: true,
      total: {
        label: 'Dear Brightly',
        amount: paymentRequestDetails.totalAmount,
      },
      displayItems: [],
      shippingOptions: [],
    };

    if (paymentRequestDetails.shippingFee !== 0) {
      stripePaymentObj.shippingOptions.push({
        id: 'standard-shipping',
        label: 'Standard Shipping',
        detail: 'Arrives in 5-7 business days',
        amount: paymentRequestDetails.shippingFee,
      });
    } else if (paymentRequestDetails.medicalVisitFee === 0) {
      stripePaymentObj.shippingOptions.push({
        id: 'free-shipping',
        label: 'Free Shipping',
        detail: 'Arrives in 5-7 business days',
        amount: 0,
      });
    } else {
      stripePaymentObj.shippingOptions.push({
        id: 'free-shipping',
        label: 'Free Shipping',
        detail: 'Arrives in 5-7 business days after your provider reviews your information',
        amount: 0,
      });
    }

    paymentRequestDetails.orderItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        stripePaymentObj.displayItems.push({
          label: item.productName,
          amount: item.price,
        });
      }
    });

    if (paymentRequestDetails.medicalVisitFee !== 0) {
      stripePaymentObj.displayItems.push({
        label: 'Provider Consultation',
        amount: paymentRequestDetails.medicalVisitFee,
      });
    }
    if (paymentRequestDetails.subscriptionDiscount) {
      stripePaymentObj.displayItems.push({
        label: 'Promo: Free Consultation for the first year',
        amount: -paymentRequestDetails.subscriptionDiscount,
      });
    }
    if (paymentRequestDetails.discount) {
      stripePaymentObj.displayItems.push({
        label: 'Promo: Discount Code',
        amount: -paymentRequestDetails.discount,
      });
    }
    if (paymentRequestDetails.shippingFee !== 0) {
      stripePaymentObj.displayItems.push({
        label: 'Standard Shipping',
        amount: paymentRequestDetails.shippingFee,
      });
    }

    return stripePaymentObj;
  };

  render() {
    const {
      canMakePayment,
      paymentRequest,
      paymentType,
      hasError,
      errorMsg,
      expressCheckoutSuccess,
    } = this.state;
    const supportPaymentType = paymentType
      ? paymentType === paymentCheckoutType.APPLE_PAY || paymentType === paymentCheckoutType.GOOGLE_PAY || paymentType === paymentCheckoutType.LINK
      : false;

    return (
      <Container>
        {canMakePayment &&
          !expressCheckoutSuccess &&
          supportPaymentType && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <ExpressCheckoutP>Express checkout with:</ExpressCheckoutP>
              <PaymentRequestButtonElement
                  className="PaymentRequestButton"
                  paymentRequest={paymentRequest}
              />
              {hasError && <ErrorText>{errorMsg}</ErrorText>}
              <ExpressCheckoutHr>
                <ExpressCheckoutLowerP>or</ExpressCheckoutLowerP>
              </ExpressCheckoutHr>
            </div>
          )}
        {expressCheckoutSuccess && (
          <ExpressCheckoutP>
            Thanks for your order! Confirm your address below and you'll be on your way to great
            skin in no time!
          </ExpressCheckoutP>
        )}
      </Container>
    );
  }
}

const ApplePay = connect(
  state => ({
    isPaymentSubmitting: isPaymentSubmitting(state),
    order: getOrder(state),
    paymentErrorMessage: getPaymentErrorMessage(state),
    userState: getUser(state),
  }),
  {
    getPaymentTokenSuccess,
  },
)(_ApplePay);

const ApplePayInjected = injectStripe(ApplePay);

// wraps the apple pay class in the required components
class ApplePayWrapped extends Component {
  render() {
    return (
      <div className="apple-pay-stripe">
        <StripeProvider apiKey={STRIPE_KEY}>
          <Elements>
            <ApplePayInjected
              onSubmitExpress={this.props.onSubmitExpress}
              onStateBlur={this.props.onStateBlur}
              disabled={this.props.disabled}
              getPaymentTokenSuccess={this.props.getPaymentTokenSuccess}
              switchNextButton={this.props.switchNextButton}
            />
          </Elements>
        </StripeProvider>
      </div>
    );
  }
}

const ShippingAddressRaw = ({
  values,
  touched,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  onStateBlur,
  navigateBack,
  orderUpdateErrorMessage,
  customerUpdateErrorMessage,
  setFieldValue,
}) => (
    <StyledContainer id="styled-container">
      <div style={{ marginBottom:10 }}>
        <ShippingTitle>Shipping Information</ShippingTitle>
      </div>
      <ShippingFormContainers id="styled-shipping-form-container"
                              onSubmit={e => {
                                e.preventDefault();
                              }}
      >
        <ShippingFormRows
            prefix="shippingDetails"
            data={values.shippingDetails}
            errors={errors.shippingDetails}
            touched={touched.shippingDetails}
            handleBlur={handleBlur}
            handleChange={handleChange}
            onStateBlur={onStateBlur}
            setFieldValue={setFieldValue}
        />
        <CheckoutSubscribeSMSCheckbox
            name="optInSmsAppNotifications"
            value={values.optInSmsAppNotifications}
            onChangeHandle={handleChange}
            handleBlur={handleBlur}
            onStateBlur={onStateBlur}
            errors={errors.optInSmsAppNotifications}
            touched={touched.optInSmsAppNotifications}
        />
      </ShippingFormContainers>
      {(orderUpdateErrorMessage || customerUpdateErrorMessage) && (
          <Alert>
            {orderUpdateErrorMessage || customerUpdateErrorMessage}
          </Alert>
      )}
      <BottomNav
          currentCheckoutStepName={"shipping"}
          backButtonType={"arrow"}
          backButtonClick={navigateBack}
          backButtonTitle={"Back"}
          disableBackButton={false}
          disableNextButton={false}
          hideNextButtonArrow={true}
          hideBackButton={false}
          nextButtonClick={handleSubmit}
          nextTitle={"Continue"}
      />
    </StyledContainer>
);

const ShippingAddressWrapped = withFormik({
  validateOnBlur: true,
  enableReinitialize: true,
  mapPropsToValues: props => {
    return {
      ...props.data,
      order: props.order,
      user: props.user
    }
  },
  validationSchema: Yup.object().shape({
    shippingDetails: shippingValidationSchemaRules,
  }),
  handleSubmit: (values, { props }) => {
    GTMUtils.trackCall('checkout-details_confirm_shipping_click');
    
    props.onSubmit(values);
  },
})(ShippingAddressRaw);

class ShippingExpressCheckoutContainer extends Component {
  constructor(props) {
    // get the props we need to calculate pricing
    super(props);

    this.state = {
      addressData: this.props.data,
      nextButtonText: 'Next',
      isUpdatingAddress: false,
    };
  }

  componentDidMount() {
    const {order, user} = this.props;

    if (MANUAL_TEST_MODE && DEBUG) {
      if (order.orderProducts.length > 0) {
        const devFixtures = CheckoutAddressFixtures
        devFixtures.phone = `(514) 555-${Math.random(9999) + 1}`
        this.props.onSubmit(devFixtures)
      }
    }

    if (user && user.id && order && order.id) {
      klaviyoTrackStartedCheckout(order, window.location.origin);
    }

    if (order) {
      const eventData = getGTMOrderCheckoutEvent(order.orderProducts);
      GTMUtils.trackCall('checkout_shipping_view', eventData);
    } else {
      GTMUtils.trackCall('checkout_shipping_view');
    }
  }

  componentDidUpdate(prevProps) {
    const { cleanOrdersError, clearUserError, customerUpdateErrorMessage, onOrderShippingDetailsUpdateSuccess, orderUpdateErrorMessage, updateOrderShippingDetailsSuccess } = this.props;

    if (!prevProps.updateOrderShippingDetailsSuccess && updateOrderShippingDetailsSuccess) {
      if (onOrderShippingDetailsUpdateSuccess) {
        onOrderShippingDetailsUpdateSuccess();
      }
    }

    if (!prevProps.orderUpdateErrorMessage && orderUpdateErrorMessage) {
      setTimeout(() => {
        cleanOrdersError();
      }, 3000);
    }

    if (!prevProps.customerUpdateErrorMessage && customerUpdateErrorMessage) {
      setTimeout(() => {
        clearUserError();
      }, 3000);
    }

  }

  onSubmit = async values => {
    // have to remount formik component to force update
    await this.setState({ isUpdatingAddress: true });

    await this.setState({
      addressData: values,
      nextButtonText: 'Confirm Address',
    });

    await this.setState({ isUpdatingAddress: false });

    // this.props.onSubmit(this.state.addressData);
  };

  onClickNext = values => {
    if (this.state.nextButtonText === 'Confirm Address') {
      this.props.onSubmitExpress(values);
    } else {
      this.props.onSubmit(values);
    }
  };

  render() {
    const {
      orderUpdateErrorMessage,
      customerUpdateErrorMessage,
      onStateBlur,
      disabled,
      navigateBack,
      navigateNext,
      order,
      user
    } = this.props;

    // need to break out the next button to this level
    return (
      <Wrapper id="wrapper">
        <ApplePayWrapped
          onSubmitExpress={this.onSubmit}
          getPaymentTokenSuccess={this.props.getPaymentTokenSuccess}
          onStateBlur={onStateBlur}
          disabled={disabled}
          switchNextButton={this.switchNextButton}
          navigateBack={navigateBack}
          navigateNext={navigateNext}
        />
        {!this.state.isUpdatingAddress && (
          <ShippingAddressWrapped
            orderUpdateErrorMessage={orderUpdateErrorMessage}
            customerUpdateErrorMessage={customerUpdateErrorMessage}
            onSubmit={this.onClickNext}
            data={this.state.addressData}
            onStateBlur={onStateBlur}
            disabled={disabled}
            navigateBack={navigateBack}
            navigateNext={navigateNext}
            order={order}
            user={user}
            nextButtonText={this.state.nextButtonText}
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    updateOrderShippingDetailsSuccess: isUpdateOrderShippingDetailsSuccess(state),
  }),
  {
    cleanOrdersError,
    clearUserError,
  },
)(ShippingExpressCheckoutContainer);
