import React from 'react';
import styled from 'react-emotion';
import SubscribeSMSCheckbox from 'src/common/components/SubscribeSMSCheckbox';
import { colors, mobileFirstBreakpoints } from 'src/variables';

const checkboxDescriptionFontColor = "#000" 

const CheckboxContainer = styled.div`
  width: 100% !important;
  margin-top: -1rem;
  margin-bottom: 1rem;

  ${mobileFirstBreakpoints.md} {
    width: 49% !important;
  }
`

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const DashboardSubscribeSMSCheckbox = ({
  name,
  value,
  onChangeHandle,
  ...props
}) => {

  const existingPhoneNumberSubscribeTerms = `By checking this box, you consent to DearBrightly, 
  Inc. sending recurring autodialed SMS texts or calls to the phone number you have listed on this page. 
  You are not required to consent to purchase any DearBrightly, Inc. goods or services. 
  Message and data rates may apply. 
  Text STOP to cancel; HELP for help.`

  return (
    <Wrapper>
      <CheckboxContainer >
        <SubscribeSMSCheckbox
          name={name}
          value={value}
          onChangeHandle={onChangeHandle}
          borderColor={colors.darkModerateBlueOpacity}
          outlineColor={colors.sharkOpacity}
          color={checkboxDescriptionFontColor}
          subscribeTerms={props.hasExistingPhoneNumber ? existingPhoneNumberSubscribeTerms : undefined}
          {...props}
        />
      </CheckboxContainer>
    </Wrapper>
  );
}

export default DashboardSubscribeSMSCheckbox;
