import React, { Component } from 'react';
import styled from 'react-emotion';
import * as S from './styles';
import { FIRST_TIME_TRIAL_DISCOUNT } from 'src/common/constants/orders'
import { formatAmountToDollarsWithCents, formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';
import { StandardBlueButton } from 'src/common/components/Buttons';
import { colors, fontFamily, fontWeight } from 'src/variables';

const personalizedIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/personalized-icon.svg';
const chatIcon = 'https://d17yyftwrkmnyz.cloudfront.net/chat-icon.png';
const oilFreeMoisturizerIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/oil-free-moisturizer-icon.svg';
const automaticIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/automatic-icon.svg';

const ProductDetailForm = styled('div')`
  width: 345px;
  border: 1px solid grey;
  padding: 25px 20px;
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
  text-align: center;
  @media (max-width: 500px) {
    position: sticky;
    bottom: 5px;
    width: 100%;
  }
  h5 {
    text-align: center;
    font-size: 12px;
    margin: 10px 0 0 0;
    font-family: ${fontFamily.baseFont};
  }
`;
const Info = styled('p')`
  text-align: center;
  font-size: 10px;
  line-height: 14px;
  color: rgb(105, 105, 105);
  font-family: ${fontFamily.baseFont};
  margin: 0;
`;
const ProductSummary = styled('div')`
  flex: 2.5 0 0;
`;
const Price = styled('div')`
  padding-left: 20px;
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
const Description = styled('ul')`
  margin: 10px 0;
`

const DescriptionItem = styled('li')`
  font-size: 14px;
  font-family: ${fontFamily.baseFont};
  color: #000;
  margin-bottom: 15px;
  margin-left: 35px;
  text-align: top;  
  i {
    height: 18px;
    width: 18px;
    display: inline-block;
    margin-left: -35px;
    margin-right: 15px;
    vertical-align: middle;
    &.automatic-icon {
      background: url(${automaticIcon}) center no-repeat;
      background-size: 15px;
    }
    &.chat-icon {
      background: url(${chatIcon}) center no-repeat;
      background-size: 18px;
      margin-top: 3px;
    }
    &.personalized-icon {
      background: url(${personalizedIcon}) center no-repeat;
      background-size: 15px;
    }
    &.oil-free-moisturizer-icon {
      background: url(${oilFreeMoisturizerIcon}) center no-repeat;
      background-size: 18px;
      margin-top: 3px;
    }
    &.circle-bullet {
      height: 8px;
      width: 8px;
      background-color: ${colors.doveGray};
      border-radius: 50%;
      margin-left: -25px;
    }    
  }
`;
const DescriptionSummary = styled('p')`
  margin: 0;
  margin-left: 0px;
  padding: 0px 0px 10px 0px;
  color: #000;
  font-size: 16px;
  font-family: ${fontFamily.baseFont};
`;
const Pricing = styled('h2')`
  font-size: 18px;
  line-height: 24px;
  color: #000;
  font-family: ${fontFamily.baseFont};
  font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
  letter-spacing: 0.08px;
  margin-bottom: 5px;
`;

export class ProductDetailFormComponentRx extends Component {
  getIconDisplay(item) {
    let iconDisplay;

    if (item.includes("Change frequency or cancel anytime")) {
      iconDisplay = 'automatic-icon';
    } else if (item.includes("doctor's consult")) {
      iconDisplay = 'chat-icon';
    } else if (item.includes("Bonus ingredient:")) {
      iconDisplay = 'personalized-icon';
    } else if (item.includes("Medical grade moisturizer")) {
      iconDisplay = 'oil-free-moisturizer-icon';
    } else {
      iconDisplay = 'circle-bullet';
    }

    return iconDisplay;
  }


  renderDescription() {
    const { description } = this.props.data;

    return (
      <Description>
        <ul>
            <DescriptionItem>
                <i className="automatic-icon" />
                First-time bottle lasts ~2 months. Refills last ~3 months and bill at { this.getSubscriptionPrice()}/quarter.
                Change frequency or cancel anytime.
            </DescriptionItem>

          {description.length > 1 && description.map((item, index) => (
            <DescriptionItem key={index}>
              <i className={this.getIconDisplay(item)} />
              {item}
            </DescriptionItem>
          ))}

          {description.length === 1 && <DescriptionSummary>{description}</DescriptionSummary>}
        </ul>
      </Description>
    );
  }

  getSubscriptionPrice() {
    return formatAmountToDollars(null, this.props.data.subscriptionPrice);
  }

  getPrice() {
    return formatAmountToDollars(null, this.props.data.price);
  }

  renderDiscountedTrialPriceBreakdown() {
    const { data } = this.props;
    return formatAmountToDollarsWithCents((data.trialPrice - FIRST_TIME_TRIAL_DISCOUNT) / 2);
  }

  getRxMonthlyPriceBreakdown() {
    return (
      <div>
        <Pricing>{this.renderDiscountedTrialPriceBreakdown()}/month</Pricing>
        <h4>2-month supply</h4>
      </div>
    );
  };

  render() {
    const { data, onAddToBag } = this.props;
    const freeShippingText = "Free shipping";

    return (
      <ProductDetailForm>
        <FormHeadingWrapper>
          <ProductHeader>
            <ProductSummary>
              <div style={{paddingBottom:10}}>
                <S.Heading2 bold id={"name"}><strong>{data.name}</strong></S.Heading2>
              </div>
              <S.Heading3 id={"product-summary"}>{data.productSummary}</S.Heading3>
            </ProductSummary>
            <Price id={"price"}>
              {this.getRxMonthlyPriceBreakdown()}
            </Price>
          </ProductHeader>
        </FormHeadingWrapper>

        { this.renderDescription()}

        <AddBtnWrapper>
          <StandardBlueButton id="addToCart" horizontalPadding={60} active={true} onClick={() => {
            onAddToBag(3, 1)
          }}>Start Checkout</StandardBlueButton>
          <h5>{freeShippingText}</h5>
        </AddBtnWrapper>
          <Info>
              *At checkout, answer questions and upload photos of your skin for your provider to determine if a prescription is appropriate.
          </Info>
      </ProductDetailForm>
    );
  };
}