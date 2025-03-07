export const FETCH_CUSTOMERS_REQUEST = 'FETCH_CUSTOMERS_REQUEST';
export const fetchCustomersRequest = (isAdmin, paginationData, searchData, statusFilterData) => ({
  type: FETCH_CUSTOMERS_REQUEST,
  payload: {
    isAdmin,
    paginationData,
    searchData,
    statusFilterData,
  },
});

export const FETCH_CUSTOMERS_SUCCESS = 'FETCH_CUSTOMERS_SUCCESS';
export const fetchCustomersSuccess = customers => ({
  type: FETCH_CUSTOMERS_SUCCESS,
  payload: customers,
});

export const FETCH_CUSTOMERS_FAIL = 'FETCH_CUSTOMERS_FAIL';
export const fetchCustomersFail = errorMessage => ({
  type: FETCH_CUSTOMERS_FAIL,
  payload: errorMessage,
});

export const FETCH_CUSTOMERS_EXPORT_REQUEST = 'FETCH_CUSTOMERS_EXPORT_REQUEST';
export const fetchCustomersExportRequest = (isAdmin, searchData, statusFilterData) => {
  return {
  type: FETCH_CUSTOMERS_EXPORT_REQUEST,
  payload: {
    isAdmin,
    searchData,
    statusFilterData
  },
}};

export const FETCH_CUSTOMERS_EXPORT_SUCCESS = 'FETCH_CUSTOMERS_EXPORT_SUCCESS';
export const fetchCustomersExportSuccess = () => ({
  type: FETCH_CUSTOMERS_EXPORT_SUCCESS,
});

export const FETCH_CUSTOMERS_EXPORT_FAIL = 'FETCH_CUSTOMERS_EXPORT_FAIL';
export const fetchCustomersExportFail = errorMessage => ({
  type: FETCH_CUSTOMERS_EXPORT_FAIL,
  payload: errorMessage,
});

export const REMOVE_CUSTOMERS_REQUEST = 'REMOVE_CUSTOMERS_REQUEST';
export const removeCustomersRequest = ids => ({
  type: REMOVE_CUSTOMERS_REQUEST,
  payload: ids,
});

export const REMOVE_CUSTOMERS_SUCCESS = 'REMOVE_CUSTOMERS_SUCCESS';
export const removeCustomersSuccess = ids => ({
  type: REMOVE_CUSTOMERS_SUCCESS,
  payload: ids,
});

export const REMOVE_CUSTOMERS_FAIL = 'REMOVE_CUSTOMERS_FAIL';
export const removeCustomersFail = errorMessage => ({
  type: REMOVE_CUSTOMERS_FAIL,
  payload: errorMessage,
});

// TODO - move to customerAction
export const UPDATE_CUSTOMER_DATA_REQUEST = 'UPDATE_CUSTOMER_DATA_REQUEST';
export const updateCustomerDataRequest = customerData => ({
  type: UPDATE_CUSTOMER_DATA_REQUEST,
  payload: customerData,
});

export const UPDATE_CUSTOMER_DATA_SUCCESS = 'UPDATE_CUSTOMER_DATA_SUCCESS';
export const updateCustomerDataSuccess = customerData => ({
  type: UPDATE_CUSTOMER_DATA_SUCCESS,
  payload: customerData,
});

export const UPDATE_CUSTOMER_DATA_FAIL = 'UPDATE_CUSTOMER_DATA_FAIL';
export const updateCustomerDataFail = errorMessage => ({
  type: UPDATE_CUSTOMER_DATA_FAIL,
  payload: errorMessage,
});

export const SUBMIT_ELIGIBILITY_REQUEST = 'SUBMIT_ELIGIBILITY_REQUEST';
export const submitEligibilityRequest = data => ({
  type: SUBMIT_ELIGIBILITY_REQUEST,
  payload: data,
});

export const SUBMIT_ELIGIBILITY_SUCCESS = 'SUBMIT_ELIGIBILITY_SUCCESS';
export const submitEligibilitySuccess = orderId => ({
  type: SUBMIT_ELIGIBILITY_SUCCESS,
  payload: orderId,
});

export const SUBMIT_ELIGIBILITY_FAIL = 'SUBMIT_ELIGIBILITY_FAIL';
export const submitEligibilityFail = errorMessage => ({
  type: SUBMIT_ELIGIBILITY_FAIL,
  payload: errorMessage,
});

export const CLEAN_CUSTOMERS_DATA = 'CLEAN_CUSTOMERS_DATA';
export const cleanCustomersData = () => ({
  type: CLEAN_CUSTOMERS_DATA,
});

export const UPDATE_CUSTOMER_SEARCH_FILTER = 'UPDATE_CUSTOMER_SEARCH_FILTER';
export const updateCustomerSearchFilter = searchFilter => ({
  type: UPDATE_CUSTOMER_SEARCH_FILTER,
  payload: searchFilter,
});

export const UPDATE_RX_STATUS_FILTER = 'UPDATE_RX_STATUS_FILTER';
export const updateRxStatusFilter = rxStatusFilter => ({
  type: UPDATE_RX_STATUS_FILTER,
  payload: rxStatusFilter,
});

export const UPDATE_CUSTOMER_PAGINATION = 'UPDATE_CUSTOMER_PAGINATION';
export const updateCustomerPagination = paginationData => ({
  type: UPDATE_CUSTOMER_PAGINATION,
  payload: paginationData,
});
