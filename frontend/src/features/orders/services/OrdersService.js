import { config } from 'src/config';

export class OrdersService {
  constructor(http) {
    this.http = http;
  }

  async fetchOrder(data) {
    const isAdmin = data.isAdmin;

    try {
      if (isAdmin) {
        return await this.http.GET(`admin/orders/${data.id}`);
      }
      return await this.http.GET(`orders/${data.id}`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The order could not be retrieved. Please try again later.');
    }
  }

  async fetchPendingCheckoutOrders() {
    try {
      return await this.http.GET(`orders?status=pending_checkout`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The pending checkout order could not be retrieved. Please try again later.');
    }
  }
  
  async fetchOrdersList(data) {
    const isAdmin = data.isAdmin;
    try {
      if (isAdmin) {
        const paginationData = data.paginationData;
        const page = paginationData.page ? `page=${paginationData.page}` : 'page=1';
        const size = paginationData.size ? `&size=${paginationData.size}` : '';
        const offset = paginationData.offset ? `&offset=${paginationData.offset}` : '';
        const search = data.searchData ? `&search=${data.searchData}` : '';
        const status = data.statusFilterData ? `&status=${data.statusFilterData}` : '';
        return await this.http.GET(`admin/orders?${page}${size}${offset}${search}${status}`);
      }
      return await this.http.GET(`orders`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The list of orders could not be obtained. Please try again later.');
    }
  }

  async fetchOrdersExport(data) {
    const isAdmin = data.isAdmin;

    try {
      if (isAdmin) {
        const search = data.searchData ? `&search=${data.searchData}` : '';
        const status = data.statusFilterData ? `&status=${data.statusFilterData}` : '';
        const formatted_timestamp = new Date(Date.now()).toLocaleString();
        const fileName = `export_orders_${formatted_timestamp}.csv`;
        return await this.http.GET(`admin/orders?${search}${status}&export=true`, { download: true, fileName: fileName});
      }
      return;
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The list of orders could not be obtained. Please try again later.');
    }
  }

  // TODO - Add pagination to this
  async fetchCustomerOrdersList(customerUUID) {
    try {
      return await this.http.GET(`customers/${customerUUID}/orders`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(
        'The list of pending orders could not be obtained. Please try again later.');
    }
  }

  // Deprecated
  async archiveOrders(ids) {
    try {
      return await this.http.DELETE('orders', ids);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }


  async fetchOrderStatuses() {
    try {
      return await this.http.GET('orders/choices/status');
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(error);
    }
  }

  async updateOrderDetails(data) {
    try {
      return await this.http.PATCH(`orders/${data.id}`, data.orderDetails);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      var orderUpdateErrorMessage = config.genericOrderUpdateError;
      if (error.body && error.body.detail) {
        orderUpdateErrorMessage = `Unable to proceed with checkout. ${error.body.detail}`;
      }
      return Promise.reject(orderUpdateErrorMessage);
    }
  }


  async createOrder(data) {
    try {
      return await this.http.POST(`orders`, data);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }

  async updatePendingOrCreateOrder(data) {
    try {
      return await this.http.POST(`orders/update_pending_or_create`, data);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      var orderUpdateErrorMessage = config.genericOrderUpdateError;
      if (error.body && error.body.detail) {
        orderUpdateErrorMessage = `Unable to proceed with checkout. ${error.body.detail}`;
      }
      return Promise.reject(orderUpdateErrorMessage);
    }
  }

  async updateOrderShippingDetails(data) {
    try {
      return await this.http.POST(`payment/update_order_total/${data.id}`, data.orderDetails);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      const errorMessage = error.body && error.body.detail ? error.body.detail : config.genericError;
      return Promise.reject(errorMessage);
    }
  }
}
