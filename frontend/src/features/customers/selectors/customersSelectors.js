import { createSelector } from 'reselect';

const getCustomerData = state => state.customers;

const getCustomersData = state => state.customers;

export const getCustomer = state => getCustomerData(state).data;

export const getCustomers = state => getCustomersData(state).data;

export const getCustomersErrorMessage = state => getCustomersData(state).errorMessage;

export const isFetchingCustomers = state => getCustomersData(state).isFetching;

export const isDataFetchedSuccessfully = state => getCustomersData(state).fetchedSuccessfully;

export const getCustomersPagination = state => getCustomersData(state).pagination;

export const getSearchFilter = state => getCustomersData(state).searchFilter;

export const getCustomerIsUpdating = state => getCustomerData(state).isUpdating;

export const getRxStatusFilter = state => getCustomersData(state).rxStatusFilter;

const extractId = (_state, id) => id;

export const getCustomerById = createSelector(getCustomers, extractId, (customers, customerId) =>
  customers.find(customer => customer.id == customerId),
);
