import { getShoppingBagItemsFromOrderProducts } from 'src/common/helpers/getShoppingBagItemsFromOrderProducts';
import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import {
    SHOPPING_BAG_ADD,
    SHOPPING_BAG_UPDATE_QUANTITY,
    SHOPPING_BAG_REMOVE_ITEM,
    SHOPPING_BAG_UPDATE_FAILED,
    SHOPPING_BAG_RESET,
} from '../actions/shoppingBagActions';

import { FETCH_PENDING_CHECKOUT_ORDER_SUCCESS } from 'src/features/orders/actions/ordersActions'

import { PAYMENT_SUCCESS } from 'src/features/checkout/actions/paymentActions';

const initialState = {
    data: [],
    errorMessage: '',
};

export function shoppingBag(state = initialState, action) {
    switch (action.type) {
        case SHOPPING_BAG_ADD:
            return {
                data: [...state.data, action.payload],
                errorMessage: '',
            };
        case SHOPPING_BAG_UPDATE_QUANTITY:
            return {
                ...state,
                data: state.data.map(
                    item =>
                        item.productUuid === action.payload.id && item.frequency === action.payload.frequency
                            ? { ...item, quantity: action.payload.quantity}
                            : item,
                ),
                errorMessage: '',
            };
        case SHOPPING_BAG_REMOVE_ITEM:
            return {
                ...state,
                data: state.data.filter(item => item.productUuid !== action.payload),
                errorMessage: '',
            };
        case SHOPPING_BAG_UPDATE_FAILED:
            return {
                ...state,
                errorMessage: action.payload,
            };
        case LOG_OUT_SUCCESS:
        case PAYMENT_SUCCESS:
        case SHOPPING_BAG_RESET:
            return {
                ...initialState,
            };
        case FETCH_PENDING_CHECKOUT_ORDER_SUCCESS:
        {
          if (state.data.length == 0) {
              const { results } = action.payload;
              const sorted_pending_orders = results && results.length > 0  ? results.sort(function(a,b){return a.createdDatetime - b.createdDatetime}): null;
              const pending_order = sorted_pending_orders ? sorted_pending_orders[0] : null;

              return {
                data: pending_order ? getShoppingBagItemsFromOrderProducts(pending_order.orderProducts) : state.data,
                errorMessage: '',
              };

            } else {
              return state
            }
        }
        default:
            return state;
    }
}
