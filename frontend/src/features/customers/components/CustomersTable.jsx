import React from 'react';
import 'rc-checkbox/assets/index.css';
import Checkbox from 'rc-checkbox';
import { Table } from 'reactstrap';

import { CustomerItem } from './CustomerItem';

export const CustomersTable = ({
    customers,
    selectedCustomersIds,
    onCustomerSelect,
    onCustomerClick,
    onSelectAllCustomers,
}) => (
    <Table>
        <thead>
            <tr>
                <th>
                    <Checkbox
                        onChange={onSelectAllCustomers}
                        checked={customers.length == selectedCustomersIds.length}
                    />
                </th>
                <th>Customer</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date Joined</th>
            </tr>
        </thead>
        <tbody>
            {customers.map(customer => (
                <CustomerItem
                    key={customer.id}
                    customer={customer}
                    onSelect={() => onCustomerSelect(customer.id)}
                    isSelected={selectedCustomersIds.includes(customer.id)}
                    onCustomerClick={onCustomerClick}
                />
            ))}
        </tbody>
    </Table>
);
