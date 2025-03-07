import React from 'react';
import styled from 'react-emotion';

import {formatAmountToDollars, formatAmountToDollarsWithCents,} from 'src/common/helpers/formatAmountToDollars';
import {FIRST_TIME_TRIAL_DISCOUNT, FIRST_TIME_TRIAL_DISCOUNT_CODE,} from 'src/common/constants/orders';
import {breakpoints, colors, fontSize, fontFamily } from 'src/variables';
import Row from 'reactstrap/lib/Row';
import refillIcon from 'src/assets/images/refillBlue.svg';
import {RxBadge} from 'src/features/dashboard/shared/styles';
import {history} from 'src/history';

const consultIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/feedback.svg';


const RefillIconWrapper = styled.img`
  height: ${props => props.width};
  width: ${props => props.width};
  margin-left: 5px;
  padding: 8px;
  background-color: ${colors.mulberry};
  border-radius: 50%;
  background: ${colors.blackSqueeze};
`;

const CartWrapper = styled('div')`
  .in-checkout-mode {
    background: #fff;
  }
  .in-account-mode {
    width: 100%;
    @media (min-width: 768px) {
      width: 50%;
    }
  }
`;
const ProductsWrapper = styled('div')`
  & ~ .onboard-price-box {
    margin-top: 25px;
  }
`;
const EditQuantityContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 20px;
  ${breakpoints.xs} {
    flex-direction: row;
  }
`;

const LinkBtn = styled('a')`
  font-size: 12px;
  color: #000;
  line-height: 21px;
  text-decoration: underline;
  font-family: ${fontFamily.baseFont};
  text-align: right;
  margin-left: 20px;
  margin-top: 10px;
  ${breakpoints.xs} {
    margin-top: 0;
  }
`;

const ItemDetails = styled('div')``;
const Input = styled('input')`
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0;
    opacity: 1;
  }
  width: 25px;
  min-height: 15px;
  padding: 0;
  font-size: 12px;
  color: ${colors.black};
  background-color: ${colors.white};
  border: 1px solid ${colors.dirtyWhite};
  text-align: center;
`;
const MinusButton = styled('button')`
  background-color: transparent;
  font-size: 14px;
  width: 25px;
  border-color: transparent;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  padding: 2px 0;
  border: 1px solid ${colors.dirtyWhite};
  vertical-align: middle;
  &:before {
    -webkit-text-stroke-color: white;
    -webkit-text-stroke-width: 2px;
  }
  &:focus {
    box-shadow: none;
    outline: none;
  }
  color: ${colors.black};
  cursor: pointer;
`;
const PlusButton = styled('button')`
  background-color: transparent;
  font-size: 16px;
  border-color: transparent;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  padding: 2px 0;
  font-size: 14px;
  width: 25px;
  border: 1px solid ${colors.dirtyWhite};
  vertical-align: middle;
  &:before {
    -webkit-text-stroke-color: white;
    -webkit-text-stroke-width: 2px;
  }
  &:focus {
    box-shadow: none;
    outline: none;
  }
  color: ${colors.black};
  cursor: pointer;
`;

const QuantityChange = styled('div')``;

const PriceExpInfo = styled.span`
  text-align: justify;
  color: gray;
  font-size: 12px;
  padding-top: 10px;
  @media only screen and (max-width: 768px) {
    font-size: 10px;
  }
`;
const SpanText = styled.span`
  color: ${colors.veryDarkBlue};
  font-size: 14px;
  font-family: ${fontFamily.baseFont};
`;
const ItemGreen = styled('div')`
  padding-top: ${props => (props.marginTop ? props.marginTop : 0)};
  font-size: ${fontSize.smallest};
  line-height: 18px;
  color: ${colors.summaryGreen};
  font-family: ${fontFamily.baseFont};
`;

const CardContainer = styled.div`
  border: 1px solid ${colors.brightGray};
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  width: 100%;
`;
const Card = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;
const CardImageTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  ${breakpoints.xs} {
    justify-content: flex-start;
  }
`;
const CardTextBody = styled.div`
  width: 100%;
  margin: 0 20px;
  text-align: right;
  ${breakpoints.xs} {
    margin: 0 0 0 12px;
    text-align: left;
  }
`;
const CardTitle = styled.div`
  display: flex;
  flex-direction: row;
  color: ${colors.facebookBlue};
  line-height: 35px;
  padding: 0;
  margin: 0;
  align-items: center;
  justify-content: end;
  width: 100%;
  text-transform: uppercase;
  ${breakpoints.xs} {
    font-size: ${fontSize.smallest};
    line-height: 25px;
    justify-content: start;
  }
`;

const CardPriceText = styled.div`
  line-height: 25px;
  font-weight: bold;
  font-size: ${fontSize.small};
`;
const CardMonthlyPriceText = styled.div`
  font-weight: bold;
  font-size: ${fontSize.smallest};
  line-height: 25px;
`;
const ProductImage = styled.img`
  border-radius: 5px;
  max-width: 175px;
  object-fit: contain;
  ${breakpoints.xs} {
    max-width: 100px;
  }
`;
const BulletedPlanUpdateDescription = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${colors.facebookBlue};
`;
const BulletedDescription = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  font-size: 12px;
  padding-top: 10px;
`;
const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export class CartSummary extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getProductSummary = this.getProductSummary.bind(this);
    this.state = {

    };
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  getProductData(name) {
    if (!name) {
      return null;
    }
    const productData = this.props.products.filter(
      product =>
        product.name.toLowerCase() === name.toLowerCase() &&
        (product.isHidden === false || product.productCategory === 'bottle'),
    );
    return productData[0];
  }

  getProductSummary(name) {
    if (!name) {
      return null;
    }
    const productData = this.getProductData(name);
    return productData && productData.productSummary;
  }

  compare(a, b) {
    return a.id - b.id;
  }

  onQuantityChange = (id, frequency, quantity) => {
    if (quantity < 0 || quantity === '') {
      quantity = 1;
    }

    const orderDetails = {
      orderProducts: this.props.order.orderProducts.map(
          orderProduct =>
              orderProduct.productUuid === id
                  ? {
                    ...orderProduct,
                    quantity,
                    frequency,
                  }
                  : orderProduct,
      ),
    };

    this.props.updateOrderRequest({
      id: this.props.order.id,
      orderDetails,
    });

  };

  increaseValue = (id, frequency, quantity) => {
    this.onQuantityChange(id, frequency, quantity + 1);
  };

  decreaseValue = (id, frequency, quantity) => {
    this.onQuantityChange(id, frequency, quantity - 1);
  };

  hasRx = () => {
    return this.props.data.filter(p => p.type === 'Rx').length > 0;
  };

  showSubscriptionDetails = () => {
    return this.props.showSubscription === true;
  };
  showPrices = () => {
    return this.props.showPrice === true;
  };

  goToProducts = () => {
    this.props.toggleCart();
    history.push('/products');
  };

  renderItemDetails = item => {
    const showSubscription = this.showSubscriptionDetails();

    const frequency = item.frequency;
    const isSubscription = item.frequency > 0;
    const refillInfo = 'Refill shipments: Every three months';
    const changeFrequencyInfo = 'Change frequency or cancel anytime';
    const refillPrice = item.refillPrice;
    const subscriptionPrice = item.subscriptionPrice;
    const isRx = item.productType === 'Rx';
    const rxRefillText = isRx ? 'Trial size lasts ~2 months, refills last ~3 months. ' : '';

    return (
        <ItemDetails>
          {showSubscription && isSubscription &&
          <div style={{ background: '#F3F3F3', borderRadius: 5, padding: 10, marginTop: 25 }}>
            <Row
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
            >
              <div style={{ width: '50%' }}>
                <SpanText>Refill shipments</SpanText>
              </div>
              <div style={{ width: '50%', textAlign: 'right' }}>
                <div>
                  <SpanText>
                    {formatAmountToDollarsWithCents(subscriptionPrice / frequency)}
                    /mo
                  </SpanText>
                </div>
                <div style={{ marginTop: 5 }}>
                  <ItemGreen>
                    {frequency}
                    -month supply
                  </ItemGreen>
                </div>
              </div>
            </Row>
            <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid #E5E5E5',
                }}
            >
              <PriceExpInfo>
                {`${rxRefillText}Refills ship and bill every 3 months at ${formatAmountToDollarsWithCents(
                    subscriptionPrice,
                )} 
                  (${formatAmountToDollarsWithCents(
                    subscriptionPrice / frequency,
                )}/mo). Cancel or change frequency anytime.`}
              </PriceExpInfo>
            </div>
          </div>
          }
      </ItemDetails>
    );
  };

  getReadableDiscountedTrialPrice = product => {
    const isRx = product.productType === 'Rx';
    let discountTrialPrice = product.trialPrice;
    if (isRx) {
      discountTrialPrice -= FIRST_TIME_TRIAL_DISCOUNT;
    }
    return formatAmountToDollars(null, discountTrialPrice);
  };

  getReadableDiscountedMonthlyPrice = product => {
    const isRx = product.type === 'Rx';
    let discountTrialPrice = product.trialPrice;
    if (isRx) {
      discountTrialPrice -= FIRST_TIME_TRIAL_DISCOUNT;
    }
    return formatAmountToDollarsWithCents((data.trialPrice - FIRST_TIME_TRIAL_DISCOUNT) / 2);
  };

  getRxMonthlyPriceBreakdown = (productData, item) => {
    const isRx = item.type === 'Rx';
    const monthsSupply = isRx ? 2 : 3;
    const productPrice = productData ? productData.price : 0;
    const subscriptionPrice = productData ? productData.subscriptionPrice : 0;
    const discountedProductPrice = isRx
      ? (productPrice - FIRST_TIME_TRIAL_DISCOUNT) / monthsSupply
      : subscriptionPrice / monthsSupply;

    return formatAmountToDollarsWithCents(discountedProductPrice);
  };

  renderItems(data, discountCode) {
    if (!data) {
      return null;
    }
    const showPrices = this.showPrices();

    return data.sort(this.compare).map((item, index) => {
      const isRx = item.productType === 'Rx';
      const productData = this.getProductData(item.productName);
      const formattedMonthlyPrice = isRx
        ? this.getRxMonthlyPriceBreakdown(productData, item)
        : formatAmountToDollarsWithCents(item.subscriptionPrice / item.frequency);
      const productPrice = productData
        ? item.frequency > 0 && !isRx
          ? productData.subscriptionPrice
          : productData.price
        : 0;
      const formattedProductPrice = formatAmountToDollarsWithCents(productPrice);
      const discountedTrialPrice = this.getReadableDiscountedTrialPrice(item);
      const isPlan = item.frequency > 0;
      const showStrikeThroughPrice = formattedProductPrice > discountedTrialPrice ? true : false;

      return (
        <CardContainer id={'card-container'} className="mb-2">
          <Card id={'card'} className="card p-3 border-0">
            <CardImageTextWrapper>
              <ProductImage alt="Product" className="card-img-top" src={item.productImage} />
              <CardTextBody id={'card-text-body'}>
                <CardTitle id={'card-title'}>
                  {item.quantity} x {item.productName}
                  {isRx && <RxBadge>RX</RxBadge>}
                  {isPlan && <RefillIconWrapper src={refillIcon} height={'26px'} width={'26px'} />}
                </CardTitle>
                { showPrices &&
                  <CardPriceText>
                    { showStrikeThroughPrice ?
                        (<div> <strike>{formattedProductPrice}</strike> {discountedTrialPrice} </div>) :
                        (<div> {formattedProductPrice} </div>)
                    }
                  </CardPriceText>
                }
                {/*{isPlan && (*/}
                {/*    <CardMonthlyPriceText>*/}
                {/*      {formattedMonthlyPrice}*/}
                {/*      /mo*/}
                {/*    </CardMonthlyPriceText>*/}
                {/*)}*/}
                {!isRx && (
                  <EditQuantityContainer>
                    <QuantityChange>
                      <div className="d-flex justify-content-end">
                        <MinusButton
                          className="fa fa-minus  "
                          onClick={() => {
                            this.decreaseValue(item.productUuid, item.frequency, item.quantity);
                          }}
                        />
                        <Input
                          readOnly
                          min={1}
                          type="number"
                          value={item.quantity}
                        />
                        <PlusButton
                          className="fa fa-plus "
                          onClick={() => {
                            this.increaseValue(item.productUuid, item.frequency, item.quantity);
                          }}
                        />
                      </div>
                    </QuantityChange>
                  </EditQuantityContainer>
                )}
                {isRx && (
                    <ItemGreen marginTop={10}>
                      Special trial size for your first two months
                    </ItemGreen>
                )}
              </CardTextBody>
            </CardImageTextWrapper>
            {this.renderItemDetails(item)}
          </Card>
        </CardContainer>
      );
    });
  }

  render() {
    const { discountCode, order } = this.props;
    if (!order) {
      return <div></div>
    }
    return (
      <React.Fragment>
        <CartWrapper>
          <ProductsWrapper>
            {this.renderItems(order.orderProducts, discountCode)}
          </ProductsWrapper>
        </CartWrapper>
      </React.Fragment>
    );
  }
}