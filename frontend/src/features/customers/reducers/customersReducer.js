import {
  FETCH_CUSTOMERS_REQUEST,
  FETCH_CUSTOMERS_FAIL,
  FETCH_CUSTOMERS_SUCCESS,
  REMOVE_CUSTOMERS_SUCCESS,
  UPDATE_CUSTOMER_DATA_REQUEST,
  UPDATE_CUSTOMER_DATA_SUCCESS,
  UPDATE_CUSTOMER_DATA_FAIL,
  CLEAN_CUSTOMERS_DATA,
  FETCH_CUSTOMERS_EXPORT_REQUEST,
  FETCH_CUSTOMERS_EXPORT_SUCCESS,
  FETCH_CUSTOMERS_EXPORT_FAIL,
  UPDATE_CUSTOMER_PAGINATION,
  UPDATE_CUSTOMER_SEARCH_FILTER,
  UPDATE_RX_STATUS_FILTER,
} from '../actions/customersActions';

const defaultState = {
  errorMessage: '',
  fetchedSuccessfully: false,
  isFetching: false,
  isUpdatedSuccessfully: false,
  isUpdating: false,
  data: [],
  searchFilter: '',
  rxStatusFilter: 'All',
  pagination: {
    current: 1,
    total: 0,
    size: 40,
    next: '',
    previous: '',
  }
};

export const customers = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_CUSTOMERS_REQUEST:
      return {
        ...state,
        isFetching: true,
        fetchedSuccessfully: false,
        errorMessage: '',
      };
    case FETCH_CUSTOMERS_SUCCESS:
    {
      const { results, count, next, previous } = action.payload;
      let current = state.pagination.current;
      if (state.pagination.total > count) {
        current = 1;
      }
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: true,
        data: results,
        errorMessage: '',
        pagination: {
          total: count,
          next,
          previous,
          current: current,
          size: state.pagination.size,
        },
      };
    }
    case FETCH_CUSTOMERS_FAIL:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: false,
        errorMessage: action.payload,
      };
    case FETCH_CUSTOMERS_EXPORT_REQUEST:
      return {
        ...state,
        isFetching: true,
        fetchedSuccessfully: false,
        errorMessage: '',
      };
    case FETCH_CUSTOMERS_EXPORT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: true,
        errorMessage: '',
      };
    case FETCH_CUSTOMERS_EXPORT_FAIL:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: false,
        errorMessage: action.payload,
      };
    case CLEAN_CUSTOMERS_DATA:
      return {
        ...state,
        data: [],
      };
    case REMOVE_CUSTOMERS_SUCCESS:
      return {
        ...state,
        data: state.data.filter(customer => !action.payload.includes(customer.id)),
      };
    case UPDATE_CUSTOMER_DATA_REQUEST:
      return {
        ...state,
        isUpdatedSuccessfully: false,
        isUpdating: true,
        errorMessage: '',
      };

    case UPDATE_CUSTOMER_DATA_SUCCESS:
      return {
        ...state,
        data: state.data.map(
          customer => (customer.id == action.payload.id ? action.payload : customer),
        ),
        isUpdatedSuccessfully: true,
        isUpdating: false,
        errorMessage: '',
      };

    case UPDATE_CUSTOMER_DATA_FAIL:
      return {
        ...state,
        isUpdatedSuccessfully: false,
        errorMessage: action.payload,
      };
    case UPDATE_CUSTOMER_SEARCH_FILTER:
        return {
          ...state,
          searchFilter: action.payload,
        };
    case UPDATE_RX_STATUS_FILTER:
      return {
        ...state,
        rxStatusFilter: action.payload,
      };

    case UPDATE_CUSTOMER_PAGINATION:
      return {
        ...state,
        pagination: {
          current: action.payload.current,
          size: action.payload.size,
          total: state.pagination.total,
        },
      }
    default:
      return state;
  }
};
