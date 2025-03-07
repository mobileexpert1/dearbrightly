import React from 'react';
import { Collapse } from 'reactstrap';
import styled from 'react-emotion';

import plusIcon from 'src/assets/images/smallBluePlusIcon.svg';
import minusIcon from 'src/assets/images/blueMinusIcon.svg';

import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { formatTimestampDate } from 'src/common/helpers/formatTimestamp';
import { MyOrdersOrderDetails } from 'src/features/dashboard/components/MyOrdersOrderDetails';
import { breakpoints } from 'src/variables';

const CollapseWrapper = styled.td`
  border: none !important;
  padding: 0.75rem 0 !important;
`;

const MoreInfoButtonWrapper = styled.td`
  text-align: right;
`;

const MoreDetailsButton = styled.div`
  cursor: pointer;
`;

const StyledIcon = styled.img`
  margin-left: 0.6rem;
  margin-bottom: 0.2rem;
  height: 0.6rem;
  width: 0.6rem;
`;

const ButtonContent = styled.span`
  ${breakpoints.xs} {
    display: none;
  }
`;

export const MyOrdersOrderRowItem = ({ order, status, toggleSection, activeSection, user }) => {
  const date = formatTimestampDate(new Date(order.purchasedDatetime));
  const { isMobile } = useDeviceDetect();
  const isRowOpen = activeSection === order.id;

  return (
    <React.Fragment>
      <tr>
        <td>{order.orderNumber}</td>
        <td>{date}</td>
        <td>{status}</td>
        <MoreInfoButtonWrapper onClick={() => toggleSection(order.id)}>
          <MoreDetailsButton>
            <ButtonContent>{isRowOpen ? 'Less Details' : 'More Details'}</ButtonContent>
            <StyledIcon src={isRowOpen ? minusIcon : plusIcon} />
          </MoreDetailsButton>
        </MoreInfoButtonWrapper>
      </tr>
      <tr>
        <CollapseWrapper colSpan={12}>
          <Collapse isOpen={isRowOpen}>
            <MyOrdersOrderDetails order={order} isMobile={isMobile} user={user} />
          </Collapse>
        </CollapseWrapper>
      </tr>
    </React.Fragment>
  );
};
