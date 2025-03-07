import { combineEpics, ofType } from 'redux-observable';
import {map, mergeMap, pluck} from 'rxjs/operators';
import { showSuccessToastNotification } from 'src/features/toastNotifications/actions/toastNotificationsActions';
import * as action from '../actions/passwordResetActions';

export function passwordResetEpicFactory(authService) {
    const requestPasswordResetEmailEpic = action$ =>
        action$.pipe(
            ofType(action.REQUEST_PASSWORD_RESET_EMAIL_REQUESTED),
            pluck('payload'),
            mergeMap(email =>
                authService
                    .requestPasswordResetEmail(email)
                    .then(() =>
                        action.requestPasswordResetEmailSuccess(
                            'Password reset link has been sent to your email address.',
                        ),
                    )
                    .catch(action.requestPasswordResetEmailFail),
            ),
        );
    const requestPasswordResetEmailSuccessEpic = action$ =>
    action$.pipe(
        ofType(action.REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED),
        map(() => showSuccessToastNotification(`Reset password email sent.`)),
    );

    const verifyPasswordResetTokenEpic = action$ =>
        action$.pipe(
            ofType(action.VERIFY_PASSWORD_RESET_TOKEN_REQUESTED),
            pluck('payload'),
            mergeMap(token =>
                authService
                    .verifyPasswordResetToken(token)
                    .then(action.verifyPasswordResetTokenSuccess)
                    .catch(action.verifyPasswordResetTokenFail),
            ),
        );

    const setNewPasswordEpic = action$ =>
        action$.pipe(
            ofType(action.SET_NEW_PASSWORD_REQUESTED),
            pluck('payload'),
            mergeMap(data =>
                authService
                    .setNewPassword(data)
                    .then(() =>
                        action.setNewPasswordSuccess(
                            'Your new password has now been set and you are able to log in.',
                        ),
                    )
                    .catch(action.setNewPasswordFail),
            ),
        );

    return combineEpics(
        requestPasswordResetEmailEpic,
        requestPasswordResetEmailSuccessEpic,
        verifyPasswordResetTokenEpic,
        setNewPasswordEpic,
    );
}
