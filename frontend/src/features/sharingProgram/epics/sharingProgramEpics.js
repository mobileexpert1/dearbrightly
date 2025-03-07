import { combineEpics, ofType } from 'redux-observable';
import { switchMap, pluck } from 'rxjs/operators';
import * as action from 'src/features/sharingProgram/actions/sharingProgramActions';

export function sharingProgramEpicFactory(sharingProgramService) {
  const getSharingProgramCodeEpic = action$ =>
    action$.pipe(
      ofType(action.GET_SHARING_PROGRAM_CODE_REQUEST),
      pluck('payload'),
      switchMap(
        ({
          entryPoint,
          communicationMethod,
          emailType,
          emailReminderIntervalInDays,
          referrerEmail,
        }) =>
          sharingProgramService
            .getSharingProgramCode(
              entryPoint,
              communicationMethod,
              emailType,
              emailReminderIntervalInDays,
              referrerEmail,
            )
            .then(action.getSharingProgramCodeSuccess)
            .catch(action.getSharingProgramCodeFail),
      ),
    );

  const sendSharingEmailEpic = action$ =>
    action$.pipe(
      ofType(action.SHARING_PROGRAM_EMAIL_REQUEST),
      pluck('payload'),
      switchMap(({ refereeEmail, entryPoint, emailType, emailReminderIntervalInDays }) =>
        sharingProgramService
          .sendSharingEmail(refereeEmail, entryPoint, emailType, emailReminderIntervalInDays)
          .then(action.sharingProgramEmailSuccess)
          .catch(action.sharingProgramEmailFail),
      ),
    );

  return combineEpics(getSharingProgramCodeEpic, sendSharingEmailEpic);
}
