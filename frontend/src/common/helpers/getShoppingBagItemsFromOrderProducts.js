export const getShoppingBagItemFromOrderProduct = orderProduct => {
    const shoppingBagItem = {
        'category': orderProduct.productCategory,
        'frequency': orderProduct.frequency,
        'image': orderProduct.productImage,
        'price': orderProduct.price,
        'productName': orderProduct.productName,
        'productUuid': orderProduct.productUuid,
        'quantity': orderProduct.quantity,
        'sku': orderProduct.productSku,
        'type': orderProduct.productType,
        'trialPrice': orderProduct.trialPrice,
        'refillPrice': orderProduct.refillPrice,
        'subscriptionPrice': orderProduct.subscriptionPrice,
    }

    return shoppingBagItem;
};

export const getShoppingBagItemsFromOrderProducts = orderProducts => {

    let i;
    let shoppingBagItems = [];

    for (i = 0; i < orderProducts.length; i++) {
        const shoppingBagItem = getShoppingBagItemFromOrderProduct(orderProducts[i]) ;
        shoppingBagItems.push(shoppingBagItem);
    }

    return shoppingBagItems;
};
