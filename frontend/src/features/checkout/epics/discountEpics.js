import { combineEpics, ofType } from 'redux-observable';
import { switchMap, pluck } from 'rxjs/operators';

import * as action from 'src/features/checkout/actions/discountActions';

export function discountEpicFactory(checkoutService) {
  const getDiscountEpic = action$ =>
    action$.pipe(
      ofType(action.GET_DISCOUNT_CODE_REQUEST),
      pluck('payload'),
      switchMap(data =>
        checkoutService
          .getDiscount(data)
          .then(action.getDiscountCodeSuccess)
          .catch(action.getDiscountCodeFail),
      ),
    );

  const removeDiscountEpic = action$ =>
    action$.pipe(
      ofType(action.REMOVE_DISCOUNT_CODE_REQUEST),
      pluck('payload'),
      switchMap(orderId =>
        checkoutService
          .removeDiscount(orderId)
          .then(action.removeDiscountCodeSuccess)
          .catch(action.removeDiscountCodeFail),
      ),
    );

  return combineEpics(getDiscountEpic, removeDiscountEpic);
}
