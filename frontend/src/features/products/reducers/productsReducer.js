import {
    FETCH_PRODUCTS_REQUESTED,
    FETCH_PRODUCTS_FAILED,
    FETCH_PRODUCTS_SUCCEEDED,
} from '../actions/productsActions';

const defaultState = {
    errorMessage: '',
    fetchedSuccessfully: false,
    isFetching: false,
    data: [],
    highestPriceOTCProduct: 0,
};

export const products = (state = defaultState, action) => {
    switch (action.type) {
        case FETCH_PRODUCTS_REQUESTED:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_PRODUCTS_SUCCEEDED:
            const pricesOtcProducts = action.payload.map(object => {
                if (object.productType === 'OTC') {
                    return object.price;
                } else {
                    return 0;
                }
            });
            const maxPrice = Math.max(...pricesOtcProducts);
            return {
                ...defaultState,
                fetchedSuccessfully: true,
                data: action.payload,
                highestPriceOTCProduct: maxPrice,
            };
        case FETCH_PRODUCTS_FAILED:
            return {
                ...state,
                isFetching: false,
                fetchedSuccessfully: false,
                errorMessage: action.payload,
            };
        default:
            return state;
    }
};
