import { createSelector } from 'reselect';

const getPasswordResetState = state => state.passwordReset;

export const getPasswordResetErrorMessage = createSelector(
    getPasswordResetState,
    ({ errorMessage }) => errorMessage,
);

export const isFetchingPasswordReset = createSelector(
    getPasswordResetState,
    ({ isFetching }) => isFetching,
);

export const isPasswordResetTokenValid = createSelector(
    getPasswordResetState,
    ({ passwordResetTokenValid }) => passwordResetTokenValid,
);

export const isPasswordEmailSent = createSelector(
    getPasswordResetState,
    ({ passwordEmailSent }) => passwordEmailSent,
);
