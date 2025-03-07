import { combineEpics, ofType } from 'redux-observable';
import { map, pluck, tap } from 'rxjs/operators';

import { history } from 'src/history';

import {
    REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
    VERIFY_PASSWORD_RESET_TOKEN_FAILED,
    SET_NEW_PASSWORD_SUCCEEDED,
} from 'src/features/auth/actions/passwordResetActions';

import { REDIRECT_TO_URL, redirectToUrl, redirectToUrlSuccess } from '../actions/navigationActions';

export function navigationEpicFactory() {
    const navigationRedirectEpic = action$ =>
        action$.pipe(
            ofType(REDIRECT_TO_URL),
            pluck('payload'),
            tap(history.push),
            map(redirectToUrlSuccess),
        );

    const redirectToHomePageScreenEpic = action$ =>
        action$.pipe(
            ofType(
                REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
                VERIFY_PASSWORD_RESET_TOKEN_FAILED,
                SET_NEW_PASSWORD_SUCCEEDED,
            ),
            map(() => redirectToUrl('/')),
        );

    return combineEpics(navigationRedirectEpic, redirectToHomePageScreenEpic);
}
