import React from 'react';
import { connect } from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';
import {
  shoppingBagAdd,
  shoppingBagUpdateQuantity,
  shoppingBagRemoveItem,
  shoppingBagUpdateFailed,
} from 'src/features/products/actions/shoppingBagActions';

import { ProductDetail } from 'src/features/products/components/ProductDetail';
import { isAuthenticated } from 'src/features/auth/selectors/authenticationSelectors';
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { kebabCaseToLowerCase } from 'src/common/helpers/formatText';
import { getAllProducts } from '../selectors/productsSelectors';
import { getShoppingBagItems } from '../selectors/shoppingBagSelectors';
import { navigateCheckout } from 'src/features/checkout/actions/checkoutStepsActions';
import { getUserData } from "src/features/user/selectors/userSelectors";
import {
    getFBPixelContentViewTrackedEventIDs,
    getFBPixelAddToCartTrackedEventIDs,
} from "src/features/analytics/selectors/analyticsSelectors";
import {setFBPixelTracked} from "src/features/analytics/actions/analyticsActions";

class ProductDetailCard extends React.Component {
  componentDidMount() {
    scrollToComponent(this.componentTop, { offset: 0, align: 'top' });
  }

  getProductData() {
    const name = kebabCaseToLowerCase(this.props.match.params.name)
      .split('glowgetter')
      .join('night shift');
    if (!name) return null;
    return this.props.products.find(
      product => (product.isHidden === false || product.productCategory === "bottle") && product.name.toLowerCase() === name,
    );
  }

  render() {
    const data = this.getProductData();
    if (!data || !this.props.isProductFetched) return null;

    return (
      <ProductDetail
        ref={section => {
          this.componentTop = section;
        }}
        data={data}
        shoppingBagAdd={this.props.shoppingBagAdd}
        shoppingBagUpdateQuantity={this.props.shoppingBagUpdateQuantity}
        shoppingBagRemoveItem={this.props.shoppingBagRemoveItem}
        shoppingBag={this.props.shoppingBag.data}
        navigateCheckout={this.props.navigateCheckout}
        isAuthenticated={this.props.isAuthenticated}
        rxSubscription={this.props.mostRecentRxSubscription}
        user={this.props.user}
        fbPixelContentViewTrackedEventIDs={this.props.fbPixelContentViewTrackedEventIDs}
        fbPixelAddToCartTrackedEventIDs={this.props.fbPixelAddToCartTrackedEventIDs}
        setFBPixelTracked={this.props.setFBPixelTracked}
      />
    );
  }
}

const mapStateToProps = state => ({
  products: getAllProducts(state),
  fbPixelContentViewTrackedEventIDs: getFBPixelContentViewTrackedEventIDs(state),
  fbPixelAddToCartTrackedEventIDs: getFBPixelAddToCartTrackedEventIDs(state),
  isProductFetched: state.products.fetchedSuccessfully,
  shoppingBag: getShoppingBagItems(state),
  isAuthenticated: isAuthenticated(state),
  mostRecentRxSubscription: getMostRecentRxSubscription(state),
  user: getUserData(state),
});

export default connect(
  mapStateToProps,
  {
    setFBPixelTracked,
    shoppingBagAdd,
    shoppingBagRemoveItem,
    shoppingBagUpdateQuantity,
    shoppingBagUpdateFailed,
    navigateCheckout,
  },
)(ProductDetailCard);
