import React, { useEffect } from 'react';
import styled from 'react-emotion';
import MyPlanCard from './MyPlanCard';
import { breakpoints } from 'src/variables';
import NoPlanContent from './NoPlanContent';

const Wrapper = styled.div`
  margin: 3rem;
  ${breakpoints.sm} {
    margin: 1rem !important;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  ${breakpoints.sm} {
    margin: 0 auto;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: center;
  }
`;

const Title = styled.div`
  padding-bottom: 2rem;
  font-size: 20px;
  font-weight: bold;
`;

const MyPlanCardContainer = props => {
  const {
    navigateOrderCheckout,
    products,
    subscriptions,
    updateSubscriptionRequest,
    isSubscriptionUpdateSuccess,
    isUpdatingSubscription,
    subscriptionBundleOptions,
    orderStatuses,
    user,
    visit,
    pendingCheckoutOrder,
    defaultPaymentMethod,
  } = props;
  return (
      <React.Fragment>
        {subscriptions.length > 0 && (
            <Wrapper>
              <Container>
                {subscriptions.map(subscription => (
                    <MyPlanCard
                        orderStatuses={orderStatuses}
                        products={products}
                        subscription={subscription}
                        user={user}
                        defaultPaymentMethod={defaultPaymentMethod}
                        updateSubscriptionRequest={updateSubscriptionRequest}
                        isSubscriptionUpdateSuccess={isSubscriptionUpdateSuccess}
                        isUpdatingSubscription={isUpdatingSubscription}
                        subscriptionBundleOptions={subscriptionBundleOptions}
                    /> ))}
              </Container>
            </Wrapper>
        )}
        {subscriptions.length === 0 && (
            <NoPlanContent
                user={user}
                navigateOrderCheckout={navigateOrderCheckout}
                visit={visit}
                pendingCheckoutOrder={pendingCheckoutOrder}
            />
        )}
      </React.Fragment>
  );
};

export default MyPlanCardContainer;
