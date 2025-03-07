import { connect } from "react-redux";
import React from 'react';
import { injectStripe } from 'react-stripe-elements';
import styled from 'react-emotion';
import { Spinner } from 'reactstrap';
import { getPaymentErrorMessage, isCreditCardUpdating, isCreditCardUpdateSuccess } from 'src/features/checkout/selectors/paymentSelectors';
import CardInfoSection from 'src/features/checkout/components/CardInfoSection';
import { getUser } from 'src/features/user/selectors/userSelectors';
import { updateCreditCardRequest } from 'src/features/checkout/actions/paymentActions';
import { DarkButton } from 'src/common/components/Buttons';
import { colors, fontFamily } from "src/variables";

const ButtonContainer = styled('div')`
  padding-top: 15px;
  padding-left: 15px;
  align-items: right;
`;

const Alert = styled('div')`
    color: ${colors.mulberry};
    border-color: #f5c6cb;
    padding: 5;
    margin: 10px;
	font-family: ${fontFamily.baseFont};
`;

class CreditCardComponent extends React.Component {

	constructor(props) {
		super(props)
		this.handleCardInfoSubmit = this.handleCardInfoSubmit.bind(this);
	}

	state = {
		tokenCreationErrorMessage: '',
	};

	componentDidMount() {
		this.props.submitCardInfo(this.handleCardInfoSubmit);
	}

	componentDidUpdate(prevProps) {
		const { isCreditCardUpdateSuccess, onSubmit } = this.props;

		if (!prevProps.isCreditCardUpdateSuccess && isCreditCardUpdateSuccess && onSubmit) {
			onSubmit();
		}
	}

	handleTokenCreationFailed = (error = '') => {
		const { order } = this.props;

		this.setState({
			tokenCreationErrorMessage: error,
		});
	};

	handleCardInfoSubmit = event => {
		const { updateCreditCardRequest, userState } = this.props;
		event && event.preventDefault();

		this.setState({
			tokenCreationErrorMessage: ''
		});

		// Within the context of Stripe `Elements`, this call to createToken knows which Element to
		// tokenize, since there's only one in this group.
		this.props.stripe
			.createToken()
			.then(result => {
				if (result.token) {
					this.setState({ tokenCreationErrorMessage: '' });
					updateCreditCardRequest(userState.user, result.token.id);
					return result;
				}
				let errorMsg = result.error ? result.error.message : 'Invalid input';
				this.handleTokenCreationFailed(errorMsg);
				return result.error;
			}).catch(error => {
				const errorMsg = error.body ? error.body.detail : 'Unable to update credit card details.';
				this.handleTokenCreationFailed(errorMsg);
			});
	};

	render() {
		const {
			isCreditCardUpdating, paymentErrorMessage,
			isUpdatePayment, fontSize, onCardInfoChange
		} = this.props;
		const { tokenCreationErrorMessage } = this.state;

		var errorMessage = null;
		if (tokenCreationErrorMessage.length > 0) {
			errorMessage = tokenCreationErrorMessage;
		} else if (paymentErrorMessage.length > 0) {
			errorMessage = paymentErrorMessage
		}

		return (
			<form onSubmit={this.handleCardInfoSubmit}>
				<CardInfoSection onCardInfoChange={onCardInfoChange} isUpdatePayment={isUpdatePayment} fontSize={fontSize} />
				{errorMessage && <Alert>{errorMessage}</Alert>}
				{!isUpdatePayment && (<ButtonContainer>
					<DarkButton type="submit">
						{!isCreditCardUpdating ? 'Update' : <Spinner color="primary" />}
					</DarkButton>
				</ButtonContainer>)}
			</form>
		);
	}
}

const CreditCard = connect(
	state => ({
		isCreditCardUpdating: isCreditCardUpdating(state),
		isCreditCardUpdateSuccess: isCreditCardUpdateSuccess(state),
		paymentErrorMessage: getPaymentErrorMessage(state),
		userState: getUser(state),
	}),
	{
		updateCreditCardRequest,
	},
)(CreditCardComponent);

export default injectStripe(CreditCard);
