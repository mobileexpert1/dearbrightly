import { createSelector } from 'reselect';

const getSharingProgramData = state => state.sharingProgram;

const extractType = (_state, codeType) => codeType;

export const getReferralCodes = createSelector(
  getSharingProgramData,
  extractType,
  (sharingCodes, communicationMethod) => sharingCodes[communicationMethod],
);

export const getSharingEntryPoint = state => getSharingProgramData(state).entryPoint;

export const getSharingEmailType = state => getSharingProgramData(state).emailType;

export const getSharingEmailReminderIntervalInDays = state =>
  getSharingProgramData(state).emailReminderIntervalInDays;

export const getSharingReferrerEmail = state => getSharingProgramData(state).referrerEmail;

export const getIsEmailSent = state => getSharingProgramData(state).isEmailSent;

export const getIsGenerated = state => getSharingProgramData(state).isGenerated;

export const getEmailPending = state => getSharingProgramData(state).emailPending;

export const getEmailError = state => getSharingProgramData(state).emailError;
