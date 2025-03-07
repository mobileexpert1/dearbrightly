import { combineEpics, ofType } from 'redux-observable';
import { switchMap, map, pluck } from 'rxjs/operators';

import { showSuccessToastNotification } from 'src/features/toastNotifications/actions/toastNotificationsActions';

import * as action from '../actions/customersActions';
import * as customerAction from '../actions/customerActions';


export function customersEpicFactory(customersService) {
  const fetchCustomersEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_CUSTOMERS_REQUEST),
      pluck('payload'),
      switchMap(data =>
        customersService
          .fetchCustomersList(data)
          .then(action.fetchCustomersSuccess)
          .catch(action.fetchCustomersFail),
      ),
    );

  const fetchCustomersExportEpic = action$ => 
    action$.pipe(
      ofType(action.FETCH_CUSTOMERS_EXPORT_REQUEST),
      pluck('payload'),
      switchMap(data => 
        customersService
          .fetchCustomersExport(data)
          .then(action.fetchCustomersExportSuccess)
          .catch(action.fetchCustomersExportFail),
      ),
    );

  const removeCustomersEpic = action$ =>
    action$.pipe(
      ofType(action.REMOVE_CUSTOMERS_REQUEST),
      pluck('payload'),
      switchMap(customersIds =>
        customersService
          .removeCustomers(customersIds)
          .then(action.removeCustomersSuccess)
          .catch(action.removeCustomersFail),
      ),
    );

  const removeCustomersNotificationEpic = action$ =>
    action$.pipe(
      ofType(action.REMOVE_CUSTOMERS_SUCCESS),
      map(() => showSuccessToastNotification('Successfully removed')),
    );

  const updateCustomerDataEpic = action$ =>
    action$.pipe(
      ofType(action.UPDATE_CUSTOMER_DATA_REQUEST),
      pluck('payload'),
      // switchMap(data =>
      //     from(customersService.updateCustomerData(data)).pipe(
      //         switchMap(data => [
      //             action.updateCustomerDataSuccess(data),
      //         ]),
      //         catchError(action.updateCustomerDataFail),
      //     ),
      // ),
      switchMap(customerData =>
        customersService
          .updateCustomerData(customerData)
          .then(action.updateCustomerDataSuccess)
          .catch(action.updateCustomerDataFail),
      ),
    );

  const submitEligibilityEpic = action$ =>
    action$.pipe(
      ofType(action.SUBMIT_ELIGIBILITY_REQUEST),
      pluck('payload'),
      switchMap(data =>
        customersService
          .updateCustomerData(data.customer)
          .then(() => action.submitEligibilitySuccess(data))
          .catch(action.submitEligilityFail),
      ),
    );

  const unsubscribeCustomerEpic = action$ =>
    action$.pipe(
      ofType(customerAction.UNSUBSCRIBE_CUSTOMER_REQUEST),
      pluck('payload'),
      switchMap(({ email, token }) =>
        customersService
          .unsubscribeCustomer(email, token)
          .then(customerAction.unsubscribeCustomerSuccess)
          .catch(customerAction.unsubscribeCustomerFail),
      ),
    );

  return combineEpics(
    fetchCustomersEpic,
    fetchCustomersExportEpic,
    removeCustomersEpic,
    removeCustomersNotificationEpic,
    submitEligibilityEpic,
    updateCustomerDataEpic,
    unsubscribeCustomerEpic
  );
}
