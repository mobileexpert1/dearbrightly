import React from 'react';
import { Table } from 'reactstrap';
import styled from 'react-emotion';

import { MyOrdersOrderRowItem } from 'src/features/dashboard/components/MyOrdersOrderRowItem';
import { BoxContentWrapper } from 'src/features/dashboard/shared/styles';
import { colors } from 'src/variables';

const StyledTableHeader = styled.th`
  color: ${colors.darkModerateBlue};
  border-top: none !important;
  border-bottom: 1px solid ${colors.darkModerateBlue} !important;
`;

export const MyOrdersTable = ({
  onDateHeaderClick,
  orderStatuses,
  toggleSection,
  activeSection,
  orders,
  user,
}) => (
  <BoxContentWrapper style={{ padding: '0' }}>
    <Table>
      <thead>
        <tr>
          <StyledTableHeader>Order Number</StyledTableHeader>
          <StyledTableHeader onClick={onDateHeaderClick}>Date</StyledTableHeader>
          <StyledTableHeader>Status</StyledTableHeader>
          <StyledTableHeader />
        </tr>
      </thead>
      <tbody>
        {orders.map(item => (
          <MyOrdersOrderRowItem
            key={item.id}
            order={item}
            status={orderStatuses[item.status]}
            toggleSection={toggleSection}
            activeSection={activeSection}
            user={user}
          />
        ))}
      </tbody>
    </Table>
  </BoxContentWrapper>
);
