import { isOTCOrder } from 'src/common/helpers/isOTCOrder';

export const isMedicalVisitRequiredAtCheckout = (orderProducts = null) => {

  if (orderProducts) {
    if (isOTCOrder(orderProducts)) {
      return false;
    }
  }

  return true;
};