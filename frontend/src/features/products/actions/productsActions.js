export const FETCH_PRODUCTS_REQUESTED = 'FETCH_PRODUCTS_REQUESTED';
export const fetchProductsRequest = () => ({
    type: FETCH_PRODUCTS_REQUESTED,
});

export const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
export const fetchProductsSuccess = products => ({
    type: FETCH_PRODUCTS_SUCCEEDED,
    payload: products,
});

export const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';
export const fetchProductsFail = errorMessage => ({
    type: FETCH_PRODUCTS_FAILED,
    payload: errorMessage,
});
