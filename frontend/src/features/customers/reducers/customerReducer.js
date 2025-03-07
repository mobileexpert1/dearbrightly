import {
  FETCH_CUSTOMER_REQUEST,
  FETCH_CUSTOMER_SUCCESS,
  FETCH_CUSTOMER_FAIL,
  UNSUBSCRIBE_CUSTOMER_REQUEST,
  UNSUBSCRIBE_CUSTOMER_SUCCESS,
  UNSUBSCRIBE_CUSTOMER_FAIL,
} from 'src/features/customers/actions/customerActions';

const defaultState = {
  errorMessage: '',
  fetchedSuccessfully: false,
  isFetching: false,
  unsubscribeSuccess: false,
  isUnsubscribing: false,
  data: undefined,
  orders: undefined,
};

export const customer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_CUSTOMER_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case FETCH_CUSTOMER_SUCCESS:
      return {
        ...state,
        fetchedSuccessfully: true,
        data: action.payload,
      };
    case FETCH_CUSTOMER_FAIL:
      return {
        ...state,
        isFetching: false,
        fetchedSuccessfully: false,
        errorMessage: action.payload,
      };
    case UNSUBSCRIBE_CUSTOMER_REQUEST:
      return {
        ...state,
        isUnsubscribing: true,
        unsubscribeSuccess: false,
        errorMessage: '',
      };
    case UNSUBSCRIBE_CUSTOMER_SUCCESS:
      return {
        ...state,
        isUnsubscribing: false,
        unsubscribeSuccess: true,
        errorMessage: '',
      };
    case UNSUBSCRIBE_CUSTOMER_FAIL:
      return {
        ...state,
        isUnsubscribing: false,
        unsubscribeSuccess: false,
        errorMessage: action.payload,
      };
    default:
      return state;
  }
};
