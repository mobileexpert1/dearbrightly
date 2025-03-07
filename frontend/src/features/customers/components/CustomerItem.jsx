import React from 'react';
import styled from 'react-emotion';
import 'rc-checkbox/assets/index.css';
import Checkbox from 'rc-checkbox';

import { formatTimestampDate } from 'src/common/helpers/formatTimestamp';

const Clickable = styled.td`
    cursor: pointer;
    color: #007bff !important;

    &:hover {
        text-decoration: underline;
    }
`;

export const CustomerItem = ({ customer, onCustomerClick, isSelected, onSelect }) => (
    <tr>
        <td>
            <Checkbox onChange={onSelect} checked={isSelected} />
        </td>
        <Clickable onClick={() => onCustomerClick(customer)}>
            {customer && customer.firstName} {customer && customer.lastName}
        </Clickable>
        <td>{customer.email}</td>
        <td>{customer.rxStatus}</td>
        <td>{formatTimestampDate(new Date(customer.dateJoined))}</td>
    </tr>
);