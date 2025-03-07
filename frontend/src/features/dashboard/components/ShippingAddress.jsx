import React from 'react';
import styled from 'react-emotion';
import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
import { MessageBar } from 'src/features/dashboard/shared/components/Messages';
import {
  HeaderWrapper,
  HeaderContent,
  BreakLine,
  FormContentWrapper,
  InputWrapper,
  InputTitle,
  StyledInput,
  SaveButton,
} from 'src/features/dashboard/shared/myAccountStyles';
import { fontSize, breakpoints, colors } from 'src/variables';
import { shippingAddressInputs } from 'src/features/dashboard/constants/shippingAddressContent';
import listOfStates from 'src/common/helpers/listOfStates.js';
import { successMessages } from 'src/features/dashboard/constants/myAccountPage';
import ShippingAddressInfo from 'src/common/components/ShippingAddressInfo';
import DashboardSubscribeSMSCheckbox from './DashboardSubscribeSMSCheckbox';
import { AssociatedSubscriptions } from 'src/features/dashboard/components/AssociatedSubscriptions';

const CurrentAddressWrapper = styled.div`
  background: rgba(247, 224, 217, 0.3);
  border-radius: 4px;
  padding: 1rem 1.5rem;

  ${breakpoints.xs} {
    padding: 1rem;
  }
`;

const AddressHeader = styled.p`
  font-size: ${fontSize.small};
  font-weight: 800;
`;

const AddressContentWrapper = styled.div`
  display: flex;

  ${breakpoints.xs} {
    flex-direction: column;
  }
`;

const AddressContent = styled.p`
  font-size: 14px;
  line-height: 17px;
  margin-bottom: 0.2rem;
`;

const AddressColumn = styled.div`
  min-width: 8rem;
  padding-right: 10px;
`;

const Subheading = styled.p`
  padding-top: 8px;
  font-size: ${fontSize.small};
`;

const StyledSelect = styled.select`
  border: 1px solid ${colors.darkModerateBlueOpacity};
  border-radius: 4px;
  height: 3rem;

  :focus {
    border: 0.5px solid ${colors.sharkOpacity};
  }
`;

export const ShippingAddress = ({
  shippingDetails,
  handleUpdateDetails,
  toggleSubmitted,
  handleChange,
  formShippingDetails,
  displaySuccessMessage,
  displayErrorMessage,
  isSubmitted,
  isRequiredFieldEmpty,
  errorMessage,
  associatedSubscriptions,
  isDefault,
  optInSmsAppNotifications,
  handleOptInSmsNotificationsChange,
}) => {
  const states = listOfStates();

  return (
    <React.Fragment>
      
      {shippingDetails && <ShippingAddressInfo isDefault={isDefault} shippingDetails={shippingDetails} />}
      {associatedSubscriptions && (
          <BoxContentWrapper>
            <AssociatedSubscriptions associatedSubscriptions={associatedSubscriptions} />
          </BoxContentWrapper>
      )}
      <BoxContentWrapper>
        <HeaderWrapper>
          <HeaderContent noMargin>Change shipping address</HeaderContent>
          <Subheading>Note: Remember to provide an address where packages are safe</Subheading>
          <BreakLine />
        </HeaderWrapper>
        {formShippingDetails && (
          <form onSubmit={handleUpdateDetails}>
            <FormContentWrapper onClick={toggleSubmitted}>
              {shippingAddressInputs.map(input => (
                <InputWrapper key={input.title}>
                  <InputTitle>
                    {input.title} {input.required && '*'}
                  </InputTitle>
                  {input.type === 'select' ? (
                    <StyledSelect
                      title="State"
                      name="state"
                      required={input.required}
                      onChange={handleChange}
                      optionItems={listOfStates()}
                      value={formShippingDetails[input.name]}
                    >
                      {states.map(state => (
                        <option key={state.value} value={state.value}>
                          {state.name}
                        </option>
                      ))}
                    </StyledSelect>
                  ) : (
                    <StyledInput
                      required={input.required}
                      onChange={handleChange}
                      type={input.type}
                      name={input.name}
                      value={formShippingDetails[input.name]}
                      disabled={input.disabled}
                    />
                  )}
                  {isRequiredFieldEmpty &&
                  (!formShippingDetails[input.name] || formShippingDetails[input.name].length === 0) && input.required && (
                    <ErrorMessage text={`${input.title} is required`} />
                  )}
                  {isSubmitted && errorMessage && errorMessage[input.name] && (
                    <ErrorMessage text={errorMessage[input.name]} />
                  )}
                </InputWrapper>
              ))}
            </FormContentWrapper>
            {(optInSmsAppNotifications != null) && <DashboardSubscribeSMSCheckbox
                name={"optInSmsAppNotifications"}
                value={optInSmsAppNotifications}
                onChangeHandle={handleOptInSmsNotificationsChange}
                hasExistingPhoneNumber={shippingDetails && shippingDetails.phone ? true : false}
            />}
            <SaveButton onClick={handleUpdateDetails}>Save</SaveButton>
          </form>
        )}
        {displaySuccessMessage && <MessageBar messageContent={successMessages.shippingAddress} />}
        {displayErrorMessage && (typeof errorMessage === 'string') && (
          <MessageBar isErrorMessage messageContent={errorMessage} />
        )}
      </BoxContentWrapper>
    </React.Fragment>
  );
};
