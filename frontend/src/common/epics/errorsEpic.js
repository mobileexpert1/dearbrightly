import { combineEpics, ofType } from 'redux-observable';
import { pluck, tap, map, takeWhile } from 'rxjs/operators';
import errorMsg from 'src/common/components/Toast/index';

import { history } from 'src/history';

import { FETCH_PRODUCTS_FAILED } from 'src/features/products/actions/productsActions';
import {
    FETCH_ORDER_STATUSES_FAIL,
    FETCH_ORDERS_FAIL,
    UPDATE_ORDER_FAIL,
    UPDATE_PENDING_OR_CREATE_ORDER_FAIL,
    UPDATE_ORDER_SHIPPING_DETAILS_FAIL,
    ARCHIVE_ORDERS_FAIL,
    FETCH_CUSTOMER_ORDERS_FAIL
} from 'src/features/orders/actions/ordersActions';
import {
    FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL,
    GET_VISIT_FAIL,
    SEND_QUESTIONNAIRE_ANSWERS_FAIL,
    SEND_QUESTIONNAIRE_PHOTO_FAIL,
    SUBMIT_CONSENT_FAIL,
    CREATE_MEDICAL_VISIT_FAIL,
    MARK_MESSAGE_AS_READ_FAIL,
    SEND_MESSAGE_FAIL,
    GET_VISITS_FAIL,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { logOutRequest, LOG_OUT_FAIL } from 'src/features/auth/actions/authenticationActions';
import {
    FETCH_CUSTOMERS_FAIL,
    SUBMIT_ELIGIBILITY_FAIL,
    UPDATE_CUSTOMER_DATA_FAIL,
    REMOVE_CUSTOMERS_FAIL,
} from 'src/features/customers/actions/customersActions';
import {
    FETCH_USER_FAIL,
} from 'src/features/user/actions/userActions';
import {
    FETCH_SUBSCRIPTIONS_FAIL,
    UPDATE_SUBSCRIPTION_FAIL,
} from 'src/features/subscriptions/actions/subscriptionsActions';
import { VALIDATE_DISCOUNT_CODE_FAIL } from 'src/features/checkout/actions/discountActions';
import { FETCH_MESSAGES_FAIL } from 'src/features/dashboard/actions/messagesActions';
import { SUBMIT_PAYMENT_FAIL } from 'src/features/checkout/actions/paymentActions';
import { HTTP_REQUEST_AUTH_FAIL, GRAPHQL_REQUEST_AUTH_FAIL } from 'src/common/actions/httpRequestActions';
import {getEnvValue} from "src/common/helpers/getEnvValue";
const DEBUG = getEnvValue('DEBUG');
errorMsg.config({ maxCount: 1, top: 80, duration: 7 });


export function errorsEpicFactory() {
    const errorsEpic = action$ =>
        action$.pipe(
            ofType(
                FETCH_PRODUCTS_FAILED,
                FETCH_ORDER_STATUSES_FAIL,
                FETCH_MEDICAL_SURVEY_QUESTIONS_FAIL,
                FETCH_CUSTOMERS_FAIL,
                FETCH_CUSTOMER_ORDERS_FAIL,
                FETCH_ORDERS_FAIL,
                FETCH_SUBSCRIPTIONS_FAIL,
                FETCH_USER_FAIL,
                VALIDATE_DISCOUNT_CODE_FAIL,
                SUBMIT_ELIGIBILITY_FAIL,
                UPDATE_CUSTOMER_DATA_FAIL,
                UPDATE_ORDER_FAIL,
                UPDATE_ORDER_SHIPPING_DETAILS_FAIL,
                UPDATE_PENDING_OR_CREATE_ORDER_FAIL,
                UPDATE_SUBSCRIPTION_FAIL,
                REMOVE_CUSTOMERS_FAIL,
                ARCHIVE_ORDERS_FAIL,
                FETCH_MESSAGES_FAIL,
                MARK_MESSAGE_AS_READ_FAIL,
                SEND_MESSAGE_FAIL,
                GET_VISIT_FAIL,
                SEND_QUESTIONNAIRE_ANSWERS_FAIL,
                SEND_QUESTIONNAIRE_PHOTO_FAIL,
                SUBMIT_CONSENT_FAIL,
                CREATE_MEDICAL_VISIT_FAIL,
                GET_VISITS_FAIL,
                SUBMIT_PAYMENT_FAIL,
                HTTP_REQUEST_AUTH_FAIL,
                GRAPHQL_REQUEST_AUTH_FAIL,
            ),
            tap(action => {
                if (DEBUG) {
                    console.log(`Errors epic: ${action.payload} -> Action type: ${action.type}`);
                    if (action.payload.body && action.payload.body.detail) {
                        const requireLogin = payloadRequiresLogin(action.payload);
                        console.log(`Errors epic action paylod body: ${action.payload.body}.
                            Action payload body detail: ${action.payload.body.detail}.
                            Payload requires login: ${requireLogin}`);
                    }
                }
            }),
            pluck('payload'),
            takeWhile(payload => {
                return payloadRequiresLogin(payload);
            }),
            map(logOutRequest),
            tap(() => errorMsg.info('Your session has expired. Please log in again.', 3)),
            tap(() => history.push('/login')),
        );

    return combineEpics(errorsEpic);
}

const payloadRequiresLogin = payload => {
    return (
        payload ?
            (payload === 'Token refresh error.' ||
                payload === 'Refresh has expired.' ||
                payload === 'Error: Unauthorized' ||
                payload === 401 ||
                (payload.body && payload.body.detail === 'Authentication credentials were not provided.') ||
                (payload.body && payload.body.detail === 'Token refresh error.') ||
                (payload.body && payload.body.detail === 'Refresh has expired.') ||
                (payload.body && payload.body.detail === 'Error: Unauthorized') ||
                (payload.body && payload.body.detail === 'User is unauthorized.') ||
                (payload.body && payload.body.detail === 'Signature has expired.')) :
            false
    );
}