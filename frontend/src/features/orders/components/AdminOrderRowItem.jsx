import React, { useState, useEffect } from 'react';
import styled from 'react-emotion';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import 'rc-dropdown/assets/index.css';
import Dropdown from 'rc-dropdown';
import Menu, { MenuItem } from 'rc-menu';
import 'rc-checkbox/assets/index.css';
import Checkbox from 'rc-checkbox';
import Select from 'react-select';

import { colors } from 'src/variables';
import { formatAmountToDollarsWithCents } from 'src/common/helpers/formatAmountToDollars';
import { formatTimestampDateTime } from 'src/common/helpers/formatTimestamp';

const ClickableUnseen = styled.td`
    cursor: pointer;
    color: ${colors.linkColor} !important;
    font-weight: bolder;
    
    &:hover {
        text-decoration: underline; 
    }
`;

const Clickable = styled.td`
    cursor: pointer;
    color: ${colors.linkColor} !important;

    &:hover {
        text-decoration: underline; 
    }
`;

const attentionSymbolStyle = {
    color: 'red',
    size: "0.75em",
};

const newCustomerSymbolStyle = {
    color: colors.salmon,
    size: "0.75em",
};

const icons = {
  edit: <EditOutlined />,
  form: <FormOutlined />,
  delete: <DeleteOutlined />
};

const DropdownMenu = ({ actions, id }) => (
  <Menu>
    {actions.map(action => (
      <MenuItem key={action.name} onClick={() => action.func(id)}>
        {icons[action.icon]}
        {action.name}
      </MenuItem>
    ))}
  </Menu>
);

export const AdminOrderRowItem = ({
  order,
  status,
  onStatusChange,
  openCustomerDetails,
  openOrderDetails,
  actions,
  orderStatusesOptions,
  isSelected,
  onSelect,
}) => {
  const date = formatTimestampDateTime(new Date(order.purchasedDatetime));
  const email = order.customer && order.customer.email ? order.customer.email : '';
  const name =
    order.customer && order.customer.shippingDetails
      ? `${order.customer.shippingDetails.firstName} ${order.customer.shippingDetails.lastName}`
      : '';

  const showAttentionSymbol = status === "Manual Verification Required";
  const showNewCustomerSymbol = !order.isRefill;
  const isOrderSeen = order.seenDatetime;

  const currentOption = order && order.status && orderStatusesOptions.find(option => option.value === order.status);
  const [ selectedStatus, setSelectedStatus ] = useState({
    label: currentOption && currentOption.name || '',
    value: currentOption && currentOption.value || ''
  });

  useEffect(() => {
    const currentOption = order && order.status && orderStatusesOptions.find(option => option.value === order.status);
    if (currentOption && currentOption.name && currentOption.value) {
      setSelectedStatus({
        label: currentOption.name,
        value: currentOption.value
      });
    }
  }, [order, orderStatusesOptions]);

  const onStateChange = (selected) => {
    if (selected) {
      setSelectedStatus({...selected});
      onStatusChange(selected);
    }
  };

  const createOptions = (items) => {
    return items.map(({ value, name }) => ({
      label: name,
      value: value
    }))
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      background: '#fff',
      minHeight: '45px',
      height: '45px',
      boxShadow: state.isFocused ? null : null,
    }),

    container: (provided, state) => ({
      ...provided,
      paddingBottom: '6px',
      width: '200px'
    }),

    valueContainer: (provided, state) => ({
      ...provided,
      height: '45px',
      padding: '0 6px',
    }),

    input: (provided, state) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorSeparator: state => ({
      display: 'none',
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: '45px',
    }),
  };

  return (
    <tr>
      <td>
        <Checkbox onChange={onSelect} checked={isSelected} />
      </td>
      <td>{showAttentionSymbol && <i className="fa fa-warning" style={attentionSymbolStyle}></i>}</td>
      <td>{showNewCustomerSymbol && <i className="fa fa-user-circle" style={newCustomerSymbolStyle}></i>}</td>
      {isOrderSeen && (<Clickable css={{ maxWidth: 120 }} onClick={() => openOrderDetails(order.id)}>
        {order.orderNumber}
      </Clickable>)}
      {!isOrderSeen && (<ClickableUnseen css={{ maxWidth: 120 }} onClick={() => openOrderDetails(order.id)}>
        {order.orderNumber}
      </ClickableUnseen>)}
      <td>{date}</td>
      <Clickable onClick={() => openCustomerDetails(order.customer.id)}>
        <div>
          <div>{`${name}`}</div>
          <div>{`${email}`}</div>
        </div>
      </Clickable>
      <td>{order.orderType}</td>
      <td>
        <Select
          styles={customStyles}
          options={createOptions(orderStatusesOptions)}
          value={selectedStatus}
          onChange={onStateChange}
        />
      </td>
      <td>{order.orderProducts.map(orderProduct => orderProduct.productName).join(', ')}</td>
      <td>{formatAmountToDollarsWithCents(order.totalAmount)}</td>
      <td>
        <Dropdown overlay={DropdownMenu({ actions, id: order.id, xd: 'yes' })} trigger={['click']}>
          <EllipsisOutlined style={{ fontSize: 32, paddingLeft: 8, cursor: 'pointer' }}/>
        </Dropdown>
      </td>
      <td>{order.notes}</td>
    </tr>
  );
};
