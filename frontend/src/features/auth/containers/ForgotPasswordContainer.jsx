import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { requestPasswordResetEmail } from '../actions/passwordResetActions';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import {
  getPasswordResetErrorMessage,
  isFetchingPasswordReset,
  isPasswordEmailSent,
} from 'src/features/auth/selectors/passwordResetSelectors';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
const DEBUG = getEnvValue('DEBUG');

const Container = styled('div')`
    width: 100%;
    height: 100%;
    margin: 0;
    overflow-y: scroll;
    @media (min-height:568px) and (min-width: 576px) {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap
    }
`
class ForgotPasswordContainer extends Component {
  state = {
    email: '',
    submitted: false,
  };

  componentDidMount() {

  }

  handleChange = ({ target }) => this.setState({ [target.name]: target.value, submitted: false });

  handleSubmit = () => {
    const { email } = this.state;

    this.setState({ submitted: true });

    if (email) {
      this.props.requestPasswordResetEmail(email);
    }
    GTMUtils.trackCall('forgot-password_reset_click');
  };

  componentDidUpdate(prevProps) {
    const { navigateCheckout, passwordEmailSent } = this.props;
    if (!prevProps.passwordEmailSent && passwordEmailSent && navigateCheckout) {
      navigateCheckout('sign up', false);
    }
  }

  render() {
    const { passwordResetErrorMessage, isFetching } = this.props;
    const { email, submitted } = this.state;

    const hasError = !!passwordResetErrorMessage || (submitted && !email);
    const errorMessage = passwordResetErrorMessage || 'Email is required';
    const hideBackButton = this.props.navigateBack ? false : true;

    return (
        <Container id={"container"}>
          <ForgotPasswordForm
              hasError={hasError}
              errorMessage={errorMessage}
              onChange={this.handleChange}
              value={email}
              isFetching={isFetching}
              topClass={this.props.topClass}
          />
          <BottomNav
              currentCheckoutStepName={"forgot password"}
              backButtonType={"arrow"}
              backButtonClick={this.props.navigateBack}
              backButtonTitle={"Back"}
              disableBackButton={hideBackButton}
              disableNextButton={false}
              hideNextButtonArrow={true}
              hideBackButton={hideBackButton}
              nextButtonClick={this.handleSubmit}
              nextTitle={"Reset Password"}
          />
        </Container>
    );
  }
}

const mapStateToProps = state => ({
  isFetching: isFetchingPasswordReset(state),
  passwordResetErrorMessage: getPasswordResetErrorMessage(state),
  passwordEmailSent: isPasswordEmailSent(state),
});

export default connect(
  mapStateToProps,
  { requestPasswordResetEmail },
)(ForgotPasswordContainer);