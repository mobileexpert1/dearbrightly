import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import optimizelyService from 'src/common/services/OptimizelyService';
import { config } from 'src/config';

const DEBUG = getEnvValue('DEBUG');

export class PaymentService {
  constructor(http) {
    this.http = http;
  }

  async updateCreditCard(user, token, subscriptions) {
    try {
      return await this.http.POST(`customers/${user.id}/update_credit_card_info`, { token, subscriptions });
    } catch (error) {
      const errorMsg = error.body
        ? error.body.detail
        : 'Your credit card info could not be updated. Please try again later.';
      return Promise.reject(errorMsg);
    }
  }

  async getCustomerPaymentMethod(customerId) {
    try {
      return await this.http.GET(`customers/${customerId}/customer_payment_methods`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }

  async getCustomerDefaultPaymentMethod(customerId) {
    try {
      return await this.http.GET(`customers/${customerId}/customer_payment_methods?default=true`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }

  // Submits payment to Stripe
  // amount needs to be in cents (e.g., 495 for $4.95)
  async submitPayment(order, token) {
    try {
      const response = await this.http.POST(`payment/orders/${order.id}/authorize-payment`, { 'token': token });

      GTMUtils.trackCall('product-details_pay_click_success');
      // if (!DEBUG) {
      //   optimizelyService.track('product-details_pay_click_success');
      // }

      return response;
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }

      GTMUtils.trackCall('product-details_pay_click_fail', {
        success: false,
        error,
      });

      const errorMsg = error.body
        ? error.body.detail
        : 'Unable to process payment. Please try again later.';
      return Promise.reject(errorMsg);
    }
  }

  async stripeConnectFetchUserId(userUUID, authorizationCode) {
    try {
      return await this.http.POST('payment/fetch_stripe_connect_user_id', {
        user_uuid: userUUID,
        authorization_code: authorizationCode,
      });
    } catch (error) {
      return Promise.reject('Unable to fetch the Stripe Connect user id. Please try again later.');
    }
  }
}
