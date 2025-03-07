import sha256 from 'crypto-js/sha256';

export const getFBPixelURL = (user, order, eventName, eventID, products) => {
    let fbPixelAdvancedMatchingURL = `https://www.facebook.com/tr/?id=${process.env.FACEBOOK_PIXEL_ID}&ev=${eventName}`;

    if (user) {
      const hashedEmail = sha256(user.email);
      fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&ud[em]=${hashedEmail}`;
    }

    if (user && user.shippingDetails && user.shippingDetails.phone) {
      const hashedPhone = sha256(user.shippingDetails.phone);
      fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&ud[ph]=${hashedPhone}`;
    }

    if (products && order && order.subtotal ) {
        const num_items = products.length;
        fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&cd[value]=${order.subtotal/100}&cd[currency]=USD&cd[num_items]=${num_items}`;
    }

    if (eventID) {
        const hashedEventId = sha256(eventID);
        fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&eid=${hashedEventId}`;
    }

    if (products) {
        let productCategories = products.map(product => product.productCategory);
        let contentIds = productCategories[0];
        if (productCategories.length > 1) {
            contentIds = `[${productCategories.join(', ')}]`;
        }
        fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&cd[content_type]=product` + `&cd[content_ids]=["${contentIds}"]` + `&cd[content_category]=Skin%20Care`;
    }

    if (!order && products && (eventName === 'AddToCart' || eventName === 'ViewContent')) {
        const content_name = products[0].name;
        const value = products[0].price/100;
        fbPixelAdvancedMatchingURL = fbPixelAdvancedMatchingURL + `&cd[content_name]=${encodeURIComponent(content_name)}` + `&cd[currency]=USD` + `&cd[value]=${value}`;
    }

    return fbPixelAdvancedMatchingURL;
  }
