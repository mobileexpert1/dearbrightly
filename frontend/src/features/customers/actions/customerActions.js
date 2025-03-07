export const FETCH_CUSTOMER_REQUEST = 'FETCH_CUSTOMER_REQUEST';
export const fetchCustomerRequest = id => ({
  type: FETCH_CUSTOMER_REQUEST,
  payload: id,
});

export const FETCH_CUSTOMER_SUCCESS = 'FETCH_CUSTOMER_SUCCESS';
export const fetchCustomerSuccess = customer => ({
  type: FETCH_CUSTOMER_SUCCESS,
  payload: customer,
});

export const FETCH_CUSTOMER_FAIL = 'FETCH_CUSTOMER_FAIL';
export const fetchCustomerFail = errorMessage => ({
  type: FETCH_CUSTOMER_FAIL,
  payload: errorMessage,
});

export const UNSUBSCRIBE_CUSTOMER_REQUEST = 'UNSUBSCRIBE_CUSTOMER_REQUEST';
export const unsubscribeCustomerRequest = (email, token) => ({
  type: UNSUBSCRIBE_CUSTOMER_REQUEST,
  payload: {email, token},
});

export const UNSUBSCRIBE_CUSTOMER_SUCCESS = 'UNSUBSCRIBE_CUSTOMER_SUCCESS';
export const unsubscribeCustomerSuccess = () => ({
  type: UNSUBSCRIBE_CUSTOMER_SUCCESS,
});

export const UNSUBSCRIBE_CUSTOMER_FAIL = 'UNSUBSCRIBE_CUSTOMER_FAIL';
export const unsubscribeCustomerFail = errorMessage => ({
  type: UNSUBSCRIBE_CUSTOMER_FAIL,
  payload: errorMessage,
});