import { combineEpics, ofType } from 'redux-observable';
import { map, switchMap, pluck } from 'rxjs/operators';
import * as action from 'src/features/orders/actions/ordersActions';
import {
    showSuccessToastNotification,
} from 'src/features/toastNotifications/actions/toastNotificationsActions';


export function orderEpicFactory(ordersService) {
  const createOrderEpic = action$ =>
    action$.pipe(
        ofType(action.CREATE_ORDER_REQUEST),
        pluck('payload'),
        switchMap(order =>
          ordersService
            .createOrder(order)
            .then(action.createOrderSuccess)
            .catch(action.createOrderFail),
        ),
    );

  const updatePendingOrCreateOrderEpic = action$ =>
    action$.pipe(
        ofType(action.UPDATE_PENDING_OR_CREATE_ORDER_REQUEST),
        pluck('payload'),
        switchMap(order =>
            ordersService
                .updatePendingOrCreateOrder(order)
                .then(action.updatePendingOrCreateOrderSuccess)
                .catch(action.updatePendingOrCreateOrderFail),
        ),
    );

  const updateOrderEpic = action$ =>
    action$.pipe(
        ofType(action.UPDATE_ORDER_REQUEST),
        pluck('payload'),
        switchMap(order =>
            ordersService
                .updateOrderDetails(order)
                .then(action.updateOrderSuccess)
                .catch(action.updateOrderFail),
        ),
    );

  // const updateOrderSuccessEpic = action$ =>
  //   action$.pipe(
  //       ofType(action.UPDATE_ORDER_SUCCESS),
  //       map(() => showSuccessToastNotification(`Update success.`)),
  //   );

  // const updateOrderFailEpic = action$ =>
  //   action$.pipe(
  //       ofType(action.UPDATE_ORDER_FAIL),
  //       pluck('payload'),
  //       map(errorMessage => showErrorToastNotification(`Update failed.`)),
  //   );

  const updateOrderShippingDetailsEpic = action$ =>
    action$.pipe(
        ofType(action.UPDATE_ORDER_SHIPPING_DETAILS_REQUEST),
        pluck('payload'),
        switchMap(order =>
            ordersService
                .updatePendingOrCreateOrder(order)
                .then(action.updateOrderShippingDetailsSuccess)
                .catch(action.updateOrderShippingDetailsFail),
        ),
    );

  const fetchPendingCheckoutOrderEpic = action$ =>
    action$.pipe(
        ofType(action.FETCH_PENDING_CHECKOUT_ORDER_REQUEST),
        switchMap( () =>
            ordersService
                .fetchPendingCheckoutOrders()
                .then(action.fetchPendingCheckoutOrderSuccess)
                .catch(action.fetchPendingCheckoutOrderFail)
        ),
    );

  return combineEpics(
    createOrderEpic,
    updatePendingOrCreateOrderEpic,
    updateOrderEpic,
    // updateOrderFailEpic,
    // updateOrderSuccessEpic,
    updateOrderShippingDetailsEpic,
    fetchPendingCheckoutOrderEpic,
  );
}

