import {
  SET_FB_PIXEL_TRACKED,
} from 'src/features/analytics/actions/analyticsActions';

const initialState = {
  fbPixelContentViewTrackedEventIDs: new Set(),
  fbPixelAddToCartTrackedEventIDs: new Set(),
  fbPixelInitiateCheckoutTrackedEventIDs: new Set(),
  fbPixelCompleteRegistrationTrackedEventIDs: new Set(),
  fbFBPixelPurchaseTrackedEventIDs: new Set(),
};

export const analytics = (state = initialState, action) => {
  switch (action.type) {
    case SET_FB_PIXEL_TRACKED:
      if (action.payload.eventId) {
        const eventID = action.payload.eventId;
        if (action.payload.eventName === "ContentView") {
          return {
            ...state,
            fbPixelContentViewTrackedEventIDs: state.fbPixelContentViewTrackedEventIDs.add(eventID),
          }
        }

        if (action.payload.eventName === "AddToCart") {
          return {
            ...state,
            fbPixelAddToCartTrackedEventIDs: state.fbPixelAddToCartTrackedEventIDs.add(eventID),
          }
        }

        if (action.payload.eventName === "InitiateCheckout") {
          return {
            ...state,
            fbPixelInitiateCheckoutTrackedEventIDs: state.fbPixelInitiateCheckoutTrackedEventIDs.add(eventID),
          }
        }

        if (action.payload.eventName === "CompleteRegistration") {
          return {
            ...state,
            fbPixelCompleteRegistrationTrackedEventIDs: state.fbPixelCompleteRegistrationTrackedEventIDs.add(eventID),
          }
        }

        if (action.payload.eventName === "Purchase") {
          return {
            fbPixelContentViewTrackedEventIDs: state.fbPixelContentViewTrackedEventIDs,
            fbPixelAddToCartTrackedEventIDs: new Set(),
            fbPixelInitiateCheckoutTrackedEventIDs: new Set(),
            fbPixelCompleteRegistrationTrackedEventIDs: state.fbPixelCompleteRegistrationTrackedEventIDs,
            fbFBPixelPurchaseTrackedEventIDs: state.fbFBPixelPurchaseTrackedEventIDs.add(eventID),
          }
        }
      } else {
        return state;
      }

    default:
      return state;
  }
};
