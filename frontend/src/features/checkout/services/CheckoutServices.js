export class CheckoutService {
  constructor(http) {
    this.http = http;
  }

  async getDiscount(data) {
    const body = {
      discountCode: data.code,
      orderId: data.orderId,
    };

    try {
      return await this.http.POST('shopify/get-discount', body, { authorized: false });
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      let discountCodeErrorMessage = 'Invalid promo code';
      if (error.body && error.body.detail) {
        discountCodeErrorMessage = `Invalid promo code. ${error.body.detail}`;
      }
      return Promise.reject(discountCodeErrorMessage);
    }
  }

  async removeDiscount(orderId) {
    try {
      return await this.http.POST(`orders/${orderId}/remove_discount`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The code could not be removed. Please try again later.');
    }
  }
}
