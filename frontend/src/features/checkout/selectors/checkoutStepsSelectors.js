import { createSelector } from 'reselect';
import {
  ONBOARDING_FLOW_CONTROL,
  ONBOARDING_FLOW_OTC,
  ONBOARDING_FLOW_TYPE_1,
  ONBOARDING_FLOW_TYPE_2,
  SKIP_PAYMENT_FLOW,
  ONBOARDING_FLOW_CONTROL_PROGRESS_BAR,
  ONBOARDING_FLOW_OTC_PROGRESS_BAR,
  ONBOARDING_FLOW_TYPE_1_PROGRESS_BAR,
  ONBOARDING_FLOW_TYPE_2_PROGRESS_BAR,
  SKIP_PAYMENT_FLOW_PROGRESS_BAR,
} from 'src/common/constants/orders';

const getCheckoutStepsData = state => state.checkoutSteps;

export const getOnboardingFlowVariation = state => getCheckoutStepsData(state).onboardingFlowType;

export const getShowCheckoutModal = state => getCheckoutStepsData(state).showCheckoutModal;

export const getCurrentCheckoutStepName = state => getCheckoutStepsData(state).currentStepName;

export const getCheckoutSteps = createSelector(getCheckoutStepsData, (checkout) => {
    let checkoutSteps = ONBOARDING_FLOW_CONTROL;

    if (checkout.onboardingFlowType === 'otc') {
      checkoutSteps = ONBOARDING_FLOW_OTC;
    } else if (checkout.onboardingFlowType === 'variation_1') {
      checkoutSteps = ONBOARDING_FLOW_TYPE_1;
    }  else if (checkout.onboardingFlowType === 'variation_2') {
      checkoutSteps = ONBOARDING_FLOW_TYPE_2;
    } else if (checkout.onboardingFlowType === 'skip_payment') {
      checkoutSteps = SKIP_PAYMENT_FLOW;
    }

    return checkoutSteps;
  })


export const getCheckoutStepsProgressBar = createSelector(getCheckoutStepsData, (checkout) => {
    let checkoutSteps = ONBOARDING_FLOW_CONTROL_PROGRESS_BAR;

    if (checkout.onboardingFlowType === 'otc') {
      checkoutSteps = ONBOARDING_FLOW_OTC_PROGRESS_BAR;
    } else if (checkout.onboardingFlowType === 'variation_1') {
      checkoutSteps = ONBOARDING_FLOW_TYPE_1_PROGRESS_BAR;
    }  else if (checkout.onboardingFlowType === 'variation_2') {
      checkoutSteps = ONBOARDING_FLOW_TYPE_2_PROGRESS_BAR;
    } else if (checkout.onboardingFlowType === 'skip_payment') {
      checkoutSteps = SKIP_PAYMENT_FLOW_PROGRESS_BAR;
    }

    return checkoutSteps;
  })