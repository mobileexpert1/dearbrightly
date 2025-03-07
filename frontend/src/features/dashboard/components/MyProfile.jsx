import React from 'react';

import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
import { MessageBar } from 'src/features/dashboard/shared/components/Messages';
import { myProfileInputs } from 'src/features/dashboard/constants/myProfileContent';
import {
  HeaderWrapper,
  HeaderContent,
  HrefButton,
  BreakLine,
  FormContentWrapper,
  InputWrapper,
  InputTitle,
  StyledInput,
  SaveButton,
} from 'src/features/dashboard/shared/myAccountStyles';
import { successMessages } from 'src/features/dashboard/constants/myAccountPage';
import DashboardSubscribeSMSCheckbox from "src/features/dashboard/components/DashboardSubscribeSMSCheckbox";

export const MyProfile = ({
  handleUpdateDetails,
  toggleSubmitted,
  handleChange,
  user,
  accountDetails,
  displaySuccessMessage,
  displayErrorMessage,
  isSubmitted,
  updateAccountDetailsErrorMessage,
  handleStripeConnectOAuthRequest,
}) => (
  <BoxContentWrapper>
    <HeaderWrapper>
      <HeaderContent>Personal info</HeaderContent>
      <BreakLine />
    </HeaderWrapper>
    {user && (
      <form onSubmit={handleUpdateDetails}>
        <FormContentWrapper onClick={toggleSubmitted}>
          {myProfileInputs.map(input => (
            <InputWrapper key={input.title}>
              <InputTitle>{input.title}</InputTitle>
              <StyledInput
                required={input.required}
                onChange={handleChange}
                type={input.type}
                name={input.name}
                value={accountDetails[input.name]}
                disabled={input.disabled}
              />
              {isSubmitted &&
                !accountDetails[input.name] && <ErrorMessage text={`${input.title} is required`} />}
            </InputWrapper>
          ))}
        </FormContentWrapper>
        <SaveButton onClick={handleUpdateDetails}>Save</SaveButton>
      </form>
    )}
    {user && user.isMedicalProvider && (
        <div>
          <HrefButton onClick={ handleStripeConnectOAuthRequest }>Stripe Connect</HrefButton>
        </div>
    )}
    {displaySuccessMessage && <MessageBar messageContent={successMessages.myProfile} />}
    {displayErrorMessage && (
      <MessageBar isErrorMessage messageContent={updateAccountDetailsErrorMessage} />
    )}
  </BoxContentWrapper>
);
