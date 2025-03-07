import {
  SET_SHARING_ENTRY_POINT,
  SET_SHARING_EMAIL_TYPE,
  SET_SHARING_REFERRER_EMAIL,
  SET_SHARING_EMAIL_REMINDER_INTERVAL,
  GET_SHARING_PROGRAM_CODE_SUCCESS,
  GET_SHARING_PROGRAM_CODE_REQUEST,
  RESET_GENERATED_CODE,
  SHARING_PROGRAM_EMAIL_REQUEST,
  SHARING_PROGRAM_EMAIL_SUCCESS,
  SHARING_PROGRAM_EMAIL_FAIL,
} from '../actions/sharingProgramActions';

import {
  communicationMethodsOptions,
  sharingEntryPointOptions,
} from 'src/features/sharingProgram/constants/sharingProgramConstants';

const initialState = {
  [communicationMethodsOptions.unknown]: '',
  [communicationMethodsOptions.fbMessenger]: '',
  [communicationMethodsOptions.email]: '',
  [communicationMethodsOptions.copy]: '',
  [communicationMethodsOptions.whatsapp]: '',
  [communicationMethodsOptions.more]: '',
  isGenerated: false,
  emailPending: false,
  isEmailSent: false,
  entryPoint: sharingEntryPointOptions.unknown,
  emailType: '00',
  emailReminderIntervalInDays: '00',
  referrerEmail: null,
  emailError: false,
};

export const sharingProgram = (state = initialState, action) => {
  switch (action.type) {
    case SET_SHARING_ENTRY_POINT: {
      return {
        ...state,
        entryPoint: action.payload,
      };
    }
    case SET_SHARING_EMAIL_TYPE: {
      return {
        ...state,
        emailType: action.payload,
      };
    }
    case SET_SHARING_REFERRER_EMAIL: {
      return {
        ...state,
        referrerEmail: action.payload,
      };
    }
    case SET_SHARING_EMAIL_REMINDER_INTERVAL: {
      return {
        ...state,
        emailReminderIntervalInDays: action.payload,
      };
    }
    case GET_SHARING_PROGRAM_CODE_REQUEST: {
      return {
        ...state,
      };
    }
    case GET_SHARING_PROGRAM_CODE_SUCCESS: {
      return {
        ...state,
        [action.payload.communicationMethod]: action.payload.code,
        isGenerated: true,
      };
    }
    case RESET_GENERATED_CODE: {
      return {
        ...state,
        [action.payload]: '',
        isGenerated: false,
      };
    }
    case SHARING_PROGRAM_EMAIL_REQUEST: {
      return {
        ...state,
        emailPending: true,
        isEmailSent: false,
        emailError: false,
      };
    }
    case SHARING_PROGRAM_EMAIL_SUCCESS: {
      return {
        ...state,
        emailPending: false,
        isEmailSent: true,
        emailError: false,
      };
    }
    case SHARING_PROGRAM_EMAIL_FAIL: {
      return {
        ...state,
        emailPending: false,
        isEmailSent: false,
        emailError: true,
      };
    }

    default:
      return state;
  }
};
