import React from 'react';
import { Col } from 'reactstrap';
import PlusCircleOutlined from '@ant-design/icons/PlusCircleOutlined';

import * as S from './styles';

import { AdminOrderProductDetail } from './AdminOrderProductDetail';

export const AdminOrderProductsDetail = ({
    orderProducts,
    productsOptions,
    onQuantityChange,
    onItemChange,
    onItemRemove,
    onItemAdd,
}) => (
    <Col lg="8">
        <S.Title>Products</S.Title>
        {orderProducts.map(orderProduct => (
            <AdminOrderProductDetail
                key={orderProduct.nr}
                orderProduct={orderProduct}
                productsOptions={productsOptions}
                onQuantityChange={onQuantityChange}
                onItemChange={onItemChange}
                onItemRemove={onItemRemove}
            />
        ))}
        <PlusCircleOutlined
            style={{ color: 'green', cursor: 'pointer', fontSize: 24 }}
            onClick={onItemAdd}
        />
    </Col>
);
