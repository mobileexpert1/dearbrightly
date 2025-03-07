import React from 'react';
import styled from 'react-emotion';
import SubscribeSMSCheckbox from 'src/common/components/SubscribeSMSCheckbox';
import { colors, mobileFirstBreakpoints } from 'src/variables';

const CheckboxContainer = styled.div`
  width: 100% !important;
  padding: 0 3px 3px;

  ${mobileFirstBreakpoints.md} {
    width: 50% !important;
    margin-top: 0;
  }
`

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const CheckoutSubscribeSMSCheckbox = ({
  name,
  value,
  onChangeHandle,
  ...props
}) => {

  return (
    <Wrapper>
      <CheckboxContainer >
        <SubscribeSMSCheckbox
          name={name}
          value={value}
          onChangeHandle={onChangeHandle}
          outlineColor={colors.darkModerateBlue}
          {...props}
        />
      </CheckboxContainer>
    </Wrapper>
  );
}

export default CheckoutSubscribeSMSCheckbox;
