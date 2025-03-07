import React from 'react';
import styled from 'react-emotion';
import { fontFamily, fontWeight } from 'src/variables';


const ProductContainer = styled('div')`
    &.img {
        width: 50px
    }
    &.text {
      margin: 0.5em;
      padding: 0.5em;    
      display: inline;
      text-align: left;
      font-size: 19px;
      line-height: 21px;
      color: #000;
      font-family: ${fontFamily.baseFont};
      font-weight: ${fontWeight.bold};
      &.remove-margin {
          margin-bottom: 0px;
      }
    }
`;
const ItemContent = styled('div')`
    line-height: 10px;
    width: calc(100% - 56px);
    width: -webkit-calc(100% - 56px);
    flex: 4 0 0;
`;
const ItemImageWrap = styled('div')`
    width: 175px;
    img {
        width: 100%;
    }
    margin: 0 10px 0 0;
`;
const ItemSummary = styled('h2')`
    font-size: 19px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
`;

const FrequencySummary = styled('h4')`
    font-size: 14px
    color: rgb(105, 105, 105);
`;
const CartWrapper = styled('div')`
    width: 100%;
    @media (min-width: 768px) {
        width: 50%;
    }
`;
const ProductsWrapper = styled('div')`
    width: 300px;
    border: 1px solid #000;
    background: #fff;
    padding: 15px 15px;
    margin-bottom: 10px;
    &:last-child {
        margin-bottom: 0px;
    }
`;

const Title = styled('p')`
    margin: 0;
    padding-left: 10px;
    padding-left: ${props => props.paddingLeft};
    font-size: 14px;
    font-weight: bold;
`;

export class SubscriptionProduct extends React.Component {
  constructor(props) {
      super(props);
      this.getProductSummary = this.getProductSummary.bind(this);
  }

  getProductSummary(name) {
      if (!name) {
        return null;
      }
      const productsData = this.props.products.filter(product => product.name.toLowerCase() === name.toLowerCase() && (product.isHidden === false || product.productCategory === "bottle"));
      return productsData && productsData[0] && productsData[0].productSummary;
  }

    render() {
        const { item } = this.props;
        const itemSummary = this.getProductSummary(item.productName);
        const subscriptionFrequencySummary = item.frequency;
        const subscriptionFrequencySummaryText = `Refills every ${ subscriptionFrequencySummary } months`;

        return (
          <React.Fragment>
            <ProductsWrapper>
              <div className="d-flex justify-content-inline">
                <ItemImageWrap><img src={item.image} alt={item.productName} /></ItemImageWrap>
                  <div className="d-flex flex-column">
                  <h5 className="d-flex justify-content-start">{ item.productName }</h5>
                  <h6 className="d-flex justify-content-start">{ subscriptionFrequencySummaryText }</h6>
                  </div>
              </div>
          </ProductsWrapper>

      </React.Fragment>
        )
    }
}
