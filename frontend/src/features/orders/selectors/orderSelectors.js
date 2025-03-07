import { createSelector } from 'reselect';

const getOrderData = state => state.order;

export const getOrder = state => getOrderData(state).data;

export const isExpressCheckout = state => getOrderData(state).isExpressCheckout;

export const isFetching = state => getOrderData(state).isFetching;

export const isOrderFetchSuccess = state => getOrderData(state).fetchedSuccessfully;

export const isUpdatingOrder = state => getOrderData(state).isUpdating;

export const isUpdateOrderSuccess = state => getOrderData(state).isUpdateSuccess;

export const isUpdateOrderShippingDetailsSuccess = state => getOrderData(state).updateOrderShippingDetailsSuccess;

export const isUpdatingOrderTotal = state => getOrderData(state).isUpdatingOrderShippingDetails;

export const getOrderErrorMessage = state => getOrderData(state).errorMessage;

export const isUpdatePendingOrCreateOrderSuccess = state => getOrderData(state).fetchedSuccessfully;