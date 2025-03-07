export const FETCH_SUBSCRIPTIONS_REQUEST = 'FETCH_SUBSCRIPTIONS_REQUEST';
export const fetchSubscriptionsRequest = userId => ({
  type: FETCH_SUBSCRIPTIONS_REQUEST,
  payload: userId,
});

export const FETCH_SUBSCRIPTIONS_SUCCESS = 'FETCH_SUBSCRIPTIONS_SUCCESS';
export const fetchSubscriptionsSuccess = data => ({
  type: FETCH_SUBSCRIPTIONS_SUCCESS,
  payload: data,
});

export const FETCH_SUBSCRIPTIONS_FAIL = 'FETCH_SUBSCRIPTIONS_FAIL';
export const fetchSubscriptionsFail = errorMessage => ({
  type: FETCH_SUBSCRIPTIONS_FAIL,
  payload: errorMessage,
});

export const UPDATE_SUBSCRIPTIONS_REQUEST = 'UPDATE_SUBSCRIPTIONS_REQUEST';
export const updateSubscriptionsRequest = data => ({
  type: UPDATE_SUBSCRIPTIONS_REQUEST,
  payload: data,
});

export const UPDATE_SUBSCRIPTIONS_SUCCESS = 'UPDATE_SUBSCRIPTIONS_SUCCESS';
export const updateSubscriptionsSuccess = data => ({
  type: UPDATE_SUBSCRIPTIONS_SUCCESS,
  payload: data,
});

export const UPDATE_SUBSCRIPTIONS_FAIL = 'UPDATE_SUBSCRIPTIONS_FAIL';
export const updateSubscriptionsFail = errorMessage => ({
  type: UPDATE_SUBSCRIPTIONS_FAIL,
  payload: errorMessage,
});

export const UPDATE_SUBSCRIPTION_REQUEST = 'UPDATE_SUBSCRIPTION_REQUEST';
export const updateSubscriptionRequest = data => ({
  type: UPDATE_SUBSCRIPTION_REQUEST,
  payload: data,
});

export const UPDATE_SUBSCRIPTION_SUCCESS = 'UPDATE_SUBSCRIPTION_SUCCESS';
export const updateSubscriptionSuccess = data => ({
  type: UPDATE_SUBSCRIPTION_SUCCESS,
  payload: data,
});

export const UPDATE_SUBSCRIPTION_FAIL = 'UPDATE_SUBSCRIPTION_FAIL';
export const updateSubscriptionFail = errorMessage => ({
  type: UPDATE_SUBSCRIPTION_FAIL,
  payload: errorMessage,
});

export const CREATE_SUBSCRIPTION_REQUEST = 'CREATE_SUBSCRIPTION_REQUEST';
export const createSubscriptionRequest = data => ({
  type: CREATE_SUBSCRIPTION_REQUEST,
  payload: data,
});

export const CREATE_SUBSCRIPTION_SUCCESS = 'CREATE_SUBSCRIPTION_SUCCESS';
export const createSubscriptionSuccess = data => ({
  type: CREATE_SUBSCRIPTION_SUCCESS,
  payload: data,
});

export const CREATE_SUBSCRIPTION_FAIL = 'CREATE_SUBSCRIPTION_FAIL';
export const createSubscriptionFail = errorMessage => ({
  type: CREATE_SUBSCRIPTION_FAIL,
  payload: errorMessage,
});

export const UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST = 'UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST';
export const updateOrCreateSubscriptionRequest = data => ({
  type: UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST,
  payload: data,
});

export const UPDATE_OR_CREATE_SUBSCRIPTION_SUCCESS = 'UPDATE_OR_CREATE_SUBSCRIPTION_SUCCESS';
export const updateOrCreateSubscriptionSuccess = data => ({
  type: UPDATE_OR_CREATE_SUBSCRIPTION_SUCCESS,
  payload: data,
});

export const UPDATE_OR_CREATE_SUBSCRIPTION_FAIL = 'UPDATE_OR_CREATE_SUBSCRIPTION_FAIL';
export const updateOrCreateSubscriptionFail = errorMessage => ({
  type: UPDATE_OR_CREATE_SUBSCRIPTION_FAIL,
  payload: errorMessage,
});

export const CLEAR_SUBSCRIPTION_ERROR_MESSAGE = 'CLEAR_SUBSCRIPTION_ERROR_MESSAGE';
export const clearSubscriptionErrorMessage = () => ({
  type: CLEAR_SUBSCRIPTION_ERROR_MESSAGE,
});

export const UPDATE_SHIPPING_DETAILS_REQUEST = 'UPDATE_SHIPPING_DETAILS_REQUEST';
export const updateShippingDetailsRequest = data => ({
  type: UPDATE_SHIPPING_DETAILS_REQUEST,
  payload: data,
});

export const UPDATE_SHIPPING_DETAILS_SUCCESS = 'UPDATE_SHIPPING_DETAILS_SUCCESS';
export const updateShippingDetailsSuccess = data => ({
  type: UPDATE_SHIPPING_DETAILS_SUCCESS,
  payload: data,
});

export const UPDATE_SHIPPING_DETAILS_FAIL = 'UPDATE_SHIPPING_DETAILS_FAIL';
export const updateShippingDetailsFail = errorMessage => ({
  type: UPDATE_SHIPPING_DETAILS_FAIL,
  payload: errorMessage,
});
