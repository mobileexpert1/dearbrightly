export const getOrderItemPrice = item => {
  return (
    (item.frequency > 0 && item.type !== 'Rx' ? item.subscriptionPrice : item.price) * item.quantity
  );
};

export const getOrderTotal = data => {
  if (!data) {
    return null;
  }
  const itemsTotalArr = data.map(item => getOrderItemPrice(item));
  const total = itemsTotalArr.reduce((prev, current) => prev + current, 0);
  return total;
};
