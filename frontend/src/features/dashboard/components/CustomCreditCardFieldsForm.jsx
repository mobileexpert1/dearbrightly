import React from 'react';
import { connect } from 'react-redux';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  injectStripe,
} from 'react-stripe-elements';
import styled from 'react-emotion';

import {
  getPaymentErrorMessage,
  isCreditCardUpdateSuccess,
  isCreditCardUpdating,
} from 'src/features/checkout/selectors/paymentSelectors';
import { getUser } from 'src/features/user/selectors/userSelectors';
import { updateCreditCardRequest } from 'src/features/checkout/actions/paymentActions';
import { MessageBar } from 'src/features/dashboard/shared/components/Messages';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
import {
  HeaderWrapper,
  HeaderContent,
  BreakLine,
  SaveButton,
  InputTitle,
} from 'src/features/dashboard/shared/myAccountStyles';
import { successMessages } from 'src/features/dashboard/constants/myAccountPage';
import { fontSize, colors } from 'src/variables';
import { cardIcons } from 'src/features/dashboard/constants/paymentMethodsContent';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { Row, Col } from 'reactstrap';
import { UserPaymentInfo } from 'src/common/components/UserPaymentInfo';
import { AssociatedSubscriptions } from 'src/features/dashboard/components/AssociatedSubscriptions';

const StyledForm = styled.form`
  max-width: 26rem;
  display: flex;
  flex-direction: column;
`;

const ElementWrapper = styled.div`
  padding: 0.8rem 0.6rem 0.6rem;
  border: 1px solid ${colors.darkModerateBlueOpacity};
  outline: 0;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const CardIcon = styled.img`
  height: 1.8rem;
  width: 3rem;
  margin-top: 2rem;
  margin-right: 0.3rem;
`;

const createOptions = () => {
  return {
    style: {
      base: {
        fontSize: fontSize.small,
        color: colors.shark,
        letterSpacing: '0.025em',
        fontFamily: 'PFHandbookPro-Regular',
        lineHeight: '24px',
        '::placeholder': {
          color: colors.grayishBlue,
        },
      },
      invalid: {
        color: colors.darkPink,
      },
    },
  };
};

class CustomCreditCardFieldsFormC extends React.Component {
  constructor(props){
    super(props);
  }
  state = {
    errorMessage: '',
    successMessage: '',
    tokenCreationErrorMessage: '',
  };

  componentDidUpdate(prevProps) {
    const { isCreditCardUpdateSuccess } = this.props;

    if (!prevProps.isCreditCardUpdateSuccess && isCreditCardUpdateSuccess) {
      this.setState({ successMessage: successMessages.paymentMethod });
    }
  }

  handleChange = ({ error }) => {
    if (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  handleTokenCreationFailed = (error = '') => {
    this.setState({
      tokenCreationErrorMessage: error,
    });
  };

  handleCardInfoSubmit = event => {
    const { updateCreditCardRequest, userState, associatedSubscriptions, isDefault } = this.props;
    event.preventDefault();

    this.setState({
      tokenCreationErrorMessage: '',
      successMessage: '',
    });

    this.props.stripe
      .createToken()
      .then(result => {
        if (result.token) {
          this.setState({ tokenCreationErrorMessage: '' });
          if (isDefault || !associatedSubscriptions) {
            updateCreditCardRequest(userState.user, result.token.id);
          } else {
            updateCreditCardRequest(userState.user, result.token.id, associatedSubscriptions);
          }
          return result;
        }
        const errorMsg = result.error.message || 'Invalid input';
        this.handleTokenCreationFailed(errorMsg);
        return result.error;
      })
      .catch(error => {
        const errorMsg = error.body.detail || 'Unable to update credit card details.';
        this.handleTokenCreationFailed(errorMsg);
      });
  };

  render() {
    const { 
      paymentErrorMessage, 
      isCreditCardUpdating, 
      associatedSubscriptions,
      paymentDetails,
      isDefault,
    } = this.props;
    const { tokenCreationErrorMessage, successMessage } = this.state;

    const errorMessage = tokenCreationErrorMessage || paymentErrorMessage;

    const formInputs = [
      {
        title: 'Card number',
        component: <CardNumberElement {...createOptions()} onChange={this.handleChange} />,
      },
      {
        title: 'Expiration date',
        component: <CardExpiryElement {...createOptions()} onChange={this.handleChange} />,
      },
      {
        title: 'CVC',
        component: <CardCVCElement {...createOptions()} onChange={this.handleChange} />,
      },
    ];

    return (
      <CustomSpinner spinning={isCreditCardUpdating} blur={true} animate={true}>
        <Row>
          <Col xs="12" sm="12" md="6" lg="6" xl="6">
            <BoxContentWrapper>
              <HeaderWrapper>
                <HeaderContent>{isDefault ? 'Default payment info' : 'Payment info'}</HeaderContent>
                <BreakLine />
              </HeaderWrapper>
              <div>
                {this.props.userState.user && (
                  <UserPaymentInfo 
                    user={this.props.userState.user} 
                    paymentDetails={paymentDetails}
                  />
                  )
                }
              </div>
              <div style={{ display: "flex", textAlign: "center" }}>
                <div style={{ margin: "auto" }}>
                  {cardIcons.map(icon => (
                    <CardIcon key={icon} src={icon} />
                  ))}
                </div>
              </div>
              <br></br>
              <AssociatedSubscriptions associatedSubscriptions={associatedSubscriptions} />
            </BoxContentWrapper>

          </Col>
          <Col xs="12" sm="12" md="6" lg="6" xl="6">
            <BoxContentWrapper>
              <HeaderWrapper>
                <HeaderContent>Update card</HeaderContent>
                <BreakLine />
              </HeaderWrapper>
              <React.Fragment>
                <StyledForm onSubmit={this.handleCardInfoSubmit}>
                  {formInputs.map(input => (
                    <div key={input.title}>
                      <InputTitle>{input.title}</InputTitle>
                      <ElementWrapper>{input.component}</ElementWrapper>
                    </div>
                  ))}
                  <SaveButton>Save</SaveButton>
                </StyledForm>
              </React.Fragment>
              {errorMessage && <MessageBar isErrorMessage messageContent={errorMessage} />}
              {successMessage && <MessageBar messageContent={successMessage} />}
            </BoxContentWrapper>
          </Col>
        </Row>

      </CustomSpinner>
    );
  }
}

const CustomCreditCardFieldsForm = connect(
  state => ({
    isCreditCardUpdateSuccess: isCreditCardUpdateSuccess(state),
    paymentErrorMessage: getPaymentErrorMessage(state),
    isCreditCardUpdating: isCreditCardUpdating(state),
    userState: getUser(state),
  }),
  {
    updateCreditCardRequest,
  },
)(CustomCreditCardFieldsFormC);

export default injectStripe(CustomCreditCardFieldsForm);
