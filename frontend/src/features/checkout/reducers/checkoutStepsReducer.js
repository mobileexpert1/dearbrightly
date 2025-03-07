import {
  NAVIGATE_CHECKOUT,
  NAVIGATE_NEXT,
  NAVIGATE_BACK,
  NAVIGATE_ORDER_CHECKOUT,
  NAVIGATE_AFTER_SIGN_UP,
} from 'src/features/checkout/actions/checkoutStepsActions';

import { LOG_OUT_SUCCESS } from 'src/features/auth/actions/authenticationActions';
import {
  ONBOARDING_FLOW_CONTROL_DOUBLY_LINKED_LIST,
  ONBOARDING_FLOW_OTC_DOUBLY_LINKED_LIST,
  ONBOARDING_FLOW_TYPE_1_DOUBLY_LINKED_LIST,
  ONBOARDING_FLOW_TYPE_2_DOUBLY_LINKED_LIST,
  SKIP_PAYMENT_FLOW_DOUBLY_LINKED_LIST
} from 'src/common/constants/orders';
import { isOrderPendingPayment, isOrderPendingSkinProfileQuestions, isOrderPendingPhotos } from 'src/features/orders/helpers/orderStatuses';
import { isVisitPhotoIdUploadRequired } from 'src/features/dashboard/helpers/userStatuses';
import { UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS, FETCH_PENDING_CHECKOUT_ORDER_SUCCESS } from 'src/features/orders/actions/ordersActions'
import { paymentCheckoutType } from 'src/common/constants/payment';

// Navigation Reducer
const initialState = {
  checkoutStepsLinkedList: ONBOARDING_FLOW_TYPE_2_DOUBLY_LINKED_LIST,
  currentStepName: 'sign up',
  onboardingFlowType: null,
  showCheckoutModal: false,
};

export const checkoutSteps = (state = initialState, action) => {
  let currentStepNode = null;
  let order = null;

  switch (action.type) {
    case NAVIGATE_CHECKOUT:
      return {
        ...state,
        currentStepName: action.currentStepName,
        showCheckoutModal: action.showCheckoutModal,
      };
    case NAVIGATE_NEXT:
      order = action.order;
      let orderIsExpressCheckout = order ? (order.paymentCheckoutType !== paymentCheckoutType.CREDIT_CARD && order.paymentCheckoutType !== paymentCheckoutType.NONE) : false;
      let nextStepName = state.currentStepName;
      currentStepNode = state.checkoutStepsLinkedList ? state.checkoutStepsLinkedList.getNode(state.currentStepName) : null;
      const nextStepNode = currentStepNode ? currentStepNode.getNextNode() : null;

      nextStepName = nextStepNode ? nextStepNode.name : nextStepName;

      // If the user is already authenticated, skip the sign up page
      if (nextStepName === 'sign up' && action.isAuthenticated === true) {
        nextStepName = nextStepNode ? nextStepNode.getNextNode().name : null;
      }

      // Skip payment if the user did an express checkout with Google or Apple Pay
      if (nextStepName === 'payment' && orderIsExpressCheckout) {
        nextStepName = nextStepNode ? nextStepNode.getNextNode().name : null;
      }

      // If no order, navigate to your plan to show errors after user sign up
      if (!order && state.currentStepName === 'sign up') {
        nextStepName = 'your plan';
      }

      return {
        ...state,
        currentStepName: nextStepName,
      }
    case NAVIGATE_BACK:
      let prevStepName = state.currentStepName;
      currentStepNode = state.checkoutStepsLinkedList ? state.checkoutStepsLinkedList.getNode(state.currentStepName) : null;
      const prevStepNode = currentStepNode ? currentStepNode.getPrevNode() : null;
      prevStepName = prevStepNode ? prevStepNode.name : 'sign up';

      // If the user is already authenticated, skip the sign up page
      if (prevStepName === 'sign up' && action.isAuthenticated === true) {
        prevStepName = prevStepNode ? prevStepNode.getPrevNode().name : null;
      }

      return {
        ...state,
        currentStepName: prevStepName,
      }
    case NAVIGATE_AFTER_SIGN_UP:
      let afterSignUpStepName = 'sign up';
      const signUpStepNode = state.checkoutStepsLinkedList ? state.checkoutStepsLinkedList.getNode('sign up') : null;
      afterSignUpStepName = signUpStepNode ? signUpStepNode.getNextNode().name : afterSignUpStepName;

      return {
        ...state,
        currentStepName: afterSignUpStepName,
        showCheckoutModal: true,
      }
    case LOG_OUT_SUCCESS:
      return {
        ...initialState,
      };
    case UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS:
    case FETCH_PENDING_CHECKOUT_ORDER_SUCCESS:
      const onboardingFlowType = action.payload.onboardingFlowType;

      if (!onboardingFlowType) {
        return {
          ...state,
        }
      }

      let linkedList = ONBOARDING_FLOW_CONTROL_DOUBLY_LINKED_LIST;
      if (onboardingFlowType === 'otc') {
        linkedList = ONBOARDING_FLOW_OTC_DOUBLY_LINKED_LIST;
      } else if (onboardingFlowType === 'variation_1') {
        linkedList = ONBOARDING_FLOW_TYPE_1_DOUBLY_LINKED_LIST;
      } else if (onboardingFlowType === 'variation_2') {
        linkedList = ONBOARDING_FLOW_TYPE_2_DOUBLY_LINKED_LIST;
      } else if (onboardingFlowType === 'skip_payment') {
        linkedList = SKIP_PAYMENT_FLOW_DOUBLY_LINKED_LIST;
      }

      return {
        ...state,
        onboardingFlowType: onboardingFlowType,
        checkoutStepsLinkedList: linkedList,
      };

    // case SET_NAVIGATION_TYPE:
    //   let linkedList = ONBOARDING_FLOW_CONTROL_DOUBLY_LINKED_LIST;
    //   if (action.onboardingFlowType === 'otc') {
    //     linkedList = ONBOARDING_FLOW_OTC_DOUBLY_LINKED_LIST;
    //   } else if (action.onboardingFlowType === 'variation_1') {
    //     linkedList = ONBOARDING_FLOW_TYPE_1_DOUBLY_LINKED_LIST;
    //   } else if (action.onboardingFlowType === 'variation_2') {
    //     linkedList = ONBOARDING_FLOW_TYPE_2_DOUBLY_LINKED_LIST;
    //   }
    //
    //   return {
    //     ...state,
    //     onboardingFlowType: action.onboardingFlowType,
    //     checkoutStepsLinkedList: linkedList,
    //   };

    case NAVIGATE_ORDER_CHECKOUT:
      order = action.order;
      const consentAccepted = action.visit.consentToTelehealth;
      const visitPhotoIdUploadRequired = isVisitPhotoIdUploadRequired(action.visit);
      let nextOrderStep = 'sign up';

      if (isOrderPendingPayment(order)) {
        nextOrderStep = 'shipping';
      }
      if (isOrderPendingSkinProfileQuestions(order)) {
        nextOrderStep = 'skin profile';
      }
      if (isOrderPendingPhotos(order)) {
        if (visitPhotoIdUploadRequired) {
          nextOrderStep = 'photo id';
        } else {
          nextOrderStep = 'photos';
        }
      }

      return {
        ...state,
        currentStepName: nextOrderStep,
        showCheckoutModal: action.showCheckoutModal,
      }
    default:
      return state;
  }
};
