import { ORDER_STATUSES } from 'src/common/constants/orders';


export const isOrderPendingMedicalProviderReview = (order) =>
{
  if (order && order.status) {
    return order.status === ORDER_STATUSES['Pending Medical Provider Review'];
  } else {
    return false;
  }
}

export const isOrderPendingPayment = (order) =>
{
  if (order && order.status) {
    return (order.status === ORDER_STATUSES['Pending Payment'] || order.status === ORDER_STATUSES['Payment Failure']);
  } else {
    return false;
  }
}

export const isOrderPendingSkinProfileQuestions = (order) =>
{
  if (order && order.status) {
    return order.status === ORDER_STATUSES['Pending Questionnaire'];
  } else {
    return false;
  }
}

export const isOrderPendingPhotos = (order) =>
{
  if (order && order.status) {
    return order.status === ORDER_STATUSES['Pending Photos'];
  } else {
    return false;
  }
}

export const isOrderPendingCheckout = (order) =>
{
  const pendingCheckout = isOrderPendingPayment(order) || isOrderPendingPhotos(order);
  return pendingCheckout;
}
