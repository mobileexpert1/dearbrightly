export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const fetchUserRequest = id => ({
  type: FETCH_USER_REQUEST,
  payload: id,
});

export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const fetchUserSuccess = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});

export const FETCH_USER_FAIL = 'FETCH_USER_FAIL';
export const fetchUserFail = errorMessage => ({
  type: FETCH_USER_FAIL,
  payload: errorMessage,
});

export const SET_DATE_OF_BIRTH = 'SET_DATE_OF_BIRTH';
export const setDateOfBirth = dateOfBirth => ({
  type: SET_DATE_OF_BIRTH,
  payload: dateOfBirth,
});

export const SET_SHIPPING_ADDRESS_STATE = 'SET_SHIPPING_ADDRESS_STATE';
export const setShippingAddressState = shippingAddressState => ({
  type: SET_SHIPPING_ADDRESS_STATE,
  payload: shippingAddressState,
});

export const SET_CONSENT_TO_TELEHEALTH = 'SET_CONSENT_TO_TELEHEALTH';
export const setConsentToTelehealth = consentToTelehealthState => ({
  type: SET_CONSENT_TO_TELEHEALTH,
  payload: consentToTelehealthState,
});

export const CLEAR_USER_ERROR = 'CLEAR_USER_ERROR';
export const clearUserError = () => ({
  type: CLEAR_USER_ERROR,
});


export const SET_MESSAGES_READ = 'SET_MESSAGES_READ';
export const setMessagesRead = () => ({
  type: SET_MESSAGES_READ,
});