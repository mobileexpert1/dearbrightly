const getPaymentData = state => state.payment;

export const getInitKey = state => getPaymentData(state).initializationKey;

export const getPaymentErrorMessage = state => getPaymentData(state).errorMessage;

export const isPaymentSubmitSuccess = state => getPaymentData(state).isPaymentSubmitSuccess;

export const isPaymentSubmitting = state => getPaymentData(state).isPaymentSubmitting;

export const isCreditCardUpdateSuccess = state => getPaymentData(state).isCreditCardUpdateSuccess;

export const isCreditCardUpdating = state => getPaymentData(state).isCreditCardUpdating;

export const getPaymentMethods = state => getPaymentData(state).paymentMethods;

export const getDefaultPaymentMethod = state => getPaymentData(state).defaultPaymentMethod;

export const isFetchingPaymentMethods = state => getPaymentData(state).isFetchingPaymentMethods;

export const isPaymentMethodsFetchSuccess = state => getPaymentData(state).isPaymentMethodsFetchSuccess;

export const isFetchingToken = state => getPaymentData(state).isFetchingToken;
