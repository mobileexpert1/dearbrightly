import { getGTMItems } from 'src/common/helpers/getGTMItems';

export const getGTMOrderCheckoutEvent = (orderProducts) => {

  if (!orderProducts) {
    return null;
  }

  const result = getGTMItems(orderProducts);

  return { 'products': result.products, 'total': result.total, 'currency': result.currency };
}
