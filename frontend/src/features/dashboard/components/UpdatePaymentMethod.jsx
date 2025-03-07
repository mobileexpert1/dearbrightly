import React from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';
import CustomCreditCardFieldsForm from './CustomCreditCardFieldsForm';

const STRIPE_KEY = process.env.STRIPE_KEY_PUBLISHABLE;

export default class UpdatePaymentMethod extends React.Component{
  constructor(props) {
    super(props);
  }

  subscriptionsByPaymentMethods = (subscriptions) => {
    let subscriptionsByPaymentMethods = {};
    if(subscriptions){
      subscriptionsByPaymentMethods = subscriptions.reduce((accumulator, currentValue) => {
        if(currentValue.paymentDetails){
          const key = currentValue.paymentDetails.id;
          if(!accumulator[key]){
            accumulator[key] = [];
          }
          accumulator[key].push(currentValue);
        }
        return accumulator;
      }, {});
    }
    return (
      Object.entries(subscriptionsByPaymentMethods).map(([_, v]) => (
        <Elements>
          <CustomCreditCardFieldsForm
            paymentDetails={v[0].paymentDetails}
            associatedSubscriptions={v}
          />
        </Elements>
      ))
    )
  }

  render() {
    const { subscriptions, activeSubscriptionsWithoutPaymentDetails } = this.props;

    return (
      <StripeProvider apiKey={STRIPE_KEY}>
        <React.Fragment>
          <Elements>
            <CustomCreditCardFieldsForm isDefault associatedSubscriptions={activeSubscriptionsWithoutPaymentDetails}/>
          </Elements>
            {subscriptions && subscriptions.length > 0 && (
              <React.Fragment>
                {this.subscriptionsByPaymentMethods(subscriptions)}
              </React.Fragment>
            )}
        </React.Fragment>
      </StripeProvider>
    )
  }
}
