import React from 'react';
import styled from 'react-emotion';
import AddToPlanCard from './AddToPlanCard';
import { breakpoints } from 'src/variables';
import {updateOrCreateSubscriptionRequest} from "src/features/subscriptions/actions/subscriptionsActions";

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
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;
  ${breakpoints.sm} {
    margin: 0 auto;
    flex-wrap: wrap;
  }
`;

const Title = styled.div`
  padding-bottom: 2rem;
  font-size: 20px;
  font-weight: bold;
`;

const AddToPlanCardContainer = props => {
    const { products, subscriptions, updateOrCreateSubscriptionRequest, user, subscriptionBundleOptions } = props;
    const subscriptionProducts = subscriptions && subscriptions.map(sub => sub.productUuid);
    const isRecommended = element => {
        return !subscriptionProducts.includes(element.id);
    };
    const recommendedProducts = products && products.filter(isRecommended);
    const isReturningUser = user && user.paymentProcessorCustomerId;

    return (
        <Wrapper>
            {recommendedProducts.length > 0 && (isReturningUser || subscriptions.length > 0) && (
                <div>
                    <Title className="pt-5">Add to Plan</Title>
                    <Container>
                        {recommendedProducts.map((recommendedProduct, index) => {
                            return (
                                <AddToPlanCard
                                    key={index}
                                    updateOrCreateSubscriptionRequest={updateOrCreateSubscriptionRequest}
                                    recommendedProduct={recommendedProduct}
                                    subscriptionBundleOptions={subscriptionBundleOptions}
                                />
                            );
                        })}
                    </Container>
                </div>)}
        </Wrapper>
    );
};

export default AddToPlanCardContainer;
