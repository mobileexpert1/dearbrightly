const getDiscountData = state => state.discount;

export const getDiscount = state => getDiscountData(state).data;

export const getDiscountCode = state => getDiscountData(state).discountCode;

export const getDiscountErrorMessage = state => getDiscountData(state).errorMessage;


export const isRequestingDiscountCode = state => getDiscountData(state).isRequestingDiscountCode;

export const isDiscountCodeRequestSuccess = state =>
    getDiscountData(state).isDiscountCodeRequestSuccess;

export const isRequestingDiscountCodeRemoval = state => getDiscountData(state).isRequestingDiscountCodeRemoval;

export const isRemoveDiscountCodeRequestSuccess = state =>
    getDiscountData(state).isRemoveDiscountCodeRequestSuccess;
