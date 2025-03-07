import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';

import {
  getDiscountCodeRequest,
  removeDiscountCodeRequest,
  resetDiscountCodeState,
} from 'src/features/checkout/actions/discountActions';
import { updateOrderRequest } from 'src/features/orders/actions/ordersActions';
import {
  getDiscount,
  getDiscountCode,
  getDiscountErrorMessage,
  isDiscountCodeRequestSuccess,
  isRequestingDiscountCode,
  isRequestingDiscountCodeRemoval,
} from 'src/features/checkout/selectors/discountSelectors';

import { formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';
import { getOrder } from 'src/features/orders/selectors/orderSelectors';
import RemoveIcon from 'src/assets/images/x.svg';
import { FIRST_TIME_TRIAL_DISCOUNT_CODE } from 'src/common/constants/orders';
import { colors, fontFamily, fontWeight } from 'src/variables';

// todo common
const ListItem = styled('li')`
  position: relative;
  margin-bottom: 10px;
  &.divider {
    height: 1px;
    background: rgb(218, 218, 218);
  }
  &.total-box {
    span {
      font-size: 21px;
      font-family: ${fontFamily.baseFont};
      font-weight: ${fontWeight.bold};
    }
  }
  &.has-subtext {
    margin-bottom: -3px;
  }
`;

const Item = styled('span')`
  font-size: 14px;
  line-height: 18px;
  color: #000;
  font-family: ${fontFamily.baseFont};
  text-align: right;
  cursor: pointer;
  &.apply-code {
    a {
      text-decoration: underline;
      color: #000;
    }
  }
  &.discount-price {
    cursor: unset;
    span {
      color: #007bff;
      font-family: ${fontFamily.baseFont};
    }
  }
  &.promo-apply {
    border: 1px solid rgb(230, 224, 224);
    background: #fff;
    padding: 0px 8px;
    max-width: 200px;
    position: relative;
    input {
      border: 0;
      font-size: 14px !important;
      color: rgb(105, 105, 105);
      padding: 4px 48px 4px 0;
      width: 100%;
      outline: 0;
      text-transform: uppercase;
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
      padding: 0 8px;
      font-family: ${fontFamily.baseFont};
      font-weight: ${fontWeight.bold};
      cursor: pointer;
      outline: 0;
    }
  }
`;

const CancelLink = styled('a')`
  font-size: 14px;
  line-height: 18px;
  color: #000;
  font-family: ${fontFamily.baseFont};
  position: absolute;
  right: 210px;
  top: 11px;
  &:hover {
    color: #000;
  }
`;

const Check = styled('div')`
  font-size: 0.8rem;
  font-family: ${fontFamily.baseFont};
`;

const Alert = styled('div')`
  width: 100%;
  font-family: ${fontFamily.baseFont};
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-size: 0.8rem;
`;

const RemoveCouponLink = styled('a')`
  display: inline-block;
  background: url(${RemoveIcon}) no-repeat;
  background-size: cover;
  width: 11px;
  height: 11px;
  vertical-align: middle;
  margin-left: 6px;
`;

class AddDiscount extends React.Component {
  state = {
    isInputVisible: false,
    promoCode: this.props.discount.discountCode || '',
  };

  renderAlert = () => {
    setTimeout(() => this.resetDiscount(), 4500);

    return <Alert>{this.props.discountCodeErrorMessage}</Alert>;
  };

  showInput = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      isInputVisible: true,
    });
  };

  hideInput = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      isInputVisible: false,
    });
  };

  onChangeValue = value => {
    this.setState({
      promoCode: value,
    });
  };

  handleApplyDiscountCode = () => {
    const { promoCode } = this.state;
    const { order } = this.props;

    if (!promoCode) {
      this.setState({
        isInputVisible: false,
      });
      return;
    }

    this.setState({
      isInputVisible: false,
    });

    if (order && order.id){
      this.props.getDiscountCodeRequest(promoCode, order.id);
    }

    // Update the order with the discount code, if the order has been created
    if (order && order.id) {
      this.updateOrderDiscount(promoCode, order.id);
    }
  };

  updateOrderDiscount = (promoCode, orderId) => {
    const { updateOrderRequest } = this.props;

    const orderDetails = {
      discountCode: promoCode,
    };

    updateOrderRequest({
      id: orderId,
      orderDetails,
    });
  };

  resetDiscount = e => {
    const { order, removeDiscountCodeRequest, resetDiscountCodeState } = this.props;
    if (e) {
      e.preventDefault();
    }
    this.setState(
      {
        promoCode: '',
        isInputVisible: false,
      },
      () => {
        if (order && order.id) {
          removeDiscountCodeRequest(order.id);
        } else {
          resetDiscountCodeState();
        }
      },
    );
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { discount, order } = this.props;

    if (prevProps.discount != discount) {
      this.setState({
        promoCode: discount.discountCode || '',
      });
    }
  }

  onAlertDismiss = () => {
    const { resetDiscountCodeState } = this.props;
    resetDiscountCodeState();
  };

  render() {
    const { isInputVisible, promoCode } = this.state;
    const {
      discountCodeErrorMessage,
      requestingDiscountCode,
      requestingDiscountCodeRemoval,
      orderConfirmationView,
      order,
    } = this.props;

    const isUpdatingDiscountCode = requestingDiscountCodeRemoval || requestingDiscountCode;
    const discountAmount = order && order.discount ? order.discount : 0;
    const discountCode = order && order.discountCode ? order.discountCode : null;

    return (
      <React.Fragment>
        {requestingDiscountCode && <Check>Checking...</Check>}
        {requestingDiscountCodeRemoval && <Check>Removing code...</Check>}
        <ListItem className="d-flex justify-content-between">
          {!isUpdatingDiscountCode &&
            !isInputVisible &&
            (discountCode && (
              <React.Fragment>
                <Item>
                  <React.Fragment>
                    Promo ({discountCode}){' '}
                    {!orderConfirmationView && <RemoveCouponLink onClick={this.resetDiscount} />}
                  </React.Fragment>
                </Item>
                <Item className="discount-price">
                  <span style={{ color: colors.summaryGreen }}>
                    {discountAmount > 0 && (`-${formatAmountToDollars(order, discountAmount)}`)}
                  </span>
                </Item>
              </React.Fragment>
            ))}
          {discountCodeErrorMessage && this.renderAlert()}
          {!isUpdatingDiscountCode &&
            !isInputVisible &&
            !orderConfirmationView &&
            !discountCodeErrorMessage &&
            !discountCode && (
              <React.Fragment>
                <Item />
                <Item className="apply-code">
                  <a href="#" onClick={this.showInput}>
                    Apply promo
                  </a>
                </Item>
              </React.Fragment>
            )}
        </ListItem>
        {!isUpdatingDiscountCode &&
          !orderConfirmationView &&
          isInputVisible && (
            <ListItem className="d-flex justify-content-between">
              <CancelLink href="#" className="cancel-btn" onClick={this.hideInput}>
                Cancel
              </CancelLink>
              <Item />
              <Item className="promo-apply">
                <input
                  type="text"
                  defaultValue={promoCode}
                  onChange={e => this.onChangeValue(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  className="promo-apply-btn"
                  onClick={this.handleApplyDiscountCode}
                >
                  Apply
                </button>
              </Item>
            </ListItem>
          )}
      </React.Fragment>
    );
  }
}

export const AddDiscountContainer = connect(
  state => ({
    order: getOrder(state),
    discount: getDiscount(state),
    discountCode: getDiscountCode(state),
    discountCodeRequestSuccess: isDiscountCodeRequestSuccess(state),
    discountCodeErrorMessage: getDiscountErrorMessage(state),
    requestingDiscountCode: isRequestingDiscountCode(state),
    requestingDiscountCodeRemoval: isRequestingDiscountCodeRemoval(state),
  }),
  {
    updateOrderRequest,
    getDiscountCodeRequest,
    removeDiscountCodeRequest,
    resetDiscountCodeState,
  },
)(AddDiscount);
