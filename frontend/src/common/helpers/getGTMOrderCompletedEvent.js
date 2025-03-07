import {getGTMItems} from "src/common/helpers/getGTMItems";

export const getGTMOrderCompletedEvent = (order) => {

  if (!order) {
    return null;
  }

  const result = getGTMItems(order.orderItems);

  var orderCompletedEvent = {
    'order_id': order.id, // for Google ads
    'currency': result.currency, // Google Analytics Ecomm required key
    'total': (order.subtotal - order.discount + order.shippingFee)/100,
    'products': result.products,
    'np': order.orderItems.length,
    'ot': getObfuscatedOrderType(order.orderType),
    'id': order.id,
  };

  return orderCompletedEvent;
}

const getObfuscatedOrderType = (orderType) => {
  if (orderType === 'OTC') {
    return 0;
  } else if (orderType === 'Rx') {
    return 1;
  }
}
