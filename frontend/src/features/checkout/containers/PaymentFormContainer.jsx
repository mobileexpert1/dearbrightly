import React from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';
import PaymentForm from 'src/features/checkout/components/PaymentForm';

const STRIPE_KEY = process.env.STRIPE_KEY_PUBLISHABLE;

export default class PaymentFormContainer extends React.Component {

    render() {
        const { fontSize, navigateBack, navigateCheckout, navigateNext } = this.props;
        return (
            <StripeProvider apiKey={STRIPE_KEY}>
                <Elements>
                    <PaymentForm
                      fontSize={fontSize}
                      width={500}
                      navigateBack={ navigateBack }
                      navigateCheckout={navigateCheckout}
                      navigateNext={ navigateNext }
                    />
                </Elements>
            </StripeProvider>
        );
    }
}