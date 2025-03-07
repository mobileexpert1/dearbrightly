import * as actions from 'src/features/auth/actions/authenticationActions';
import { APP_INIT } from 'src/common/actions/init';
import { GET_VISITS_SUCCESS } from 'src/features/medicalSurvey/actions/medicalSurveyActions';

import {
  UPDATE_CUSTOMER_DATA_REQUEST,
  UPDATE_CUSTOMER_DATA_SUCCESS,
  UPDATE_CUSTOMER_DATA_FAIL,
} from 'src/features/customers/actions/customersActions';

import {
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAIL,
  SET_DATE_OF_BIRTH,
  SET_CONSENT_TO_TELEHEALTH,
  SET_SHIPPING_ADDRESS_STATE,
  CLEAR_USER_ERROR,
  SET_MESSAGES_READ,
} from 'src/features/user/actions/userActions';

import { UPDATE_CREDIT_CARD_SUCCESS } from 'src/features/checkout/actions/paymentActions';

import { isUserEligibleForService } from 'src/features/user/helpers/userHelpers';

const initialState = {
  consentToTelehealth: null,
  user: null,
  updatingAccountDetails: false,
  updateAccountDetailsErrorMessage: null,
  isUpdatedSuccessfully: false,
  dateOfBirth: null,
  shippingAddressState: null,
  isEligible: false,
  eligibilityErrorMessage: null,
  messagesRead: false,
};

export const user = (state = initialState, action) => {
  switch (action.type) {
    case APP_INIT:
      return {
        ...state,
        updatingAccountDetails: false,
        updateAccountDetailsErrorMessage: null,
        isUpdatedSuccessfully: false,
      };
    case actions.LOG_IN_FAIL:
      return {
        ...state,
        user: null,
      };
    case actions.LOG_IN_SUCCESS:
      return {
        ...state,
        user: {
          ...action.payload,
          id_hash: action.payload.id.hashCode()
        },
        dateOfBirth: action.payload.dob ? action.payload.dob : state.dateOfBirth,
        shippingAddressState: action.payload.shippingDetails ? action.payload.shippingDetails.state : state.shippingAddressState,
      };
    case actions.LOG_OUT_SUCCESS:
      return {
        ...initialState,
      };
    case FETCH_USER_REQUEST:
    case UPDATE_CUSTOMER_DATA_REQUEST: // TODO - Create UPDATE_USER_DATA_REQUEST (don't conflate with customer data update)
      return {
        ...state,
        updatingAccountDetails: true,
        updateAccountDetailsErrorMessage: null,
        isUpdatedSuccessfully: false,
      };
    case FETCH_USER_SUCCESS:
    case UPDATE_CREDIT_CARD_SUCCESS:
    case UPDATE_CUSTOMER_DATA_SUCCESS:
      return {
        ...state,
        updatingAccountDetails: false,
        user: action.payload,
        updateAccountDetailsErrorMessage: null,
        isUpdatedSuccessfully: true,
      };
    case FETCH_USER_FAIL:
    case UPDATE_CUSTOMER_DATA_FAIL:
      return {
        ...state,
        updatingAccountDetails: false,
        updateAccountDetailsErrorMessage: action.payload,
        isUpdatedSuccessfully: false,
      };
    case SET_DATE_OF_BIRTH:
      // set eligibility status if both the state and dob are set
      const eligibilityStatus = isUserEligibleForService(action.payload, state.shippingAddressState);
      return {
        ...state,
        dateOfBirth: action.payload,
        isEligible: eligibilityStatus ? eligibilityStatus.isEligible : state.isEligible,
        eligibilityErrorMessage: eligibilityStatus ? eligibilityStatus.error : state.eligibilityErrorMessage,
      };
    case SET_SHIPPING_ADDRESS_STATE:
    {
      // set eligibility status if both the state and dob are set
      const eligibilityStatus = isUserEligibleForService(state.dateOfBirth, action.payload);

      return {
        ...state,
        shippingAddressState: action.payload,
        isEligible: eligibilityStatus ? eligibilityStatus.isEligible : state.isEligible,
        eligibilityErrorMessage: eligibilityStatus ? eligibilityStatus.error : state.eligibilityErrorMessage,
      };
    }
    case SET_CONSENT_TO_TELEHEALTH:
      return {
        ...state,
        consentToTelehealth: action.payload,
      }
    case GET_VISITS_SUCCESS:
      return {
        ...state,
      };
    case CLEAR_USER_ERROR:
      return {
        ...state,
        updateAccountDetailsErrorMessage: null,
      };
    case SET_MESSAGES_READ:
      return {
        ...state,
        messagesRead: true,
      };
    default:
      return state;
  }
};
