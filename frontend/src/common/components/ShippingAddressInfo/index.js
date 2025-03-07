import React, { useEffect } from 'react';
import styled from 'react-emotion';
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
import { breakpoints, fontSize } from 'src/variables';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
import { customersService } from 'src/rootService';
import { getEnvValue } from 'src/common/helpers/getEnvValue';

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

const ShippingAddressInfo = ({ isDefault, shippingDetails, showHeader = true, style }) => {
  const addressLine = shippingDetails.addressLine2 ? `${shippingDetails.addressLine1}, ${shippingDetails.addressLine2}` :  `${shippingDetails.addressLine1}`;
  const title = isDefault ? 'Default shipping address' : 'Shipping address';
  const hasShippingInfo = shippingDetails ?
    (shippingDetails.firstName ||
    shippingDetails.lastName ||
    shippingDetails.addressLine1 ||
    shippingDetails.addressLine2 ||
    shippingDetails.city ||
    shippingDetails.state ||
    shippingDetails.postal_code) : false;
  return (
    <BoxContentWrapper style={{...style}}>
      {showHeader && (
        <HeaderWrapper>
          <HeaderContent>{title}</HeaderContent>
          <BreakLine />
        </HeaderWrapper>
      )}
      {hasShippingInfo && (
        <CurrentAddressWrapper>
          {showHeader && (<AddressHeader>Currently shipping to:</AddressHeader>)}
          <AddressContentWrapper>
            <AddressColumn>
              <AddressContent>
                {shippingDetails.firstName} {shippingDetails.lastName}
              </AddressContent>
              <AddressContent>
                {addressLine}
              </AddressContent>
              <AddressContent>
                {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
              </AddressContent>
            </AddressColumn>
          </AddressContentWrapper>
        </CurrentAddressWrapper>
      )}
    </BoxContentWrapper>
  );
};

export default ShippingAddressInfo;
