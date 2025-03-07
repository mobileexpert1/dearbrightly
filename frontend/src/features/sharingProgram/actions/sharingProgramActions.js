export const SET_SHARING_ENTRY_POINT = 'SET_SHARING_ENTRY_POINT';
export const setSharingEntryPoint = entryPoint => {
  return { type: SET_SHARING_ENTRY_POINT, payload: entryPoint };
};

export const SET_SHARING_REFERRER_EMAIL = 'SET_SHARING_REFERRER_EMAIL';
export const setSharingReferrerEmail = referrerEmail => {
  return { type: SET_SHARING_REFERRER_EMAIL, payload: referrerEmail };
};

export const SET_SHARING_EMAIL_TYPE = 'SET_SHARING_EMAIL_TYPE';
export const setSharingEmailType = emailType => {
  return { type: SET_SHARING_EMAIL_TYPE, payload: emailType };
};

export const SET_SHARING_EMAIL_REMINDER_INTERVAL = 'SET_SHARING_EMAIL_REMINDER_INTERVAL';
export const setSharingEmailReminderInterval = emailReminderIntervalInDays => {
  return { type: SET_SHARING_EMAIL_REMINDER_INTERVAL, payload: emailReminderIntervalInDays };
};

export const GET_SHARING_PROGRAM_CODE_REQUEST = 'GET_SHARING_PROGRAM_CODE_REQUEST';
export const getSharingProgramCodeRequest = (
  entryPoint,
  communicationMethod,
  emailType = null,
  emailReminderIntervalInDays = null,
  referrerEmail = null,
) => {
  return {
    type: GET_SHARING_PROGRAM_CODE_REQUEST,
    payload: {
      entryPoint,
      communicationMethod,
      emailType,
      emailReminderIntervalInDays,
      referrerEmail,
    },
  };
};

export const GET_SHARING_PROGRAM_CODE_SUCCESS = 'GET_SHARING_PROGRAM_CODE_SUCCESS';
export const getSharingProgramCodeSuccess = sharingData => {
  return {
    type: GET_SHARING_PROGRAM_CODE_SUCCESS,
    payload: sharingData,
  };
};

export const GET_SHARING_PROGRAM_CODE_FAIL = 'GET_SHARING_PROGRAM_CODE_FAIL';
export const getSharingProgramCodeFail = errorMessage => {
  return {
    type: GET_SHARING_PROGRAM_CODE_FAIL,
    payload: errorMessage,
  };
};

export const RESET_GENERATED_CODE = 'RESET_GENERATED_CODE';
export const resetGeneratedCode = codeType => {
  return {
    type: RESET_GENERATED_CODE,
    payload: codeType,
  };
};

export const SHARING_PROGRAM_EMAIL_REQUEST = 'SHARING_PROGRAM_EMAIL_REQUEST';
export const sharingProgramEmailRequest = (
  refereeEmail,
  entryPoint,
  emailType,
  emailReminderIntervalInDays,
) => {
  return {
    type: SHARING_PROGRAM_EMAIL_REQUEST,
    payload: {
      refereeEmail,
      entryPoint,
      emailType,
      emailReminderIntervalInDays,
    },
  };
};

export const SHARING_PROGRAM_EMAIL_SUCCESS = 'SHARING_PROGRAM_EMAIL_SUCCESS';
export const sharingProgramEmailSuccess = () => {
  return {
    type: SHARING_PROGRAM_EMAIL_SUCCESS,
  };
};

export const SHARING_PROGRAM_EMAIL_FAIL = 'SHARING_PROGRAM_EMAIL_FAIL';
export const sharingProgramEmailFail = errorMessage => {
  return {
    type: SHARING_PROGRAM_EMAIL_FAIL,
    payload: errorMessage,
  };
};
