import { store } from "src/index"


export const NAVIGATE_CHECKOUT = 'NAVIGATE_CHECKOUT';
export const navigateCheckout = (currentStepName, showCheckoutModal) => {
  return {
    type: NAVIGATE_CHECKOUT,
    currentStepName,
    showCheckoutModal,
  };
};

export const NAVIGATE_NEXT = 'NAVIGATE_NEXT';
export const navigateNext = () => {
  return {
    type: NAVIGATE_NEXT,
    order: store.getState().order.data,
    isAuthenticated: store.getState().authentication.isAuthenticated,
  };
};

export const NAVIGATE_BACK = 'NAVIGATE_BACK';
export const navigateBack = () => {
  return {
    type: NAVIGATE_BACK,
    isAuthenticated: store.getState().authentication.isAuthenticated,
  };
};

export const NAVIGATE_AFTER_SIGN_UP = 'NAVIGATE_AFTER_SIGN_UP';
export const navigateAfterSignUp = () => {
  return { type: NAVIGATE_AFTER_SIGN_UP };
};

// export const SET_NAVIGATION_TYPE = 'SET_NAVIGATION_TYPE';
// export const setNavigationType = (onboardingFlowType) => {
//   return {
//     type: SET_NAVIGATION_TYPE,
//     onboardingFlowType,
//   };
// };

// Navigates checkout according to the order status
export const NAVIGATE_ORDER_CHECKOUT = 'NAVIGATE_ORDER_CHECKOUT';
export const navigateOrderCheckout = ( showCheckoutModal ) => {
  const orderData = store.getState().order.data;
  const visitData = store.getState().medicalSurvey.visit;
  return {
    type: NAVIGATE_ORDER_CHECKOUT,
    showCheckoutModal: showCheckoutModal,
    order: orderData,
    visit: visitData,
  };
};