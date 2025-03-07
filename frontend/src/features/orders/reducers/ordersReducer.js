import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import {
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_FAIL,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_EXPORT_REQUEST,
  FETCH_ORDERS_EXPORT_FAIL,
  FETCH_ORDERS_EXPORT_SUCCESS,
  FETCH_CUSTOMER_ORDERS_REQUEST,
  FETCH_CUSTOMER_ORDERS_FAIL,
  FETCH_CUSTOMER_ORDERS_SUCCESS,
  FETCH_ORDER_STATUSES_SUCCESS,
  ARCHIVE_ORDERS_SUCCESS,
  CLEAN_ORDERS_DATA,
  FETCH_ORDER_REQUEST,
  FETCH_ORDER_SUCCESS,
  FETCH_ORDER_FAIL,
  UPDATE_ORDER_SEARCH_FILTER,
  UPDATE_ORDER_STATUS_FILTER_VALUE,
  UPDATE_ORDER_PAGINATION,
} from '../actions/ordersActions';

const defaultState = {
  errorMessage: '',
  fetchedSuccessfully: false,
  isFetching: false,
  statuses: {},
  data: [],
  pagination: {
    current: 1,
    size: 40,
    total: 0,
    next: '',
    previous: '',
  },
  order: {},
  searchFilter: '',
  statusFilterValue: 'All',
};



export const orders = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
    case FETCH_ORDER_REQUEST:
    case FETCH_CUSTOMER_ORDERS_REQUEST:
      return {
        ...state,
        fetchedSuccessfully: false,
        isFetching: true,
        errorMessage: '',
      };
    case FETCH_ORDER_SUCCESS:
      return {
        ...state,
        fetchedSuccessfully: true,
        order: action.payload,
        isFetching: false,
      };
    case FETCH_CUSTOMER_ORDERS_SUCCESS:
      return {
        ...state,
        fetchedSuccessfully: true,
        data: action.payload,
        isFetching: false,
      };
    case FETCH_ORDERS_SUCCESS:
      const { results, count, next, previous } = action.payload;
      let current = state.pagination.current;
      if (state.pagination.total > count) {
        current = 1;
      }
      return {
        ...state,
        isFetching: false,
        errorMessage: '',
        fetchedSuccessfully: true,
        data: results,
        pagination: {
          current: current,
          size: state.pagination.size,
          total: count,
          next,
          previous,
        },
      };
    case FETCH_ORDERS_EXPORT_REQUEST:
      return {
        ...state,
        isFetching: true,
        fetchedSuccessfully: false,
        errorMessage: '',
      };
    case FETCH_ORDERS_EXPORT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: true,
        errorMessage: '',
      };
    case FETCH_ORDERS_EXPORT_FAIL:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: false,
        errorMessage: action.payload,
      };
    case FETCH_ORDERS_FAIL:
    case FETCH_ORDER_FAIL:
    case FETCH_CUSTOMER_ORDERS_FAIL:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: false,
        errorMessage: action.payload,
      };
    case CLEAN_ORDERS_DATA:
      return {
        ...state,
        data: [],
      };
    case FETCH_ORDER_STATUSES_SUCCESS:
      return {
        ...state,
        statuses: action.payload,
      };
    case ARCHIVE_ORDERS_SUCCESS:
      return {
        ...state,
        data: state.data.filter(order => !action.payload.includes(order.id)),
      };
    case LOG_OUT_SUCCESS:
      return {
        ...defaultState,
      };
    case UPDATE_ORDER_SEARCH_FILTER:
      return {
        ...state,
        searchFilter: action.payload,
      };
    case UPDATE_ORDER_STATUS_FILTER_VALUE:
      return {
        ...state,
        statusFilterValue: action.payload,
      };
    case UPDATE_ORDER_PAGINATION:
      return {
        ...state,
        pagination: {
          current: action.payload.current,
          size: action.payload.size,
          total: state.pagination.total,
          next: state.pagination.next,
          previous: state.pagination.previous,
        }
      };
    default:
      return state;
  }
};
