import {store} from "src/index";
import {getHighestCostOTCProduct} from "src/features/products/selectors/productsSelectors";

export const getObfuscatedRxProductPrice = (product) => {
  const state = store.getState();
  if (product.productType === 'Rx') {
    return getHighestCostOTCProduct(state);
  } else {
    return product.price;
  }
}