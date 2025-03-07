export const isOTCOrder = (orderProducts) => {

    if (orderProducts.length == 0) {
        return false;
    }

    for (var i = 0; i < orderProducts.length; i++) {
        const item = orderProducts[i];
        if (item.productType == 'Rx') {
            return false;
        }
    }

    return true;
}