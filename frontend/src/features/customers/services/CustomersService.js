import { config } from 'src/config';

export class CustomersService {
  constructor(http) {
    this.http = http;
  }

  // TODO - pass admin state to this method (right now we don't differentiate in the CustomersContainer)
  async fetchCustomer(id) {
    try {
      return this.http.GET(`admin/customers/${id}`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('Unable to fetch user info. Please try again later.');
    }
  }

  async fetchCustomersList(data) {
    try {
      const paginationData = data.paginationData;
      const isAdmin = data.isAdmin;
      const page = paginationData.page ? `page=${paginationData.page}` : 'page=1';
      const size = paginationData.size ? `&size=${paginationData.size}` : '';
      const offset = paginationData.offset ? `&offset=${paginationData.offset}` : '';
      const search = data.searchData ? `&search=${data.searchData}` : '';
      const status = data.statusFilterData ? `&rx_status=${data.statusFilterData}` : '';

      if (isAdmin) {
        return await this.http.GET(`admin/customers?${page}${size}${offset}${search}${status}`);
      }
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(
        'The list of customers could not be obtained. Please try again later.',
      );
    }
  }

  // TODO - update to support exporting single customers by selector
  async fetchCustomersExport(data) {
    try {
      const isAdmin = data.isAdmin;
      const search = data.searchData ? `&search=${data.searchData}` : '';
      const status = data.statusFilterData ? `&rx_status=${data.statusFilterData}` : '';

      if (isAdmin) {
        const formatted_timestamp = new Date(Date.now()).toLocaleString();
        const fileName = `export_orders_${formatted_timestamp}.csv`
        return await this.http.GET(`admin/customers?${search}${status}&export=true`, { download: true, fileName: fileName });
      }

    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(
        'The export of customers could not be obtained. Please try again later.',
      );
    }
  }

  async removeCustomers(ids) {
    try {
      return await this.http.DELETE('customers', ids);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }

  async updateCustomerData(customerData) {
    try {
      return await this.http.PATCH(`customers/${customerData.id}`, customerData);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }

      var customerUpdateErrorMessage = config.genericCustomerUpdateError;
      if (error.body && error.body.detail) {
        customerUpdateErrorMessage = `Unable to update user details. ${error.body.detail}`;
      }
      return Promise.reject(customerUpdateErrorMessage);
    }
  }

  async unsubscribeCustomer(email, token) {
    try {
      return await this.http.POST(`customers/unsubscribe`, { 'email': email, 'token': token });
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject(config.genericError);
    }
  }

}
