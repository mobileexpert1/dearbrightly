import React, { Component } from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { breakpoints, colors, fontSize, fontFamily } from 'src/variables';
import { PatientChatMessageContainer } from 'src/features/emr/containers/PatientChatMessageContainer';
import { redirectToUrl } from 'src/common/actions/navigationActions';
import { getConsentToTelehealth, getUserData, hasUnreadMessages } from 'src/features/user/selectors/userSelectors';
import { history } from 'src/history';
import { cleanOrdersData } from 'src/features/orders/actions/ordersActions';
import UserLeftNav from '../components/UserLeftNav';
import { UserDashboardContent } from '../components/UserDashboardContent';
import { SkinProfileContainer } from './SkinProfileContainer';
import { updateCustomerDataRequest } from 'src/features/customers/actions/customersActions';
import { fetchCustomerOrdersRequest } from 'src/features/orders/actions/ordersActions';
import {
  isVisitFetchSuccess,
  getMedicalVisit,
  getMedicalVisitErrorMessage,
  isVisitBeingFetched,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { MySkinProfileContainer } from './MySkinProfileContainer';
import {
  getActiveSubscriptions,
  getActiveNonLegacySubscriptions,
  getMostRecentRxSubscription,
  getShipDateToSubscriptionsMap,
  getShipDateToSubscriptionsMapForBundle,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import {
  isSubscriptionNone,
  isUserActionRequired,
  isUserPendingCheckout,
} from 'src/features/dashboard/helpers/userStatuses';
import EditPhotosContainer from './EditPhotosContainer';
import { TreatmentPlanContainer } from './TreatmentPlanContainer';
import { MyAccountContainer } from './MyAccountContainer';

import { fetchSubscriptionsRequest } from 'src/features/subscriptions/actions/subscriptionsActions';
import {
  getMostRecentVisitRequest,
  getPendingOrCreateVisitRequest,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {
  isSubscriptionFetchSuccess,
  isFetchingSubscriptions,
  getSubscriptionsErrorMessage,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { isAuthenticated } from 'src/features/auth/selectors/authenticationSelectors';
import UploadPhotosCheckoutContainer from 'src/features/checkout/containers/UploadPhotosCheckoutContainer';
import {
  getOrder,
  isFetching,
  isOrderFetchSuccess,
} from 'src/features/orders/selectors/orderSelectors';
import { getOrderStatuses } from 'src/features/orders/selectors/ordersSelectors';
import {
  navigateCheckout,
  navigateOrderCheckout,
} from 'src/features/checkout/actions/checkoutStepsActions';
import { FRONT_FACE, LEFT_FACE, RIGHT_FACE } from 'src/common/constants/medicalVisits';
import { fetchPendingCheckoutOrderRequest } from 'src/features/orders/actions/ordersActions';
import { SubscriptionOverviewContainer } from './SubscriptionOverview';
import {
  getOrdersCreatedWithinLast2Weeks,
  isDataFetchedSuccessfully,
  isFetchingOrders,
} from "src/features/orders/selectors/ordersSelectors";
import { getDefaultPaymentMethodRequest } from 'src/features/checkout/actions/paymentActions';
import { 
  isFetchingPaymentMethods,
  getPaymentErrorMessage,
  isPaymentMethodsFetchSuccess,
  isCreditCardUpdateSuccess,
  isCreditCardUpdating,
} from 'src/features/checkout/selectors/paymentSelectors';

const Wrapper = styled.div`
  max-width: ${props => !props.isQuestionnaireOpen && '1280px'};
  min-height: 90vh;
  margin: 0 auto;
  padding-right: ${props =>
    props.isQuestionnaireOpen || props.isPhotoUploadOpen ? '0px' : '30px'};
  padding-left: ${props => (props.isQuestionnaireOpen || props.isPhotoUploadOpen ? '0px' : '30px')};
  font-family: ${fontFamily.baseFont};

  ${breakpoints.sm} {
    min-height: 86vh;
  }

  ${breakpoints.xs} {
    min-height: ${props => (props.isPhotoUploadOpen ? 0 : '95vh')};
    padding-right: ${props =>
      props.isQuestionnaireOpen || props.isPhotoUploadOpen ? '0px' : '18px'};
    padding-left: ${props =>
      props.isQuestionnaireOpen || props.isPhotoUploadOpen ? '0px' : '18px'};
  }
`;

const BodyWrapper = styled.div`
  padding: ${props => (props.isQuestionnaireOpen ? '29px 0 50px 0' : '50px 0 0')};
  display: flex;
  min-height: 100vh;
  position: relative;

  ${breakpoints.md} {
    margin-top: ${props => (props.isQuestionnaireOpen ? '29px' : '2rem')};
    flex-direction: column;
  }

  ${breakpoints.sm} {
    min-height: 86vh;
  }
  ${breakpoints.xs} {
    margin-top: 0;
    padding-top: ${props => !props.isPhotoUploadOpen && '2rem'};
    min-height: 84vh;
    height: fit-content;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-grow: 3;
  flex-direction: column;
  padding-left: ${props => (props.isQuestionnaireOpen || props.isPhotoUploadOpen ? 0 : '30px')};

  ${breakpoints.md} {
    padding-left: initial;
  }

  ${breakpoints.xs} {
    position: relative;
  }
`;

const MessagesBanner = styled.div`
  position: absolute;
  background-color: ${colors.blackSqueeze};
  top: 0px;
  z-index: 1;
  border-radius: 4px;
  width: 80%;

  ${breakpoints.lg} {
    width: 77%;
  }

  ${breakpoints.md} {
    width: 100%;
  }
`;

const MessagesContent = styled.p`
  margin: 0;
  padding: 1.5rem 2rem 1rem;
  color: ${colors.darkModerateBlue};
  font-weight: 600;
  font-size: ${fontSize.small};
  line-height: 17px;

  ${breakpoints.sm} {
    padding: 0.5rem 1rem;
  }
`;

class UserDashboardContainer extends Component {
  componentDidMount() {
    const {
      fetchCustomerOrdersRequest,
      fetchPendingCheckoutOrderRequest,
      fetchSubscriptionsRequest,
      getMostRecentVisitRequest,
      loggedIn,
      rxSubscription,
      isOrderFetching,
      isOrderFetchSuccess,
      isOrdersFetching,
      isOrdersFetchSuccess,
      user,
      visitFetchSuccess,
    } = this.props;

    if (loggedIn) {
      if (!rxSubscription && user && user.id) {
        fetchSubscriptionsRequest(user.id);
      }

      if (!visitFetchSuccess) {
        getMostRecentVisitRequest();
      }

      if (!isOrderFetching && !isOrderFetchSuccess) {
        fetchPendingCheckoutOrderRequest();
      }

      if (!isOrdersFetching && !isOrdersFetchSuccess && user && user.id) {
        fetchCustomerOrdersRequest(user.id);
      }
    }
  }

  //added componentDidUpdate to handle case when user data is not yet available during component mounting
  componentDidUpdate(prevProps) {
    const {
      fetchCustomerOrdersRequest,
      fetchPendingCheckoutOrderRequest,
      fetchSubscriptionsRequest,
      getMostRecentVisitRequest,
      loggedIn,
      rxSubscription,
      user,
      visitFetchSuccess,
      isOrderFetchSuccess,
      isVisitBeingFetched,
      isFetchingSubscriptions,
      medicalVisitError,
      subscriptionErrorMessage,
      subscriptionFetchSuccess,
      isOrdersFetching,
      isOrderFetching,
      isOrdersFetchSuccess,
      getDefaultPaymentMethodRequest,
      isFetchingPaymentMethods,
      isPaymentMethodsFetchSuccess,
      paymentErrorMessage,
      isCreditCardUpdateSuccess,
      isCreditCardUpdating,
    } = this.props;
    if (loggedIn) {
      if (
        (!isCreditCardUpdating && !prevProps.isCreditCardUpdateSuccess && isCreditCardUpdateSuccess) ||
        (
          !subscriptionFetchSuccess &&
          !rxSubscription &&
          user &&
          user.id &&
          !isFetchingSubscriptions &&
          subscriptionErrorMessage.length === 0
        )
      ) {
        fetchSubscriptionsRequest(user.id);
      }

      if (!visitFetchSuccess && !isVisitBeingFetched && medicalVisitError.length === 0) {
        getMostRecentVisitRequest();
      }

      if (!isOrderFetching && !isOrderFetchSuccess) {
        fetchPendingCheckoutOrderRequest();
      }

      if (!isOrdersFetching && !isOrdersFetchSuccess && user && user.id) {
        fetchCustomerOrdersRequest(user.id);
      }

      if (
        (!isCreditCardUpdating && !prevProps.isCreditCardUpdateSuccess && isCreditCardUpdateSuccess) ||
        (
          !isFetchingPaymentMethods &&
          !isPaymentMethodsFetchSuccess &&
          !paymentErrorMessage &&
          user && user.paymentProcessorCustomerId
        )
      ) {
        getDefaultPaymentMethodRequest(user.id);
      }
    }
  }

  componentWillUnmount() {
    this.props.cleanOrdersData();
  }

  render() {
    const {
      consentToTelehealth,
      user,
      getPendingOrCreateVisitRequest,
      isUpdating,
      rxSubscription,
      medicalVisitError,
      navigateCheckout,
      navigateOrderCheckout,
      pendingCheckoutOrder,
      visit,
      visitFetchSuccess,
      isOrderFetchSuccess,
      userHasUnreadMessages,
      subscriptions,
      nonLegacySubscriptions,
    } = this.props;
    const userActionRequired = isUserActionRequired(
      user,
      visit,
      rxSubscription,
      pendingCheckoutOrder,
    );
    const noRxSubscription = isSubscriptionNone(rxSubscription);
    let photosNavigationItem = null;
    const rxOrderPendingCheckout =
      pendingCheckoutOrder &&
      pendingCheckoutOrder.orderType === 'Rx' &&
      isUserPendingCheckout(pendingCheckoutOrder, visit);

    const mostRecentOrderId =
      (this.props.location.state && this.props.location.state.mostRecentOrderId) || null;

    const activeTabId =
      (this.props.location.state && this.props.location.state.activeTabId) || null;

    let navigationItems = [
      {
        name: 'My plan',
        url: 'my-plan',
        exact: true,
        hideInNav: false,
        render: () => (
          <SubscriptionOverviewContainer
            orders={this.props.orders}
            orderStatuses={this.props.orderStatuses}
            rxSubscription={rxSubscription}
            subscriptions={subscriptions}
            nonLegacySubscriptions={nonLegacySubscriptions}
            shipDateToSubscriptionsMap={this.props.shipDateToSubscriptionsMap}
            subscriptionBundleOptions={this.props.subscriptionBundleOptions}
            pendingCheckoutOrder={pendingCheckoutOrder}
            user={user}
            visit={visit}
            isUpdating={isUpdating}
            navigateCheckout={navigateCheckout}
            navigateOrderCheckout={navigateOrderCheckout}
          />
        ),
        userActionRequired: userActionRequired,
      },
      {
        name: 'Treatment plan',
        url: 'treatment-plan',
        hideInNav: noRxSubscription,
        render: () => <TreatmentPlanContainer user={user} rxSubscription={rxSubscription} />,
      },
      {
        name: 'Messages',
        url: 'messages',
        render: () => <PatientChatMessageContainer />,
        hideInNav: !visit.id,
        userActionRequired: userHasUnreadMessages,
      },
      {
        name: 'Skin Profile',
        url: 'skin-profile',
        render: () => (
          <SkinProfileContainer
            user={user}
            visit={visit}
            visitFetchSuccess={visitFetchSuccess}
            medicalVisitError={medicalVisitError}
            pendingCheckoutOrder={pendingCheckoutOrder}
            navigateOrderCheckout={navigateOrderCheckout}
            isOrderFetchSuccess={isOrderFetchSuccess}
            getPendingOrCreateVisitRequest={getPendingOrCreateVisitRequest}
            rxSubscription={rxSubscription}
            consentToTelehealth={consentToTelehealth}
          />
        ),
        hideInNav: true,
      },
      {
        name: 'Skin Profile',
        url: 'my-skin',
        render: () => (
          <MySkinProfileContainer
            subscription={rxSubscription}
            user={user}
            visit={visit}
            pendingCheckoutOrder={pendingCheckoutOrder}
            navigateOrderCheckout={navigateOrderCheckout}
          />
        ),
        hideInNav: !visit.id || rxOrderPendingCheckout,
      },
      {
        name: 'Account',
        url: 'my-account',
        render: () => (
          <MyAccountContainer
            mostRecentOrderId={mostRecentOrderId}
            activeTab={activeTabId}
            user={user}
            subscriptions={subscriptions}
          />
        ),
        hideInNav: false,
      },
      {
        name: 'Photos',
        url: 'photos',
        hideInNav: true,
        render: () => (
          <UploadPhotosCheckoutContainer
            user={user}
            visit={visit}
            photoTypes={[FRONT_FACE, LEFT_FACE, RIGHT_FACE]}
          />
        ),
      },
      {
        name: 'Edit photos',
        url: 'edit-photos',
        hideInNav: true,
        render: () => (
          <EditPhotosContainer
            user={user}
            visit={visit}
            onSubmit={() => history.push('/user-dashboard/edit-photos')}
          />
        ),
      },
    ];

    if (photosNavigationItem) {
      navigationItems.push(photosNavigationItem);
    }

    const isQuestionnaireOpen = window.location.pathname.includes('user-dashboard/skin-profile');
    const isPhotoUploadOpen = window.location.pathname.includes('user-dashboard/photos');
    const areMessagesOpen = window.location.pathname.includes('user-dashboard/messages');

    return (
      <Wrapper
        isQuestionnaireOpen={isQuestionnaireOpen}
        isPhotoUploadOpen={isPhotoUploadOpen}
        areMessagesOpen={areMessagesOpen}
      >
        <BodyWrapper
          isQuestionnaireOpen={isQuestionnaireOpen}
          isPhotoUploadOpen={isPhotoUploadOpen}
        >
          <UserLeftNav
            navigationItems={navigationItems}
            routePrefix="/user-dashboard/"
            isQuestionnaireOpen={isQuestionnaireOpen}
            isPhotoUploadOpen={isPhotoUploadOpen}
          />
          <ContentWrapper
            isQuestionnaireOpen={isQuestionnaireOpen}
            isPhotoUploadOpen={isPhotoUploadOpen}
          >
            {areMessagesOpen && (
              <MessagesBanner>
                <MessagesContent>
                  For treatment related questions, message your provider here anytime! For anything
                  else, email support@dearbrightly.com.
                </MessagesContent>
              </MessagesBanner>
            )}
            <UserDashboardContent
              routePrefix="/user-dashboard/"
              navigationItems={navigationItems}
              defaultRoute="my-plan"
            />
          </ContentWrapper>
        </BodyWrapper>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    consentToTelehealth: getConsentToTelehealth(state),
    isUpdating: state.user.updatingAccountDetails,
    loggedIn: isAuthenticated(state),
    rxSubscription: getMostRecentRxSubscription(state),
    subscriptionFetchSuccess: isSubscriptionFetchSuccess(state),
    user: getUserData(state),
    visit: getMedicalVisit(state),
    visitFetchSuccess: isVisitFetchSuccess(state),
    pendingCheckoutOrder: getOrder(state),
    medicalVisitError: getMedicalVisitErrorMessage(state),
    isOrderFetchSuccess: isOrderFetchSuccess(state),
    isOrderFetching: isFetching(state),
    isOrdersFetching: isFetchingOrders(state),
    isOrdersFetchSuccess : isDataFetchedSuccessfully(state),
    userHasUnreadMessages: hasUnreadMessages(state),
    isVisitBeingFetched: isVisitBeingFetched(state),
    isFetchingSubscriptions: isFetchingSubscriptions(state),
    subscriptionErrorMessage: getSubscriptionsErrorMessage(state),
    orders: getOrdersCreatedWithinLast2Weeks(state),
    orderStatuses: getOrderStatuses(state),
    subscriptions: getActiveSubscriptions(state),
    nonLegacySubscriptions: getActiveNonLegacySubscriptions(state),
    shipDateToSubscriptionsMap: getShipDateToSubscriptionsMap(state),
    subscriptionBundleOptions: getShipDateToSubscriptionsMapForBundle(state),
    isFetchingPaymentMethods: isFetchingPaymentMethods(state),
    paymentErrorMessage: getPaymentErrorMessage(state),
    isPaymentMethodsFetchSuccess: isPaymentMethodsFetchSuccess(state),
    isCreditCardUpdateSuccess: isCreditCardUpdateSuccess(state),
    isCreditCardUpdating: isCreditCardUpdating(state),
  }),
  {
    cleanOrdersData,
    fetchCustomerOrdersRequest,
    fetchPendingCheckoutOrderRequest,
    fetchSubscriptionsRequest,
    getPendingOrCreateVisitRequest,
    getMostRecentVisitRequest,
    redirectToUrl,
    updateCustomerDataRequest,
    navigateCheckout,
    navigateOrderCheckout,
    getDefaultPaymentMethodRequest,
  },
)(UserDashboardContainer);
