import { config } from 'src/config';

export class SubscriptionsService {
    constructor(http) {
        this.http = http;
    }

    async fetchSubscriptionsList(userId=null) {
        try {
            if (userId) {
                return await this.http.GET(`customers/${userId}/subscriptions`);
            } else {
                return await this.http.GET(`subscriptions`);
            }
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            return Promise.reject(config.genericSubscriptionLoadError);
        }
    }

    async updateSubscription(data) {
        try {
            return await this.http.PATCH(`subscriptions/${data.uuid}`, data);
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            var errorMessage = config.genericSubscriptionUpdateError;
            if (error.body && error.body[0]) {
                errorMessage = error.body[0];
            }
            return Promise.reject(errorMessage);
        }
    }

    async updateSubscriptions(data) {
        try {
            return await this.http.PUT(`subscriptions`, data);
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            var errorMessage = config.genericSubscriptionUpdateError;
            if (error.body && error.body[0]) {
                errorMessage = error.body[0];
            }
            return Promise.reject(errorMessage);
        }
    }

    async createSubscription(data) {
        try {
            return await this.http.POST(`subscriptions`, data);
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            var errorMessage = config.genericSubscriptionUpdateError;
            if (error.body && error.body[0]) {
                errorMessage = error.body[0];
            }
            return Promise.reject(errorMessage);
        }
    }

    async updateOrCreateSubscription(data) {
        try {
            return await this.http.POST(`subscriptions/update_or_create_subscription`, data);
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            var errorMessage = config.genericSubscriptionUpdateError;
            if (error.body && error.body[0]) {
                errorMessage = error.body[0];
            }
            return Promise.reject(errorMessage);
        }
    }

    async updateShippingDetails(data) {
        try {
            return await this.http.POST(`subscriptions/update_shipping_details`, data);
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            var errorMessage = config.genericSubscriptionUpdateError;
            if (error.body && error.body.detail) {
                errorMessage = error.body.detail;
            } else if (error.body && Object.keys(error.body).length > 0){
                errorMessage = error.body;
            }
            return Promise.reject(errorMessage);
        }
    }

    async sendFeedbackEmail(messageBody, topic) {
        try {
            return await this.http.POST('mail/send_email', {
                'messageBody': messageBody,
                'topic': topic,
                'toEmail': 'feedback@dearbrightly.com' });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
