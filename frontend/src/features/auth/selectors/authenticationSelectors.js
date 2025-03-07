import { createSelector } from 'reselect';

const getAuthenticationState = state => state.authentication;

export const getRegistrationErrorMessage = createSelector(
    getAuthenticationState,
    ({ registrationErrorMessage }) => registrationErrorMessage,
);
export const getRegistrationSuccessStatus = createSelector(
    getAuthenticationState,
    ({ isRegistered }) => isRegistered,
);
export const getLoginErrorMessage = createSelector(
    getAuthenticationState,
    ({ loginErrorMessage }) => loginErrorMessage,
);

export const getOtpIsRequired = createSelector(
    getAuthenticationState,
    ({ otpIsRequired }) => otpIsRequired,
)

export const getOtpTimeoutSet = createSelector(
    getAuthenticationState,
    ({ otpTimeoutSet }) => otpTimeoutSet
)

export const getTwoFactorEnabled = createSelector(
    getAuthenticationState,
    ({ twoFactorEnabled }) => twoFactorEnabled
)

export const getTwoFactorSetupResponse = createSelector(
    getAuthenticationState,
    ({ twoFactorSetupResponse }) => twoFactorSetupResponse
)

export const getTwoFactorError = createSelector(
    getAuthenticationState,
    ({ twoFactorError }) => twoFactorError
)

export const getOtpTimeoutToggleError = createSelector(
    getAuthenticationState,
    ({ otpTimeoutToggleError }) => otpTimeoutToggleError
)

export const getTwoFactorSetupError = createSelector(
    getAuthenticationState,
    ({ twoFactorSetupError }) => twoFactorSetupError
)




export const isAuthenticated = state => getAuthenticationState(state).isAuthenticated;
export const tokenChecked = state => getAuthenticationState(state).tokenChecked;
export const isProcessing = state => getAuthenticationState(state).isProcessing;
export const otpIsRequired = state => getAuthenticationState(state).otpIsRequired;
