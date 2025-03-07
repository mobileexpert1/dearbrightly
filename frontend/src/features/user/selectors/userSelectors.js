import { createSelector } from 'reselect';

export const getUser = state => state.user;
export const getUserData = createSelector(getUser, ({ user }) => user);

export const getUserId = createSelector(getUserData, ({ id }) => id);

export const isUserAuthenticated = createSelector(getUser, user => user && user.loggedIn);

export const getUserDateOfBirth = createSelector(getUser, ({ dateOfBirth }) => dateOfBirth);

export const getShippingAddressState = createSelector(getUser, ({ shippingAddressState }) => shippingAddressState);

export const getConsentToTelehealth = createSelector(getUser, ({ consentToTelehealth }) => consentToTelehealth);

export const getUserEligibilityStatus = createSelector(getUser, ({ isEligible }) => isEligible);

export const getUserEligibilityErrorMessage = createSelector(getUser, ({ eligibilityErrorMessage }) => eligibilityErrorMessage);

export const isSuperUserAuthenticated = createSelector(
    getUserData,
    userData => userData && userData.isSuperuser,
);

export const isUpdatingAccountDetails = createSelector(getUser, ({ updatingAccountDetails }) => updatingAccountDetails);
export const getUpdateAccountDetailsErrorMessage = createSelector(getUser, ({ updateAccountDetailsErrorMessage }) => updateAccountDetailsErrorMessage);
export const isUpdatingAccountDetailsSuccess = createSelector(getUser, ({ isUpdatedSuccessfully }) => isUpdatedSuccessfully);

export const isSuperUser = state => getUser(state).isSuperuser;

export const hasUnreadMessages = createSelector(getUser, user => {
  const userData = user ? user.user : null;
  const unreadMessages = userData && userData.hasUnreadMessages && !user.messagesRead;
  return unreadMessages;
});