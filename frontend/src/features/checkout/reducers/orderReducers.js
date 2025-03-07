import {
    CREATE_ORDER_REQUEST,
    CREATE_ORDER_SUCCESS,
    CREATE_ORDER_FAIL,
    UPDATE_ORDER_REQUEST,
    UPDATE_ORDER_SUCCESS,
    UPDATE_ORDER_FAIL,
    UPDATE_ORDER_SHIPPING_DETAILS_SUCCESS,
    UPDATE_ORDER_SHIPPING_DETAILS_REQUEST,
    UPDATE_ORDER_SHIPPING_DETAILS_FAIL,
    UPDATE_PENDING_OR_CREATE_ORDER_REQUEST,
    UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS,
    UPDATE_PENDING_OR_CREATE_ORDER_FAIL,
    ORDER_RESET,
    UPDATE_IS_ORDER_EXPRESS_CHECKOUT,
    FETCH_PENDING_CHECKOUT_ORDER_REQUEST,
    FETCH_PENDING_CHECKOUT_ORDER_SUCCESS,
    FETCH_PENDING_CHECKOUT_ORDER_FAIL,
    CLEAN_ORDERS_ERROR,
} from 'src/features/orders/actions/ordersActions';
import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import { APP_INIT } from 'src/common/actions/init';
import { SUBMIT_PAYMENT_SUCCESS } from 'src/features/checkout/actions/paymentActions';
import { REMOVE_DISCOUNT_CODE_SUCCESS } from 'src/features/checkout/actions/discountActions';


const defaultState = {
    isFetching: false,
    isUpdating: false,
    isUpdateSuccess: false,
    fetchedSuccessfully: false,
    isUpdatingOrderShippingDetails: false,
    updateOrderShippingDetailsSuccess: false,
    data: {},
    errorMessage: '',
    initializationKey: null,
    working: false,
    isExpressCheckout: false,
};

export const order = (state = defaultState, action) => {
    switch (action.type) {
        case CREATE_ORDER_REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case CREATE_ORDER_SUCCESS:
            return {
                ...defaultState,
                fetchedSuccessfully: true,
                data: action.payload,
            };
        case CREATE_ORDER_FAIL:
            return {
                ...defaultState,
                fetchedSuccessfully: false,
                errorMessage: action.payload,
            };
        case UPDATE_ORDER_REQUEST:
            return {
                ...state,
                errorMessage: '',
                isUpdating: true,
                isUpdateSuccess: false,
            };
        case SUBMIT_PAYMENT_SUCCESS:
        case REMOVE_DISCOUNT_CODE_SUCCESS:
        case UPDATE_ORDER_SUCCESS:
            return {
                ...state,
                data: action.payload,
                errorMessage: '',
                isUpdating: false,
                isUpdateSuccess: true,
            };
        case UPDATE_ORDER_FAIL:
            return {
                ...defaultState,
                isUpdating: false,
                isUpdateSuccess: false,
                errorMessage: action.payload,
            };
        case UPDATE_PENDING_OR_CREATE_ORDER_REQUEST:
            return {
                ...state,
                isFetching: true,
                fetchedSuccessfully: false,
                errorMessage: '',
            };
        case UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS:
            return {
                ...state,
                isFetching: false,
                fetchedSuccessfully: true,
                errorMessage: '',
                data: action.payload,
            };
        case UPDATE_PENDING_OR_CREATE_ORDER_FAIL:
            return {
                ...defaultState,
                isFetching: false,
                fetchedSuccessfully: false,
                errorMessage: action.payload,
            };
        case UPDATE_ORDER_SHIPPING_DETAILS_REQUEST:
            return {
                ...state,
                isUpdatingOrderShippingDetails: true,
                updateOrderShippingDetailsSuccess: false,
                errorMessage: '',
            };

        case UPDATE_ORDER_SHIPPING_DETAILS_SUCCESS:
            return {
                ...state,
                isUpdatingOrderShippingDetails: false,
                updateOrderShippingDetailsSuccess: true,
                errorMessage: '',
                data: action.payload,
            };

        case UPDATE_ORDER_SHIPPING_DETAILS_FAIL:
            return {
                ...state,
                isUpdatingOrderShippingDetails: false,
                updateOrderShippingDetailsSuccess: false,
                errorMessage: action.payload,
            };
        case UPDATE_IS_ORDER_EXPRESS_CHECKOUT:
          return {
            ...state,
            isExpressCheckout: action.payload,
          };
        case LOG_OUT_SUCCESS:
        case ORDER_RESET:
            return {
                ...defaultState,
            };
        case APP_INIT:
            return {
                ...state,
                errorMessage: '',
            };
        case FETCH_PENDING_CHECKOUT_ORDER_REQUEST:
            return {
              ...state,
              errorMessage: '',
              fetchedSuccessfully: false,
              isFetching: true,
            }
        case FETCH_PENDING_CHECKOUT_ORDER_SUCCESS:
            const { results, count, next, previous } = action.payload;
            const sorted_pending_orders = results && results.length > 0  ? results.sort(function(a,b){return a.createdDatetime - b.createdDatetime}): null;
            return {
              ...state,
              data: sorted_pending_orders && sorted_pending_orders.length > 0 ? sorted_pending_orders[0] : null,
              errorMessage: '',
              fetchedSuccessfully: true,
              isFetching: false,
            }
        case FETCH_PENDING_CHECKOUT_ORDER_FAIL:
            return {
              ...state,
              errorMessage: action.payload,
              fetchedSuccessfully: false,
              isFetching: false,
            }
        case CLEAN_ORDERS_ERROR:
            return {
                ...state,
                errorMessage: '',
            }
        default:
            return state;
    }
};