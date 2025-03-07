import { combineEpics, ofType } from 'redux-observable';
import {switchMap, pluck, map} from 'rxjs/operators';
import { showSuccessToastNotification } from 'src/features/toastNotifications/actions/toastNotificationsActions';
import { getMostRecentVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { fetchPendingCheckoutOrderRequest } from 'src/features/orders/actions/ordersActions';

import * as action from 'src/features/checkout/actions/paymentActions';

export function paymentsEpicFactory(paymentService) {
    // ---- Uncomment if we ever switch back to Braintree ---
    // const fetchTokenEpic = action$ =>
    //     action$.pipe(
    //         ofType(action.GET_PAYMENT_TOKEN_REQUEST),
    //         switchMap(() =>
    //             paymentService
    //                 .fetchToken()
    //                 .then(action.getPaymentTokenSuccess)
    //                 .catch(action.getPaymentTokenFail),
    //         ),
    //     );
    //
    // const postNonceEpic = action$ =>
    //     action$.pipe(
    //         ofType(action.POST_PAYMENT_NONCE_REQUESTED),
    //         pluck('payload'),
    //         switchMap(({ orderId, nonce }) =>
    //             paymentService
    //                 .postNonce(orderId, nonce)
    //                 .then(action.postPaymentNonceSuccess)
    //                 .catch(action.postPaymentNonceFail),
    //         ),
    //     );

    const submitPaymentEpic = action$ =>
        action$.pipe(
            ofType(action.SUBMIT_PAYMENT_REQUEST),
            pluck('payload'),
            switchMap(({ order, token }) =>
                paymentService
                    .submitPayment(order, token)
                    .then(action.submitPaymentSuccess)
                    .catch(action.submitPaymentFail),
            ),
        );

    const stripeConnectEpic = action$ =>
        action$.pipe(
            ofType(action.STRIPE_CONNECT_FETCH_USER_ID_REQUEST),
            pluck('payload'),
            switchMap( ({ userUUID, authorizationCode }) =>
                paymentService
                    .stripeConnectFetchUserId(userUUID, authorizationCode)
                    .then(action.stripeConnectFetchUserIdSuccess)
                    .catch(action.stripeConnectFetchUserIdFail),
            ),
        );

    const updateCreditCardEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_CREDIT_CARD_REQUEST),
            pluck('payload'),
            switchMap(({ user, token, subscriptions }) =>
                paymentService
                    .updateCreditCard(user, token, subscriptions)
                    .then(action.updateCreditCardSuccess)
                    .catch(action.updateCreditCardFail),
            ),
        );

  const getRecentVisitEpic = action$ =>
    action$.pipe(
      ofType(action.UPDATE_CREDIT_CARD_SUCCESS),
      pluck('payload'),
      map(() => {
        return getMostRecentVisitRequest();
      }),
    );

  // const getPendingCheckoutOrderEpic = action$ =>
  //   action$.pipe(
  //     ofType(action.UPDATE_CREDIT_CARD_SUCCESS),
  //     pluck('payload'),
  //     map(() => {
  //       return fetchPendingCheckoutOrderRequest();
  //     }),
  //   );

    const getPaymentMethodsEpic = action$ =>
      action$.pipe(
        ofType(action.GET_PAYMENT_METHODS_REQUEST),
        pluck('payload'),
        switchMap((userId) =>
          paymentService
            .getCustomerPaymentMethod(userId)
            .then(action.getPaymentMethodsSuccess)
            .catch(action.getPaymentMethodsFail),
        ),
      );

      const getDefaultPaymentMethodEpic = action$ =>
      action$.pipe(
        ofType(action.GET_DEFAULT_PAYMENT_METHOD_REQUEST),
        pluck('payload'),
        switchMap((userId) =>
          paymentService
            .getCustomerDefaultPaymentMethod(userId)
            .then(action.getDefaultPaymentMethodSuccess)
            .catch(action.getDefaultPaymentMethodFail),
        ),
      );

    return combineEpics(stripeConnectEpic, submitPaymentEpic, updateCreditCardEpic, getPaymentMethodsEpic, getRecentVisitEpic, getDefaultPaymentMethodEpic);
}
