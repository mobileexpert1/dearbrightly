import React from 'react';
import 'rc-checkbox/assets/index.css';
import Checkbox from 'rc-checkbox';
import { Table } from 'reactstrap';

import { AdminOrderRowItem } from './AdminOrderRowItem';

export const AdminOrdersTable = ({
  orders,
  orderStatuses,
  orderStatusesOptions,
  selectedOrdersIds,
  onDateHeaderClick,
  onAllOrdersSelect,
  onOrderSelect,
  onCustomerClick,
  onOrderIdClick,
  onStatusChange,
  onOrderArchive,
  onAddOrderNote,
}) => {
  const actions = [
    { name: 'Add Note', icon: 'edit', func: onAddOrderNote },
    { name: 'Edit Order', icon: 'form', func: onOrderIdClick },
    // { name: 'Archive', icon: 'delete', func: onOrderArchive },
  ];

  return (
    <Table>
      <thead>
        <tr>
          <th>
            <Checkbox
              onChange={onAllOrdersSelect}
              checked={orders.length == selectedOrdersIds.length}
            />
          </th>
          <th />
          <th />
          <th>Number</th>
          <th css={{ cursor: 'pointer' }} onClick={onDateHeaderClick}>
            Date
          </th>
          <th>Customer</th>
          <th>Type</th>
          <th>Status</th>
          <th>Products</th>
          <th>Total</th>
          <th>Action</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <AdminOrderRowItem
            key={order.id}
            order={order}
            status={orderStatuses[order.status]}
            actions={actions}
            orderStatusesOptions={orderStatusesOptions}
            isSelected={selectedOrdersIds.includes(order.id)}
            onStatusChange={status => status && onStatusChange({ id: order.id, orderDetails: { status: status.value } })}
            onSelect={() => onOrderSelect(order.id)}
            openCustomerDetails={onCustomerClick}
            openOrderDetails={onOrderIdClick}
          />
        ))}
      </tbody>
    </Table>
  );
};
