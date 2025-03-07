import { combineEpics, ofType } from 'redux-observable';
import { switchMap, map, pluck } from 'rxjs/operators';

import * as action from '../actions/subscriptionsActions';
import { showSuccessToastNotification } from 'src/features/toastNotifications/actions/toastNotificationsActions';

export function subscriptionsEpicFactory(subscriptionsService) {

    const fetchSubscriptionsEpic = action$ =>
        action$.pipe(
            ofType(action.FETCH_SUBSCRIPTIONS_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .fetchSubscriptionsList(data)
                    .then(action.fetchSubscriptionsSuccess)
                    .catch(action.fetchSubscriptionsFail),
            ),
        );

    const updateSubscriptionEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_SUBSCRIPTION_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .updateSubscription(data)
                    .then(action.updateSubscriptionSuccess)
                    .catch(action.updateSubscriptionFail),
            ),
        );

    const updateSubscriptionsEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_SUBSCRIPTIONS_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .updateSubscriptions(data)
                    .then(action.updateSubscriptionsSuccess)
                    .catch(action.updateSubscriptionsFail),
            ),
        );

    const createSubscriptionEpic = action$ =>
        action$.pipe(
            ofType(action.CREATE_SUBSCRIPTION_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .createSubscription(data)
                    .then(action.createSubscriptionSuccess)
                    .catch(action.createSubscriptionFail),
            ),
        );

    const updateOrCreateSubscriptionEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_OR_CREATE_SUBSCRIPTION_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .updateOrCreateSubscription(data)
                    .then(action.updateOrCreateSubscriptionSuccess)
                    .catch(action.updateOrCreateSubscriptionFail),
            ),
        );

    const updateShippingDetailsEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_SHIPPING_DETAILS_REQUEST),
            pluck('payload'),
            switchMap(data =>
                subscriptionsService
                    .updateShippingDetails(data)
                    .then(action.updateShippingDetailsSuccess)
                    .catch(action.updateShippingDetailsFail),
            ),
        );

    const updateSubscriptionSuccessEpic = action$ =>
        action$.pipe(
            ofType(action.UPDATE_SUBSCRIPTION_SUCCESS),
            map(() => showSuccessToastNotification(`Subscription update succeeded.`)),
        );

    // const updateSubscriptionFailEpic = action$ =>
    //     action$.pipe(
    //         ofType(action.UPDATE_SUBSCRIPTION_FAIL),
    //         pluck('payload'),
    //         map(errorMessage => showErrorToastNotification(`Subscription update failed.`)),
    //     );

    return combineEpics(
        fetchSubscriptionsEpic,
        updateSubscriptionEpic,
        updateSubscriptionSuccessEpic,
        createSubscriptionEpic,
        updateOrCreateSubscriptionEpic,
        updateSubscriptionsEpic,
        updateShippingDetailsEpic,
        // updateSubscriptionFailEpic
    );
}
