import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { isAuthenticated, getLoginErrorMessage, isProcessing } from 'src/features/auth/selectors/authenticationSelectors';
import { logInRequest } from 'src/features/auth/actions/authenticationActions';
import BottomNav from 'src/features/checkout/components/BottomNav';

import { navigateBack, navigateNext } from 'src/features/checkout/actions/checkoutStepsActions';
import * as S from '../../../common/components/CommonStyle';
import optimizelyService from 'src/common/services/OptimizelyService';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import FbButton from 'src/common/components/FbButton';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { breakpoints, colors, fontFamily } from 'src/variables';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');

const Wrapper = styled('div')`
    width: 50%;
    margin: 0 auto;
    background: ${colors.white};
    h2 {
        margin-bottom: 14px;
        color: #000;
    }
    @media (min-height:568px) and (min-width: 576px) {
      display: flex;
      flex-direction: column;
    }
    ${breakpoints.lg} {
      width: 100%;
      margin: 0;
    }
`;

const LoginFormContainer = styled('div')`
    max-width: 600px;
    @media (min-height:568px) and (min-width: 576px) {
        padding-bottom: 50px;
    }
    padding: 20px 10px 10px 10px;
    @media (max-height:567px) {
       overflow-y: scroll;
       height: 80%;
    }
`;

const FormContainer = styled('form')`
    @media (max-height:567px) {
       overflow-y: scroll;
       height: 80%;
    }
`;

const FormGroup = styled('div')`
    margin-bottom: 15px;
    &.checkbox-block {
        margin-top: 16px;
        position: relative;
        padding-left: 0px;
    }
    a {
        color: dimgray;
        text-decoration: underline;
        font-family: ${fontFamily.baseFont};
        &:hover {
            color: dimgray;
            text-decoration: underline;
        }
    }
`;

const SignInBtnWrapper = styled('div')``;

const Paragraph = styled('p')`
    font-size: 16px;
    line-height: 20px;
    color: #000;
    margin-top: 20px;
    font-family: ${fontFamily.baseFont};
    a {
        color: #000;
        text-decoration: underline;
    }
`;

class CheckoutLoginFormContainer extends React.Component {
    state = {
        login: {
            email: '',
            password: '',
        },
        errors: {
            emailError: false,
            passwordRequiredError: false,
        },
    };
    
    componentDidMount() {
        GTMUtils.trackCall('checkout_login_view');
    }

    // on input change
    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
            login: { ...this.state.login, [name]: value },
        });
    };

    showError = errorField => {
        setTimeout(() => {
            this.setState({
                errors: {
                    ...this.state.errors,
                    [errorField]: true,
                },
            });
        }, 100);
    };

    validateForm = () => {
        const { email, password } = this.state.login;
        this.setState({
            errors: {
                emailError: false,
                passwordRequiredError: false,
            },
        });

        let valid = true;
        if (email.trim() === '') {
            valid = false;
            this.showError('emailError');
        }
        if (password.trim() === '') {
            valid = false;
            this.showError('passwordRequiredError');
        }

        return valid;
    };

    handleLogin = e => {
        const { loggedIn, navigateNext, order, userState } = this.props;

        if (e) {
            e.preventDefault();
        }

        if (loggedIn && userState.user && userState.user.id && order && order.id) {
            navigateNext();
            return;
        }

        if (this.validateForm()) {
            localStorage.setItem('redirect_url', window.location.pathname + window.location.search + window.location.hash);

            const email = this.state.login.email.trim();
            const password = this.state.login.password.trim();
            this.props.logInRequest({ email, password });

            // if (!DEBUG) {
            //     optimizelyService.track('checkout_login');
            // }
        }
    };

    render() {
        const { email, password } = this.state.login;
        const { emailError, passwordRequiredError } = this.state.errors;
        const { isProcessing, loginErrorMessage, navigateBack } = this.props;

        return (
            <CustomSpinner spinning={isProcessing} blur={true}>
                <Wrapper id={"wrapper"}>
                    <LoginFormContainer id={"login-form-container"}>
                        <S.Heading2>Welcome back! Log in here.</S.Heading2>
                        <FbButton onClick={this.props.handleFBLogin} text="Continue with Facebook" width="100%" />
                        <FormContainer>
                            {loginErrorMessage && (
                                <S.FormError className="mb-3">
                                    {loginErrorMessage}
                                </S.FormError>
                            )}
                            <FormGroup>
                                <S.FormLabel>Email</S.FormLabel>
                                <S.FormControl
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    value={email}
                                    onChange={this.handleChange}
                                />
                                {emailError && <S.FormError>Please enter valid email</S.FormError>}
                            </FormGroup>
                            <FormGroup>
                                <S.FormLabel>Password</S.FormLabel>
                                <S.FormControl
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={password}
                                    onChange={this.handleChange}
                                />
                                {passwordRequiredError && (
                                    <S.FormError>Password is required</S.FormError>
                                )}
                            </FormGroup>

                            <FormGroup className="checkbox-block">
                                <a style={{ fontSize: '14px' }} href="#" onClick={e => this.props.handleShowView('forgot', e)}>
                                    Forgot your password?
                                </a>
                            </FormGroup>
                            <SignInBtnWrapper>
                                <Paragraph>
                                    Don't have an account?{' '}
                                    <a
                                        href="#"
                                        onClick={e => this.props.handleShowView('sign up', e)}
                                    >
                                        Sign up
                                    </a>
                                    .
                                </Paragraph>
                            </SignInBtnWrapper>
                        </FormContainer>
                    </LoginFormContainer>
                    <BottomNav
                        currentCheckoutStepName={'sign up'}
                        backButtonType={"arrow"}
                        backButtonClick={navigateBack}
                        backButtonTitle={"Back"}
                        disableBackButton={false}
                        disableNextButton={false}
                        hideNextButtonArrow={true}
                        hideBackButton={false}
                        nextButtonClick={this.handleLogin}
                        nextTitle={'Continue'}
                    />
                </Wrapper>
            </CustomSpinner>
        );
    }
}
const mapStateToProps = state => ({
    loggedIn: isAuthenticated(state),
    userState: state.user,
    order: state.order.data,
    isProcessing: isProcessing(state),
    loginErrorMessage: getLoginErrorMessage(state),
});

export const CheckoutLogin = connect(
    mapStateToProps,
    { logInRequest, navigateBack, navigateNext },
)(CheckoutLoginFormContainer);
