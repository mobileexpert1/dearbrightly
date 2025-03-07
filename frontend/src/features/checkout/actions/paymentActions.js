export const GET_PAYMENT_TOKEN_REQUEST = 'GET_PAYMENT_TOKEN_REQUEST';
export const getPaymentTokenRequest = () => ({
    type: GET_PAYMENT_TOKEN_REQUEST,
});

export const GET_PAYMENT_TOKEN_SUCCESS = 'GET_PAYMENT_TOKEN_SUCCESS';
export const getPaymentTokenSuccess = (token) => ({
    type: GET_PAYMENT_TOKEN_SUCCESS,
    payload: token,
});

export const GET_PAYMENT_TOKEN_FAIL = 'GET_PAYMENT_TOKEN_FAIL';
export const getPaymentTokenFail = errorMessage => ({
    type: GET_PAYMENT_TOKEN_FAIL,
    payload: errorMessage,
});


export const UPDATE_CREDIT_CARD_REQUEST = 'UPDATE_CREDIT_CARD_REQUEST';
export const updateCreditCardRequest = (user, token, subscriptions) => ({
    type: UPDATE_CREDIT_CARD_REQUEST,
    payload: {
      user,
      token,
      subscriptions,
    },
});

export const UPDATE_CREDIT_CARD_SUCCESS = 'UPDATE_CREDIT_CARD_SUCCESS';
export const updateCreditCardSuccess = (user) => ({
  type: UPDATE_CREDIT_CARD_SUCCESS,
  payload: user
});

export const UPDATE_CREDIT_CARD_FAIL = 'UPDATE_CREDIT_CARD_FAIL';
export const updateCreditCardFail = errorMessage => ({
  type: UPDATE_CREDIT_CARD_FAIL,
  payload: errorMessage,
});


export const GET_PAYMENT_METHODS_REQUEST = 'GET_PAYMENT_METHODS_REQUEST';
export const getPaymentMethodsRequest = (userId) => ({
    type: GET_PAYMENT_METHODS_REQUEST,
    payload: userId,
});

export const GET_PAYMENT_METHODS_SUCCESS = 'GET_PAYMENT_METHODS_SUCCESS';
export const getPaymentMethodsSuccess = (paymentMethods) => ({
  type: GET_PAYMENT_METHODS_SUCCESS,
  payload: paymentMethods,
});

export const GET_PAYMENT_METHODS_FAIL = 'GET_PAYMENT_METHODS_FAIL';
export const getPaymentMethodsFail = errorMessage => ({
  type: GET_PAYMENT_METHODS_FAIL,
  payload: errorMessage,
});


export const GET_DEFAULT_PAYMENT_METHOD_REQUEST = 'GET_DEFAULT_PAYMENT_METHOD_REQUEST';
export const getDefaultPaymentMethodRequest = userId => ({
    type: GET_DEFAULT_PAYMENT_METHOD_REQUEST,
    payload: userId,
});

export const GET_DEFAULT_PAYMENT_METHOD_SUCCESS = 'GET_DEFAULT_PAYMENT_METHOD_SUCCESS';
export const getDefaultPaymentMethodSuccess = defaultPaymentMethod => ({
  type: GET_DEFAULT_PAYMENT_METHOD_SUCCESS,
  payload: defaultPaymentMethod,
});

export const GET_DEFAULT_PAYMENT_METHOD_FAIL = 'GET_DEFAULT_PAYMENT_METHOD_FAIL';
export const getDefaultPaymentMethodFail = errorMessage => ({
  type: GET_DEFAULT_PAYMENT_METHOD_FAIL,
  payload: errorMessage,
});


export const POST_PAYMENT_NONCE_REQUESTED = 'POST_PAYMENT_NONCE_REQUESTED';
export const postPaymentNonceRequest = (orderId, nonce) => {
    const authorizationData = {
        orderId,
        nonce,
    };
    return {
        type: POST_PAYMENT_NONCE_REQUESTED,
        payload: authorizationData,
    };
};

export const POST_PAYMENT_NONCE_SUCCEEDED = 'POST_PAYMENT_NONCE_SUCCEEDED';
export const postPaymentNonceSuccess = nonce => ({
    type: POST_PAYMENT_NONCE_SUCCEEDED,
    payload: nonce,
});

export const POST_PAYMENT_NONCE_FAILED = 'POST_PAYMENT_NONCE_FAILED';
export const postPaymentNonceFail = errorMessage => ({
    type: POST_PAYMENT_NONCE_FAILED,
    payload: errorMessage,
});

export const PAYMENT_SUCCESS = 'PAYMENT_SUCCESS';
export const paymentSuccess = (orderId) => ({
    type: PAYMENT_SUCCESS,
    payload: orderId,
});

export const SUBMIT_PAYMENT_REQUEST = 'SUBMIT_PAYMENT_REQUEST';
export const submitPaymentRequest = (token, order) =>
{
  const paymentRequestData = {
    token,
    order,
  };
  return {
    type: SUBMIT_PAYMENT_REQUEST,
    payload: paymentRequestData,
  };
};

export const SUBMIT_PAYMENT_SUCCESS = 'SUBMIT_PAYMENT_SUCCESS';
export const submitPaymentSuccess = (order) => ({
  type: SUBMIT_PAYMENT_SUCCESS,
  payload: order,
});

export const SUBMIT_PAYMENT_FAIL = 'SUBMIT_PAYMENT_FAIL';
export const submitPaymentFail = (errorMessage) => ({
  type: SUBMIT_PAYMENT_FAIL,
  payload: errorMessage,
});


// ---- Stripe Connect OAuth ----

export const STRIPE_CONNECT_FETCH_USER_ID_REQUEST = 'STRIPE_CONNECT_FETCH_USER_ID_REQUEST';
export const stripeConnectFetchUserIdRequest = (userUUID, authorizationCode) => ({
    type: STRIPE_CONNECT_FETCH_USER_ID_REQUEST,
    payload: { userUUID, authorizationCode },
});

export const STRIPE_CONNECT_FETCH_USER_ID_SUCCESS = 'STRIPE_CONNECT_FETCH_USER_ID_SUCCESS';
export const stripeConnectFetchUserIdSuccess = () => ({
    type: STRIPE_CONNECT_FETCH_USER_ID_SUCCESS,
});

export const STRIPE_CONNECT_FETCH_USER_ID_FAIL = 'STRIPE_CONNECT_FETCH_USER_ID_FAIL';
export const stripeConnectFetchUserIdFail = errorMessage => ({
    type: STRIPE_CONNECT_FETCH_USER_ID_FAIL,
    payload: errorMessage,
});

export const CLEAR_PAYMENT_ERROR_MESSAGE = 'CLEAR_PAYMENT_ERROR_MESSAGE'
export const clearPaymentErrorMessage = () => ({
  type: CLEAR_PAYMENT_ERROR_MESSAGE
});
