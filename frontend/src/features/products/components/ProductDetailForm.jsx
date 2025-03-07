import React, { Component } from 'react';
import styled from 'react-emotion';
import * as S from './styles';
import {
  formatAmountToDollarsWithCents,
  formatAmountToDollars,
} from 'src/common/helpers/formatAmountToDollars';
import { StandardBlueButton } from 'src/common/components/Buttons';
import { colors, fontFamily, fontWeight } from 'src/variables';
import BlackMinusIcon from 'src/assets/images/blackMinusIcon.svg';
import BlackPlusIcon from 'src/assets/images/blackPlusIcon.svg';

const ProductDetailForm = styled('div')`
  width: 345px;
  border: 1px solid ${colors.thinGrey};
  border-radius: 7px;
  margin-bottom: 20px;
  margin-left: auto;
  background: #fff;
  @media (min-width: 1200px) {
    position: sticky;
    top: 100px;
    right: 3%;
    z-index: 999;
  }
  @media (max-width: 1200px) {
    margin-right: 20px;
  }
  @media (max-width: 768px) {
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    width: 90%;
  }
  @media (min-width: 769px) and (max-width: 991px) {
    position: absolute;
    top: 140px;
    margin-right: 0;
    right: 40px;
  }
  @media (min-width: 992px) and (max-width: 1200px) {
    position: absolute;
    top: 160px;
    margin-right: 0;
    right: 45px;
  }
`;
const ProductHeader = styled('div')`
  display: flex;
  flex-direction: row;
`;
const FormHeadingWrapper = styled('div')`
  h3 {
    margin-bottom: 10px;
  }
`;
const AddBtnWrapper = styled('div')`
  margin: 20px 0 15px;
  padding: 0px 20px 25px 20px;
  text-align: center;
  @media (max-width: 500px) {
    position: sticky;
    bottom: 5px;
    width: 100%;
  }
  @media (min-width: 769px) and (max-width: 1200px) {
    padding: 0px 20px 15px 20px;
  }
  h5 {
    text-align: center;
    font-size: 12px;
    margin: 10px 0 0 0;
    font-family: ${fontFamily.baseFont};
  }
`;
const ProductSummary = styled('div')`
  flex: 2.5 0 0;
`;
const Price = styled('div')`
  padding-left: 20px;
  text-align: right;
  justify-self: end;
  font-size: 14px;
  h2 {
    font-size: 18px;
    text-align: right;
    line-height: 24px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    letter-spacing: 0.08px;
    margin-bottom: 0px;
    text-transform: ${props => (props.uppercase ? 'uppercase' : '')};
    color: rgba(69, 119, 219, 1);
  }
  h4 {
    font-size: 14px;
    text-align: right;
    line-height: 20px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
    letter-spacing: 0.08px;
    margin-bottom: -5px;
    text-transform: ${props => (props.uppercase ? 'uppercase' : '')};
    color: rgba(69, 119, 219, 1);
  }
`;
const ShortSummary = styled('span')`
  font-size: 13px;
  font-weight: bold;
  line-height: 15.6px;
`;
const Pricing = styled('span')`
  font-size: 12px;
  font-weight: bold;
  line-height: 24px;
  color: rgba(69, 119, 219, 1);
  font-family: ${fontFamily.baseFont};
  font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
  letter-spacing: 0.08px;
  margin-bottom: 5px;
`;
const SaveAmount = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${colors.white};
  width: 100%;
  padding: 6px;
  background-color: ${colors.darkGreen};
  text-align: center;
  border-radius: 70px;
`;

const DeliveryFrequencyWrapper = styled.div``;

const RadioButtonsWrapper = styled.div``;
const ProductsFrequencyWrapper = styled.div`
  padding: 5px 0;
  background-color: ${props => (props.color ? props.color : 'transparent')};
`;

const FrequencyRadioButton = styled('input')`
  width: 15px;
  margin-right: 10px;
`;

const ShippingLabel = styled.div`
  font-size: 15px;
  margin-right: 30px;
  width: 120px;
  flex-grow: 1;
`;

const ProductsFrequency = styled.div`
  overflow: hidden;
  display: flex;
  align-items: center;
  box-sizing: content-box;
  font-size: 12px;
  font-weight: bold;
`;

const RefillInfo = styled.div`
  max-width: 120px;
  font-size: 10px;
  line-height: 17px;
  font-weight: 400;
  margin: 0 0 0 25px;
  color: ${colors.lightPlatinum};
`;

const SubscriptionInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const PriceInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: right;
  justify-content: space-between;
`;

const QuantityContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0 0 0;
`;

const QuantityContainerContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledButton = styled.button`
  min-height: 1.5rem;
  height: 2.5rem;
  max-width: 3rem;
  background-color: transparent;
  font-size: 16px;
  padding: 4px 10px;
  vertical-align: middle;
  cursor: pointer;
  border: none;
  &:before {
    -webkit-text-stroke-color: ${colors.white};
    -webkit-text-stroke-width: 2px;
  }
  &:focus {
    box-shadow: none;
    outline: none;
  }
`;

const Amount = styled.div`
  max-width: 3rem;
  min-height: 1.5rem;
  padding: 7px 10px;
  font-size: 15px;
  font-weight: bold;
  background-color: transparent;
  text-align: center;
`;

const QuantityLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  line-height: 15.6px;
`;

const StyledHeading = styled(S.Heading2)`
  font-size: 20px;
`;

const StyledPrice = styled(Price)`
  font-size: 19px;
  color: ${props => (props.color ? props.color : 'black')};
`;


const PinkBoxWrapper = styled.div`
  background: ${colors.linen};
  border-radius: 4px;
  font-size: 10px;
  min-height: 24px;
  margin-top: 16px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 240px;
`;

export class ProductDetailFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: 1,
      frequency: this.props.data.subscriptionPrice > 0 ? 3 : 0,
    };
  }

  handleQuantityChange = quantity => {
    this.setState({
      quantity: this.state.quantity + quantity,
    });
  };

  getSubscriptionPrice() {
    return formatAmountToDollars(null, this.props.data.subscriptionPrice);
  }

  getPrice() {
    return formatAmountToDollars(null, this.props.data.price);
  }
  getDiscountAmount() {
    return formatAmountToDollars(null, this.props.data.price - this.props.data.subscriptionPrice);
  }
  renderDiscountedTrialPriceBreakdown() {
    const { data } = this.props;
    return formatAmountToDollarsWithCents(data.subscriptionPrice / 3);
  }

  getRxMonthlyPriceBreakdown() {
    return (
      <div>
        <Pricing>
          {this.renderDiscountedTrialPriceBreakdown()}
          /month
        </Pricing>
      </div>
    );
  }

  render() {
    const { data, onAddToBag } = this.props;
    const freeShippingText = 'Free shipping';
    const price = this.getPrice();
    const subscriptionPrice = this.getSubscriptionPrice();
    const hasSubscriptionOption = subscriptionPrice != '$0';

    return (
      <ProductDetailForm>
        <FormHeadingWrapper style={{ padding: '25px 20px', borderBottom:`1px solid ${colors.thinGrey}` }}>
          <ProductHeader>
            <ProductSummary>
              <div style={{ paddingBottom: 10 }}>
                <StyledHeading bold id={'name'}>
                  <strong>{data.name}</strong>
                </StyledHeading>
              </div>
              <ShortSummary id={'product-summary'}>{data.productSummary}</ShortSummary>
            </ProductSummary>
          </ProductHeader>
        </FormHeadingWrapper>
        <QuantityContainer style={{ padding: '16px 20px' }}>
          <QuantityLabel className="mb-1">Quantity</QuantityLabel>
          <QuantityContainerContainer>
            <StyledButton
              disabled={this.state.quantity === 1 ? true : false}
              onClick={() => this.handleQuantityChange(-1)}
              type="button"
            >
              <img src={BlackMinusIcon} />
            </StyledButton>
            <Amount>{this.state.quantity}</Amount>
            <StyledButton onClick={() => this.handleQuantityChange(1)} type="button">
              <img src={BlackPlusIcon} />
            </StyledButton>
          </QuantityContainerContainer>
        </QuantityContainer>
        <DeliveryFrequencyWrapper>
          <RadioButtonsWrapper>
            {hasSubscriptionOption && (
                <ProductsFrequencyWrapper
                    color={colors.veryLightGray}
                    style={{ paddingBottom: '20px' }}
                >
                  <ProductsFrequency style={{ padding: '0px 20px' }}>
                    <FrequencyRadioButton
                        type="radio"
                        checked={this.state.frequency === 3}
                        onChange={e => {
                          this.setState({ frequency: 3 });
                        }}
                    />
                    <ShippingLabel onClick={() => this.setState({ frequency: 3 })}>Ships quarterly</ShippingLabel>
                    <Price id={'price'}>
                      <StyledPrice color={colors.facebookBlue}>{subscriptionPrice}</StyledPrice>
                    </Price>
                    {/*{subscriptionPrice < price && (*/}
                    {/*  <StyledPrice*/}
                    {/*    style={{*/}
                    {/*      textDecoration: 'line-through',*/}
                    {/*      fontWeight: '400',*/}
                    {/*      paddingLeft: '20px',*/}
                    {/*    }}*/}
                    {/*  >*/}
                    {/*    {price}*/}
                    {/*  </StyledPrice>*/}
                    {/*)}*/}
                  </ProductsFrequency>
                  <SubscriptionInfo style={{ padding: '0px 20px' }}>
                    <RefillInfo>
                      Receive refills after the first bottle. Change refill frequency or cancel
                      anytime.&nbsp;
                      {/*<a href="#" style={{textDecoration: "underline", color:`${colors.lightPlatinum}`}}>Learn more.</a>*/}
                    </RefillInfo>
                    <PriceInfoWrapper>
                      <Price id={'price'}>
                        {this.getRxMonthlyPriceBreakdown()}
                      </Price>
                      <SaveAmount>Save {this.getDiscountAmount()} on every order</SaveAmount>
                    </PriceInfoWrapper>
                  </SubscriptionInfo>
                </ProductsFrequencyWrapper>
            )}

            <ProductsFrequencyWrapper>
              <ProductsFrequency style={{ padding: '0px 20px' }}>
                <FrequencyRadioButton
                  type="radio"
                  checked={this.state.frequency === 0 || !hasSubscriptionOption}
                  onChange={e => this.setState({ frequency: 0 })}
                />
                <ShippingLabel onClick={() => this.setState({ frequency: 0 })}>One-time purchase</ShippingLabel>
                <Price style={{fontSize: "19px", fontWeight:"400", fontFamily: fontFamily.baseFont }}>{price}</Price>
              </ProductsFrequency>
            </ProductsFrequencyWrapper>

          </RadioButtonsWrapper>
        </DeliveryFrequencyWrapper>
        <AddBtnWrapper>
          <StandardBlueButton
            id="addToCart"
            horizontalPadding={60}
            active={true}
            onClick={() => {
              onAddToBag(this.state.frequency, this.state.quantity);
            }}
          >
            Start checkout
          </StandardBlueButton>
          <PinkBoxWrapper>
          {freeShippingText}
          </PinkBoxWrapper>
        </AddBtnWrapper>
      </ProductDetailForm>
    );
  }
}
