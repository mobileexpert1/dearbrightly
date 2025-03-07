import React from 'react';
import { Row, Col } from 'reactstrap';
import styled from 'react-emotion';

import { colors } from 'src/variables';
import { formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';

import { ItemTitle } from './styles';

const Summary = styled.div`
    margin-top: 30px;
    padding: 10px 15px 10px 0;
    background-color: ${colors.light};

    .row {
        margin: 0;
    }
`;

export const OrderDetailsSummary = ({ order, totalAmount, subtotal, tax, shippingFee, discountCode, discount }) => (
    <Col lg="4">
        <Summary>
            <Row>
                <Col lg="9">
                    <ItemTitle>Subtotal:</ItemTitle>
                </Col>
                <Col lg="3">{formatAmountToDollars(order, subtotal)}</Col>
            </Row>
            <Row>
                <Col lg="9">
                    <ItemTitle>Shipping:</ItemTitle>
                </Col>
                <Col lg="3">{formatAmountToDollars(order, shippingFee)}</Col>
            </Row>
            <Row>
                <Col lg="9">
                    <ItemTitle>Tax:</ItemTitle>
                </Col>
                <Col lg="3">{formatAmountToDollars(order, tax)}</Col>
            </Row>
            {discountCode && (
                <Row>
                    <Col lg="9">
                        <ItemTitle>Promo ({discountCode}):</ItemTitle>
                    </Col>
                    {discount > 0 && (<Col lg="3">-{formatAmountToDollars(order, discount)}</Col>)}
                </Row>
            )}
            <Row>
                <Col lg="9">
                    <ItemTitle>Total:</ItemTitle>
                </Col>
                <Col lg="3">{formatAmountToDollars(order, totalAmount)}</Col>
            </Row>
        </Summary>
    </Col>
);
