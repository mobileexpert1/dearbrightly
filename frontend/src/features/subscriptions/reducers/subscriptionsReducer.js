import {
  CLEAR_SUBSCRIPTION_ERROR_MESSAGE,
  FETCH_SUBSCRIPTIONS_REQUEST,
  FETCH_SUBSCRIPTIONS_FAIL,
  FETCH_SUBSCRIPTIONS_SUCCESS,
  UPDATE_SUBSCRIPTION_REQUEST,
  UPDATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_FAIL,
  UPDATE_SUBSCRIPTIONS_REQUEST,
  UPDATE_SUBSCRIPTIONS_SUCCESS,
  UPDATE_SUBSCRIPTIONS_FAIL,
  UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST,
  UPDATE_OR_CREATE_SUBSCRIPTION_SUCCESS,
  UPDATE_OR_CREATE_SUBSCRIPTION_FAIL,
  UPDATE_SHIPPING_DETAILS_REQUEST,
  UPDATE_SHIPPING_DETAILS_SUCCESS,
  UPDATE_SHIPPING_DETAILS_FAIL
} from 'src/features/subscriptions/actions/subscriptionsActions';
import {CLEAR_PAYMENT_ERROR_MESSAGE} from "src/features/checkout/actions/paymentActions";

const defaultState = {
  data: [],
  errorMessage: '',
  updateShippingDetailsError: '',

  isFetchSuccess: false,
  isUpdateShippingDetailsSuccess: false,

  isFetching: false,
  isUpdatedSuccessfully: false,
  isUpdating: false,
  isUpdatingShippingDetails: false,
};

export const subscriptions = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_SUBSCRIPTIONS_REQUEST:
      return {
        ...state,
        errorMessage: '',
        isFetchSuccess: false,
        isFetching: true,
      };
    case FETCH_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        data: action.payload,
        errorMessage: '',
        isFetchSuccess: true,
        isFetching: false,
      };
    case FETCH_SUBSCRIPTIONS_FAIL:
      return {
        ...state,
        errorMessage: action.payload,
        isFetchSuccess: false,
        isFetching: false,
      };
    case UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST:
    case UPDATE_SUBSCRIPTION_REQUEST:
    case UPDATE_SUBSCRIPTIONS_REQUEST:
      return {
        ...state,
        errorMessage: '',
        isUpdatedSuccessfully: false,
        isUpdating: true,
      };
    case UPDATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        errorMessage: '',
        isUpdatedSuccessfully: true,
        isUpdating: false,
        data: state.data.map(
          subscription => {
            if (subscription.uuid == action.payload.uuid) {
              return action.payload;
            }

            return subscription;
        })
      };
    case UPDATE_SUBSCRIPTIONS_SUCCESS:

      let updatedSubscriptionData = [...state.data];
      action.payload.map(subscriptionPayloadData => {
        const subscriptionUuid = subscriptionPayloadData.uuid;
        const index = state.data.findIndex(subscription => subscription.uuid === subscriptionUuid);
        updatedSubscriptionData[index] = subscriptionPayloadData;
      });

      return {
        ...state,
        errorMessage: '',
        isUpdatedSuccessfully: true,
        isUpdating: false,
        data: updatedSubscriptionData,
      };

    case UPDATE_OR_CREATE_SUBSCRIPTION_SUCCESS:
      let isExistingSubscription = false;
      let updatedSubscriptionsData = state.data.map(
          subscription => {
            if (subscription.uuid == action.payload.uuid) {
              isExistingSubscription = true;
              return action.payload;
            }
            return subscription;
        })
      if (!isExistingSubscription) {
        updatedSubscriptionsData.push(action.payload)
      }
      return {
        ...state,
        errorMessage: '',
        isUpdatedSuccessfully: true,
        isUpdating: false,
        data: updatedSubscriptionsData
      };
    case UPDATE_OR_CREATE_SUBSCRIPTION_FAIL:
    case UPDATE_SUBSCRIPTION_FAIL:
    case UPDATE_SUBSCRIPTIONS_FAIL:
      return {
        ...state,
        errorMessage: action.payload,
        isUpdatedSuccessfully: false,
        isUpdating: false,
      };
    case CLEAR_SUBSCRIPTION_ERROR_MESSAGE:
      return {
        ...state,
        errorMessage: '',
      }
    case UPDATE_SHIPPING_DETAILS_REQUEST:
      return {
        ...state,
        updateShippingDetailsError: '',
        isUpdateShippingDetailsSuccess: false,
        isUpdatingShippingDetails: true,
      }
    case UPDATE_SHIPPING_DETAILS_SUCCESS:
      const updatedSubscriptions = state.data.map(subscription => {
        if (subscription.shippingDetails && subscription.shippingDetails.id === action.payload.id) {
          subscription.shippingDetails = action.payload;
        }
        return subscription;
    });
      return {
        ...state,
        data: updatedSubscriptions,
        updateShippingDetailsError: '',
        isUpdateShippingDetailsSuccess: true,
        isUpdatingShippingDetails: false,
      }
    case UPDATE_SHIPPING_DETAILS_FAIL:
      return {
        ...state,
        updateShippingDetailsError: action.payload,
        isUpdateShippingDetailsSuccess: false,
        isUpdatingShippingDetails: false,
      }
    default:
      return state;
  }
};
