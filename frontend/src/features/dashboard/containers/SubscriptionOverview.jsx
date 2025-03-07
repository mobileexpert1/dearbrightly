import React from 'react';
import { connect } from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';
import { UserNotificationBar } from 'src/features/dashboard/components/UserNotificationBar';
import {
  BoxContainer,
  TableHeaderWrapper,
  TableHeader,
  AddToPlanBoxContainer,
} from 'src/features/dashboard/shared/styles';
import {
  isUserActionRequired,
  isSubscriptionActive,
  isSubscriptionNone,
} from 'src/features/dashboard/helpers/userStatuses';

import {getProductsToAddToSubscription} from 'src/features/products/selectors/productsSelectors';
import {
  getSubscriptionsErrorMessage,
  isSubscriptionUpdateSuccess,
  isUpdatingSubscription,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import {
  getProgressAnswers,
  getQuestionsLength,
  getCurrentQuestionnaireStep,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {
  updateOrCreateSubscriptionRequest,
  updateSubscriptionRequest
} from 'src/features/subscriptions/actions/subscriptionsActions';
import UpcomingOrdersTable from 'src/features/dashboard/components/UpcomingOrdersTable';
import MyPlanCardContainer from 'src/features/dashboard/components/MyPlanCardContainer';
import AddToPlanCardContainer from 'src/features/dashboard/components/AddToPlanCardContainer';
import { getDefaultPaymentMethod } from 'src/features/checkout/selectors/paymentSelectors';

class SubscriptionOverview extends React.Component {
  state = {
    isUpdating: true,
    currentTab: 1,
  };

  componentDidMount() {
    scrollToComponent(this.componentTop, { offset: -100, align: 'top' });
  }

  componentDidUpdate(prevProps) {
    const { user, orders, subscriptions } = this.props;

    if (!prevProps.orders && orders) {
      const isReturningUser = user.paymentProcessorCustomerId;

      if (isReturningUser && user && orders.length === 0) {
        this.goToPlansTab();
      }
    }

  }

  onTabClick(number) {
    this.setState({ currentTab: number });
  }

  getTabClasses(tabId) {
    return this.state.currentTab === tabId ? 'active' : '';
  }

  goToPlansTab = () => {
    this.onTabClick(2);
  }

  render() {
    const {
      user,
      visit,
      progressAnswers,
      currentQuestionnaireStep,
      questionsLength,
      pendingCheckoutOrder,
      navigateOrderCheckout,
      products,
      updateSubscriptionRequest,
      updateOrCreateSubscriptionRequest,
      isSubscriptionUpdateSuccess,
      isUpdatingSubscription,
      rxSubscription,
      subscriptions,
      nonLegacySubscriptions,
      orders,
      subscriptionBundleOptions,
      orderStatuses,
      defaultPaymentMethod,
    } = this.props;
    const answeredQuestions = progressAnswers;
    const userActionRequired = isUserActionRequired(
      user,
      visit,
      rxSubscription,
      pendingCheckoutOrder,
    );

    const rxSubscriptionNone = isSubscriptionNone(rxSubscription);
    const rxSubscriptionActive = isSubscriptionActive(rxSubscription);

    return (
      <div
        ref={section => {
          this.componentTop = section;
        }}
      >
        <div>
          {userActionRequired &&
            (rxSubscriptionActive || rxSubscriptionNone) && (
              <div>
                <UserNotificationBar
                  localUserAnswers={answeredQuestions}
                  user={user}
                  visit={visit}
                  rxSubscription={rxSubscription}
                  currentQuestionnaireStep={currentQuestionnaireStep}
                  questionsLength={questionsLength}
                  displayOnlySkinProfileActions={false}
                  pendingCheckoutOrder={pendingCheckoutOrder}
                  navigateOrderCheckout={navigateOrderCheckout}
                />
              </div>
            )}
          <BoxContainer>
            <TableHeaderWrapper>
              <TableHeader onClick={() => this.onTabClick(1)} className={this.getTabClasses(1)}>
                Upcoming orders
              </TableHeader>

              <TableHeader onClick={() => this.onTabClick(2)} className={this.getTabClasses(2)}>
                Plan
              </TableHeader>
            </TableHeaderWrapper>
            {this.state.currentTab === 1 ? (
              <UpcomingOrdersTable
                  orders={orders}
                  orderStatuses={orderStatuses}
                  user={user}
                  subscriptions={nonLegacySubscriptions}
                  goToPlansTab={this.goToPlansTab}
                  navigateOrderCheckout={navigateOrderCheckout}
                  pendingCheckoutOrder={pendingCheckoutOrder}
                  visit={visit}
              />
            ) : (
              <BoxContainer>
                <MyPlanCardContainer
                  subscriptions={subscriptions}
                  subscriptionBundleOptions={subscriptionBundleOptions}
                  orderStatuses={orderStatuses}
                  products={products}
                  updateSubscriptionRequest={updateSubscriptionRequest}
                  isSubscriptionUpdateSuccess={isSubscriptionUpdateSuccess}
                  isUpdatingSubscription={isUpdatingSubscription}
                  user={user}
                  navigateOrderCheckout={navigateOrderCheckout}
                  pendingCheckoutOrder={pendingCheckoutOrder}
                  visit={visit}
                  defaultPaymentMethod={defaultPaymentMethod}
                />
                <AddToPlanBoxContainer>
                  <AddToPlanCardContainer
                    user={user}
                    products={products}
                    subscriptions={subscriptions}
                    subscriptionBundleOptions={subscriptionBundleOptions}
                    updateOrCreateSubscriptionRequest={updateOrCreateSubscriptionRequest}
                  />
                </AddToPlanBoxContainer>
              </BoxContainer>
            )}
          </BoxContainer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  subscriptionErrorMessage: getSubscriptionsErrorMessage(state),
  isUpdatingSubscription: isUpdatingSubscription(state),
  subscriptionsErrorMessage: getSubscriptionsErrorMessage(state),
  products: getProductsToAddToSubscription(state),
  progressAnswers: getProgressAnswers(state),
  currentQuestionnaireStep: getCurrentQuestionnaireStep(state),
  questionsLength: getQuestionsLength(state),
  isSubscriptionUpdateSuccess: isSubscriptionUpdateSuccess(state),
  defaultPaymentMethod: getDefaultPaymentMethod(state),
});

export const SubscriptionOverviewContainer = connect(
  mapStateToProps,
  {
    updateSubscriptionRequest,
    updateOrCreateSubscriptionRequest,
  },
)(SubscriptionOverview);
