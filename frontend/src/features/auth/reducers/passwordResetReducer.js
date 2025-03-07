import {
    REQUEST_PASSWORD_RESET_EMAIL_FAILED,
    REQUEST_PASSWORD_RESET_EMAIL_REQUESTED,
    REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
    VERIFY_PASSWORD_RESET_TOKEN_FAILED,
    VERIFY_PASSWORD_RESET_TOKEN_REQUESTED,
    VERIFY_PASSWORD_RESET_TOKEN_SUCCEEDED,
    SET_NEW_PASSWORD_SUCCEEDED,
    SET_NEW_PASSWORD_FAILED,
    SET_NEW_PASSWORD_REQUESTED,
} from '../actions/passwordResetActions';

const defaultState = {
    errorMessage: '',
    isFetching: false,
    passwordResetTokenValid: false,
    passwordEmailSent: false,
};

export const passwordReset = (state = defaultState, action) => {
    switch (action.type) {
        case VERIFY_PASSWORD_RESET_TOKEN_REQUESTED:
            return {
                ...defaultState,
                isFetching: true,
            };
        case SET_NEW_PASSWORD_REQUESTED:
            return {
                ...state,
                isFetching: true,
            };
        case SET_NEW_PASSWORD_FAILED:
            return {
                ...state,
                isFetching: false,
                errorMessage: action.payload,
            };
        case VERIFY_PASSWORD_RESET_TOKEN_SUCCEEDED:
            return {
                ...defaultState,
                passwordResetTokenValid: true,
            };
        case VERIFY_PASSWORD_RESET_TOKEN_FAILED:
        case SET_NEW_PASSWORD_SUCCEEDED:
            return defaultState;
        case REQUEST_PASSWORD_RESET_EMAIL_REQUESTED:
            return {
                ...state,
                passwordEmailSent: false,
                errorMessage: '',
            }
        case REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED:
            return {
                ...state,
                passwordEmailSent: true,
                errorMessage: '',
            }
        case REQUEST_PASSWORD_RESET_EMAIL_FAILED:
            return {
                ...state,
                passwordEmailSent: false,
                errorMessage: action.payload,
            }
        default:
            return state;
    }
};
