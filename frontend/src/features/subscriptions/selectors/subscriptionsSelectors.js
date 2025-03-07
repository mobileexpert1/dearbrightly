import { createSelector } from 'reselect';
import moment from 'moment';
import {ORDER_STATUSES} from "src/common/constants/orders";

const getSubscriptionsData = state => state.subscriptions;

export const getSubscriptions = state => getSubscriptionsData(state).data;

export const getSubscriptionsErrorMessage = state => getSubscriptionsData(state).errorMessage;

export const isFetchingSubscriptions = state => getSubscriptionsData(state).isFetching;

export const isSubscriptionFetchSuccess = state => getSubscriptionsData(state).isFetchSuccess;

export const isUpdatingSubscription = state => getSubscriptionsData(state).isUpdating;

export const isSubscriptionUpdateSuccess = state => getSubscriptionsData(state).isUpdatedSuccessfully;

export const isUpdatingShippingDetails = state => getSubscriptionsData(state).isUpdatingShippingDetails;

export const isUpdateShippingDetailsSuccess = state => getSubscriptionsData(state).isUpdateShippingDetailsSuccess;

export const updateShippingDetailsError = state => getSubscriptionsData(state).updateShippingDetailsError;

export const getOtcSubscriptions = createSelector(getSubscriptions, (subscriptions) =>
    subscriptions.filter(subscription => {
        return subscription.productType === 'OTC';
    }),
);

export const getActiveSubscriptions = createSelector(getSubscriptions, (subscriptions) =>
    subscriptions.filter(subscription => {
        return subscription.isActive === true
    }),
);

export const getActiveLegacySubscriptions = createSelector(getActiveSubscriptions, (subscriptions) =>
    subscriptions.filter(subscription => {
        return (subscription.shippingDetails == null && subscription.paymentDetails == null)
    }),
);

export const getActiveNonLegacySubscriptions = createSelector(getActiveSubscriptions, (subscriptions) =>
    subscriptions.filter(subscription => {
        return (subscription.shippingDetails != null || subscription.paymentDetails != null)
    }),
);

export const getRxSubscriptions = createSelector(getSubscriptions, (subscriptions) =>
    subscriptions.filter(subscription => {
        return subscription.productType === 'Rx'
    }),
);

export const getSortedRxSubscriptions = createSelector(getRxSubscriptions, (subscriptions) =>
    (subscriptions.length > 0) ? subscriptions.sort(function(a,b) {
      return new Date(b.createdDatetime) - new Date(a.createdDatetime);}) : null
);

export const getMostRecentRxSubscription = createSelector(getSortedRxSubscriptions, (sortedSubscriptions) =>
  (sortedSubscriptions) ? sortedSubscriptions[0] : null
);

export const getSubscriptionShippingInNextTwoWeeks = createSelector(getActiveLegacySubscriptions, subscriptions =>
  subscriptions.filter(sub => {
    const isSubscriptionOrderPending = sub.currentOrder ? sub.currentOrder.status !== ORDER_STATUSES['Shipped'] : false
    const nextShipmentDate = moment(new Date(sub.currentPeriodEndDatetime));
    const hoursUntilNextShipment = nextShipmentDate.diff(moment(), 'hours');
    return sub.isActive && hoursUntilNextShipment < 336 && hoursUntilNextShipment >= -72 && !isSubscriptionOrderPending;
  }),
);

export const isWithinDaysOfDate = (date1, date2, days) => {
    const formattedDate1 = moment(new Date(date1));
    const formattedDate2 = moment(new Date(date2));
    const hoursBetweenDates = formattedDate2.diff(formattedDate1, 'hours');
    return hoursBetweenDates <= 24*days && hoursBetweenDates >= -24*days;
}

export const filterDateSubscriptionsMap = (map, excludeDate) => {
    const subscriptionBundles = {...map};
    const filterDate = Object.keys(map).find(date => isWithinDaysOfDate(excludeDate, date, 3));
    if (filterDate) {
      delete subscriptionBundles[filterDate];
    }
    return subscriptionBundles;
}

const shipDateToSubscriptionsMap = (subscriptions) => {
    let subscriptionsByDates = {};
    let subscriptionDate = null;

    if (subscriptions.length > 0) {
        subscriptionDate = subscriptions[0].currentPeriodEndDatetime;
        subscriptionsByDates[subscriptionDate] = [subscriptions[0]];
    } else {
        return subscriptionsByDates;
    }

    for (let i = 1; i < subscriptions.length; i++) {
        if (isWithinDaysOfDate(
            subscriptionDate,
            subscriptions[i].currentPeriodEndDatetime,
            3)) {
            subscriptionsByDates[subscriptionDate].push(subscriptions[i]);
        } else {
            subscriptionDate = subscriptions[i].currentPeriodEndDatetime;
            subscriptionsByDates[subscriptionDate] = [subscriptions[i]];
        }
    }
    return subscriptionsByDates;
}

export const getShipDateToSubscriptionsMap = createSelector(getActiveLegacySubscriptions, subscriptions => {
    return shipDateToSubscriptionsMap(subscriptions);
});

export const getShipDateToSubscriptionsMapForBundle = createSelector(getSubscriptionShippingInNextTwoWeeks, subscriptions => {
    const map = shipDateToSubscriptionsMap(subscriptions);
    return map;
});
