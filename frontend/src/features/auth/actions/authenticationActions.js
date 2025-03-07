export const REGISTER_USER_REQUEST = 'REGISTER_USER_REQUEST';
export const registerUser = (credentials) => {
    const payload = { credentials };
    return {
        type: REGISTER_USER_REQUEST,
        payload,
    };
};

export const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
export const registerUserSuccess = (credentials) => {
    const payload = { credentials };
    return {
        type: REGISTER_USER_SUCCESS,
        payload,
    };
};

export const REGISTER_USER_FAIL = 'REGISTER_USER_FAIL';
export const registerUserFail = errorMessage => ({
    type: REGISTER_USER_FAIL,
    payload: errorMessage,
});


export const FACEBOOK_AUTHENTICATION_REQUEST = 'FACEBOOK_AUTHENTICATION_REQUEST';
export const facebookAuthenticationRequest = (credentials) => {
    const payload = { credentials };
    return {
        type: FACEBOOK_AUTHENTICATION_REQUEST,
        payload,
    };
};

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST';
export const logInRequest = (credentials) => {
    const payload = { credentials };
    return {
        type: LOG_IN_REQUEST,
        payload,
    };
};

export const SET_OTP_REQUIRED = 'SET_OTP_REQUIRED'
export const setOtpRequired = payload => ({ type: SET_OTP_REQUIRED, payload })

export const VALIDATE_OTP_REQUEST = 'VALIDATE_OTP_REQUEST'
export const validateOtpRequest = payload => ({ type: VALIDATE_OTP_REQUEST, payload })

export const VALIDATE_OTP_FAIL = 'VALIDATE_OTP_FAIL'
export const validateOtpFail = payload => ({ type: VALIDATE_OTP_FAIL, payload })

export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS';
export const logInSuccess = payload => ({ type: LOG_IN_SUCCESS, payload });

export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const authenticateUser = () => ({ type: AUTHENTICATE_USER });

export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const setCurrentUser = payload => ({ type: SET_CURRENT_USER, payload });

export const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST';
export const refreshTokenRequest = () => ({ type: REFRESH_TOKEN_REQUEST });

export const REFRESH_TOKEN_FAIL = 'REFRESH_TOKEN_FAIL';
export const refreshTokenFail = () => ({ type: REFRESH_TOKEN_FAIL });

export const LOG_IN_FAIL = 'LOG_IN_FAIL';
export const logInFail = payload => ({ type: LOG_IN_FAIL, payload });

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const logOutRequest = () => ({ type: LOG_OUT_REQUEST });

export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const logOutSuccess = () => ({ type: LOG_OUT_SUCCESS });

export const LOG_OUT_FAIL = 'LOG_OUT_FAIL';
export const logOutFail = payload => ({ type: LOG_OUT_FAIL, payload });

export const CLEAR_LOGIN_ERROR = 'CLEAR_LOGIN_ERROR';
export const clearLoginError = () => ({ type: CLEAR_LOGIN_ERROR });

export const TWO_FACTOR_SETUP_REQUEST = 'TWO_FACTOR_SETUP_REQUEST'
export const twoFactorSetupRequest = () => ({ type: TWO_FACTOR_SETUP_REQUEST })

export const TWO_FACTOR_SETUP_SUCCESS = 'TWO_FACTOR_SETUP_SUCCESS'
export const twoFactorSetupSuccess = payload => ({ type: TWO_FACTOR_SETUP_SUCCESS, payload })

export const TWO_FACTOR_SETUP_FAIL = 'TWO_FACTOR_SETUP_FAIL'
export const twoFactorSetupFail = payload => ({ type: TWO_FACTOR_SETUP_FAIL, payload })

export const TWO_FACTOR_CONFIRM_REQUEST = 'TWO_FACTOR_CONFIRM_REQUEST'
export const twoFactorConfirmRequest = payload => ({ type: TWO_FACTOR_CONFIRM_REQUEST, payload })

export const TWO_FACTOR_CONFIRM_SUCCESS = 'TWO_FACTOR_CONFIRM_SUCCESS'
export const twoFactorConfirmSuccess = () => ({ type: TWO_FACTOR_CONFIRM_SUCCESS })

export const TWO_FACTOR_CONFIRM_FAIL = 'TWO_FACTOR_CONFIRM_FAIL'
export const twoFactorConfirmFail = payload => ({ type: TWO_FACTOR_CONFIRM_FAIL, payload })

export const TWO_FACTOR_DISABLE_REQUEST = 'TWO_FACTOR_DISABLE_REQUEST'
export const disableTwoFactorRequest = payload => ({ type: TWO_FACTOR_DISABLE_REQUEST, payload })

export const TWO_FACTOR_DISABLE_SUCCESS = 'TWO_FACTOR_DISABLE_SUCCESS'
export const disableTwoFactorSuccess = () => ({ type: TWO_FACTOR_DISABLE_SUCCESS })

export const TWO_FACTOR_DISABLE_FAIL = 'TWO_FACTOR_DISABLE_FAIL'
export const disableTwoFactorFail = payload => ({ type: TWO_FACTOR_DISABLE_FAIL, payload })

/* OTP Timeout */
export const TOGGLE_OTP_TIMEOUT_REQUEST = 'TOGGLE_OTP_TIMEOUT_REQUEST'
export const toggleOtpTimeoutRequest = () => ({
    type: TOGGLE_OTP_TIMEOUT_REQUEST,
})

export const TOGGLE_OTP_TIMEOUT_SUCCESS = 'TOGGLE_OTP_TIMEOUT_SUCCESS'
export const toggleOtpTimeoutSuccess = payload => ({
    type: TOGGLE_OTP_TIMEOUT_SUCCESS,
    payload
})

export const TOGGLE_OTP_TIMEOUT_FAIL = 'TOGGLE_OTP_TIMEOUT_FAIL'
export const toggleOtpTimeoutFail = (error) => ({
    type: TOGGLE_OTP_TIMEOUT_FAIL,
    payload: error
})

