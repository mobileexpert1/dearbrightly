import {connect} from "react-redux";
import React from 'react';
import {injectStripe} from 'react-stripe-elements';
import styled from 'react-emotion';
import {getPaymentErrorMessage, isFetchingToken} from 'src/features/checkout/selectors/paymentSelectors';
import CardInfoSection from 'src/features/checkout/components/CardInfoSection';
import BottomNav from 'src/features/checkout/components/BottomNav';
import {getUser} from 'src/features/user/selectors/userSelectors';
import {
	getPaymentTokenFail, getPaymentTokenRequest,
	getPaymentTokenSuccess, clearPaymentErrorMessage
} from 'src/features/checkout/actions/paymentActions';
import {getOrder} from 'src/features/orders/selectors/orderSelectors';
import {paymentCheckoutType} from 'src/common/constants/payment';
import {getEnvValue} from 'src/common/helpers/getEnvValue';
import optimizelyService from 'src/common/services/OptimizelyService';
import { colors, breakpoints, fontFamily } from "src/variables";
import { GTMUtils } from "src/common/helpers/gtmUtils";
import { getGTMOrderCheckoutEvent } from "src/common/helpers/getGTMOrderCheckoutEvent";

const DEBUG = getEnvValue('DEBUG');

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

const PaymentNote = styled('div')`
    padding: 12px 25px 30px 25px;
    font-size: 12px;
    text-align: center;
	line-height: 24px;
	color: ${colors.veryDarkBlue};
	
	${breakpoints.sm} {
      padding-bottom: 12px;
    }  
`;

const PaymentContainer = styled.div`
	width: 60%;
	margin: 0 auto;
	overflow-y: scroll;
	height: calc(100% - 75px);
	padding-bottom: 100px;
	
    ${breakpoints.md} {
       padding: 0 5px;
       width: 100%;
       padding-bottom: 125px;
     }  
`

class PaymentComponent extends React.Component {

	handleTokenCreationFailed = (error = '') => {
		const { getPaymentTokenFail, order } = this.props;

		getPaymentTokenFail(error);

		const paymentMethod = paymentCheckoutType.properties[order.paymentCheckoutType].name;
		GTMUtils.trackCall('product-details_pay_click_token_fail', {
			success: false,
			error: error,
			payment_method: paymentMethod,
			order_id: order.id
		});

	};

	handleCardInfoSubmit = event => {
		const { getPaymentTokenRequest, getPaymentTokenSuccess, isFetchingToken, order, navigateNext } = this.props;

		if (event) {
			event.preventDefault();
		}

		if (isFetchingToken) {
			return;
		}

		getPaymentTokenRequest();

		const paymentMethod = paymentCheckoutType.properties[order.paymentCheckoutType].name;

		GTMUtils.trackCall('product-details_pay_click', {
			total_amount: order.totalAmount,
			payment_method: paymentMethod,
			order_id: order.id
		});

		// if (!DEBUG) {
		// 	optimizelyService.track('product-details_pay_click');
		// }

		// Within the context of Stripe `Elements`, this call to createToken knows which Element to
		// tokenize, since there's only one in this group.
		this.props.stripe
			.createToken()
			.then(result => {
				if (result.token) {
					getPaymentTokenSuccess(result.token.id);
					navigateNext();
					return result;
				}
				const errorMsg = result.error.message ? result.error.message : 'Unable to process payment.';
				this.handleTokenCreationFailed(errorMsg);
				return result.error;
			}).catch(error => {
			const errorMsg = error.message ? error.message : 'Unable to process payment.';
			this.handleTokenCreationFailed(errorMsg);
		});
	}

	componentDidMount() {
		if (this.props.errorMessage) {
			this.props.clearPaymentErrorMessage()
		}

		if (this.props.order) {
			const eventData = getGTMOrderCheckoutEvent(this.props.order.orderProducts);
			GTMUtils.trackCall('checkout_payment_view', eventData);
		} else {
			GTMUtils.trackCall('checkout_payment_view');
		}
	}

	render() {
		const { errorMessage, isFetchingToken, navigateBack, order } = this.props;

		return (
			<PaymentContainer id={"payment-container"}>
				<form onSubmit={this.handleCardInfoSubmit}>
					<CardInfoSection id="card-info-section" fontSize={this.props.fontSize} />
					{errorMessage && <Alert>{errorMessage}</Alert>}
					<PaymentNote>
						Please note that we will not authorize your payment until you confirm your order details on the next screen.
					</PaymentNote>
					<BottomNav
						currentCheckoutStepName={"payment"}
						backButtonType={"arrow"}
						backButtonClick={navigateBack}
						backButtonTitle={"Back"}
						disableBackButton={false}
						disableNextButton={false}
						hideNextButtonArrow={false}
						hideBackButton={false}
						nextButtonClick={this.handleCardInfoSubmit}
						nextTitle={'Review plan'}
					/>
				</form>
			</PaymentContainer>
		);
	}
}

const PaymentForm = connect(
	state => ({
		isFetchingToken: isFetchingToken(state),
		errorMessage: getPaymentErrorMessage(state),
		order: getOrder(state),
		userState: getUser(state),
	}),
	{
		getPaymentTokenRequest,
		getPaymentTokenFail,
		getPaymentTokenSuccess,
		clearPaymentErrorMessage
	},
)(PaymentComponent);

export default injectStripe(PaymentForm);
