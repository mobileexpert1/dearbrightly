import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { isAuthenticated, isProcessing } from 'src/features/auth/selectors/authenticationSelectors';
import {
  registerUser,
  facebookAuthenticationRequest,
} from 'src/features/auth/actions/authenticationActions';
import { isPasswordValid } from 'src/common/helpers/passwordValidator';
import {
  getRegistrationErrorMessage,
  getLoginErrorMessage,
} from 'src/features/auth/selectors/authenticationSelectors';
import { config } from 'src/config';
import { RegistrationFormField } from 'src/features/auth/components/RegistrationFormField';
import FbButton from 'src/common/components/FbButton';
import { Alert } from 'reactstrap';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { StandardBlueButton } from 'src/common/components/Buttons';
import { loadFbApi } from 'src/common/helpers/fbInit';
import { fontFamily, fontWeight } from 'src/variables';

const Container = styled('div')`
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding-right: 30px;
  padding-left: 30px;
  font-family: ${fontFamily.baseFont};
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const RegisterPageHeader = styled('div')`
  font-size: 40px;
  justify-content: center;
  padding-top: 100px;
  padding-bottom: 45px;
  border-bottom: 1px solid #ededed;
  margin-bottom: 20px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;

const RegisterPageForm = styled('form')`
  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
    width: 100%;
  }
  @media (min-width: 768px) {
    display: flex;
    width: 50%;
  }
  flex-direction: column;
`;

const RegisterPageFormSection = styled('div')`
  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
  }
  @media (min-width: 768px) {
    display: flex;
  }
  width: 100%;
  align-items: center;
  flex-direction: column;
  border-bottom: 1px solid #ededed;
  margin-bottom: 30px;
  padding-bottom: 15px;
`;

const StyledButton = styled.button`
  font-size: 18px;
  color: #fff;
  background-color: #000;
  border: 2px solid #000;
  padding: 8px 15px;
  text-align: center;
  cursor: pointer;
  max-width: 200px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;

const AlertContainer = styled('div')`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 0px;
  margin-bottom: 10px;

  .alert {
    width: 100%;
    margin: 0 auto;
    text-align: center;
  }
`;

const topSectionFields = [
  { label: 'Email Address', name: 'email', required: true, autoFocus: false },
  { label: 'Password', name: 'password', type: 'password', required: true },
  { label: 'Confirm Password', name: 'confirmPassword', type: 'password', required: true },
];


class RegistrationForm extends React.Component {
  componentDidMount() {
    loadFbApi();
  }

  render() {
    const {
      values,
      touched,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      loginErrorMessage,
      registrationErrorMessage
    } = this.props;
    return (
      <CustomSpinner spinning={values.props.isProcessing} blur={true}>
        <Container>
          <RegisterPageHeader>Create account</RegisterPageHeader>
          <FbButton
            onClick={values.handleFBLogin}
            text="Continue with Facebook"
            width="100%"
            orAlign="center"
            props={values.props}
          />
          <RegisterPageForm onSubmit={handleSubmit}>
            <RegisterPageFormSection>
              {topSectionFields.map(field => (
                <RegistrationFormField
                  key={field.name}
                  field={field}
                  touched={touched}
                  values={values}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              ))}
            </RegisterPageFormSection>
            {loginErrorMessage && (
              <AlertContainer>
                <Alert color="danger"> {loginErrorMessage} </Alert>
              </AlertContainer>
            )}
            {registrationErrorMessage && (
              <AlertContainer>
                <Alert color="danger"> {registrationErrorMessage} </Alert>
              </AlertContainer>
            )}
            <div className="register-page-button-container">
              <StandardBlueButton id="createAccount" active={true} type="submit">Create account</StandardBlueButton>
            </div>
          </RegisterPageForm>
        </Container>
      </CustomSpinner>
    )
  }
}

const RegistrationFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    email: null,
    password: null,
    confirmPassword: null,
    handleFBLogin,
    props,
  }),
  validationSchema: Yup.object().shape({
    password: Yup.string()
      .trim()
      .required('Password is required')
      .nullable(),
    confirmPassword: Yup.string()
      .trim()
      .required('Password confirm is required')
      .nullable(),
    email: Yup.string()
      .email('Invalid email address')
      .trim()
      .required('Email address is required')
      .nullable(),
  }),
  validate: ({ password, confirmPassword }) => {
    const errors = {};

    if (password && confirmPassword && password != confirmPassword) {
      errors.confirmPassword = 'Your passwords do not match.';
    }

    if (password && !isPasswordValid(password)) {
      errors.password = config.passwordTooWeakError;
    }

    if (confirmPassword && !isPasswordValid(confirmPassword)) {
      errors.confirmPassword = config.passwordTooWeakError;
    }

    return errors;
  },
  handleSubmit: (values, { props }) => {
    props.registerUser(values);
  },
})(RegistrationForm);

const handleFBLogin = (e, props) => {
  window.FB.login(
    response => {
      if (response.status === 'connected') {
        props.facebookAuthenticationRequest(response.authResponse, null, false);
      }
    },
    {
      scope: 'email',
      return_scopes: true,
    },
  );
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  registrationErrorMessage: getRegistrationErrorMessage(state),
  loginErrorMessage: getLoginErrorMessage(state),
});

export const RegistrationFormContainer = connect(
  mapStateToProps,
  { registerUser, facebookAuthenticationRequest },
)(RegistrationFormWithFormik);

export default RegistrationFormContainer;
