import { combineEpics, ofType } from 'redux-observable';
import { map, pluck, tap, takeWhile } from 'rxjs/operators';
import message from 'src/common/components/Toast/index';

import {
    VERIFY_PASSWORD_RESET_TOKEN_FAILED,
    SET_NEW_PASSWORD_SUCCEEDED,
    REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
} from 'src/features/auth/actions/passwordResetActions';
import {
    REMOVE_CUSTOMERS_FAIL,
    UPDATE_CUSTOMER_DATA_FAIL,
} from 'src/features/customers/actions/customersActions';
import {
    ARCHIVE_ORDERS_FAIL,
    UPDATE_ORDER_FAIL,
} from 'src/features/orders/actions/ordersActions';
import {
    SEND_QUESTIONNAIRE_PHOTO_SUCCESS
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';

import {
    SHOW_ERROR_TOAST_NOTIFICATION,
    SHOW_SUCCESS_TOAST_NOTIFICATION,
    SHOW_WARNING_TOAST_NOTIFICATION,
    showToastNotificationSuccess,
} from '../actions/toastNotificationsActions';

export const toastNotificationsEpicFactory = () => {
    const showWarningToastNotificationEpic = action$ =>
        action$.pipe(
            ofType(SHOW_WARNING_TOAST_NOTIFICATION),
            pluck('payload'),
            tap(message.warning),
            map(showToastNotificationSuccess),
        );

    const showErrorToastNotificationEpic = action$ =>
        action$.pipe(
            ofType(
                SHOW_ERROR_TOAST_NOTIFICATION,
                VERIFY_PASSWORD_RESET_TOKEN_FAILED,
                REMOVE_CUSTOMERS_FAIL,
                ARCHIVE_ORDERS_FAIL,
                UPDATE_CUSTOMER_DATA_FAIL,
                UPDATE_ORDER_FAIL,
            ),
            pluck('payload'),
            takeWhile(payload => payload.code !== 401),
            tap(message.error),
            map(showToastNotificationSuccess),
        );

    const showSuccessToastNotificationEpic = action$ =>
        action$.pipe(
            ofType(
                SHOW_SUCCESS_TOAST_NOTIFICATION,
                SET_NEW_PASSWORD_SUCCEEDED,
                REQUEST_PASSWORD_RESET_EMAIL_SUCCEEDED,
            ),
            pluck('payload'),
            tap(message.success),
            map(showToastNotificationSuccess),
        );

    return combineEpics(
        showWarningToastNotificationEpic,
        showSuccessToastNotificationEpic,
        showErrorToastNotificationEpic,
    );
};
