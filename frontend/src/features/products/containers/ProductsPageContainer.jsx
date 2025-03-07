import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';

import {
  shoppingBagAdd,
  shoppingBagUpdateQuantity,
  shoppingBagRemoveItem,
  shoppingBagUpdateFailed,
} from 'src/features/products/actions/shoppingBagActions';
import { getShoppingBagItems } from '../selectors/shoppingBagSelectors';

import { formatAmountToDollars } from 'src/common/helpers/formatAmountToDollars';
import {
  navigateCheckout,
} from '../../checkout/actions/checkoutStepsActions';
import { fetchProductsRequest } from '../actions/productsActions';
import { getAllProducts } from '../selectors/productsSelectors';
import { ProductCard } from '../components/ProductCard';
import { FIRST_TIME_TRIAL_DISCOUNT } from 'src/common/constants/orders';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { isAuthenticated } from 'src/features/auth/selectors/authenticationSelectors';


const DEBUG = getEnvValue('DEBUG');

const Container = styled.div`
  max-width: 1280px;
  justify-content: flex-start;
  align-items: start;
  margin: 0px auto;
  padding: 100px 0;
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 768px) {
    padding: 50px 0 20px 0;
  }
`;

class ProductsPageContainer extends React.Component {
  componentDidMount() {
    this.props.fetchProductsRequest();
    if (window.location.pathname === '/products') {
      scrollToComponent(this.productComponentTop, { offset: 0, align: 'top' });
    }
  }

  getReadableDiscountedTrialPrice = product => {
    const isRx = product.productType === 'Rx';
    let discountTrialPrice = product.trialPrice;
    if (isRx) {
      discountTrialPrice -= FIRST_TIME_TRIAL_DISCOUNT;
    }
    return formatAmountToDollars(null, discountTrialPrice);
  };

  getReadableTrialPrice = (product) => {
    return formatAmountToDollars(null, product.trialPrice);
  };

  getReadablePrice = (product) => {
    return formatAmountToDollars(null, product.price);
  };

  render = () => {
    return (
        <Container
            id={"container"}
            ref={section => {
              this.productComponentTop = section;
            }}
        >
        {this.props.products
          .filter(product => !product.isHidden)
          .map(product => (
            <ProductCard
              key={product.id}
              name={product.name}
              trialPrice={this.getReadableTrialPrice(product)}
              discountedTrialPrice={this.getReadableDiscountedTrialPrice(product)}
              price={this.getReadablePrice(product)}
              image={product.image}
              productSummary={product.productSummary}
              bestseller={product.name === 'Night Shift'}
              subcopy={product.name === 'Night Shift' || product.name === 'Night Shift Set' ? 'First-Time Trial' : ""}
              isAuthenticated={this.props.isAuthenticated}
            />
          ))}
      </Container>
    );
  };
}

const mapStateToProps = state => ({
  products: getAllProducts(state),
  shoppingBag: getShoppingBagItems(state),
  isAuthenticated: isAuthenticated(state),
});

export default connect(
  mapStateToProps,
  {
    fetchProductsRequest,
    shoppingBagAdd,
    shoppingBagRemoveItem,
    shoppingBagUpdateQuantity,
    shoppingBagUpdateFailed,
    navigateCheckout,
  },
)(ProductsPageContainer);
