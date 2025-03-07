import { combineEpics } from 'redux-observable';

import {
  authService,
  ordersService,
  customersService,
  productsService,
  medicalSurveyService,
  checkoutService,
  messagesService,
  paymentsService,
  localStorageService,
  subscriptionsService,
  userService,
  sharingProgramService,
  yearlyVisitService,
} from 'src/rootService';

import { subscriptionsEpicFactory } from 'src/features/subscriptions/epics/subscriptionsEpic';
import { customersEpicFactory } from 'src/features/customers/epics/customersEpic';
import { customerEpicFactory } from 'src/features/customers/epics/customerEpic';
import { userEpicFactory } from 'src/features/user/epics/userEpic';
import { passwordResetEpicFactory } from 'src/features/auth/epics/passwordResetEpic';
import { navigationEpicFactory } from 'src/common/epics/navigationEpic';
import { ordersEpicFactory } from 'src/features/orders/epics/ordersEpic';
import { toastNotificationsEpicFactory } from 'src/features/toastNotifications/epics/toastNotificationsEpic';
import { authenticationEpicFactory } from 'src/features/auth/epics/authenticationEpic';
import { productsEpicFactory } from 'src/features/products/epics/productsEpic';
import { medicalSurveyEpicFactory } from 'src/features/medicalSurvey/epics/medicalSurveyEpic';
import { discountEpicFactory } from 'src/features/checkout/epics/discountEpics';
import { orderEpicFactory } from 'src/features/checkout/epics/orderEpics';
import { paymentsEpicFactory } from 'src/features/checkout/epics/paymentEpics';
import { errorsEpicFactory } from 'src/common/epics/errorsEpic';
import { sharingProgramEpicFactory } from 'src/features/sharingProgram/epics/sharingProgramEpics';

export const rootEpic = combineEpics(
  passwordResetEpicFactory(authService),
  authenticationEpicFactory(authService, localStorageService),
  ordersEpicFactory(ordersService),
  customersEpicFactory(customersService),
  customerEpicFactory(customersService),
  userEpicFactory(userService),
  subscriptionsEpicFactory(subscriptionsService),
  toastNotificationsEpicFactory(),
  productsEpicFactory(productsService),
  medicalSurveyEpicFactory(medicalSurveyService),
  navigationEpicFactory(),
  discountEpicFactory(checkoutService),
  orderEpicFactory(ordersService),
  paymentsEpicFactory(paymentsService),
  errorsEpicFactory(),
  sharingProgramEpicFactory(sharingProgramService),
);
