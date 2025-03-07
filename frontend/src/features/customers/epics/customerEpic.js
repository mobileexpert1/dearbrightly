import { combineEpics, ofType } from 'redux-observable';
import { switchMap, pluck } from 'rxjs/operators';

import * as action from '../actions/customerActions';

export function customerEpicFactory(customersService) {
  const fetchCustomerEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_CUSTOMER_REQUEST),
      pluck('payload'),
      switchMap(id =>
        customersService
          .fetchCustomer(id)
          .then(action.fetchCustomerSuccess)
          .catch(action.fetchCustomerFail),
      ),
    );

  return combineEpics(fetchCustomerEpic);
}
