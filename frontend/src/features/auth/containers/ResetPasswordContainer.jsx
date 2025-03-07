import React from 'react';
import { connect } from 'react-redux';

import { isPasswordValid } from 'src/common/helpers/passwordValidator';

import { ResetPasswordForm } from '../components/ResetPasswordForm';
import {
  isPasswordResetTokenValid,
  isFetchingPasswordReset,
  getPasswordResetErrorMessage,
} from '../selectors/passwordResetSelectors';
import { verifyPasswordResetToken, setNewPassword } from '../actions/passwordResetActions';

class ResetPasswordContainer extends React.Component {
  state = {
    password: '',
    passwordConfirmation: '',
    showBackendErrors: false,
    touched: {},
  };

  componentDidMount() {
    const token = this.getToken();

    if (token) {
      this.props.verifyPasswordResetToken(token);
    }
  }

  getToken = () => this.props.match.params.token;

  handleChange = ({ target }) =>
    this.setState({ [target.name]: target.value.trim(), showBackendErrors: false });

  handleBlur = ({ target }) =>
    this.setState(state => ({
      touched: { ...state.touched, [target.name]: true },
    }));

  handleClick = () => this.setState({ showBackendErrors: false });

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid()) {
      this.setState({ showBackendErrors: true });

      return this.props.setNewPassword({
        password: this.state.password,
        resetPasswordConfirm: this.state.passwordConfirmation,
        token: this.getToken(),
      });
    }

    this.setState({
      touched: {
        password: true,
        passwordConfirmation: true,
      },
    });
  };

  isFormValid = () => isPasswordValid(this.state.password) && this.arePasswordsTheSame();

  isTouchedAndMissing = name => !this.state[name].trim() && !!this.state.touched[name];

  arePasswordsTheSame = () => this.state.password.trim() === this.state.passwordConfirmation.trim();

  render() {
    const missingPassword = this.isTouchedAndMissing('password');
    const missingPasswordConfirmation = this.isTouchedAndMissing('passwordConfirmation');

    const invalidPassword =
      !missingPassword && !isPasswordValid(this.state.password) && this.state.touched.password;

    const passwordDoesNotMatch =
      !missingPasswordConfirmation &&
      !this.arePasswordsTheSame() &&
      this.state.touched.passwordConfirmation;

    return this.props.isPasswordResetTokenValid ? (
      <ResetPasswordForm
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onClick={this.handleClick}
        isFetching={this.props.isFetching}
        serverSideErrors={this.state.showBackendErrors && this.props.passwordResetErrorMessage}
        passwordValue={this.state.password}
        passwordConfirmationValue={this.state.passwordConfirmation}
        missingPassword={missingPassword}
        invalidPassword={invalidPassword}
        missingPasswordConfirmation={missingPasswordConfirmation}
        passwordDoesNotMatch={passwordDoesNotMatch}
      />
    ) : null;
  }
}

const mapStateToProps = state => ({
  isFetching: isFetchingPasswordReset(state),
  passwordResetErrorMessage: getPasswordResetErrorMessage(state),
  isPasswordResetTokenValid: isPasswordResetTokenValid(state),
});

export default connect(
  mapStateToProps,
  { verifyPasswordResetToken, setNewPassword },
)(ResetPasswordContainer);
