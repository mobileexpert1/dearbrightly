import * as actions from 'src/features/auth/actions/authenticationActions';
import { APP_INIT } from 'src/common/actions/init';

const defaultState = {
    isRegistering: false,
    isRegistered: false,
    isProcessing: false,
    isAuthenticated: false,
    registrationErrorMessage: null,
    loginErrorMessage: null,
    otpIsRequired: false,
    otpTimeoutSet: false,
    otpTimeoutToggleError: null,
    twoFactorEnabled: false,
    twoFactorError: null, // handles errors for TWO_FACTOR_DISABLE_FAIL and TWO_FACTOR_CONFIRM_FAIL
    twoFactorSetupError: null,
    twoFactorSetupResponse: null,
};

export const authentication = (state = defaultState, action) => {
    switch (action.type) {
        case actions.REGISTER_USER_REQUEST:
            return {
                ...defaultState,
                isRegistering: true,
            };
        case actions.REGISTER_USER_FAIL:
            return {
                ...defaultState,
                isRegistering: false,
                registrationErrorMessage: action.payload,
            };
        case actions.REGISTER_USER_SUCCESS:
            return {
                ...defaultState,
                isRegistered: true
            };
        case actions.LOG_IN_REQUEST:
        case actions.FACEBOOK_AUTHENTICATION_REQUEST:
            return {
                ...state,
                isProcessing: true,
                loginErrorMessage: null
            };
        case actions.AUTHENTICATE_USER:
            return {
                ...state,
                isAuthenticated: true,
                isProcessing: false
            };
        case actions.LOG_IN_SUCCESS:
            //analytics.identify(action.payload.id.hashCode());
            if (typeof H !== 'undefined'){
                H.identify(action.payload.id)
            };
            return {
                ...state,
                isAuthenticated: true,
                isProcessing: false,
                loginErrorMessage: null,
                otpIsRequired: action.payload.otpIsRequired,
                otpTimeoutSet: action.payload.otpTimeoutSet,
                twoFactorEnabled: action.payload.twoFactorEnabled,
            };
        case actions.SET_OTP_REQUIRED:
            return {
                ...state,
                isAuthenticated: false,
                isProcessing: false,
                otpIsRequired: true
            };
        case actions.TWO_FACTOR_SETUP_REQUEST:
            return {
                ...state,
                isProcessing: true,
                twoFactorSetupError: null,
                twoFactorSetupResponse: null
            };
        case actions.TWO_FACTOR_SETUP_SUCCESS:
            return {
                ...state,
                isProcessing: false,
                twoFactorSetupError: null,
                twoFactorSetupResponse: action.payload
            };
        case actions.TWO_FACTOR_SETUP_FAIL:
            return {
                ...state,
                isProcessing: false,
                twoFactorEnabled: false,
                twoFactorSetupError: action.payload,
                twoFactorSetupResponse: null,
                otpIsRequired: false
            };
        case actions.TWO_FACTOR_CONFIRM_REQUEST:
            return {
                ...state,
                isProcessing: true,
                twoFactorEnabled: false,
                twoFactorError: null,
                otpIsRequired: false,
            };
        case actions.TWO_FACTOR_CONFIRM_SUCCESS:
            return {
                ...state,
                isProcessing: false,
                twoFactorEnabled: true,
                twoFactorError: null,
                twoFactorSetupResponse: null, //--> clears the modal for pin code @ 2FA setup
                otpIsRequired: true,
            };
        case actions.TWO_FACTOR_CONFIRM_FAIL:
            return {
                ...state,
                isProcessing: false,
                twoFactorEnabled: false,
                twoFactorError: action.payload,
                otpIsRequired: false
            };
        case actions.TOGGLE_OTP_TIMEOUT_REQUEST:
            return {
                ...state,
                isProcessing: true,
                otpTimeoutToggleError: null
            };
        case actions.TOGGLE_OTP_TIMEOUT_SUCCESS:
            return {
                ...state,
                isProcessing: false,
                otpTimeoutToggleError: null,
                otpTimeoutSet: action.payload.otpSessionTimeout ? true : false,
                twoFactorEnabled: true
            };
        case actions.TOGGLE_OTP_TIMEOUT_FAIL:
            return {
                ...state,
                isProcessing: false,
                otpTimeoutToggleError: action.payload
            };
        case actions.TWO_FACTOR_DISABLE_REQUEST:
            return {
                ...state,
                isProcessing: true,
                twoFactorError: null
            };
        case actions.TWO_FACTOR_DISABLE_SUCCESS:
            return {
                ...state,
                isProcessing: false,
                otpIsRequired: false,
                twoFactorEnabled: false,
                twoFactorError: null
            };
        case actions.TWO_FACTOR_DISABLE_FAIL:
            return {
                ...state,
                isProcessing: false,
                twoFactorEnabled: true,
                twoFactorError: action.payload
            };
        case actions.VALIDATE_OTP_REQUEST:
            return {
                ...state,
                isAuthenticated: false,
                isProcessing: true,
                otpIsRequired: true
            };
        case actions.VALIDATE_OTP_FAIL:
            return {
                ...state,
                isAuthenticated: false,
                isProcessing: false,
                otpIsRequired: true,
                loginErrorMessage: action.payload
            };
        case actions.LOG_IN_FAIL:
            return {
                ...state,
                isAuthenticated: false,
                isProcessing: false,
                loginErrorMessage: action.payload
            };
        case actions.CLEAR_LOGIN_ERROR:
            return {
                ...state,
                loginErrorMessage: null
            };
        case APP_INIT:
            return {
                ...state,
            }
        case actions.LOG_OUT_SUCCESS:
            return {
                ...defaultState,
            };
        default:
            return state;
    }
};
