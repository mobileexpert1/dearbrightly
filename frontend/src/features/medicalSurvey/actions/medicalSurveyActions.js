export const FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST = 'FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST';
export const fetchMedicalSurveyQuestionsRequest = visit => ({
  type: FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST,
  payload: visit,
});

export const FETCH_MEDICAL_SURVEY_QUESTIONS_SUCCESS = 'FETCH_MEDICAL_SURVEY_QUESTIONS_SUCCESS';
export const fetchMedicalSurveyQuestionsSuccess = questions => ({
  type: FETCH_MEDICAL_SURVEY_QUESTIONS_SUCCESS,
  payload: questions,
});

export const FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL = 'FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL';
export const fetchMedicalSurveyQuestionsFail = errorMessage => ({
  type: FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL,
  payload: errorMessage,
});

export const SEND_QUESTIONNAIRE_ANSWERS_REQUEST = 'SEND_QUESTIONNAIRE_ANSWERS_REQUEST';
export const sendQuestionnaireAnswersRequest = data => ({
  type: SEND_QUESTIONNAIRE_ANSWERS_REQUEST,
  payload: data,
});

export const SEND_QUESTIONNAIRE_ANSWERS_SUCCESS = 'SEND_QUESTIONNAIRE_ANSWERS_SUCCESS';
export const sendQuestionnaireAnswersSuccess = data => ({
  type: SEND_QUESTIONNAIRE_ANSWERS_SUCCESS,
  payload: data,
});

export const SEND_QUESTIONNAIRE_ANSWERS_CLEAR_ERROR_REQUEST =
  'SEND_QUESTIONNAIRE_ANSWERS_CLEAR_ERROR_REQUEST';
export const sendQuestionnaireAnswersClearErrorRequest = () => ({
  type: SEND_QUESTIONNAIRE_ANSWERS_CLEAR_ERROR_REQUEST,
});

export const SEND_QUESTIONNAIRE_ANSWERS_FAIL = 'SEND_QUESTIONNAIRE_ANSWERS_FAIL';
export const sendQuestionnaireAnswersFail = errorMessage => ({
  type: SEND_QUESTIONNAIRE_ANSWERS_FAIL,
  payload: errorMessage,
});

export const CREATE_MEDICAL_VISIT_REQUEST = 'CREATE_MEDICAL_VISIT_REQUEST';
export const createMedicalVisitRequest = data => ({
  type: CREATE_MEDICAL_VISIT_REQUEST,
  payload: data,
});

export const CREATE_MEDICAL_VISIT_SUCCESS = 'CREATE_MEDICAL_VISIT_SUCCESS';
export const createMedicalVisitSuccess = visit => ({
  type: CREATE_MEDICAL_VISIT_SUCCESS,
  payload: visit,
});

export const CREATE_MEDICAL_VISIT_FAIL = 'CREATE_MEDICAL_VISIT_FAIL';
export const createMedicalVisitFail = errorMessage => ({
  type: CREATE_MEDICAL_VISIT_FAIL,
  payload: errorMessage,
});

export const GET_VISIT_REQUEST = 'GET_VISIT_REQUEST';
export const getVisitRequest = visitId => ({
  type: GET_VISIT_REQUEST,
  payload: visitId,
});

export const GET_VISIT_SUCCESS = 'GET_VISIT_SUCCESS';
export const getVisitSuccess = visit => ({
  type: GET_VISIT_SUCCESS,
  payload: visit,
});

export const GET_VISIT_FAIL = 'GET_VISIT_FAIL';
export const getVisitFail = errorMessage => ({
  type: GET_VISIT_FAIL,
  payload: errorMessage,
});

export const SEND_QUESTIONNAIRE_PHOTO_REQUEST = 'SEND_QUESTIONNAIRE_PHOTO_REQUEST';
export const sendQuestionnairePhotoRequest = data => ({
  type: SEND_QUESTIONNAIRE_PHOTO_REQUEST,
  payload: data,
});

export const SEND_QUESTIONNAIRE_PHOTO_SUCCESS = 'SEND_QUESTIONNAIRE_PHOTO_SUCCESS';
export const sendQuestionnairePhotoSuccess = visit => ({
  type: SEND_QUESTIONNAIRE_PHOTO_SUCCESS,
  payload: visit,
});

export const SEND_QUESTIONNAIRE_PHOTO_FAIL = 'SEND_QUESTIONNAIRE_PHOTO_FAIL';
export const sendQuestionnairePhotoFail = errorMessage => ({
  type: SEND_QUESTIONNAIRE_PHOTO_FAIL,
  payload: errorMessage,
});

export const SUBMIT_CONSENT_REQUEST = 'SUBMIT_CONSENT_REQUEST';
export const submitConsentRequest = visitId => ({
  type: SUBMIT_CONSENT_REQUEST,
  payload: visitId,
});

export const SUBMIT_CONSENT_SUCCESS = 'SUBMIT_CONSENT_SUCCESS';
export const submitConsentSuccess = visit => ({
  type: SUBMIT_CONSENT_SUCCESS,
  payload: visit,
});

export const SUBMIT_CONSENT_FAIL = 'SUBMIT_CONSENT_FAIL';
export const submitConsentFail = errorMessage => ({
  type: SUBMIT_CONSENT_FAIL,
  payload: errorMessage,
});

export const GET_PENDING_OR_CREATE_VISIT_REQUEST = 'GET_PENDING_OR_CREATE_VISIT_REQUEST';
export const getPendingOrCreateVisitRequest = (userUUID, status, consentToTelehealth) => ({
  type: GET_PENDING_OR_CREATE_VISIT_REQUEST,
  payload: { userUUID, status, consentToTelehealth },
});

export const GET_PENDING_OR_CREATE_VISIT_SUCCESS = 'GET_PENDING_OR_CREATE_VISIT_SUCCESS';
export const getPendingOrCreateVisitSuccess = visit => ({
  type: GET_PENDING_OR_CREATE_VISIT_SUCCESS,
  payload: visit,
});

export const GET_PENDING_OR_CREATE_VISIT_FAIL = 'GET_PENDING_OR_CREATE_VISIT_FAIL';
export const getPendingOrCreateVisitFail = errorMessage => ({
  type: GET_PENDING_OR_CREATE_VISIT_FAIL,
  payload: errorMessage,
});

export const GET_PENDING_VISIT_REQUEST = 'GET_PENDING_VISIT_REQUEST';
export const getPendingVisitRequest = userId => ({
  type: GET_PENDING_VISIT_REQUEST,
  payload: userId,
});

export const GET_PENDING_VISIT_SUCCESS = 'GET_PENDING_VISIT_SUCCESS';
export const getPendingVisitSuccess = visit => ({
  type: GET_PENDING_VISIT_SUCCESS,
  payload: visit,
});

export const GET_PENDING_VISIT_FAIL = 'GET_PENDING_VISIT_FAIL';
export const getPendingVisitFail = errorMessage => ({
  type: GET_PENDING_VISIT_FAIL,
  payload: errorMessage,
});

export const GET_MOST_RECENT_VISIT_REQUEST = 'GET_MOST_RECENT_VISIT_REQUEST';
export const getMostRecentVisitRequest = () => ({
  type: GET_MOST_RECENT_VISIT_REQUEST,
});

export const GET_MOST_RECENT_VISIT_SUCCESS = 'GET_MOST_RECENT_VISIT_SUCCESS';
export const getMostRecentVisitSuccess = visit => ({
  type: GET_MOST_RECENT_VISIT_SUCCESS,
  payload: visit,
});

export const GET_MOST_RECENT_VISIT_FAIL = 'GET_MOST_RECENT_VISIT_FAIL';
export const getMostRecentVisitFail = errorMessage => ({
  type: GET_MOST_RECENT_VISIT_FAIL,
  payload: errorMessage,
});

export const GET_VISITS_REQUEST = 'GET_VISITS_REQUEST';
export const getVisitsRequest = () => ({
  type: GET_VISITS_REQUEST,
});

export const GET_VISITS_SUCCESS = 'GET_VISITS_SUCCESS';
export const getVisitsSuccess = visits => ({
  type: GET_VISITS_SUCCESS,
  payload: visits,
});

export const GET_VISITS_FAIL = 'GET_VISITS_FAIL';
export const getVisitsFail = errorMessage => ({
  type: GET_VISITS_FAIL,
  payload: errorMessage,
});

export const SAVE_USER_ANSWERS = 'SAVE_USER_ANSWERS';
export const saveUserAnswers = answers => {
  return { type: SAVE_USER_ANSWERS, payload: answers };
};

export const SAVE_QUESTIONNAIRE_ANSWERS = 'SAVE_QUESTIONNAIRE_ANSWERS';
export const saveQuestionnaireAnswers = answers => {
  return { type: SAVE_QUESTIONNAIRE_ANSWERS, payload: answers };
};

export const SET_CURRENT_STEP = 'SET_CURRENT_STEP';
export const setCurrentStep = (skinProfileStep, questionsLength) => {
  return { type: SET_CURRENT_STEP, payload: { skinProfileStep, questionsLength } };
};

export const DISABLE_NEXT_BUTTON = 'DISABLE_NEXT_BUTTON';
export const disableNextButton = value => {
  return { type: DISABLE_NEXT_BUTTON, payload: value };
};
