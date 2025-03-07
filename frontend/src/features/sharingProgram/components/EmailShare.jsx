import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'react-emotion';

import checkboxIcon from 'src/assets/images/checkbox.svg';
import mobileEmailIcon from 'src/assets/images/mobileEmailIcon.svg';

import { MobileShareOptionIcon, IconLabel } from 'src/features/sharingProgram/shared/styles';
import { colors, fontSize } from 'src/variables';
import { communicationMethodsOptions } from '../constants/sharingProgramConstants';

const InputWrapper = styled.div`
  display: flex;
  margin-top: 2rem;
  position: relative;
`;

const StyledInput = styled(Field)`
  margin-right: 0.2rem;
  border-radius: 4px;
`;

const ActionButton = styled.button`
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  width: 128px;
  height: 54px;
  background: ${props => (props.disabled ? colors.veryLightBlumine : colors.blumine)};
  color: ${colors.clear};
  border-radius: 4px;
  font-size: ${fontSize.normal};
  line-height: 17px;
  font-weight: 600;
  margin: 0 auto;
  border: none;

  :hover {
    background: ${props => !props.disabled && colors.blumineLight};
  }

  .loading:after {
    content: ' .';
    animation: dots 1s steps(5, end) infinite;
    font-size: 36px;
  }

  @keyframes dots {
    0%,
    20% {
      color: rgba(0, 0, 0, 0);
      text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
    }
    40% {
      color: white;
      text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
    }
    60% {
      text-shadow: 0.25em 0 0 white, 0.5em 0 0 rgba(0, 0, 0, 0);
    }
    80%,
    100% {
      text-shadow: 0.25em 0 0 white, 0.5em 0 0 white;
    }
  }
`;

const ButtonText = styled.p`
  color: ${colors.clear};
  margin: 0;

  margin-bottom: ${props => props.isEmailPending && '1rem'};
  margin-right: ${props => props.isEmailPending && '1rem'};
`;

const StyledErrorMessage = styled(ErrorMessage)`
  position: absolute;
  bottom: 0;
`;

const EmailConfirmationWrapper = styled.div`
  display: flex;
  margin-top: 0.5rem;
`;

const InvitationSentText = styled.p`
  font-size: ${fontSize.normal};
  color: ${props => (props.error ? colors.red : colors.caribbeanGreen)};
  margin-top: 0.5rem;
  margin-bottom: 0;
  width: fit-content;
`;

const StyledIcon = styled.img`
  height: 18px;
  width: 18px;
  margin-top: 0.6rem;
  margin-right: 0.4rem;
`;

export const EmailShare = ({
  isEmailPending,
  isEmailSent,
  sendInvitation,
  emailError,
  isMobile,
  handleMobileShare,
}) => {
  return isMobile ? (
    <div>
      <MobileShareOptionIcon
        src={mobileEmailIcon}
        onClick={() => handleMobileShare(communicationMethodsOptions.email, 'isEmailOptionClicked')}
      />
      <IconLabel>Email</IconLabel>
    </div>
  ) : (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
      })}
      isInitialValid={false}
      onSubmit={({ email }, { resetForm }) => {
        sendInvitation(email);
        resetForm();
      }}
      render={({ errors, touched, isValid }) => (
        <Form>
          <InputWrapper>
            <StyledInput
              name="email"
              placeholder="Email Address"
              type="text"
              className={'form-control' + (errors.email && touched.email ? ' is-invalid' : '')}
            />
            <ActionButton disabled={!isValid} type="submit">
              <ButtonText className={isEmailPending && 'loading'} isEmailPending={isEmailPending}>
                {!isEmailPending && 'Invite'}
              </ButtonText>
            </ActionButton>
            <StyledErrorMessage name="email" component="div" className="invalid-feedback" />
          </InputWrapper>
          {!isEmailPending &&
            (isEmailSent || emailError) && (
              <EmailConfirmationWrapper>
                {isEmailSent && <StyledIcon src={checkboxIcon} />}
                <InvitationSentText error={emailError}>
                  {isEmailSent ? 'Invitation Sent' : 'Unable to send email'}
                </InvitationSentText>
              </EmailConfirmationWrapper>
            )}
        </Form>
      )}
    />
  );
};
