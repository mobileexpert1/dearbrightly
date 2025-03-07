import { combineEpics, ofType } from 'redux-observable';
import { switchMap, pluck } from 'rxjs/operators';

import * as action from 'src/features/user/actions/userActions';

export function userEpicFactory(userService) {
  const fetchUserEpic = action$ =>
    action$.pipe(
      ofType(action.FETCH_USER_REQUEST),
      pluck('payload'),
      switchMap(id =>
        userService
          .fetchUser(id)
          .then(action.fetchUserSuccess)
          .catch(action.fetchUserFail),
      ),
    );

  return combineEpics(fetchUserEpic);
}
