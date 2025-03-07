import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'react-emotion';

import { isPasswordValid } from 'src/common/helpers/passwordValidator';
// TODO - If this page is enabled again, create an update user password action (or user update customer data action). The action below was removed.

// export async function updateUserPassword(passwordDetails, userId) {
//     const userData = {
//         ...passwordDetails,
//     };
//
//     const headers = new Headers({
//         'Content-Type': 'application/json',
//     });
//
//     const response = await fetch(`${BASE_URL}/api/v1/customers/${userId}/change_password`, {
//         method: 'POST',
//         credentials: 'include',
//         headers,
//         body: JSON.stringify(userData),
//     });
//
//     return response;
// }

//import { updateUserPassword } from 'src/sections/login/section_module/actions';

import { Spinner } from 'reactstrap';
import { DarkButton } from 'src/common/components/Buttons';
import PasswordInputWithValidations from 'src/features/auth/components/PasswordInputWithValidations';
import Input from 'src/common/components/Input/Input';
import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';
import { fontFamily, fontWeight } from 'src/variables';

const Alert = styled('div')`
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
`;

const Success = styled('div')`
    font-size: 24px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    text-transform: uppercase;
    margin-bottom: 85px;
    text-align: center;
`;

const LoginDetailsSection = styled('div')`
    font-size: 20px;
    padding-bottom: 20px;
`;

const FormStyles = css`
    .form-group {
        width: 100%;
    }
`;

class LoginDetailsRaw extends Component {
    state = {
        email: (this.props.user && this.props.user.email) || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        submitted: false,
        passwordError: false,
        isUpdatedSuccessfully: false,
        isUpdating: false,
        updateErrorMessage: '',
    };

    componentDidUpdate(prevProps) {
        if (
            prevProps.isUpdatedSuccessfully !== this.props.isUpdatedSuccessfully ||
            prevProps.updateErrorMessage !== this.props.updateErrorMessage ||
            prevProps.isUpdating !== this.props.isUpdating
        ) {
            this.setState({
                isUpdatedSuccessfully: this.props.isUpdatedSuccessfully,
                isUpdating: this.props.isUpdating,
                updateErrorMessage: this.props.updateErrorMessage,
            });
        }
    }

    validateUserEntry = () => {
        const { oldPassword, newPassword, confirmPassword } = this.state;
        if (
            oldPassword &&
            newPassword !== '' &&
            confirmPassword !== '' &&
            newPassword === confirmPassword &&
            this.passwordInput.state.isValid
        ) {
            this.setState({ passwordError: false });
            return true;
        }

        this.setState({ passwordError: true });
        return false;
    };

    handleChange = event => {
        const { name, value } = event.target;

        this.setState({ [name]: value });
    };

    updateLoginDetails = event => {
        event.preventDefault();

        const accountDetails = {
            oldPassword: this.state.oldPassword || '',
            newPassword_1: this.state.newPassword || '',
            newPassword_2: this.state.confirmPassword || '',
        };

        this.setState({ submitted: true });

        if (this.validateUserEntry()) {
            //this.props.updateUserPassword(accountDetails, this.props.user.id);
        }
    };

    render() {
        const {
            oldPassword,
            newPassword,
            confirmPassword,
            submitted,
            passwordError,
            email,
            isUpdatedSuccessfully,
            isUpdating,
            updateErrorMessage,
        } = this.state;

        return (
            <LoginDetailsSection>
                {!isUpdatedSuccessfully && (
                    <form className={FormStyles} onSubmit={this.updateLoginDetails}>
                        <div className="form-group">
                            <Input
                                title="Email"
                                required={true}
                                handleChange={this.handleChange}
                                type="text"
                                name="email"
                                value={email}
                                disabled
                            />

                            <Input
                                title="Old Password"
                                required={true}
                                handleChange={this.handleChange}
                                type="password"
                                name="oldPassword"
                                value={oldPassword}
                            />
                            {submitted &&
                                !oldPassword && <ErrorMessage text="Field cannot be empty." />}
                            {/* <Input
                                title="New Password"
                                required={true}
                                handleChange={this.handleChange}
                                type="password"
                                name="newPassword"
                                value={newPassword}
                            /> */}
                            <div className="input-title">
                                New Password
                                <span className="input-required">*</span>
                            </div>
                            <PasswordInputWithValidations
                                inputClass="form-control"
                                name="newPassword"
                                value={newPassword}
                                onChange={this.handleChange}
                                ref={node => {
                                    this.passwordInput = node;
                                }}
                            />

                            {submitted &&
                                !newPassword && (
                                    <ErrorMessage text="New password cannot be empty and must match." />
                                )}
                            <Input
                                title="Confirm Password"
                                required={true}
                                handleChange={this.handleChange}
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                            />
                            {submitted &&
                                !confirmPassword && (
                                    <ErrorMessage text="New password cannot be empty and must match." />
                                )}
                            <DarkButton onClick={this.updateLoginDetails}>
                                {!isUpdating ? 'Update' : <Spinner color="primary"/>}
                            </DarkButton>
                            {submitted &&
                                passwordError && <ErrorMessage text="New password is invalid." />}
                        </div>
                    </form>
                )}
                {!isUpdating && updateErrorMessage && <Alert>{updateErrorMessage}</Alert>}
                {submitted &&
                    isUpdatedSuccessfully && (
                        <Success>Success. Your Password has been changed.</Success>
                    )}
            </LoginDetailsSection>
        );
    }
}

export const LoginDetails = connect(
    state => ({
        isUpdating: state.user.updatingAccountDetails,
        updateErrorMessage: state.user.updateAccountDetailsErrorMessage,
        isUpdatedSuccessfully: state.user.isUpdatedSuccessfully,
        user: state.user.user,
    }),
    {
        updateUserPassword,
    },
)(LoginDetailsRaw);
