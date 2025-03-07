import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { CartSummary } from './CartSummary';
import { OrderSummaryContainer } from './OrderSummary';
import { getAllProducts } from 'src/features/products/selectors/productsSelectors';
import { ShippingInfo } from 'src/features/checkout/components/ShippingInfo';
import {getDiscount, getDiscountCode} from '../selectors/discountSelectors';
import { getOrder } from 'src/features/orders/selectors/orderSelectors';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { breakpoints } from 'src/variables';
import { updateOrderRequest } from 'src/features/orders/actions/ordersActions';

const CartWrapper = styled('div')`
  width: 60%;
  height: calc(100% - 75px);
  margin: 0 auto;
  overflow-y: scroll;
  padding-bottom: 100px;
  padding-top: 20px;

  ${breakpoints.md} {
    padding: 0 5px;
    width: 100%;
    padding-bottom: 125px;
  }
`;

const BottomNavContainer = styled('div')`
  padding-top: 20px;
  ${breakpoints.lg} {
    padding-top: 0;
  }
`;

const CartSummaryContainer = styled('div')`
  height: 100%;
`

// this component is being used in payment screen only
class CartInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasRemovedItem: false,
            subtotal: 0,
            total: 0,
            showPriceBreakup: false,
        };
    }

    togglePriceBreakup = e => {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            showPriceBreakup: !this.state.showPriceBreakup,
        });
    };

    render() {
        const {
            order,
            products,
            orderUpdateErrorMsg,
            navigateBack,
        } = this.props;
        const {showPriceBreakup} = this.state;
        const shippingDetails = (order && order.shippingDetails) || '';

        return (
            <CartSummaryContainer>
                <CartWrapper id={'cart-wrapper'}>
                    <CartSummary
                        products={products}
                        data={order.orderProducts}
                        parent={'cartSummary'}
                        total={order.totalAmount}
                        order={order}
                        updateOrderRequest={this.props.updateOrderRequest}
                        showSubscription={true}
                        showPrice={true}
                    />
                    <ShippingInfo
                        showPriceBreakup={showPriceBreakup}
                        shippingDetails={shippingDetails}
                        showEditButton={false}
                    />
                    <OrderSummaryContainer id={"order-summary-container"}
                                        showPriceBreakup={showPriceBreakup}
                    />
                    {orderUpdateErrorMsg && (
                        <span className="text-danger text-center" style={{paddingTop: 10, paddingRight: 10}}>
                                {orderUpdateErrorMsg}
                            </span>
                    )}
                    <BottomNavContainer>
                        <BottomNav
                            id={'bottom-nav'}
                            currentCheckoutStepName={'payment confirmation'}
                            backButtonType={'arrow'}
                            backButtonClick={navigateBack}
                            backButtonTitle={'Back'}
                            disableBackButton={false}
                            disableNextButton={false}
                            hideNextButtonArrow={false}
                            hideBackButton={false}
                            nextButtonClick={this.props.handleCardInfoSubmit}
                            nextTitle={'Confirm payment'}
                        />
                    </BottomNavContainer>
                </CartWrapper>
            </CartSummaryContainer>
        );
    }
}

export const CartContainer = connect(
  state => ({
    products: getAllProducts(state),
    order: getOrder(state),
    discount: getDiscount(state),
    discountCode: getDiscountCode(state),
  }),
  { updateOrderRequest },
)(CartInfo);
