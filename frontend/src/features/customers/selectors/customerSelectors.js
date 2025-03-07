const getCustomerData = state => state.customer;

export const getCustomer = state => getCustomerData(state).data;

export const getCustomerErrorMessage = state => getCustomerData(state).errorMessage;

export const isFetchingCustomer = state => getCustomerData(state).isFetching;

export const isCustomerFetchedSuccessfully = state =>
  getCustomerData(state).fetchedSuccessfully;

export const getCustomerOrders = state => getCustomerData(state).orders;

export const isFetchingOrders = state => getCustomerData(state).isFetching;

export const isCustomerOrderFetchedSuccessfully = state =>
  getCustomerData(state).fetchedOrderSuccessfully;

export const isCustomerUnsubscribing = state => getCustomerData(state).isUnsubscribing;

export const isCustomerUnsubscribeSuccess = state =>
  getCustomerData(state).unsubscribeSuccess;