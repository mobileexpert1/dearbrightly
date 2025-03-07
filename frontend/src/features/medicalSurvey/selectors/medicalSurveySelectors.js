import { createSelector } from 'reselect';

const getMedicalSurveyData = state => state.medicalSurvey;

export const getMedicalVisit = state => getMedicalSurveyData(state).visit;

export const getMedicalVisitData = createSelector(getMedicalVisit, ({ visit }) => visit);

export const getMedicalVisits = state => getMedicalSurveyData(state).visits;

export const getProgressAnswers = state => getMedicalSurveyData(state).userAnswers;

export const getCurrentQuestionnaireStep = state => getMedicalSurveyData(state).skinProfileStep;

export const getNextButtonState = state => getMedicalSurveyData(state).disableNextButton;

export const getQuestionsLength = state => getMedicalSurveyData(state).questionsLength;

export const getQuestionnaireAnswers = state => getMedicalSurveyData(state).answers;

export const isUploadingPhoto = state => getMedicalSurveyData(state).isUploadingPhoto;

export const getUploadingPhotoType = state => getMedicalSurveyData(state).photoType;

export const isUploadPhotoSuccess = state => getMedicalSurveyData(state).isUploadPhotoSuccess;
export const isSubmitConsentSuccess = state => getMedicalSurveyData(state).submitConsentSuccess;
export const isSubmittingConsentRequest = state => getMedicalSurveyData(state).isSubmittingConsentRequest;
export const sendQuestionnaireAnswersSuccess = state => getMedicalSurveyData(state).sendQuestionnaireAnswersSuccess;
export const isSendingQuestionnaireAnswers = state => getMedicalSurveyData(state).isSendingQuestionnaireAnswers;

// Error Message Selectors
export const getMedicalVisitErrorMessage = state => getMedicalSurveyData(state).visitErrorMessage;
export const getPhotoErrorMessage = state => getMedicalSurveyData(state).photoErrorMessage;
export const getQuestionnaireErrorMessage = state => getMedicalSurveyData(state).questionnaireErrorMessage;
export const getQuestionnaireAnswersErrorMessage = state => getMedicalSurveyData(state).questionnaireAnswersErrorMessage;
export const getSubmitConsentErrorMessage = state => getMedicalSurveyData(state).submitConsentError;

export const getSortedMedicalVisits = createSelector(
  getMedicalVisits,
  medicalVisits =>
    medicalVisits && medicalVisits.length > 0
      ? medicalVisits.sort(function(a, b) {
          return new Date(b.createdDatetime) - new Date(a.createdDatetime);
        })
      : {},
);

export const getMostRecentMedicalVisit = createSelector(
  getSortedMedicalVisits,
  sortedMedicalVisits =>
    sortedMedicalVisits && sortedMedicalVisits.length > 0 ? sortedMedicalVisits[0] : {},
);

export const getQuestionnaireQuestions = createSelector(
  getMedicalVisit, visit => visit.questionnaire && visit.questionnaire.questions,
);

export const getQuestionnaireId = createSelector(
  getMedicalVisit, visit => visit.questionnaire && visit.questionnaire.id,
);

export const getCompletedQuestionnaireQuestions = createSelector(
  getMedicalVisit, visit => visit.completedQuestionnaire && visit.completedQuestionnaire.questions,
);

export const getQuestionnaireCompletedAnswers = createSelector(
  getMedicalVisit,
  visit => visit.completedQuestionnaireAnswers && visit.completedQuestionnaireAnswers.answers,
);

export const isYearlyVisitQuestionnaire = createSelector(
  getMedicalVisit,
  visit => visit.service ? visit.service.includes('Repeat') : false,
);

export const isVisitBeingFetched = state => getMedicalSurveyData(state).isVisitBeingFetched;
export const isVisitFetchSuccess = state => getMedicalSurveyData(state).isVisitFetchSuccess;

export const isQuestionnaireFetchSuccess = state => getMedicalSurveyData(state).isQuestionnaireFetchSuccess;