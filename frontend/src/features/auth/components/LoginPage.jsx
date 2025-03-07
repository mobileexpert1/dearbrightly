import Link from 'react-router-dom/Link';
import styled from 'react-emotion';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  isProcessing,
  getLoginErrorMessage,
  getOtpIsRequired
} from 'src/features/auth/selectors/authenticationSelectors';
import { facebookAuthenticationRequest, logInRequest } from 'src/features/auth/actions/authenticationActions';

import { history } from 'src/history';
import { loadFbApi } from 'src/common/helpers/fbInit';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import Input from 'src/common/components/Input/Input';
import FbButton from 'src/common/components/FbButton';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import OTPValidation from 'src/features/otp/OTPValidation';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import { fontFamily, fontWeight } from 'src/variables';



const DEBUG = getEnvValue('DEBUG');

const Container = styled('div')`
  @media screen and (max-width: 768px) {
    width: 100%;
  }
  @media (min-width: 768px) {
    width: 50%;
  }

  display: flex;
  flex-direction: column;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 10px;
  margin: 0 auto;
  margin-bottom: 50px;
  font-family: ${fontFamily.baseFont};
  .fb-btn-wrapper {
    padding: 10px 15px;
  }
`;

const ButtonContainer = styled('div')`
  @media (min-width: 768px) {
    padding-left: 15px;
    display: flex;
    align-items: center;
    text-align: center;
  }

  @media screen and (max-width: 768px) {
    justify-content: space-evenly;
    flex-wrap: flex;
    padding-left: 15px;
  }
`;

const LoginPageTitle = styled('div')`
  text-align: center;
  font-size: 30px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;

const LoginPageForm = styled('div')`
  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
  }
  @media (min-width: 768px) {
    display: flex;
  }
  align-items: center;
  position: relative;
`;

const LoginPageForgotPassword = styled('p')`
  cursor: pointer;
  margin-left: 15px;
  display: inline;

  :hover {
    color: #577e92;
  }
`;

const HelpBlock = styled('div')`
  position: absolute;
  bottom: 7px;
  color: red;
`;

const FBButtonContainer = styled('div')`
  display: flex;
  justify-content: center;
`;

class LoginPageContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      submitted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.goToForgotPasswordPage = this.goToForgotPasswordPage.bind(this);
    this.handleFBLogin = this.handleFBLogin.bind(this);
    this.FB = window.FB;
    this.emailRef = null;
  }

  componentDidMount() {
    loadFbApi();
    setTimeout(() => {
      if (this.emailRef) {
        this.emailRef.click();
      }
    }, 1000)
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.setState({ submitted: true });
    const { email, password } = this.state;

    if (email && password) {
      this.props.logInRequest({ email, password });
    }

    GTMUtils.trackCall('login-login_click');
  }

  goToForgotPasswordPage() {
    GTMUtils.trackCall('login-forgot_password_click');
    history.push('/forgot-password');
  }

  toggleErrorMessage = () => {
    this.setState({ loginErrorMessage: '' });
  };

  handleFBLogin = () => {
    window.FB.login(
      response => {
        if (response.status === 'connected') {
          this.props.facebookAuthenticationRequest(response.authResponse, null, false);
        }
      },
      {
        scope: 'email',
        return_scopes: true,
      },
    );
  };

  track = () => {
    GTMUtils.trackCall('login-create_account_click');
  };

  inputRefCb = input => {
    if (input) {
      this.emailRef = input;
    }
  }

  render() {
    const { email, password, submitted } = this.state;
    const { isProcessing, loginErrorMessage } = this.props;

    return (
      <CustomSpinner spinning={isProcessing} blur={true}>
        <Container>
          {!this.props.otpIsRequired && (<LoginPageTitle>Log in</LoginPageTitle>)}
          {loginErrorMessage && loginErrorMessage.length > 0 && (
            <MessageBannerAlert text={loginErrorMessage} color="danger" />
          )}
          {this.props.otpIsRequired ?
            <div>
              <OTPValidation />
            </div>
            : (
              <div>
                <FBButtonContainer className="fb-btn-wrapper">
                  <FbButton onClick={this.handleFBLogin} text="Continue with Facebook" />
                </FBButtonContainer>
                <form name="form" onSubmit={this.handleSubmit}>
                  <LoginPageForm onClick={this.toggleErrorMessage}>
                    <div className={`form-group${submitted && !email ? ' has-error' : ''}`}>
                      <Input
                        autoFocus
                        inputRefCb={this.inputRefCb}
                        title="Email Address"
                        required={true}
                        handleChange={this.handleChange}
                        type="email"
                        name="email"
                        value={email}
                      />
                      {submitted && !email && <HelpBlock>Email is required</HelpBlock>}
                    </div>

                    <div className={`form-group${submitted && !password ? ' has-error' : ''}`}>
                      <Input
                        title="Password"
                        required={true}
                        handleChange={this.handleChange}
                        type="password"
                        name="password"
                        value={password}
                      />
                      {submitted && !password && <HelpBlock>Password is required</HelpBlock>}
                    </div>
                  </LoginPageForm>

                  <ButtonContainer>
                    <StandardBlueButton horizontalPadding={50} active={true} type="submit">Log in</StandardBlueButton>
                  </ButtonContainer>
                  <div style={{ marginTop: 10 }}>
                    <LoginPageForgotPassword onClick={this.goToForgotPasswordPage}>
                      Forgot your password?
                    </LoginPageForgotPassword>
                  </div>
                  <ButtonContainer style={{ marginTop: 30 }}>
                    <Link to="/register" className="login-page-button">
                      <StandardOutlineBlueButton
                        maxWidth="max-content"
                        active={true}
                        onClick={this.track}
                      >
                        Create account
                      </StandardOutlineBlueButton>
                    </Link>
                  </ButtonContainer>
                </form>
              </div>
            )}
        </Container>
      </CustomSpinner>
    );
  }
}

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  userState: state.user,
  loginErrorMessage: getLoginErrorMessage(state),
  otpIsRequired: getOtpIsRequired(state),
});

export default connect(
  mapStateToProps,
  { logInRequest, facebookAuthenticationRequest },
)(LoginPageContainer);
