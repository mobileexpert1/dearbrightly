import React from 'react';
import { connect } from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';
import { updateCustomerDataRequest } from 'src/features/customers/actions/customersActions';
import {
  getOrder,
  isFetching,
  isOrderFetchSuccess,
  isUpdatingOrder,
  getOrderErrorMessage,
} from 'src/features/orders/selectors/orderSelectors';
import {
  getMedicalVisit,
  getProgressAnswers,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {
  getFBPixelAddToCartTrackedEventIDs,
  getFBPixelCompleteRegistrationTrackedEventIDs,
  getFBPixelInitiateCheckoutTrackedEventIDs,
  getFBPixelPurchaseTrackedEventIDs,
  isFBPixelTracked,
} from 'src/features/analytics/selectors/analyticsSelectors';
import { facebookAuthenticationRequest } from 'src/features/auth/actions/authenticationActions';
import { getRegistrationSuccessStatus, isAuthenticated } from 'src/features/auth/selectors/authenticationSelectors';
import PaymentFormContainer from 'src/features/checkout/containers/PaymentFormContainer';
import PaymentConfirmationContainer from 'src/features/checkout/containers/PaymentConfirmationContainer';
import { getPaymentTokenSuccess } from 'src/features/checkout/actions/paymentActions';
import {
  fetchPendingCheckoutOrderRequest,
  updateOrderShippingDetailsRequest,
  updatePendingOrCreateOrderRequest,
  updateIsOrderExpressCheckout,
  fetchCustomerOrdersRequest,
} from 'src/features/orders/actions/ordersActions';
import { paymentCheckoutType } from 'src/common/constants/payment';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import {
  navigateAfterSignUp,
  navigateBack,
  navigateCheckout,
  navigateNext,
  navigateOrderCheckout,
} from 'src/features/checkout/actions/checkoutStepsActions';
import {
  getMostRecentRxSubscription,
  isSubscriptionFetchSuccess,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { loadFbApi } from 'src/common/helpers/fbInit';
import { fetchSubscriptionsRequest } from 'src/features/subscriptions/actions/subscriptionsActions';
import {
  getMostRecentVisitRequest,
  getPendingOrCreateVisitRequest
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import UploadPhotosCheckoutContainer from 'src/features/checkout/containers/UploadPhotosCheckoutContainer';
import { FRONT_FACE, LEFT_FACE, RIGHT_FACE, PHOTO_ID } from 'src/common/constants/medicalVisits';
import { QuestionnaireContainer } from 'src/features/checkout/components/Questionnaire';
import { PhotoUploadTips } from 'src/features/checkout/components/PhotoUploadTips';
import { CustomSpinner } from 'src/common/components/CustomSpinner';
import {
  getOnboardingFlowVariation,
  getCheckoutStepsProgressBar,
  getCurrentCheckoutStepName,
} from 'src/features/checkout/selectors/checkoutStepsSelectors';
import {
  getConsentToTelehealth,
  getUserDateOfBirth,
  getUserData,
  getUpdateAccountDetailsErrorMessage,
  isUpdatingAccountDetails,
} from 'src/features/user/selectors/userSelectors';
import { getDiscount } from 'src/features/checkout/selectors/discountSelectors';
import {
  isVisitPhotoIdUploadComplete,
  isVisitQuestionnaireComplete,
} from 'src/features/dashboard/helpers/userStatuses';
import moment from 'moment';
import EligibilityModal from 'src/features/checkout/components/EligibilityModal';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import CheckoutSteps from '../components/CheckoutSteps';
import OrderConfirmationContainer from './OrderConfimationContainer';
import AuthContainer from './AuthContainer';
import ShippingExpressCheckoutContainer from './ShippingExpressCheckoutContainer';
import { getGTMOrderCompletedEvent } from "src/common/helpers/getGTMOrderCompletedEvent";
import {getFBPixelURL} from "src/common/helpers/fbPixelUtils";
import { setFBPixelTracked } from "src/features/analytics/actions/analyticsActions";
import { fetchProductsRequest } from "src/features/products/actions/productsActions";
import { getAllProducts } from 'src/features/products/selectors/productsSelectors';
import { getGTMOrderCheckoutEvent } from "src/common/helpers/getGTMOrderCheckoutEvent";
import SkinProfileCompleteContainer from './SkinProfileCompleteContainer';

const DEBUG = getEnvValue('DEBUG');

class Checkout extends React.Component {
  constructor(props) {
    super(props);

    let shippingDetails =
      (this.props.user && this.props.user.shippingDetails) ||
      (this.props.order && this.props.order.shippingDetails);
    if (!shippingDetails) {
      shippingDetails = '';
    }

    let optInSmsAppNotifications = (this.props.user && this.props.user.optInSmsAppNotifications)

    this.state = {
      subtotal: 0,
      total: 0,
      formData: {
        optInSmsAppNotifications: optInSmsAppNotifications || false,
        shippingDetails: {
          firstName: shippingDetails.firstName || '',
          lastName: shippingDetails.lastName || '',
          phone: shippingDetails.phone || '',
          addressLine1: shippingDetails.addressLine1 || '',
          addressLine2: shippingDetails.addressLine2 || '',
          city: shippingDetails.city || '',
          country: 'US',
          state: shippingDetails.state || '',
          postalCode: shippingDetails.postalCode || '',
        },
      },
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
      orderCompleted: false,
      checkoutInitiated: false,
      headerHeight: 0
    };

    this.fbStatusChangeCallback = this.fbStatusChangeCallback.bind(this);
    this.handleFBLogin = this.handleFBLogin.bind(this);
    this.FB = window.FB;

    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({ elementFontSize: '14px' });
      } else if (window.innerWidth >= 450 && this.state.elementFontSize !== '18px') {
        this.setState({ elementFontSize: '18px' });
      }
    });
  }

  componentDidMount() {
    const { loggedIn, user, fetchSubscriptionsRequest, order, products, rxSubscription } = this.props;

    this.handleHeaderHeight()
    window.addEventListener('resize', this.handleHeaderHeight);

    if (order && order.id) {
      const eventData = getGTMOrderCheckoutEvent(order.orderProducts);
      GTMUtils.trackCall('checkout_started', eventData);
      //window.fbq('track', 'InitiateCheckout');
    }

    if (loggedIn && user) {
      // refresh the visit and order states if the user navigates away and back to this page

      if (!rxSubscription && user && user.id) {
        fetchSubscriptionsRequest(user.id);
      }

      this.updateOrCreateOrder();
      scrollToComponent(this.componentTop, { offset: 0, align: 'top' });
    }

    if (!products) {
      this.props.fetchProductsRequest();
    }
    loadFbApi();

    this.setState({ isItemAddedToCart: true });
    this.setCheckoutInitiated();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleHeaderHeight);
  }

  componentDidUpdate(prevProps) {
    const {
      consentToTelehealth,
      getPendingOrCreateVisitRequest,
      isUpdatingUserDetails,
      loggedIn,
      user,
      navigateNext,
      navigateOrderCheckout,
      order,
      onboardingFlowType,
      userDateOfBirth,
      updateCustomerDataRequest,
      currentCheckoutStepName,
      orderFetchSuccess,
      orderUpdateErrorMessage,
      visit,
    } = this.props;

    // ---- User has just logged in ----
    // Update shipping details
    if (!prevProps.user && user && loggedIn) {
      this.updateShippingDetails();
      this.updateOptInSMSNotifications();
      // Update pending order or create a new order
      this.updateOrCreateOrder();

      if (!visit.id) {
        getPendingOrCreateVisitRequest(user.id, null, consentToTelehealth);
      }
    }

    // ---- The onboarding flow variation has been set (user has just logged in) ---
    if ((!prevProps.onboardingFlowType && onboardingFlowType || !prevProps.orderUpdateErrorMessage && orderUpdateErrorMessage) && (currentCheckoutStepName === 'sign up')) {
      navigateOrderCheckout(false);
    }

    if (!prevProps.orderFetchSuccess && orderFetchSuccess) {
      if (currentCheckoutStepName === 'photo id' && isVisitPhotoIdUploadComplete(visit)) {
        navigateNext();
      } else if (currentCheckoutStepName === 'skin profile' && isVisitQuestionnaireComplete(visit)) {
        navigateNext();
      }
    }

    // ---- Update DOB ----
    if (user && !user.dob && !isUpdatingUserDetails) {
      if (userDateOfBirth) {
        const formattedDate = moment(userDateOfBirth, 'YYYY-M-D', true);
        if (formattedDate.isValid()) {
          updateCustomerDataRequest({
            id: user.id,
            dob: userDateOfBirth,
          });
        }
      }
    }

    if (prevProps.order && !prevProps.order.id && order && order.id) {
      const eventData = getGTMOrderCheckoutEvent(order.orderProducts);
      GTMUtils.trackCall('checkout_started', eventData);
      //window.fbq('track', 'InitiateCheckout');
    }
  }

  handleHeaderHeight = () => {
    const header = document.getElementsByTagName('header')[0]
    const sideBarHeader = document.getElementById('sidebar-header')
    const pageHeader = header || sideBarHeader

    if (pageHeader) {
      this.setState({
        headerHeight: pageHeader.clientHeight + (typeof sideBarHeader !== 'undefined' ? 20 : 0)
      })
    }
  }

  updateShippingDetails = () => {
    const { user, order } = this.props;

    let shippingDetails =
      (user && user.shippingDetails) ||
      (order && order.shippingDetails);

    if (!shippingDetails) {
      shippingDetails = '';
    }

    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        shippingDetails: {
          firstName: shippingDetails.firstName || '',
          lastName: shippingDetails.lastName || '',
          phone: shippingDetails.phone || '',
          addressLine1: shippingDetails.addressLine1 || '',
          addressLine2: shippingDetails.addressLine2 || '',
          city: shippingDetails.city || '',
          country: 'US',
          state: shippingDetails.state || '',
          postalCode: shippingDetails.postalCode || '',
        },
      },
    }));
  }

  updateOptInSMSNotifications = () => {
    const { user } = this.props;
    let optInSmsAppNotifications = (user && user.optInSmsAppNotifications)
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        optInSmsAppNotifications: optInSmsAppNotifications,
      },
    }));
  }

  fbStatusChangeCallback(response) {
    if (response.status === 'connected') {
      this.props.facebookAuthenticationRequest(
        response.authResponse
      );
    }
  }

  handleFBLogin() {
    FB.login(this.fbStatusChangeCallback, {
      scope: 'email',
      return_scopes: true,
    });
  }

  updateOrCreateOrder = () => {
    const {
      user,
      updatePendingOrCreateOrderRequest,
      isOrderFetching,
    } = this.props;

    if (isOrderFetching) {
      return;
    }

    const orderDetails = {
      customer: user,
    };
    
    const scid = localStorage.getItem("scid")
    if (scid !== "null" && scid !== null) {
      orderDetails.shopifyCartId = scid;
    }

    const rxsku = localStorage.getItem("rxsku")
    if (rxsku !== "null" && rxsku !== null) {
      orderDetails.shopifyRxProductSku = rxsku;
    }

    updatePendingOrCreateOrderRequest(orderDetails);
  };

  navigateCheckout = step => {
    this.props.navigateCheckoutAction(step);
  };

  handleUpdateShippingDetailsExpressCheckout = paymentCheckoutType => {
    this.props.updateIsOrderExpressCheckout(true);
    this.handleUpdateShippingDetails(paymentCheckoutType);
  };

  handleUpdateShippingDetails = paymentCheckoutType => {
    const {
      updateOrderShippingDetailsRequest,
      updateCustomerDataRequest,
      userDateOfBirth,
      user
    } = this.props;
    const { shippingDetails, optInSmsAppNotifications } = this.state.formData;

    const orderDetails = {
      customer: user,
    };

    orderDetails.paymentCheckoutType = paymentCheckoutType;

    shippingDetails.phone = shippingDetails.phone.replace(/[^0-9]/g, '');
    orderDetails.shippingDetails = shippingDetails;
    updateOrderShippingDetailsRequest(orderDetails);

    let userDetails = {
      id: user.id,
      shippingDetails: shippingDetails,
    };

    if (optInSmsAppNotifications != null) {
      userDetails['optInSmsAppNotifications'] = optInSmsAppNotifications
    }

    if (userDateOfBirth) {
      const formattedDate = moment(userDateOfBirth, 'YYYY-M-D', true);
      if (formattedDate.isValid()) {
        userDetails['dob'] = userDateOfBirth;
      }
    }

    updateCustomerDataRequest(userDetails);
  };

  handleSkinProfileQuestionsSubmitSuccess = () => {
    this.props.fetchPendingCheckoutOrderRequest();
  }

  handleSkinProfilePhotosUploadSuccess = () => {
    this.props.navigateNext();
  }

  handlePhotoIdUploadSuccess = () => {
    const { fetchCustomerOrdersRequest, fetchPendingCheckoutOrderRequest, fetchSubscriptionsRequest, order } = this.props;

    fetchPendingCheckoutOrderRequest();
    fetchSubscriptionsRequest();
    fetchCustomerOrdersRequest();


    GTMUtils.trackCall('all_photos_uploaded_at_checkout');
    const orderCompletedEvent = getGTMOrderCompletedEvent(order);
    GTMUtils.trackCall('order_completed', orderCompletedEvent);
    this.setState({ orderCompleted: true });
    //window.fbq('track', 'Purchase', {value: orderCompletedEvent.total, currency: 'USD'});
  }

  handleOrderShippingDetailsUpdateSuccess = () => {
    this.updateShippingDetails();
    this.updateOptInSMSNotifications();
    this.props.navigateNext();
  }

  handlePaymentSuccess = () => {
    const { fetchCustomerOrdersRequest, fetchSubscriptionsRequest, getMostRecentVisitRequest, order, onboardingFlowType } = this.props;

    getMostRecentVisitRequest();
    fetchSubscriptionsRequest();
    fetchCustomerOrdersRequest();

    if (onboardingFlowType === 'otc') {
      const orderCompletedEvent = getGTMOrderCompletedEvent(order);
      GTMUtils.trackCall('order_completed', orderCompletedEvent);
      this.setState({ orderCompleted: true });
    }

    this.props.navigateNext();
  };

  submitAddress = (values) => {
    this.setState(
      {
        formData: values,
      },
      () => this.handleUpdateShippingDetails(paymentCheckoutType.CREDIT_CARD),
    );
  }

  setCheckoutInitiated = () => {
    this.setState({ checkoutInitiated: true, });
  }

  render() {
    const {
      checkoutInitiated,
      isItemAddedToCart,
      elementFontSize,
      formData,
      orderCompleted,
      headerHeight
    } = this.state;
    const {
      checkoutStepsProgressBar,
      completedSkinProfileAnswers,
      currentCheckoutStepName,
      customerUpdateErrorMessage,
      fbPixelAddToCartTrackedEventIDs,
      fbPixelInitiateCheckoutTrackedEventIDs,
      fbFBPixelPurchaseTrackedEventIDs,
      fbPixelCompleteRegistrationTrackedEventIDs,
      isOrderFetching,
      isRegistered,
      isUpdatingOrder,
      rxSubscription,
      navigateBack,
      navigateNext,
      onboardingFlowType,
      order,
      orderUpdateErrorMessage,
      products,
      setFBPixelTracked,
      user,
      visit,
    } = this.props;

    const rxsku = localStorage.getItem("rxsku");
    const rxProduct = rxsku && products ? products.find(product => product.sku == rxsku) : null;
    const hideNodes = currentCheckoutStepName === 'your plan' || currentCheckoutStepName === 'sign up' ||
      currentCheckoutStepName === 'skin profile' ||currentCheckoutStepName === 'skin profile complete' || currentCheckoutStepName === 'order confirmation';

    {/* FB Pixel Logic */}
    const fbPixelCompleteRegistrationTracked = user && user.id ? isFBPixelTracked(fbPixelCompleteRegistrationTrackedEventIDs, user.id) : true;
    const fbPixelInitiateCheckoutTracked = rxProduct ? isFBPixelTracked(fbPixelInitiateCheckoutTrackedEventIDs, rxProduct.id) : true;
    const fbPixelPurchaseTracked = order && order.id ? isFBPixelTracked(fbFBPixelPurchaseTrackedEventIDs, order.id) : true;
    const isFBPixelAddToCartTracked = rxProduct ? isFBPixelTracked(fbPixelAddToCartTrackedEventIDs, rxProduct.id) : false;
    const fbPixelCompleteRegistrationURL = !fbPixelCompleteRegistrationTracked && isRegistered && user && user.id ? getFBPixelURL(user, null,'CompleteRegistration', user.id, null) : null;
    const fbPixelInitiateCheckoutURL = !fbPixelInitiateCheckoutTracked && checkoutInitiated ? getFBPixelURL(null, null,'InitiateCheckout', null, [rxProduct]) : null;
    const fbPixelPurchaseURL = !fbPixelPurchaseTracked && orderCompleted && order && order.id ? getFBPixelURL(user, order,'Purchase', order.id, order.orderProducts) : null;
    const fbPixelAddToCartURL = !isFBPixelAddToCartTracked && isItemAddedToCart && rxProduct ? getFBPixelURL(user, null,'AddToCart', null, [rxProduct]) : null;
    if (!fbPixelCompleteRegistrationTracked && fbPixelCompleteRegistrationURL) { setFBPixelTracked("CompleteRegistration", user.id);}
    if (!fbPixelInitiateCheckoutTracked && fbPixelInitiateCheckoutURL) { setFBPixelTracked("InitiateCheckout", rxProduct.id); this.setState({ checkoutInitiated: false });}
    if (!fbPixelPurchaseTracked && fbPixelPurchaseURL) { setFBPixelTracked("Purchase", order.id); }
    if (!isFBPixelAddToCartTracked && fbPixelAddToCartURL) { setFBPixelTracked("AddToCart", rxProduct.id); this.setState({ isItemAddedToCart: false });}
    {/********************/}

    return (
      <div id="checkout-container" style={headerHeight ? {position: 'fixed', top: headerHeight, bottom: 0, left: 0, right: 0, overflow: 'hidden'} : undefined}>
        {/* FB Pixel Logic */}
        { fbPixelInitiateCheckoutURL && (
            <img id="fbPixelInitiateCheckout" style={{ height: 1, width: 1, display: 'none' }}
                 src={ fbPixelInitiateCheckoutURL }
            />
        )}
        { fbPixelAddToCartURL && (
            <img id="fbPixel" style={{ height: 1, width: 1, display: 'none' }}
                 src={ fbPixelAddToCartURL }
            />
        )}
        { fbPixelPurchaseURL && (
            <img id="fbPixelPurchase" style={{ height: 1, width: 1, display: 'none' }}
                 src={ fbPixelPurchaseURL }
            />
        )}
        { fbPixelCompleteRegistrationURL && (
            <img id="fbPixelCompleteRegistration" style={{ height: 1, width: 1, display: 'none' }}
                 src={ fbPixelCompleteRegistrationURL }
            />
        )}
        {/********************/}
        {/* Don't show nodes in checkout process for steps "Your Plan" and "Sign up/Login". */}
        {!hideNodes && (
          <CheckoutSteps
            currentCheckoutStepName={currentCheckoutStepName}
            steps={checkoutStepsProgressBar}
          />
        )}
        {orderUpdateErrorMessage && (
            <MessageBannerAlert text={orderUpdateErrorMessage} hrefText="go to my dashboard" hrefUrl={`/user-dashboard/my-plan`} color="danger"/>
        )}
        {this.props && !orderUpdateErrorMessage &&
          currentCheckoutStepName === 'sign up' && (
            <EligibilityModal
              user={user}
              order={order}
              rxSubscription={rxSubscription}
              visit={visit}
              updateCustomerDataRequest={updateCustomerDataRequest}
            >
              <AuthContainer
                navigateBack={navigateBack}
                handleFBLogin={this.handleFBLogin}
              />
            </EligibilityModal>
          )}
        {this.props && !orderUpdateErrorMessage &&
          currentCheckoutStepName === 'shipping' && (
            <CustomSpinner spinning={isOrderFetching} blur={true}>
              <ShippingExpressCheckoutContainer
                orderUpdateErrorMessage={orderUpdateErrorMessage}
                customerUpdateErrorMessage={customerUpdateErrorMessage}
                getPaymentTokenSuccess={getPaymentTokenSuccess}
                onSubmit={values => {
                  this.submitAddress(values)
                }}
                onSubmitExpress={values => {
                  this.setState({ formData: values }, () =>
                    this.handleUpdateShippingDetailsExpressCheckout(values['paymentType']),
                  );
                }}
                data={formData}
                navigateBack={navigateBack}
                navigateNext={navigateNext}
                order={order}
                user={user}
                onOrderShippingDetailsUpdateSuccess={this.handleOrderShippingDetailsUpdateSuccess}
              />
            </CustomSpinner>
          )}
        {this.props && !orderUpdateErrorMessage &&
          currentCheckoutStepName === 'payment' && (
            <PaymentFormContainer
              fontSize={elementFontSize}
              navigateBack={navigateBack}
              navigateNext={navigateNext}
            />
          )}
        {this.props && !orderUpdateErrorMessage &&
          currentCheckoutStepName === 'payment confirmation' && (
            <CustomSpinner spinning={isUpdatingOrder} blur={true}>
              <PaymentConfirmationContainer
                fontSize={elementFontSize}
                navigateBack={navigateBack}
                onPaymentSuccess={this.handlePaymentSuccess}
                orderUpdateErrorMessage={orderUpdateErrorMessage}
              />
            </CustomSpinner>
          )}
        {currentCheckoutStepName === 'skin profile' && (
            <EligibilityModal
                user={user}
                order={order}
                rxSubscription={rxSubscription}
                visit={visit}
                updateCustomerDataRequest={updateCustomerDataRequest}
            >
              <QuestionnaireContainer
                  user={user}
                  visit={visit}
                  isUserDashboard
                  isUserReturning={completedSkinProfileAnswers ? completedSkinProfileAnswers.length > 0 : false}
                  onSkinProfileQuestionsSubmitSuccess={this.handleSkinProfileQuestionsSubmitSuccess}
                  headerHeight={headerHeight}
              />
            </EligibilityModal>
        )}
        {currentCheckoutStepName === 'skin profile complete' && (          
            <SkinProfileCompleteContainer
            navigateBack={navigateBack}
            navigateNext={navigateNext}
            order={order}
            user={user} 
            />          
        )}
        {currentCheckoutStepName === 'photos tips' && (
          <PhotoUploadTips
            nextStep={navigateNext}
            prevStep={navigateBack}
          />
        )}
        {currentCheckoutStepName === 'photos' && (
          <UploadPhotosCheckoutContainer
            user={user}
            visit={visit}
            onSkinProfilePhotosUploadSuccess={this.handleSkinProfilePhotosUploadSuccess}
            photoTypes={[FRONT_FACE, LEFT_FACE, RIGHT_FACE]}
            navigateNext={navigateNext}
          />
        )}
        {currentCheckoutStepName === 'photo id' && (
          <UploadPhotosCheckoutContainer
            user={user}
            visit={visit}
            onSkinProfilePhotosUploadSuccess={this.handlePhotoIdUploadSuccess}
            photoTypes={[PHOTO_ID]}
            navigateNext={navigateNext}
          />
        )}
        {this.props &&
          currentCheckoutStepName === 'order confirmation' && (
            <OrderConfirmationContainer
              isRxOrder={onboardingFlowType !== 'otc'}
              toggleCart={this.props.toggleCart}
            />
          )}
      </div>
    );
  }
}

export const CheckoutPage = connect(
  state => ({
    checkoutStepsProgressBar: getCheckoutStepsProgressBar(state),
    completedSkinProfileAnswers: getProgressAnswers(state),
    consentToTelehealth: getConsentToTelehealth(state),
    currentCheckoutStepName: getCurrentCheckoutStepName(state),
    customerUpdateErrorMessage: getUpdateAccountDetailsErrorMessage(state),
    discount: getDiscount(state),
    fbPixelAddToCartTrackedEventIDs: getFBPixelAddToCartTrackedEventIDs(state),
    fbPixelCompleteRegistrationTrackedEventIDs: getFBPixelCompleteRegistrationTrackedEventIDs(state),
    fbPixelInitiateCheckoutTrackedEventIDs: getFBPixelInitiateCheckoutTrackedEventIDs(state),
    fbFBPixelPurchaseTrackedEventIDs: getFBPixelPurchaseTrackedEventIDs(state),
    isOrderFetching: isFetching(state),
    isRegistered: getRegistrationSuccessStatus(state),
    isUpdatingUserDetails: isUpdatingAccountDetails(state),
    isUpdatingOrder: isUpdatingOrder(state),
    loggedIn: isAuthenticated(state),
    rxSubscription: getMostRecentRxSubscription(state),
    onboardingFlowType: getOnboardingFlowVariation(state),
    order: getOrder(state),
    orderFetchSuccess: isOrderFetchSuccess(state),
    orderUpdateErrorMessage: getOrderErrorMessage(state),
    products: getAllProducts(state),
    subscriptionFetchSuccess: isSubscriptionFetchSuccess(state),
    userDateOfBirth: getUserDateOfBirth(state),
    user: getUserData(state),
    visit: getMedicalVisit(state),
  }),
  {
    facebookAuthenticationRequest,
    fetchCustomerOrdersRequest,
    fetchPendingCheckoutOrderRequest,
    fetchSubscriptionsRequest,
    getMostRecentVisitRequest,
    getPaymentTokenSuccess,
    getPendingOrCreateVisitRequest,
    navigateAfterSignUp,
    navigateBack,
    navigateCheckout,
    navigateNext,
    navigateOrderCheckout,
    setFBPixelTracked,
    updateCustomerDataRequest,
    updateIsOrderExpressCheckout,
    updateOrderShippingDetailsRequest,
    updatePendingOrCreateOrderRequest,
    fetchProductsRequest,
  },
)(Checkout);

export default CheckoutPage;
