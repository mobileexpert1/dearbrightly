import { combineEpics, ofType } from 'redux-observable';
import { switchMap } from 'rxjs/operators';

import { APP_INIT } from 'src/common/actions/init';

import * as action from '../actions/productsActions';

export function productsEpicFactory(productsService) {
    const fetchProductsEpic = action$ =>
        action$.pipe(
            ofType(action.FETCH_PRODUCTS_REQUESTED, APP_INIT),
            switchMap(() =>
                productsService
                    .fetchProductsList()
                    .then(action.fetchProductsSuccess)
                    .catch(action.fetchProductsFail),
            ),
        );
    return combineEpics(fetchProductsEpic);
}
