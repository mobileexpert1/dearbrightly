export const getSubscriptionProductData = (products, subscription) => {
    if (!subscription) {
      return null;
    }

    const productData = {
      frequency: subscription.frequency,
      isSubscriptionActive: subscription.isActive,
      price: subscription.productSubscriptionPrice,
      productName: subscription.productName,
      productUuid: subscription.productUuid,
      productImage: subscription.productImage,
      quantity: subscription.quantity
    };

    const product = products.find(product => product.sku === subscription.productSku);

    if (product) {
      productData.image = product.image;
    }

    return productData;
  };