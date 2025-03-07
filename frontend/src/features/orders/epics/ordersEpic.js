import { combineEpics, ofType } from 'redux-observable';
import { switchMap, map, pluck } from 'rxjs/operators';

import { APP_INIT } from 'src/common/actions/init';

import { showSuccessToastNotification } from 'src/features/toastNotifications/actions/toastNotificationsActions';
import * as action from '../actions/ordersActions';

export function ordersEpicFactory(ordersService) {

  const fetchOrderEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_ORDER_REQUEST),
      pluck('payload'),
      switchMap(data =>
        ordersService
          .fetchOrder(data)
          .then(action.fetchOrderSuccess)
          .catch(action.fetchOrderFail),
      ),
    );

  const fetchOrdersEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_ORDERS_REQUEST),
      pluck('payload'),
      switchMap(data =>
        ordersService
          .fetchOrdersList(data)
          .then(action.fetchOrdersSuccess)
          .catch(action.fetchOrdersFail),
      ),
    );
  
  const fetchOrdersExportEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_ORDERS_EXPORT_REQUEST),
      pluck('payload'),
      switchMap(data => 
        ordersService
          .fetchOrdersExport(data)
          .then(action.fetchOrdersExportSuccess)
          .catch(action.fetchOrdersExportFail)
        ),
    );

  const fetchCustomerOrdersEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_CUSTOMER_ORDERS_REQUEST),
      pluck('payload'),
      switchMap((customerUUID) =>
        ordersService
          .fetchCustomerOrdersList(customerUUID)
          .then(action.fetchCustomerOrdersSuccess)
          .catch(action.fetchCustomerOrdersFail),
      ),
    );

  const archiveOrdersEpic = action$ =>
    action$.pipe(
      ofType(action.ARCHIVE_ORDERS_REQUEST),
      pluck('payload'),
      switchMap(ordersIds =>
        ordersService
          .archiveOrders(ordersIds)
          .then(action.archiveOrdersSuccess)
          .catch(action.archiveOrdersFail),
      ),
    );

  const archiveOrdersNotificationEpic = action$ =>
    action$.pipe(
      ofType(action.ARCHIVE_ORDERS_SUCCESS),
      pluck('payload'),
      map(ids => {
        const message = ids.length > 1 ? 'Orders' : `Order id: ${ids[0]}`;

        return showSuccessToastNotification(`${message} successfully archived`);
      }),
    );

  const fetchOrderStatusesEpic = action$ =>
    action$.pipe(
      ofType(
        action.FETCH_ORDER_STATUSES_REQUEST,
        action.FETCH_ORDERS_SUCCESS,
        action.FETCH_CUSTOMER_ORDERS_SUCCESS,
      ),
      switchMap(() =>
        ordersService
          .fetchOrderStatuses()
          .then(action.fetchOrderStatusesSuccess)
          .catch(action.fetchOrderStatusesFail),
      ),
    );

  return combineEpics(
    fetchOrderEpic,
    fetchOrdersEpic,
    fetchOrdersExportEpic,
    archiveOrdersEpic,
    archiveOrdersNotificationEpic,
    fetchOrderStatusesEpic,
    fetchCustomerOrdersEpic,
  );
}
