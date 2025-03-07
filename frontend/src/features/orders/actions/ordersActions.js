// TODO - split off orderActions from ordersActions

export const FETCH_ORDER_REQUEST = 'FETCH_ORDER_REQUEST';
export const fetchOrderRequest = (isAdmin, id) => ({
  type: FETCH_ORDER_REQUEST,
  payload: {
    isAdmin,
    id
  }
});

export const FETCH_ORDER_SUCCESS = 'FETCH_ORDER_SUCCESS';
export const fetchOrderSuccess = order => ({
  type: FETCH_ORDER_SUCCESS,
  payload: order,
});

export const FETCH_ORDER_FAIL = 'FETCH_ORDER_FAIL';
export const fetchOrderFail = errorMessage => ({
  type: FETCH_ORDER_FAIL,
  payload: errorMessage,
});

export const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
export const fetchOrdersRequest = (isAdmin, paginationData=null, searchData, statusFilterData) => ({
  type: FETCH_ORDERS_REQUEST,
  payload: {
    isAdmin,
    paginationData,
    searchData,
    statusFilterData
  },
});

export const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
export const fetchOrdersSuccess = orders => ({
  type: FETCH_ORDERS_SUCCESS,
  payload: orders,
});

export const FETCH_ORDERS_FAIL = 'FETCH_ORDERS_FAIL';
export const fetchOrdersFail = errorMessage => ({
  type: FETCH_ORDERS_FAIL,
  payload: errorMessage,
});

export const FETCH_ORDERS_EXPORT_REQUEST = 'FETCH_ORDERS_EXPORT_REQUEST';
export const fetchOrdersExportRequest = (isAdmin, searchData, statusFilterData) => ({
  type: FETCH_ORDERS_EXPORT_REQUEST,
  payload: {
    isAdmin,
    searchData,
    statusFilterData
  },
});

export const FETCH_ORDERS_EXPORT_SUCCESS = 'FETCH_ORDERS_EXPORT_SUCCESS';
export const fetchOrdersExportSuccess = () => ({
  type: FETCH_ORDERS_EXPORT_SUCCESS,
});

export const FETCH_ORDERS_EXPORT_FAIL = 'FETCH_ORDERS_EXPORT_FAIL';
export const fetchOrdersExportFail = errorMessage => ({
  type: FETCH_ORDERS_EXPORT_FAIL,
  payload: errorMessage,
});

export const FETCH_CUSTOMER_ORDERS_REQUEST = 'FETCH_CUSTOMER_ORDERS_REQUEST';
export const fetchCustomerOrdersRequest = (customerUUID) => ({
  type: FETCH_CUSTOMER_ORDERS_REQUEST,
  payload: customerUUID,
});

export const FETCH_CUSTOMER_ORDERS_SUCCESS = 'FETCH_CUSTOMER_ORDERS_SUCCESS';
export const fetchCustomerOrdersSuccess = orders => ({
  type: FETCH_CUSTOMER_ORDERS_SUCCESS,
  payload: orders,
});

export const FETCH_CUSTOMER_ORDERS_FAIL = 'FETCH_CUSTOMER_ORDERS_FAIL';
export const fetchCustomerOrdersFail = errorMessage => ({
  type: FETCH_CUSTOMER_ORDERS_FAIL,
  payload: errorMessage,
});

export const FETCH_ORDER_STATUSES_REQUEST = 'FETCH_ORDER_STATUSES_REQUEST';
export const fetchOrderStatusesRequest = () => ({
  type: FETCH_ORDER_STATUSES_REQUEST,
});

export const FETCH_ORDER_STATUSES_SUCCESS = 'FETCH_ORDER_STATUSES_SUCCESS';
export const fetchOrderStatusesSuccess = statuses => ({
  type: FETCH_ORDER_STATUSES_SUCCESS,
  payload: statuses,
});

export const FETCH_ORDER_STATUSES_FAIL = 'FETCH_ORDER_STATUSES_FAIL';
export const fetchOrderStatusesFail = errorMessage => ({
  type: FETCH_ORDER_STATUSES_FAIL,
  payload: errorMessage,
});

export const ARCHIVE_ORDERS_REQUEST = 'ARCHIVE_ORDERS_REQUEST';
export const archiveOrdersRequest = ids => ({
  type: ARCHIVE_ORDERS_REQUEST,
  payload: ids,
});

export const ARCHIVE_ORDERS_SUCCESS = 'ARCHIVE_ORDERS_SUCCESS';
export const archiveOrdersSuccess = ids => ({
  type: ARCHIVE_ORDERS_SUCCESS,
  payload: ids,
});

export const ARCHIVE_ORDERS_FAIL = 'ARCHIVE_ORDERS_FAIL';
export const archiveOrdersFail = errorMessage => ({
  type: ARCHIVE_ORDERS_FAIL,
  payload: errorMessage,
});

export const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
export const createOrderRequest = data => ({
  type: CREATE_ORDER_REQUEST,
  payload: data,
});

export const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
export const createOrderSuccess = data => ({
  type: CREATE_ORDER_SUCCESS,
  payload: data,
});

export const CREATE_ORDER_FAIL = 'CREATE_ORDER_FAIL';
export const createOrderFail = data => ({
  type: CREATE_ORDER_FAIL,
  payload: data,
});

export const UPDATE_ORDER_REQUEST = 'UPDATE_ORDER_REQUEST';
export const updateOrderRequest = data => ({
  type: UPDATE_ORDER_REQUEST,
  payload: data,
});

export const UPDATE_ORDER_SUCCESS = 'UPDATE_ORDER_SUCCESS';
export const updateOrderSuccess = data => ({
  type: UPDATE_ORDER_SUCCESS,
  payload: data,
});

export const UPDATE_ORDER_FAIL = 'UPDATE_ORDER_FAIL';
export const updateOrderFail = data => ({
  type: UPDATE_ORDER_FAIL,
  payload: data,
});

export const UPDATE_ORDER_SHIPPING_DETAILS_REQUEST = 'UPDATE_ORDER_SHIPPING_DETAILS_REQUEST';
export const updateOrderShippingDetailsRequest = data => ({
  type: UPDATE_ORDER_SHIPPING_DETAILS_REQUEST,
  payload: data,
});

export const UPDATE_ORDER_SHIPPING_DETAILS_SUCCESS = 'UPDATE_ORDER_SHIPPING_DETAILS_SUCCESS';
export const updateOrderShippingDetailsSuccess = data => ({
  type: UPDATE_ORDER_SHIPPING_DETAILS_SUCCESS,
  payload: data,
});

export const UPDATE_ORDER_SHIPPING_DETAILS_FAIL = 'UPDATE_ORDER_SHIPPING_DETAILS_FAIL';
export const updateOrderShippingDetailsFail = data => ({
  type: UPDATE_ORDER_SHIPPING_DETAILS_FAIL,
  payload: data,
});

export const UPDATE_IS_ORDER_EXPRESS_CHECKOUT = 'UPDATE_IS_ORDER_EXPRESS_CHECKOUT';
export const updateIsOrderExpressCheckout = isExpressCheckout => ({
  type: UPDATE_IS_ORDER_EXPRESS_CHECKOUT,
  payload: isExpressCheckout,
});

export const UPDATE_PENDING_OR_CREATE_ORDER_REQUEST = 'UPDATE_PENDING_OR_CREATE_ORDER_REQUEST';
export const updatePendingOrCreateOrderRequest = data => ({
  type: UPDATE_PENDING_OR_CREATE_ORDER_REQUEST,
  payload: data,
});

export const UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS = 'UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS';
export const updatePendingOrCreateOrderSuccess = data => ({
  type: UPDATE_PENDING_OR_CREATE_ORDER_SUCCESS,
  payload: data,
});

export const UPDATE_PENDING_OR_CREATE_ORDER_FAIL = 'UPDATE_PENDING_OR_CREATE_ORDER_FAIL';
export const updatePendingOrCreateOrderFail = errorMsg => ({
  type: UPDATE_PENDING_OR_CREATE_ORDER_FAIL,
  payload: errorMsg,
});

export const ORDER_RESET = 'ORDER_RESET';
export const orderReset = () => ({
  type: ORDER_RESET,
});

export const CLEAN_ORDERS_DATA = 'CLEAN_ORDERS_DATA';
export const cleanOrdersData = () => ({
  type: CLEAN_ORDERS_DATA,
});

export const CLEAN_ORDERS_ERROR = 'CLEAN_ORDERS_ERROR';
export const cleanOrdersError = () => ({
  type: CLEAN_ORDERS_ERROR,
});

export const UPDATE_ORDER_SEARCH_FILTER = 'UPDATE_ORDER_SEARCH_FILTER';
export const updateOrderSearchFilter = searchFilter => ({
  type: UPDATE_ORDER_SEARCH_FILTER,
  payload: searchFilter,
});

export const UPDATE_ORDER_STATUS_FILTER_VALUE = 'UPDATE_ORDER_STATUS_FILTER_VALUE';
export const updateOrderStatusFilterValue = statusFilterValue => ({
  type: UPDATE_ORDER_STATUS_FILTER_VALUE,
  payload: statusFilterValue,
});

export const UPDATE_ORDER_PAGINATION = 'UPDATE_ORDER_PAGINATION';
export const updateOrderPagination = paginationData => ({
  type: UPDATE_ORDER_PAGINATION,
  payload: paginationData,
});


export const FETCH_PENDING_CHECKOUT_ORDER_REQUEST = 'FETCH_PENDING_CHECKOUT_ORDER_REQUEST';
export const fetchPendingCheckoutOrderRequest = () => ({
  type: FETCH_PENDING_CHECKOUT_ORDER_REQUEST,
});

export const FETCH_PENDING_CHECKOUT_ORDER_SUCCESS = 'FETCH_PENDING_CHECKOUT_ORDER_SUCCESS';
export const fetchPendingCheckoutOrderSuccess = data => ({
  type: FETCH_PENDING_CHECKOUT_ORDER_SUCCESS,
  payload: data,
});

export const FETCH_PENDING_CHECKOUT_ORDER_FAIL = 'FETCH_PENDING_CHECKOUT_ORDER_FAIL';
export const fetchPendingCheckoutOrderFail = data => ({
  type: FETCH_PENDING_CHECKOUT_ORDER_FAIL,
  payload: data,
});
