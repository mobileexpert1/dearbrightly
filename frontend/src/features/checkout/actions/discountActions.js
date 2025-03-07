export const GET_DISCOUNT_CODE_REQUEST = 'GET_DISCOUNT_CODE_REQUEST';
export const getDiscountCodeRequest = (code, orderId) => ({
  type: GET_DISCOUNT_CODE_REQUEST,
  payload: { code, orderId }
});

export const GET_DISCOUNT_CODE_SUCCESS = 'GET_DISCOUNT_CODE_SUCCESS';
export const getDiscountCodeSuccess = discount => ({
  type: GET_DISCOUNT_CODE_SUCCESS,
  payload: discount,
});

export const GET_DISCOUNT_CODE_FAIL = 'GET_DISCOUNT_CODE_FAIL';
export const getDiscountCodeFail = errorMessage => ({
  type: GET_DISCOUNT_CODE_FAIL,
  payload: errorMessage,
});

export const REMOVE_DISCOUNT_CODE_REQUEST = 'REMOVE_DISCOUNT_CODE_REQUEST';
export const removeDiscountCodeRequest = orderId => ({
  type: REMOVE_DISCOUNT_CODE_REQUEST,
  payload: orderId,
});

export const REMOVE_DISCOUNT_CODE_SUCCESS = 'REMOVE_DISCOUNT_CODE_SUCCESS';
export const removeDiscountCodeSuccess = order => ({
  type: REMOVE_DISCOUNT_CODE_SUCCESS,
  payload: order,
});

export const REMOVE_DISCOUNT_CODE_FAIL = 'REMOVE_DISCOUNT_CODE_FAIL';
export const removeDiscountCodeFail = errorMessage => ({
  type: REMOVE_DISCOUNT_CODE_FAIL,
  payload: errorMessage,
});

export const RESET_DISCOUNT_CODE_STATE = 'RESET_DISCOUNT_CODE_STATE';
export const resetDiscountCodeState = () => ({
  type: RESET_DISCOUNT_CODE_STATE,
});
