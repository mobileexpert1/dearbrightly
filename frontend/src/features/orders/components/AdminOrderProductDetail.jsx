import React from 'react';
import styled from 'react-emotion';
import InputNumber from 'rc-input-number';
import MinusCircleOutlined from '@ant-design/icons/MinusCircleOutlined';
import Select from 'react-select';

import { formatAmountToDollarsWithCents } from 'src/common/helpers/formatAmountToDollars';

const Item = styled('div')`
    display: flex;
    flex-direction: column;
    margin-right: 15px;
`;

const FrequencyWrapper = styled.div`
    height: 35px;
    width: 150px;
    display: flex;
    align-items: center;
    padding-left: 5px;
    margin-left: 7px;
`;

const Wrapper = styled('div')`
    display: flex;
    width: 100%;
    margin-bottom: 15px;
`;

const Amount = styled('p')`
    margin: 0;
    margin-top: 5px;
    margin-left: 16px;
    font-size: 16px;
`;

const Title = styled('p')`
    margin: 0;
    padding-left: 10px;
    padding-left: ${props => props.paddingLeft};
    font-size: 14px;
    font-weight: bold;
`;

const StyledInputNumber = styled(InputNumber)`
    input {
        min-height: 30px;
    }
`;

const frequencyNames = {
    1: 'Once',
    3: 'Every 3 months',
};

export const AdminOrderProductDetail = ({
    orderProduct,
    productsOptions,
    onQuantityChange,
    onItemChange,
    onItemRemove,
}) => {
    const { quantity, price, productName, frequency } = orderProduct;

    const total = quantity * price;
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
        width: '180px'
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
        <Wrapper>
            <Item
                css={{ justifyContent: 'center', cursor: 'pointer', color: 'red', paddingTop: 10 }}
                onClick={() => onItemRemove(orderProduct.nr)}
            >
                <MinusCircleOutlined />
            </Item>
            <Item>
                <Title>Item</Title>
                <Select
                    styles={customStyles}
                    placeholder='Select Item'
                    value={{label: productName, value: productName}}
                    options={productsOptions.map(({ value, name }) => ({
                        value: value,
                        label: name
                    }))}
                    onChange={value => value && onItemChange(value.value, orderProduct.nr)}
                />
            </Item>
            <Item>
                <Title paddingLeft="0">Quantity</Title>
                <StyledInputNumber
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={value => onQuantityChange(value, orderProduct.nr)}
                />
            </Item>
            <Item>
                <Title>Frequency</Title>
                <FrequencyWrapper>{frequencyNames[frequency]} </FrequencyWrapper>
            </Item>
            <Item>
                <Title>Total</Title>
                <Amount>{formatAmountToDollarsWithCents(total)}</Amount>
            </Item>
        </Wrapper>
    );
};
