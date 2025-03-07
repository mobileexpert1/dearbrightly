import {
  GET_PAYMENT_TOKEN_FAIL,
  GET_PAYMENT_TOKEN_SUCCESS,
  GET_PAYMENT_TOKEN_REQUEST,
  SUBMIT_PAYMENT_REQUEST,
  SUBMIT_PAYMENT_SUCCESS,
  SUBMIT_PAYMENT_FAIL,
  UPDATE_CREDIT_CARD_REQUEST,
  UPDATE_CREDIT_CARD_SUCCESS,
  UPDATE_CREDIT_CARD_FAIL,
  GET_PAYMENT_METHODS_REQUEST,
  GET_PAYMENT_METHODS_SUCCESS,
  GET_PAYMENT_METHODS_FAIL,
  CLEAR_PAYMENT_ERROR_MESSAGE,
  GET_DEFAULT_PAYMENT_METHOD_REQUEST,
  GET_DEFAULT_PAYMENT_METHOD_SUCCESS,
  GET_DEFAULT_PAYMENT_METHOD_FAIL,
} from 'src/features/checkout/actions/paymentActions';

const defaultState = {
  isFetchingToken: false,
  isFetchingPaymentMethods: false,
  isPaymentMethodsFetchSuccess: false,
  isPaymentSubmitSuccess: false,
  isPaymentSubmitting: false,
  isCreditCardUpdateSuccess: false,
  isCreditCardUpdating: false,
  errorMessage: '',
  initializationKey: null,
  paymentMethods: null,
  defaultPaymentMethod: null,
};

export const payment = (state = defaultState, action) => {
  switch (action.type) {
    case GET_PAYMENT_TOKEN_REQUEST:
      return {
        ...state,
        isFetchingToken: true,
        errorMessage: '',
        initializationKey: null,
      };
    case GET_PAYMENT_TOKEN_SUCCESS:
      return {
        ...state,
        isFetchingToken: false,
        initializationKey: action.payload,
        errorMessage: '',
      };
    case GET_PAYMENT_TOKEN_FAIL:
      return {
        ...state,
        isFetchingToken: false,
        errorMessage: action.payload,
        initializationKey: null,
      };
    case SUBMIT_PAYMENT_FAIL:
      return {
        ...state,
        errorMessage: action.payload,
        initializationKey: null,
        isPaymentSubmitting: false,
        isPaymentSubmitSuccess: false,
      };
    case SUBMIT_PAYMENT_REQUEST:
      return {
        ...state,
        errorMessage: '',
        isPaymentSubmitting: true,
        isPaymentSubmitSuccess: false,
      };
    case SUBMIT_PAYMENT_SUCCESS:
      return {
        ...state,
        errorMessage: '',
        initializationKey: null,
        isPaymentSubmitting: false,
        isPaymentSubmitSuccess: true,
      };
    case UPDATE_CREDIT_CARD_REQUEST:
      return {
        ...state,
        isCreditCardUpdateSuccess: false,
        isCreditCardUpdating: true,
        errorMessage: '',
      };
    case UPDATE_CREDIT_CARD_SUCCESS:
      return {
        ...state,
        isCreditCardUpdateSuccess: true,
        isCreditCardUpdating: false,
        errorMessage: '',
      };
    case UPDATE_CREDIT_CARD_FAIL:
      return {
        ...state,
        isCreditCardUpdateSuccess: false,
        isCreditCardUpdating: false,
        errorMessage: action.payload,
      };
    case GET_DEFAULT_PAYMENT_METHOD_REQUEST:
    case GET_PAYMENT_METHODS_REQUEST:
      return {
        ...state,
        isFetchingPaymentMethods: true,
        isPaymentMethodsFetchSuccess: false,
        errorMessage: '',
      };
    case GET_DEFAULT_PAYMENT_METHOD_SUCCESS:
      let defaultPaymentMethod = null;
      if (action.payload && action.payload.length > 0 && action.payload[0].card){
        const { card: { brand, expMonth, expYear, last4 }} = action.payload[0];
        defaultPaymentMethod = { card: { brand, expMonth, expYear, last4 }}
      }
      return {
        ...state,
        isFetchingPaymentMethods: false,
        isPaymentMethodsFetchSuccess: true,
        defaultPaymentMethod: defaultPaymentMethod,
        errorMessage: '',
      };
    case GET_PAYMENT_METHODS_SUCCESS:
      return {
        ...state,
        isFetchingPaymentMethods: false,
        isPaymentMethodsFetchSuccess: true,
        paymentMethods: action.payload,
        errorMessage: '',
      };
    case GET_DEFAULT_PAYMENT_METHOD_FAIL:
    case GET_PAYMENT_METHODS_FAIL:
      return {
        ...state,
        isFetchingPaymentMethods: false,
        isPaymentMethodsFetchSuccess: false,
        errorMessage: action.payload,
      };
    case CLEAR_PAYMENT_ERROR_MESSAGE:
      return {
        ...state,
        errorMessage: '',
      }

    default:
      return state;
  };
}
