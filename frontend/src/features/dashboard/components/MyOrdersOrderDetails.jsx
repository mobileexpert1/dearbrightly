import React from 'react';
import styled from 'react-emotion';
import { Table } from 'reactstrap';
import { colors, breakpoints, fontSize } from 'src/variables';
import { formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';
import { formatAddressToStringLine1, formatAddressToStringLine2 } from 'src/common/helpers/formatAddressToString';
import {ORDER_STATUSES} from "src/common/constants/orders";


const StyledTable = styled(Table)`
  background-color: ${colors.veryLightGray} !important;
  margin-bottom: 0 !important;
  td,
  th {
    border: none !important;
    padding: 0.75rem 0 !important;
  }
`;

const ComponentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: fit-content;

  ${breakpoints.xs} {
    flex-direction: column;
  }
`;

const ColumnWrapper = styled.div`
  flex-basis: 29%;
`;

const OrderColumnWrapper = styled.div`
  flex-basis: 70%;
`;

const DetailsWrapper = styled.div`
  background: ${colors.veryLightGray};
  padding: 0.75rem;
  margin-bottom: ${props => props.extraMargin && '0.5rem'};
  height: ${props => props.extraHeight && '100%'};
  div:last-of-type {
    margin-bottom: 0;
  }

  ${breakpoints.xs} {
    margin-bottom: 0.5rem;
  }
`;

const StyledTableHeader = styled.th`
  font-size: ${fontSize.small};
  color: ${colors.darkModerateBlue};
  ${breakpoints.xs} {
    font-size: ${fontSize.smallest};
  } 
`;

const DetailHeader = styled.p`
  font-size: ${fontSize.big};
  font-weight: 800;
  padding-bottom: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const AddressDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0 10px 0;
  word-break: break-word;
`;

const AddessSubheading = styled.p`
  text-decoration: uppercase;
  color: ${colors.darkModerateBlue};
  font-weight: 800;
  margin: 20px 0 0 0;
`;

const Subheading = styled.p`
  text-decoration: uppercase;
  color: ${colors.darkModerateBlue};
  font-weight: 800;
  margin-bottom: 10px;
`;

const DetailContent = styled.p`
  font-size: ${fontSize.small};
  margin-bottom: 10px;
`;

const paymentTable = [
  { key: 'subtotal', title: 'Subtotal' },
  { key: 'shippingFee', title: 'Shipping' },
  { key: 'discount', title: 'Discount' },
  { key: 'tax', title: 'Tax' },
  { key: 'totalAmount', title: 'Total' },
];

export const MyOrdersOrderDetails = ({ order, isMobile, user }) => (
  <ComponentWrapper>
    <OrderColumnWrapper>
      <DetailsWrapper extraMargin>
        <StyledTable>
          <thead>
            <tr>
              <StyledTableHeader>Items</StyledTableHeader>
              <StyledTableHeader>Qty</StyledTableHeader>
              <StyledTableHeader>Frequency</StyledTableHeader>
              {!isMobile && order && order.status === ORDER_STATUSES['Shipped'] && (<StyledTableHeader>Tracking</StyledTableHeader>)}
              <StyledTableHeader style={{textAlign: 'right'}}>Total</StyledTableHeader>
            </tr>
          </thead>
          <tbody>
          {order.orderItems.map(orderItem => (
                <tr key={orderItem.id}>
                  <td>{orderItem.productName}</td>
                  <td>{orderItem.quantity}</td>
                  {orderItem.frequency > 0 && orderItem.productType === 'Rx' && !orderItem.isRefill && (<td>Two-month trial</td>)}
                  {orderItem.frequency > 0 && orderItem.productType !== 'Rx' && (<td>Every {orderItem.frequency} months</td>)}
                  {orderItem.frequency === 0 && (<td>One-time purchase</td>)}
                  {!isMobile && (<td><a href={orderItem.trackingUri} target="_blank">{orderItem.trackingNumber}</a></td>)}
                  <td style={{textAlign: 'right'}} >{formatAmountToDollars(orderItem, orderItem.price)}</td>
                </tr>
          ))}
          </tbody>
        </StyledTable>
        {isMobile ? 
      (<StyledTable>
        <thead>
            <tr>
        {order && order.status === ORDER_STATUSES['Shipped'] && (<StyledTableHeader>Tracking</StyledTableHeader>)}
        </tr>
          </thead>
          <tbody>
          {order.orderItems.map(orderItem => (
                <tr key={orderItem.id}>
                  {isMobile && (<td><a href={orderItem.trackingUri} target="_blank">{orderItem.trackingNumber}</a></td>)}
                </tr>
          ))}
          </tbody>
        </StyledTable>) : null
      }
      </DetailsWrapper>
      
      <DetailsWrapper>
        {paymentTable.map(tableElement => (
          <DetailRow key={tableElement.key}>
            {(tableElement.key === 'discount' && order['discount'] > 0) && (<span style={{"marginBottom":"10px"}}><Subheading style={{"display": "inline"}}>{tableElement.title}</Subheading> ({order['discountCode']})</span>)}
            {(tableElement.key !== 'discount') && (<Subheading>{tableElement.title}</Subheading>)}
            {(tableElement.key === 'discount' && order['discount'] > 0) && (<DetailContent>-{formatAmountToDollars(order, order[tableElement.key])}</DetailContent>)}
            {(tableElement.key !== 'discount') && (<DetailContent>{formatAmountToDollars(order, order[tableElement.key])}</DetailContent>)}
          </DetailRow>
        ))}
      </DetailsWrapper>
    </OrderColumnWrapper>
    <ColumnWrapper>
      <DetailsWrapper extraHeight>
        <DetailHeader>Shipping</DetailHeader>
        <AddessSubheading>Name</AddessSubheading>
        <AddressDetailRow>
          {order.shippingDetails.firstName} {order.shippingDetails.lastName}
        </AddressDetailRow>
        <AddessSubheading>Address</AddessSubheading>
        <AddressDetailRow>
          {formatAddressToStringLine1(order)}<br/>
          {formatAddressToStringLine2(order)}
        </AddressDetailRow>
        <AddessSubheading>Email</AddessSubheading>
        <AddressDetailRow>{user.email}</AddressDetailRow>
        <AddessSubheading>Phone Number</AddessSubheading>
        <AddressDetailRow>{order.shippingDetails.phone}</AddressDetailRow>
      </DetailsWrapper>
    </ColumnWrapper>
  </ComponentWrapper>
);
