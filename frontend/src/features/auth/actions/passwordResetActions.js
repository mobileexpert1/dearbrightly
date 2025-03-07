export const REQUEST_PASSWORD_RESET_EMAIL_REQUESTED = 'REQUEST_PASSWORD_RESET_EMAIL_REQUESTED';
export const requestPasswordResetEmail = email => ({
    type: REQUEST_PASSWORD_RESET_EMAIL_REQUESTED,
    payload: email,
});

export const REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED = 'REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED';
export const requestPasswordResetEmailSuccess = message => ({
    type: REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
    payload: message,
});

export const REQUEST_PASSWORD_RESET_EMAIL_FAILED = 'REQUEST_PASSWORD_RESET_EMAIL_FAILED';
export const requestPasswordResetEmailFail = errorMessage => ({
    type: REQUEST_PASSWORD_RESET_EMAIL_FAILED,
    payload: errorMessage,
});

export const VERIFY_PASSWORD_RESET_TOKEN_REQUESTED = 'VERIFY_PASSWORD_RESET_TOKEN_REQUESTED';
export const verifyPasswordResetToken = passwordResetToken => ({
    type: VERIFY_PASSWORD_RESET_TOKEN_REQUESTED,
    payload: passwordResetToken,
});

export const VERIFY_PASSWORD_RESET_TOKEN_SUCCEEDED = 'VERIFY_PASSWORD_RESET_TOKEN_SUCCEEDED';
export const verifyPasswordResetTokenSuccess = () => ({
    type: VERIFY_PASSWORD_RESET_TOKEN_SUCCEEDED,
});

export const VERIFY_PASSWORD_RESET_TOKEN_FAILED = 'VERIFY_PASSWORD_RESET_TOKEN_FAILED';
export const verifyPasswordResetTokenFail = errorMessage => ({
    type: VERIFY_PASSWORD_RESET_TOKEN_FAILED,
    payload: errorMessage,
});

export const SET_NEW_PASSWORD_REQUESTED = 'SET_NEW_PASSWORD_REQUESTED';
export const setNewPassword = newPassword => ({
    type: SET_NEW_PASSWORD_REQUESTED,
    payload: newPassword,
});

export const SET_NEW_PASSWORD_SUCCEEDED = 'SET_NEW_PASSWORD_SUCCEEDED';
export const setNewPasswordSuccess = message => ({
    type: SET_NEW_PASSWORD_SUCCEEDED,
    payload: message,
});

export const SET_NEW_PASSWORD_FAILED = 'SET_NEW_PASSWORD_FAILED';
export const setNewPasswordFail = errorMessage => ({
    type: SET_NEW_PASSWORD_FAILED,
    payload: errorMessage,
});
