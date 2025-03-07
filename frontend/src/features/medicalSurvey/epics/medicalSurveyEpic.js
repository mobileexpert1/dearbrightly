import { combineEpics, ofType } from 'redux-observable';
import { switchMap, pluck } from 'rxjs/operators';
import * as action from '../actions/medicalSurveyActions';

export function medicalSurveyEpicFactory(medicalSurveyService) {
  const fetchMedicalSurveyQuestionsEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_MEDICAL_SURVEY_QUESTIONS_REQUEST),
      pluck('payload'),
      switchMap(visitId =>
        medicalSurveyService
          .fetchMedicalSurveyQuestions(visitId)
          .then(action.fetchMedicalSurveyQuestionsSuccess)
          .catch(action.fetchMedicalSurveyQuestionsFail),
      ),
    );

  const sendQuestionnaireAnswersEpic = action$ =>
    action$.pipe(
      ofType(action.SEND_QUESTIONNAIRE_ANSWERS_REQUEST),
      pluck('payload'),
      switchMap(answers =>
        medicalSurveyService
          .sendQuestionnaireAnswers(answers)
          .then(action.sendQuestionnaireAnswersSuccess)
          .catch(action.sendQuestionnaireAnswersFail),
      ),
    );

  // const sendQuestionnaireAnswersFailEpic = action$ =>
  //     action$.pipe(
  //         ofType(action.SEND_QUESTIONNAIRE_ANSWERS_FAIL),
  //         pluck('payload'),
  //         map(errorMessage => showErrorToastNotification(`Unable to submit questions: ${errorMessage}`)),
  //     );

  // const sendQuestionnaireAnswersSucceededEpic = action$ =>
  //     action$.pipe(
  //         ofType(action.SEND_QUESTIONNAIRE_ANSWERS_SUCCESS),
  //         pluck('payload'),
  //         map(() => showSuccessToastNotification(`Successfully submitted answers.`)),
  //     );

  const createMedicalVisitEpic = action$ =>
    action$.pipe(
        ofType(action.CREATE_MEDICAL_VISIT_REQUEST),
        pluck('payload'),
        switchMap(orderId =>
            medicalSurveyService
                .createMedicalVisit(orderId)
                .then(action.createMedicalVisitSuccess)
                .catch(action.createMedicalVisitFail),
        ),
    );

  const getPendingOrCreateVisitEpic = action$ =>
      action$.pipe(
          ofType(action.GET_PENDING_OR_CREATE_VISIT_REQUEST),
          pluck('payload'),
          switchMap(data =>
              medicalSurveyService
                  .getPendingOrCreateVisit(data)
                  .then(action.getPendingOrCreateVisitSuccess)
                  .catch(action.getPendingOrCreateVisitFail),
          ),
      );

  const getPendingVisitEpic = action$ =>
    action$.pipe(
      ofType(action.GET_PENDING_VISIT_REQUEST),
      pluck('payload'),
      switchMap(userId =>
        medicalSurveyService
          .getPendingVisit(userId)
          .then(action.getPendingVisitSuccess)
          .catch(action.getPendingVisitFail),
      ),
    );

  const getMostRecentVisitEpic = action$ =>
    action$.pipe(
      ofType(action.GET_MOST_RECENT_VISIT_REQUEST),
      pluck('payload'),
      switchMap(userId =>
        medicalSurveyService
          .getMostRecentVisit()
          .then(action.getMostRecentVisitSuccess)
          .catch(action.getMostRecentVisitFail),
      ),
    );

  const getVisitEpic = action$ =>
    action$.pipe(
      ofType(action.GET_VISIT_REQUEST),
      pluck('payload'),
      switchMap(visitId =>
        medicalSurveyService
          .getVisit(visitId)
          .then(action.getVisitSuccess)
          .catch(action.getVisitFail),
      ),
    );

  const sendQuestionnairePhotoRequestEpic = action$ =>
    action$.pipe(
      ofType(action.SEND_QUESTIONNAIRE_PHOTO_REQUEST),
      pluck('payload'),
      switchMap(data =>
        medicalSurveyService
          .sendQuestionnairePhoto(data)
          .then(action.sendQuestionnairePhotoSuccess)
          .catch(action.sendQuestionnairePhotoFail),
      ),
    );

  const submitConsentRequestEpic = action$ =>
    action$.pipe(
      ofType(action.SUBMIT_CONSENT_REQUEST),
      pluck('payload'),
      switchMap(visitId =>
        medicalSurveyService
          .submitConsent(visitId)
          .then(action.submitConsentSuccess)
          .catch(action.submitConsentFail),
      ),
    );

  // const submitConsentSuccessEpic = action$ =>
  //     action$.pipe(
  //         ofType(action.SUBMIT_CONSENT_SUCCESS),
  //         map(() => showSuccessToastNotification(`Succesfully submitted consent.`)),
  //     );
  //
  // const submitConsentFailEpic = action$ =>
  //     action$.pipe(
  //         ofType(action.SUBMIT_CONSENT_FAIL),
  //         pluck('payload'),
  //         map(errorMessage => showErrorToastNotification(`Unable to submit consent: ${errorMessage}.`)),
  //     );

  const getVisitsEpic = action$ =>
    action$.pipe(
      ofType(action.GET_VISITS_REQUEST),
      switchMap(() =>
        medicalSurveyService
          .getVisits()
          .then(action.getVisitsSuccess)
          .catch(action.getVisitsFail),
      ),
    );

  return combineEpics(
    fetchMedicalSurveyQuestionsEpic,
    sendQuestionnaireAnswersEpic,
    createMedicalVisitEpic,
    getMostRecentVisitEpic,
    getPendingOrCreateVisitEpic,
    getPendingVisitEpic,
    getVisitEpic,
    sendQuestionnairePhotoRequestEpic,
    submitConsentRequestEpic,
    getVisitsEpic,
  );
}
