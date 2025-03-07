export const formatAddressToString = (order) => {
    let addressString = '';

    addressString = formatAddressToStringLine1(order) + formatAddressToStringLine2(order)
    
    return addressString;
};

export const formatAddressToStringLine1 = (order) => {
    let addressStringLine1 = '';

    if (order.shippingDetails.addressLine1) {
        addressStringLine1 += `${order.shippingDetails.addressLine1}`;
    }
    if (order.shippingDetails.addressLine2) {
        addressStringLine1 += `, ${order.shippingDetails.addressLine2}`;
    }

    return addressStringLine1;
};

export const formatAddressToStringLine2 = (order) => {
    let addressStringLine2 = '';

    if (order.shippingDetails.city) {
        addressStringLine2 += `${order.shippingDetails.city}, `;
    }
    if (order.shippingDetails.state) {
        addressStringLine2 += `${order.shippingDetails.state} `;
    }
    if (order.shippingDetails.postalCode) {
        addressStringLine2 += `${order.shippingDetails.postalCode}`;
    }

    return addressStringLine2;
};