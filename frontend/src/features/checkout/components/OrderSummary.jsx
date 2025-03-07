import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { colors, breakpoints, fontSize, fontFamily, fontWeight } from 'src/variables';
import { AddDiscountContainer } from 'src/features/checkout/containers/AddDiscountContainer';
import { formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';
import {
    MEDICAL_VISIT_FEE,
    SUBSCRIPTION_DISCOUNT
} from 'src/common/constants/orders';

const SummaryWrapper = styled('div')`
    padding: 10px;
    margin-top: 0;
    ${breakpoints.xs} {
      margin-top: 10px;
    }    
    border-left: 1px solid ${colors.whitesmoke};
    border-right: 1px solid ${colors.whitesmoke};
    border-bottom: 1px solid ${colors.whitesmoke};
    .hide {
        display: none !important;
    }
    
`;
const SummaryList = styled('ul')`
    margin: 0;
`;
const ListItem = styled('li')`
    margin-bottom: 10px;
    &.divider {
        height: 1px;
        background: rgb(218, 218, 218);
    }
    &.total-box {
        span {
            font-size: 14px;
            line-height: 18px;
            font-family: ${fontFamily.baseFont};
            font-weight: ${fontWeight.bold};
        }
    }
    &.has-subtext {
        margin-bottom: -3px;
    }
    &.hide {
        display: none !important;
    }
`;
const Item = styled('span')`
    font-size: ${fontSize.small};
    line-height: 18px;
    color: #000;
    font-family: ${fontFamily.baseFont};
    &.apply-code {
        a {
            text-decoration: underline;
            color: #000;
        }
    }
    &.discount-price {
        color: rgb(131, 131, 131);
    }
    &.subtext {
        font-size: 12px;
    }
    &.promo-apply {
        border: 1px solid rgb(230, 224, 224);
        background: #fff;
        padding: 0px 8px;
        max-width: 156px;
        position: relative;
        input {
            border: 0;
            font-size: 17px;
            color: rgb(105, 105, 105);
            padding: 4px 38px 4px 0;
            width: 100%;
            outline: 0;
        }
        .promo-apply-btn {
            font-size: 11px;
            color: rgb(104, 99, 99);
            border: 0;
            background: transparent;
            text-transform: uppercase;
            border-left: 1px solid rgb(27, 33, 37);
            position: absolute;
            right: 0;
            top: 12px;
            padding: 0 10px;
            font-family: ${fontFamily.baseFont};
            font-weight: ${fontWeight.bold};
            cursor: pointer;
            outline: 0;
        }
    }
`;
const ItemGreen = styled('span')`
    font-size: ${fontSize.small};
    line-height: 18px;
    color: ${colors.summaryGreen};
    font-family: ${fontFamily.baseFont};
`;
const Label = styled('p')`
    font-size: 14px;
    line-height: 20px;
    max-width: 240px;
    color: rgb(80, 80, 80);
`;

export class OrderSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    showPriceBreakup() {
        return this.props.showPriceBreakup
            ? 'd-flex justify-content-between'
            : 'd-flex justify-content-between hide';
    }

    render() {
        const {
            order,
            showPriceBreakup,
            total,
        } = this.props;

        const isOrderCreated = order && !!order.id;
        const taxText = "Tax";
        const totalText = "Total";
        const taxAmount = isOrderCreated && order.tax >= 0 ? formatAmountToDollars(order, order.tax) : "$--";
        const subtotal = isOrderCreated ? order.subtotal : total;
        const shippingDescription ='FREE';

        return (
            <React.Fragment>
                <SummaryWrapper>
                    <SummaryList>
                        {/* Subtotal */}
                        <ListItem className="d-flex justify-content-between text-center">
                            <Item>Subtotal</Item>
                            <Item>{formatAmountToDollars(order, subtotal)}</Item>
                        </ListItem>

                        {/* Tax */}
                        <ListItem className='d-flex justify-content-between'>
                            <Item>{taxText}</Item>
                            <Item>{taxAmount}</Item>
                        </ListItem>

                        {/* Subscription promotion */}
                        {isOrderCreated && order.orderType === 'Rx' && (
                            <ListItem className={this.showPriceBreakup()}>
                                <Item>Subscription Promo</Item>
                                <ItemGreen>-{formatAmountToDollars(order, SUBSCRIPTION_DISCOUNT)}</ItemGreen>
                            </ListItem>
                        )}

                        {/* Apply promo code */}
                        <AddDiscountContainer/>

                        {/* Doctor's Consult */}
                        {(isOrderCreated && order.orderType === 'Rx') && (
                            <ListItem className='d-flex justify-content-between'>
                                <Item>{"Doctor's Consult"}</Item>
                                <ItemGreen>{"Included"}</ItemGreen>
                            </ListItem>
                        )}

                        {/* Doctor's consultation */}
                        {isOrderCreated && order.orderType === 'Rx' && (
                            <div className={showPriceBreakup ? '' : 'hide'}>
                                <ListItem className="d-flex justify-content-between has-subtext">
                                    <Item>Doctor's consultation</Item>
                                    <Item>{formatAmountToDollars(order, MEDICAL_VISIT_FEE)}</Item>
                                </ListItem>
                                <Label>Only once a year and fee is non-refundable</Label>
                            </div>
                        )}

                        {/* Shipping fee */}
                        {(
                            <ListItem className='d-flex justify-content-between'>
                                <Item>Shipping</Item>
                                <ItemGreen>{shippingDescription}</ItemGreen>
                            </ListItem>
                        )}

                        <div style={{marginTop: 5, marginBottom: 5}}><ListItem className="divider" /></div>

                        {/* Total */}
                        <ListItem className="d-flex justify-content-between total-box">
                            <Item>{totalText}</Item>
                            <Item>{formatAmountToDollars(order, order.totalAmount)}</Item>
                        </ListItem>
                    </SummaryList>
                </SummaryWrapper>
            </React.Fragment>
        );
    }
}

export const OrderSummaryContainer = connect(state => ({
    order: state.order.data,
}))(OrderSummary);
