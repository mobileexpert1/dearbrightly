import { createSelector } from 'reselect';
import moment from "moment";

const getProductsState = state => state.products;

export const getAllProducts = state => getProductsState(state).data;

export const getProductsToAddToSubscription = createSelector(getAllProducts, products =>
    products.filter(product => {
        return product.isPlanProduct === true
    }),
);

export const getProductsOptions = createSelector(getAllProducts, products =>
    products.map(product => ({
        name: product.name,
        value: product.id,
    })),
);

export const getHighestCostOTCProduct = state => getProductsState(state).highestPriceOTCProduct;

const extractId = (_state, id) => id;

export const getProductById = createSelector(getAllProducts, extractId, (products, productId) =>
    products.find(product => product.id == productId),
);
