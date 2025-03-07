import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { registerUser } from 'src/features/auth/actions/authenticationActions';
import BottomNav from 'src/features/checkout/components/BottomNav';
import {
    getRegistrationErrorMessage,
    getLoginErrorMessage,
    isProcessing,
} from 'src/features/auth/selectors/authenticationSelectors';

import * as S from '../../../common/components/CommonStyle';
import optimizelyService from 'src/common/services/OptimizelyService';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import FbButton from 'src/common/components/FbButton';
import PasswordInputWithValidations from 'src/features/auth/components/PasswordInputWithValidations';
import SignUpWithEmailBtn from 'src/common/components/SignUpWithEmailBtn';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { navigateBack, navigateNext } from 'src/features/checkout/actions/checkoutStepsActions';
import { breakpoints, colors, fontFamily } from 'src/variables';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import Logo from 'src/assets/images/logo-light.png';
import moment from 'moment';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');
const MANUAL_TEST_MODE = getEnvValue('MANUAL_TEST_MODE');


const LogoLight = styled.div`
    background: #FFFFFF00  url(${Logo}) 100% center no-repeat;
    background-size: 100%;
    height: 80px;
    background-position: center;
    margin-top: -10px;
    @media (min-width: 576px) {
        background-size: 70%;
        height: 120px;
    }
`;
const Wrapper = styled('div')`
    background: #fff;
    padding: 40px auto;
    width: 50%;
    margin: 0 auto;
    h2 {
        margin-bottom: 0px;
        color: #000;
    }
    ${breakpoints.xs} {
        width: 100%;
        margin: 0;
        padding: 20px 10px;
    }
`;

const Container = styled('div')`
    margin: 0 auto;
    padding: 50px 10px 10px 10px;
    max-width: 600px;
    @media (max-height:450px) {
       overflow-y: scroll;
       height: 80%;
    }
    ${breakpoints.xs} {
        padding-top: 10px;
    }
`;
const FormGroup = styled('div')`
    margin-bottom: 15px;
    &.checkbox-block {
        margin-top: 16px;
        position: relative;
        padding-left: 0px;
    }
    .valid-case {
        color: #23ab01;
    }
`;
const Heading = styled('div')`
    p {
        font-size: 15px;
        color: rgb(105, 105, 105);
        margin-bottom: 0px;
    }
`;
const SignInBtnWrapper = styled('div')``;
const Paragraph = styled('p')`
    font-size: 14px;
    line-height: 18px;
    color: #000;
    margin-top: 30px;
    font-family: ${fontFamily.baseFont};
    a {
        color: #000;
        text-decoration: underline;
    }
`;

const SignupForm = styled('div')``;

class CreateAccountContainer extends React.Component {
    state = {
        showSignUpForm: false,
        isPasswordValid: false,
        register: {
            email: '',
            password: '',
        },
        errors: {
            emailError: false,
            passwordRequiredError: false,
        },
    };

    componentDidMount() {
        GTMUtils.trackCall('checkout_createaccount_view');

        if (DEBUG) {
            const timeFormat = moment().format('MMDD_hhmm');
            this.setState({
                register: { ...this.state.register,
                    ['email']: `engineering-test+${timeFormat}@dearbrightly.com`,
                    ['password']: 'Glowgetter1!'},
            });
            this.setState({
                isPasswordValid: true
            })
        }
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
            register: { ...this.state.register, [name]: value },
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

    handleToggleSignUpForm = value => {
        this.setState({
            showSignUpForm: value,
        });
        GTMUtils.trackCall('checkout_signup_with_email_click');
    };

    validateForm = () => {
        const { email, password } = this.state.register;

        if (MANUAL_TEST_MODE && DEBUG) {
            return true;
        }

        this.setState({
            errors: {
                emailError: false,
                passwordRequiredError: false,
            },
        });
        const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        let valid = true;
        if (email.trim() === '' || !emailRegex.test(email.trim())) {
            valid = false;
            this.showError('emailError');
        }
        if (password.trim() === '' || !this.passwordInput.state.isValid) {
            valid = false;
            this.showError('passwordRequiredError');
        }

        return valid;
    };

    handleCreateAccount = () => {
        localStorage.setItem('redirect_url', window.location.pathname + window.location.search + window.location.hash);
        if (this.validateForm()) {
            const userData = {
                email: this.state.register.email.trim(),
                password: this.state.register.password.trim(),
            };
            this.props.registerUser(userData);

            // if (!DEBUG) {
            //     optimizelyService.track('checkout_register');
            // }
        }
    };

    render() {
        const { email, password } = this.state.register;
        const { emailError, passwordRequiredError } = this.state.errors;
        const { isProcessing, loginErrorMessage } = this.props;

        return (
            <CustomSpinner spinning={isProcessing} blur={true}>
                <Wrapper id={"wrapper"}>
                    <Container id={"container"}>
                        {!this.state.showSignUpForm && (<Heading>
                            <Row>
                                <Col xs={9}>
                                <S.Heading2 style={{
                                    marginBottom: 10,
                                    fontSize: "30px",
                                    lineHeight: "36px",
                                    fontWeight: "bold"
                                }}>Awesome news!<br />You’re in!</S.Heading2>
                                </Col>
                                <Col xs={3}>
                                    <LogoLight />
                                </Col>
                            </Row>
                            <p style={{ marginBottom: 20 }}>
                                Create an account so we can get you started on your Skin Profile. Your doctor will review it to best tailor your formula.
                            </p>
                        </Heading>)}
                        <S.FormError>{this.props.registrationErrorMessage}</S.FormError>
                        {loginErrorMessage && <S.FormError>{loginErrorMessage}</S.FormError>}
                        {!this.state.showSignUpForm && (<div style={{marginTop: 10}}>
                            <FbButton
                                onClick={this.props.handleFBLogin}
                                text="Continue with Facebook"
                                width="100%"
                            />
                        </div>)}
                        {!this.state.showSignUpForm && (
                            <SignUpWithEmailBtn
                                width="100%"
                                onClick={() => this.handleToggleSignUpForm(true)}
                            />
                        )}

                        <SignupForm>
                            {this.state.showSignUpForm && (
                                <form>
                                    <FormGroup>
                                        <S.FormLabel style={{
                                            color: colors.shark
                                        }}>Email</S.FormLabel>
                                        <S.FormControl
                                            autoFocus
                                            type="text"
                                            className="form-control"
                                            name="email"
                                            value={email}
                                            onChange={this.handleChange}
                                        />
                                        {emailError && (
                                            <S.FormError>Please enter valid email</S.FormError>
                                        )}
                                    </FormGroup>
                                    <FormGroup>
                                        <S.FormLabel style={{
                                            color: colors.shark
                                        }}>Password</S.FormLabel>
                                        <PasswordInputWithValidations
                                            inputClass="form-control"
                                            name="password"
                                            value={password}
                                            onChange={this.handleChange}
                                            onCallback={isValid => {
                                                this.setState({
                                                    isPasswordValid: isValid
                                                })
                                            }}
                                            ref={node => {
                                                this.passwordInput = node;
                                            }}
                                        />
                                        {passwordRequiredError && (
                                            <S.FormError>
                                                Please see password requirements
                                            </S.FormError>
                                        )}
                                    </FormGroup>

                                </form>
                            )}
                            <SignInBtnWrapper>
                                <Paragraph style={{
                                    color: colors.facebookBlue,
                                    fontWeight: "bold",
                                    textAlign: "center"
                                }}>
                                    Already have an account?{' '}
                                    <a
                                        style={{
                                            color: colors.facebookBlue,
                                            textDecoration: "underline"
                                        }}
                                        href="#"
                                        onClick={e => this.props.handleShowView('sign_in', e)}
                                    >
                                        Sign in
                                    </a>
                                    .
                                </Paragraph>
                            </SignInBtnWrapper>
                        </SignupForm>
                    </Container>
                    {this.state.showSignUpForm && (
                        <BottomNav
                            currentCheckoutStepName={"sign up"}
                            backButtonType={"arrow"}
                            backButtonClick={this.props.navigateBack}
                            backButtonTitle={"Back"}
                            disableBackButton={false}
                            disableNextButton={ password && this.state.isPasswordValid ? false : true }
                            hideNextButtonArrow={true}
                            hideBackButton={true}
                            nextButtonClick={this.handleCreateAccount}
                            nextTitle={"Create account"}
                        />
                    )}
                </Wrapper>
            </CustomSpinner>
        );
    }
}

const mapStateToProps = state => ({
    registrationErrorMessage: getRegistrationErrorMessage(state),
    order: state.order.data,
    userState: state.user,
    isProcessing: isProcessing(state),
    loginErrorMessage: getLoginErrorMessage(state),
});

export const CreateAccount = connect(
    mapStateToProps,
    { registerUser, navigateBack, navigateNext },
)(CreateAccountContainer);
