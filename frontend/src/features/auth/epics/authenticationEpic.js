import { combineEpics, ofType } from 'redux-observable';
import { mergeMap, pluck, tap, map, delay, takeWhile, switchMap } from 'rxjs/operators';
import message from 'src/common/components/Toast/index';
import { history } from 'src/history';
import { APP_INIT } from 'src/common/actions/init';
import * as actions from 'src/features/auth/actions/authenticationActions';
import { deleteCookie } from 'src/common/helpers/manageCookies';
import { fetchSubscriptionsRequest } from 'src/features/subscriptions/actions/subscriptionsActions';
import { getMostRecentVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { store } from 'src/index';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import { fetchUserRequest } from 'src/features/user/actions/userActions';

export function authenticationEpicFactory(authService, storageService) {
  const registerUserEpic = action$ =>
    action$.pipe(
      ofType(actions.REGISTER_USER_REQUEST),
      pluck('payload'),
      mergeMap(payload =>
        authService
          .registerUser(payload.credentials)
          .then(response => {
            tap(message.success(response, 3));
            return actions.registerUserSuccess(payload.credentials);
          })
          .catch(actions.registerUserFail),
      ),
    );

  // TODO (Alda) - Consolidate logic related to the callbackLink
  const facebookAuthenticationEpic = action$ =>
    action$.pipe(
      ofType(actions.FACEBOOK_AUTHENTICATION_REQUEST),
      pluck('payload'),
      mergeMap(payload =>
        authService
          .facebookAuthentication(payload.credentials)
          .then(response => {
            if (response && response.otpRequired) {
              return actions.setOtpRequired(response);
            }
            handleRedirect(response);
            return actions.logInSuccess(response);
          })
          .catch(err => {
            return actions.logInFail(err);
          }),
      ),
    );

  const logInAfterRegisterEpic = action$ =>
    action$.pipe(
      ofType(actions.REGISTER_USER_SUCCESS),
      pluck('payload'),
      map(payload => {
        const { credentials } = payload;
        const { email, password } = credentials;

        deleteCookie('share_code');

        GTMUtils.trackCall('checkout_login');

        return actions.logInRequest({ email, password });
      }),
    );

  const logInEpic = action$ =>
    action$.pipe(
      ofType(actions.LOG_IN_REQUEST),
      pluck('payload'),
      mergeMap(payload =>
        authService
          .logIn(payload)
          .then(response => {
            if (response && response.otpRequired) {
              return actions.setOtpRequired(response);
            }
            handleRedirect(response);
            return actions.logInSuccess(response);
          })
          .catch(err => {
            return actions.logInFail(err);
          }),
      ),
    );

  const otpValidationEpic = action$ =>
    action$.pipe(
      ofType(actions.VALIDATE_OTP_REQUEST),
      pluck('payload'),
      mergeMap(payload =>
        authService
          .validateOTPCode(payload.code, payload.enable2faTimeout)
          .then(response => {
            handleRedirect(response);
            return actions.logInSuccess(response);
          })
          .catch(err => {
            return actions.validateOtpFail(err);
          }),
      ),
    );

  const twoFactorSetupEpic = action$ =>
    action$.pipe(
      ofType(actions.TWO_FACTOR_SETUP_REQUEST),
      switchMap(() =>
        authService
          .get2faSetupCode()
          .then(actions.twoFactorSetupSuccess)
          .catch(actions.twoFactorSetupFail),
      ),
    );

  const twoFactorConfirmRequestEpic = action$ =>
    action$.pipe(
      ofType(actions.TWO_FACTOR_CONFIRM_REQUEST),
      pluck('payload'),
      switchMap(payload =>
        authService
          .confirm2FA(payload.code, payload.secretKey)
          .then(actions.twoFactorConfirmSuccess)
          .catch(actions.twoFactorConfirmFail),
      ),
    );

  const disableTwoFactorEpic = action$ =>
    action$.pipe(
      ofType(actions.TWO_FACTOR_DISABLE_REQUEST),
      pluck('payload'),
      switchMap(payload =>
        authService
          .disable2FA(payload)
          .then(actions.disableTwoFactorSuccess)
          .catch(actions.disableTwoFactorFail),
      ),
    );

  const logOutEpic = action$ =>
    action$.pipe(
      ofType(actions.LOG_OUT_REQUEST),
      tap(() => authService.logOut().catch(actions.logOutFail)),
      tap(() => localStorage.removeItem('redirect_url')),
      map(actions.logOutSuccess),
    );

  const getCurrentUserSubscriptionsEpic = action$ =>
    action$.pipe(
      ofType(actions.LOG_IN_SUCCESS),
      pluck('payload'),
      map(payload => {
        return fetchSubscriptionsRequest(payload.id);
      }),
    );

  const getCurrentUserRecentVisitEpic = action$ =>
    action$.pipe(
      ofType(actions.LOG_IN_SUCCESS),
      pluck('payload'),
      map(() => {
        return getMostRecentVisitRequest();
      }),
    );

  const refreshLoginEpic = action$ =>
    action$.pipe(
      ofType(APP_INIT),
      delay(800),
      takeWhile(() => {
        const state = JSON.parse(storageService.getItem('state'));
        return !!state && state.authentication && state.authentication.isAuthenticated;
      }),
      tap(() => actions.authenticateUser()),
      map(() => {
        const id = storageService.getItem('uuid');
        if (id) {
          return fetchUserRequest(id);
        }
      }),
    );

  const clearLoginErrorEpic = action$ =>
    action$.pipe(
      ofType(actions.LOG_IN_FAIL),
      delay(5000),
      map(actions.clearLoginError),
    );

  const toggleOtpTimeout = action$ =>
    action$.pipe(
      ofType(actions.TOGGLE_OTP_TIMEOUT_REQUEST),
      switchMap(() =>
        authService
          .toggleOtpTimeout()
          .then(response => {
            return actions.toggleOtpTimeoutSuccess(response);
          })
          .catch(e => {
            return actions.toggleOtpTimeoutFail(e);
          }),
      ),
    );

  const handleRedirect = response => {
    var redirectURL = localStorage.getItem('redirect_url', null);

    if (redirectURL) {
      history.push(redirectURL);
      localStorage.removeItem('redirect_url');
    } else {
      if (response.isSuperuser) {
        history.push('/admin-dashboard');
      } else if (response.isMedicalProvider || response.isMedicalAdmin) {
        history.push('/emr/visits#status=Provider%20Pending%20Action&service=&state=');
      } else {
        history.push('/user-dashboard');
      }
    }
  };

  return combineEpics(
    toggleOtpTimeout,
    registerUserEpic,
    facebookAuthenticationEpic,
    logOutEpic,
    logInEpic,
    otpValidationEpic,
    twoFactorSetupEpic,
    twoFactorConfirmRequestEpic,
    disableTwoFactorEpic,
    logInAfterRegisterEpic,
    getCurrentUserSubscriptionsEpic,
    getCurrentUserRecentVisitEpic,
    refreshLoginEpic,
    clearLoginErrorEpic,
  );
}
