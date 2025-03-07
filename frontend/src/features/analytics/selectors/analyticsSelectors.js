const getAnalyticsData = state => state.analytics;
export const getAnalytics = state => getAnalyticsData(state).data;

export const getFBPixelContentViewTrackedEventIDs = state => getAnalyticsData(state).fbPixelContentViewTrackedEventIDs;
export const getFBPixelAddToCartTrackedEventIDs = state => getAnalyticsData(state).fbPixelAddToCartTrackedEventIDs;
export const getFBPixelInitiateCheckoutTrackedEventIDs = state => getAnalyticsData(state).fbPixelInitiateCheckoutTrackedEventIDs;
export const getFBPixelCompleteRegistrationTrackedEventIDs = state => getAnalyticsData(state).fbPixelCompleteRegistrationTrackedEventIDs;
export const getFBPixelPurchaseTrackedEventIDs = state => getAnalyticsData(state).fbFBPixelPurchaseTrackedEventIDs;

export const isFBPixelTracked = (eventIDs, eventID) => {
    if (eventIDs && eventIDs.size > 0 && eventID) {
        const isTracked = eventIDs.has( eventID );
        return eventIDs.has( eventID );
    }
    return false;
}
