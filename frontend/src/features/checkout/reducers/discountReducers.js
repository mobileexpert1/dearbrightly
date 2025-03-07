import {
    GET_DISCOUNT_CODE_REQUEST,
    GET_DISCOUNT_CODE_SUCCESS,
    GET_DISCOUNT_CODE_FAIL,
    REMOVE_DISCOUNT_CODE_REQUEST,
    REMOVE_DISCOUNT_CODE_SUCCESS,
    REMOVE_DISCOUNT_CODE_FAIL,
    RESET_DISCOUNT_CODE_STATE
} from 'src/features/checkout/actions/discountActions';
import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import { PAYMENT_SUCCESS } from 'src/features/checkout/actions/paymentActions';
import {UPDATE_ORDER_REQUEST, UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS} from 'src/features/orders/actions/ordersActions'

const defaultState = {
    errorMessage: '',
    isRequestingDiscountCode: false,
    isDiscountCodeRequestSuccess: false,
    isRequestingDiscountCodeRemoval: false,
    isRemoveDiscountCodeRequestSuccess: false,
    data: {},
    discountCode: '',
};

export const discount = (state = defaultState, action) => {
    switch (action.type) {
        case GET_DISCOUNT_CODE_REQUEST:
            return {
                ...state,
                isRequestingDiscountCode: true,
                isDiscountCodeRequestSuccess: false,
                discountCode: action.payload.code,
                errorMessage: ''
            };
        case GET_DISCOUNT_CODE_SUCCESS:
            return {
                ...state,
                isRequestingDiscountCode: false,
                isDiscountCodeRequestSuccess: true,
                data: action.payload,
                errorMessage: '',
            };
        case UPDATE_ORDER_REQUEST:
        case UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS:
            const order = action.payload;
            return {
                ...state,
                discountCode: order.discountCode,
                data: {
                    discountCode: order.discountCode,
                    amountOff: order.discount,
                    percentOff: 0
                }
            };
        case GET_DISCOUNT_CODE_FAIL:
            return {
                ...defaultState,
                isRequestingDiscountCode: false,
                isDiscountCodeRequestSuccess: false,
                errorMessage: action.payload,
            };
        case REMOVE_DISCOUNT_CODE_REQUEST:
            return {
                ...state,
                isRequestingDiscountCodeRemoval: true,
                isRemoveDiscountCodeRequestSuccess: false,
                errorMessage: ''
            };
        case REMOVE_DISCOUNT_CODE_SUCCESS:
            return {
                ...defaultState,
                isRemoveDiscountCodeRequestSuccess: true,
            };
        case REMOVE_DISCOUNT_CODE_FAIL:
            return {
                ...state,
                isRequestingDiscountCodeRemoval: false,
                isRemoveDiscountCodeRequestSuccess: false,
                errorMessage: action.payload,
            };
        case RESET_DISCOUNT_CODE_STATE:
        case LOG_OUT_SUCCESS:
        case PAYMENT_SUCCESS:
            return {
                ...defaultState,
            };
        default:
            return state;
    }
};
