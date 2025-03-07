import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import {
  getInitKey,
  getPaymentErrorMessage,
  isPaymentSubmitSuccess,
  isPaymentSubmitting,
} from 'src/features/checkout/selectors/paymentSelectors';
import { CartContainer } from 'src/features/checkout/components/CartContainer';
import { submitPaymentRequest } from 'src/features/checkout/actions/paymentActions';
import {
  getPaymentTokenSuccess,
  paymentSuccess,
} from 'src/features/checkout/actions/paymentActions';
import { getUser } from 'src/features/user/selectors/userSelectors';
import {
  getOrder,
  isUpdatingOrder,
  isUpdatingOrderTotal,
} from 'src/features/orders/selectors/orderSelectors';
import { CustomSpinner } from 'src/common/components/CustomSpinner';
import { fontFamily } from 'src/variables';
import { GTMUtils } from "src/common/helpers/gtmUtils";
import { getGTMOrderCheckoutEvent } from "src/common/helpers/getGTMOrderCheckoutEvent";

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

class PaymentConfirmationComponent extends React.Component {

  componentDidMount() {
    if (this.props.order) {
			const eventData = getGTMOrderCheckoutEvent(this.props.order.orderProducts);
			GTMUtils.trackCall('checkout_confirm_payment_view', eventData);
		} else {
			GTMUtils.trackCall('checkout_confirm_payment_view');
		}
  }

  componentDidUpdate(prevProps) {
    const { isPaymentSubmitSuccess } = this.props;

    if (!prevProps.isPaymentSubmitSuccess && isPaymentSubmitSuccess) {
      this.handlePaymentAccepted();
    }
  }

  handlePaymentAccepted = () => {
    const { order, paymentSuccess, onPaymentSuccess } = this.props;

    paymentSuccess(order.id);

    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    const { order, stripeToken, submitPaymentRequest } = this.props;

    // requirement from Attentive
    window.attentive_purchase = '1';
    window.attentive_order = order.id;

    submitPaymentRequest(stripeToken, order);
  };

  render() {
    const {
      isPaymentSubmitting,
      navigateBack,
      order,
      paymentErrorMessage,
      orderUpdateErrorMessage,
      updatingOrder,
      updatingOrderTotal,
    } = this.props;

    return (
      <CustomSpinner
        spinning={updatingOrder || isPaymentSubmitting || updatingOrderTotal}
        blur={true}
      >
        <form
          id={'payment-confirmation-form'}
          style={{ margin: 0 }}
          onSubmit={e => e.preventDefault()}
        >
          {paymentErrorMessage && <Alert>{paymentErrorMessage}</Alert>}
          <div style={{ marginTop: 20 }}>
            <CartContainer
              orderUpdateErrorMessage={ orderUpdateErrorMessage }
              navigateBack={navigateBack}
              order={order}
              handleCardInfoSubmit={this.handleSubmit}
            />
          </div>
        </form>
      </CustomSpinner>
    );
  }
}

const PaymentConfirmation = connect(
  state => ({
    isPaymentSubmitting: isPaymentSubmitting(state),
    isPaymentSubmitSuccess: isPaymentSubmitSuccess(state),
    order: getOrder(state),
    updatingOrder: isUpdatingOrder(state),
    updatingOrderTotal: isUpdatingOrderTotal(state),
    paymentErrorMessage: getPaymentErrorMessage(state),
    stripeToken: getInitKey(state),
    userState: getUser(state),
  }),
  {
    getPaymentTokenSuccess,
    paymentSuccess,
    submitPaymentRequest,
  },
)(PaymentConfirmationComponent);

export default PaymentConfirmation;
