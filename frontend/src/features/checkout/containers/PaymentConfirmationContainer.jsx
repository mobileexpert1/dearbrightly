import React from 'react';
import PaymentConfirmation from 'src/features/checkout/components/PaymentConfirmation';

export default class PaymentConfirmationContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { fontSize, navigateBack, navigateCheckout, navigateNext, onPaymentSuccess } = this.props;
        return (
          <PaymentConfirmation
            fontSize={fontSize}
            width={500}
            navigateBack={navigateBack}
            navigateCheckout={navigateCheckout}
            navigateNext={navigateNext}
            onPaymentSuccess={onPaymentSuccess}
          />
        );
    }
}
