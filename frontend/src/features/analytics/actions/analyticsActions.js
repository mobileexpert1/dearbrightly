export const SET_FB_PIXEL_TRACKED = 'SET_FB_PIXEL_TRACKED';
export const setFBPixelTracked = (eventName, eventId) => ({
  type: SET_FB_PIXEL_TRACKED,
  payload: { eventName, eventId },
});
