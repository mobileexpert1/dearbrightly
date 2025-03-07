import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import {
  FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL,
  FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST,
  FETCH_MEDICAL_SURVEY_QUESTIONS_SUCCESS,
  CREATE_MEDICAL_VISIT_REQUEST,
  CREATE_MEDICAL_VISIT_SUCCESS,
  CREATE_MEDICAL_VISIT_FAIL,
  GET_VISIT_REQUEST,
  GET_VISIT_SUCCESS,
  GET_VISIT_FAIL,
  GET_VISITS_REQUEST,
  GET_VISITS_SUCCESS,
  GET_VISITS_FAIL,
  GET_PENDING_OR_CREATE_VISIT_REQUEST,
  GET_PENDING_OR_CREATE_VISIT_SUCCESS,
  GET_PENDING_OR_CREATE_VISIT_FAIL,
  GET_PENDING_VISIT_REQUEST,
  GET_PENDING_VISIT_SUCCESS,
  GET_PENDING_VISIT_FAIL,
  GET_MOST_RECENT_VISIT_REQUEST,
  GET_MOST_RECENT_VISIT_SUCCESS,
  GET_MOST_RECENT_VISIT_FAIL,
  SEND_QUESTIONNAIRE_ANSWERS_REQUEST,
  SEND_QUESTIONNAIRE_ANSWERS_SUCCESS,
  SEND_QUESTIONNAIRE_ANSWERS_FAIL,
  SEND_QUESTIONNAIRE_PHOTO_REQUEST,
  SEND_QUESTIONNAIRE_PHOTO_SUCCESS,
  SEND_QUESTIONNAIRE_PHOTO_FAIL,
  SUBMIT_CONSENT_REQUEST,
  SUBMIT_CONSENT_SUCCESS,
  SUBMIT_CONSENT_FAIL,
  SAVE_USER_ANSWERS,
  SAVE_QUESTIONNAIRE_ANSWERS,
  SET_CURRENT_STEP,
  DISABLE_NEXT_BUTTON,
} from '../actions/medicalSurveyActions';

const defaultState = {
  questionnaireErrorMessage: '',
  questionnaireAnswersErrorMessage: '',
  submitConsentError: '',
  photoErrorMessage: '',
  visitErrorMessage: '',

  isQuestionnaireFetching: false,
  isQuestionnaireFetchSuccess: false,
  name: '',
  description: '',
  questionnaire: [],
  isVisitBeingFetched: false,
  isVisitFetchSuccess: false,
  visit: {},
  visits: {},
  isUploadingPhoto: false,
  isUploadPhotoSuccess: false,
  // Answer Questionnaire States
  sendQuestionnaireAnswersSuccess: false,
  isSendingQuestionnaireAnswers: false,
  submitConsentSuccess: false,
  userAnswers: [],
  answers: [],
  skinProfileStep: 0,
  questionsLength: 0,
  photoType: '',
  disableNextButton: true,
};

export const medicalSurvey = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST:
      return {
        ...state,
        isQuestionnaireFetching: true,
        isQuestionnaireFetchSuccess: false,
        questionnaireErrorMessage: '',
      };

    case FETCH_MEDICAL_SURVEY_QUESTIONS_SUCCESS:
      return {
        ...state,
        isQuestionnaireFetching: false,
        isQuestionnaireFetchSuccess: true,
        questionnaireErrorMessage: '',
        questionnaire: action.payload,
      };

    case FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL:
      return {
        ...state,
        isQuestionnaireFetching: false,
        isQuestionnaireFetchSuccess: false,
        questionnaireErrorMessage: action.payload,
      };

    case CREATE_MEDICAL_VISIT_REQUEST:
      return {
        ...state,
        isVisitBeingFetched: true,
        isVisitFetchSuccess: false,
        visitErrorMessage: '',
      };

    case CREATE_MEDICAL_VISIT_SUCCESS:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: true,
        visit: action.payload,
        visitErrorMessage: '',
      };

    case CREATE_MEDICAL_VISIT_FAIL:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: false,
        visitErrorMessage: action.payload,
      };
    case GET_VISITS_REQUEST:
    case GET_VISIT_REQUEST:
    case GET_MOST_RECENT_VISIT_REQUEST:
      return {
        ...state,
        isVisitBeingFetched: true,
        isVisitFetchSuccess: false,
        visitErrorMessage: '',
      };

    case GET_VISIT_SUCCESS:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: true,
        visit: action.payload,
        visitErrorMessage: '',
      };
    case GET_MOST_RECENT_VISIT_SUCCESS:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: true,
        visit: action.payload[0] ? action.payload[0] : {},
        visitErrorMessage: '',
      };
    case GET_VISITS_SUCCESS:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: true,
        visits: action.payload,
        visitErrorMessage: '',
      };
    case GET_VISITS_FAIL:
    case GET_VISIT_FAIL:
    case GET_MOST_RECENT_VISIT_FAIL:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: false,
        visitErrorMessage: action.payload,
      };

    case SUBMIT_CONSENT_REQUEST:
      return {
        ...state,
        isSubmittingConsentRequest: true,
        submitConsentSuccess: false,
        submitConsentError: '',
      };
    case SUBMIT_CONSENT_SUCCESS:
      return {
        ...state,
        isSubmittingConsentRequest: false,
        submitConsentSuccess: true,
        submitConsentError: '',
        visit: action.payload,
      };

    case SUBMIT_CONSENT_FAIL:
      return {
        ...state,
        isSubmittingConsentRequest: false,
        submitConsentSuccess: false,
        submitConsentError: action.payload,
      };
    case LOG_OUT_SUCCESS:
      return {
        ...defaultState,
      };

    case SEND_QUESTIONNAIRE_PHOTO_REQUEST:
      return {
        ...state,
        photoErrorMessage: '',
        isUploadingPhoto: true,
        isUploadPhotoSuccess: false,
        photoType: action.payload.photo_type,
      };
    case SEND_QUESTIONNAIRE_PHOTO_SUCCESS:
      return {
        ...state,
        photoErrorMessage: '',
        isUploadingPhoto: false,
        isUploadPhotoSuccess: true,
        visit: action.payload,
        photoType: '',
      };

    case SEND_QUESTIONNAIRE_PHOTO_FAIL:
      return {
        ...state,
        photoErrorMessage: action.payload,
        isUploadingPhoto: false,
        isUploadPhotoSuccess: false,
      };
    case GET_PENDING_VISIT_REQUEST:
    case GET_PENDING_OR_CREATE_VISIT_REQUEST:
      return {
        ...state,
        isVisitBeingFetched: true,
        isVisitFetchSuccess: false,
        visitErrorMessage: '',
      };
    case GET_PENDING_VISIT_SUCCESS:
    case GET_PENDING_OR_CREATE_VISIT_SUCCESS:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: true,
        visit: action.payload,
        visitErrorMessage: '',
      };
    case GET_PENDING_VISIT_FAIL:
    case GET_PENDING_OR_CREATE_VISIT_FAIL:
      return {
        ...state,
        isVisitBeingFetched: false,
        isVisitFetchSuccess: false,
        visitErrorMessage: action.payload,
      };

    // ---- QUESTIONNAIRE ANSWERS ---- //
    case SEND_QUESTIONNAIRE_ANSWERS_REQUEST:
      return {
        ...state,
        sendQuestionnaireAnswersSuccess: false,
        isSendingQuestionnaireAnswers: true,
        questionnaireAnswersErrorMessage: '',
      };

    case SEND_QUESTIONNAIRE_ANSWERS_SUCCESS:
      return {
        ...state,
        visit: action.payload,
        sendQuestionnaireAnswersSuccess: true,
        isSendingQuestionnaireAnswers: false,
        questionnaireAnswersErrorMessage: '',
      };

    case SEND_QUESTIONNAIRE_ANSWERS_FAIL:
      return {
        ...state,
        sendQuestionnaireAnswersSuccess: false,
        isSendingQuestionnaireAnswers: false,
        questionnaireAnswersErrorMessage: action.payload,
      };
    case SAVE_USER_ANSWERS:
      return {
        ...state,
        userAnswers: action.payload,
      };
    case SAVE_QUESTIONNAIRE_ANSWERS:
      return {
        ...state,
        answers: action.payload,
      };

    case SET_CURRENT_STEP:
      return {
        ...state,
        skinProfileStep: action.payload.skinProfileStep,
        questionsLength: action.payload.questionsLength,
      };

    case DISABLE_NEXT_BUTTON:
      return {
        ...state,
        disableNextButton: action.payload,
      };
    default:
      return state;
  }
};
