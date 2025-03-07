import React from 'react';
import styled from 'react-emotion';
import { Table } from 'reactstrap';

import { formatAmountToDollars } from '../../../common/helpers/formatAmountToDollars';

const Clickable = styled.tr`
    cursor: pointer;
`;

export const CustomerRecentOrder = ({ order, status, onOrderClick, isFetching, fetched }) => {
    if (isFetching) {
        return <p>Fetching orders...</p>;
    }

    if (!order) {
        return fetched ? <p>No order data found</p> : null;
    }

    const date = new Date(order.purchasedDatetime).toDateString();

    return (
        order && (
            <Table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    <Clickable onClick={() => onOrderClick(order.id)}>
                        <td>{order.orderNumber}</td>
                        <td>{date}</td>
                        <td>{order.orderType}</td>
                        <td>{status}</td>
                        <td>{formatAmountToDollars(order, order.subtotal)}</td>
                        <td>{order.notes}</td>
                    </Clickable>
                </tbody>
            </Table>
        )
    );
};
