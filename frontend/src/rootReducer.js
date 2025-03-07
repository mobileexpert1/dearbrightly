import { combineReducers } from 'redux';

import { analytics } from 'src/features/analytics/reducers/analyticsReducer';
import { orders } from 'src/features/orders/reducers/ordersReducer';
import { passwordReset } from 'src/features/auth/reducers/passwordResetReducer';
import { user } from 'src/features/user/reducers/userReducer';
import { customers } from 'src/features/customers/reducers/customersReducer';
import { customer } from 'src/features/customers/reducers/customerReducer';
import { authentication } from 'src/features/auth/reducers/authenticationReducer';
import { products } from 'src/features/products/reducers/productsReducer';
import { shoppingBag } from 'src/features/products/reducers/shoppingBagReducer';
import { medicalSurvey } from 'src/features/medicalSurvey/reducers/medicalSurveyReducer';
import { discount } from 'src/features/checkout/reducers/discountReducers';
import { payment } from 'src/features/checkout/reducers/paymentReducers';
import { order } from 'src/features/checkout/reducers/orderReducers';
import { messages } from 'src/features/dashboard/reducers/messagesReducers';
import { checkoutSteps } from 'src/features/checkout/reducers/checkoutStepsReducer';
import { subscriptions } from 'src/features/subscriptions/reducers/subscriptionsReducer';
import { sharingProgram } from 'src/features/sharingProgram/reducers/sharingProgramReducers';

export const rootReducer = combineReducers({
  analytics,
  authentication,
  products,
  user,
  shoppingBag,
  passwordReset,
  customers,
  customer,
  orders,
  medicalSurvey,
  discount,
  order,
  messages,
  checkoutSteps,
  subscriptions,
  payment,
  sharingProgram,
});
