import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';

import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { redirectToUrl } from 'src/common/actions/navigationActions';
import { Pagination } from 'src/common/components/Pagination';
import { WithLoader } from 'src/common/components/WithLoader';
import { compareOrdersByDate } from 'src/common/helpers/compareOrdersByDate';

import { fetchCustomerOrdersRequest } from 'src/features/orders/actions/ordersActions';

import {
  getSortedOrders,
  getOrderStatuses,
  isFetchingOrders,
  isDataFetchedSuccessfully,
  getOrdersErrorMessage,
  getOrdersPagination,
} from 'src/features/orders/selectors/ordersSelectors';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { breakpoints } from 'src/variables';
import { MyOrdersTable } from 'src/features/dashboard/components/MyOrdersTable';

const DEBUG = getEnvValue('DEBUG');

const Container = styled.div`
  padding: 30px;
  ${breakpoints.sm} {
    padding: 10px;
  }
  
  font-size: 16px;

  th {
    font-size: 16px;
    vertical-align: middle !important;
  }

  td {
    vertical-align: middle !important;
    color: #333;
    font-size: 14px;
  }

  ul {
    padding: 0;
    margin: 0;
  }
`;

const pagesOptions = [10, 20, 30, 40];

class MyOrdersContainer extends Component {
  state = {
    selectedPerPage: pagesOptions[3],
    sortByDateAscending: false,
    filter: '',
    activeSection: '',
  };

  toggleCollapse = value => {
    this.setState(prevState => {
      if (prevState.activeSection !== value) {
        return { activeSection: value };
      }
      return { activeSection: '' };
    });
  };

  componentDidMount() {
    const { user, fetchCustomerOrdersRequest, mostRecentOrderId } = this.props;

    if (user && user.id) {
      fetchCustomerOrdersRequest(user.id);
      if (mostRecentOrderId) {
        this.setState({
          activeSection: mostRecentOrderId,
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { user, fetchCustomerOrdersRequest } = this.props;

    if (!prevProps.user && user && user.id) {
      fetchCustomerOrdersRequest(user.id);
    }
  }

  handleValueChange = (value, field) =>
    this.setState({
      [field]: value,
    });

  handleFilterValueChange = ({ target }) => this.handleValueChange(target.value, 'filter');

  handlePageAmountChange = ({ target }) => this.handleValueChange(target.value, 'selectedPerPage');

  filterOrders = (orders, filter) =>
    filter.length < 2
      ? orders
      : orders.filter(
          item =>
            this.props.orderStatuses[item.status].toLowerCase().includes(filter.toLowerCase()) ||
            item.orderType.toLowerCase().includes(filter.toLowerCase()) ||
            item.id === parseInt(filter, 10),
        );

  toggleSortByDateOrder = () =>
    this.setState(prevState => ({
      sortByDateAscending: !prevState.sortByDateAscending,
    }));

  render() {
    const {
      errorMessage,
      fetchOrdersRequest,
      fetchedSuccessfully,
      isFetching,
      orders,
      orderStatuses,
      pagination,
      user,
    } = this.props;
    const { filter, selectedPerPage, sortByDateAscending, activeSection } = this.state;
    const hasOrderData = orders ? orders.length > 0 : false;

    return (
      <WithLoader
        hasData={hasOrderData}
        data={orders}
        isFetching={isFetching}
        fetchingMessage="Fetching orders list..."
        fetchedSuccessfully={fetchedSuccessfully}
        noDataErrorMessage="No orders found"
        errorMessage={errorMessage ? errorMessage : 'Unable to fetch orders.'}
      >
        {orders => {
          const filteredOrders = this.filterOrders(orders, filter);
          const comparator = compareOrdersByDate(sortByDateAscending);
          const sortedOrders = [...filteredOrders.sort(comparator)];

          return (
            <Container id={"container"}>
              <MyOrdersTable
                orders={sortedOrders}
                orderStatuses={orderStatuses}
                toggleSection={this.toggleCollapse}
                onDateHeaderClick={this.toggleSortByDateOrder}
                activeSection={activeSection}
                user={user}
              />
              {pagination.total > 40 && (
                <Pagination
                  pagination={pagination}
                  pageSize={selectedPerPage}
                  handleOnChange={fetchOrdersRequest}
                />
              )}
            </Container>
          );
        }}
      </WithLoader>
    );
  }
}

const mapStateToProps = state => ({
  user: getUserData(state),
  orders: getSortedOrders(state),
  orderStatuses: getOrderStatuses(state),
  errorMessage: getOrdersErrorMessage(state),
  isFetching: isFetchingOrders(state),
  fetchedSuccessfully: isDataFetchedSuccessfully(state),
  pagination: getOrdersPagination(state),
});

export const MyOrders = connect(
  mapStateToProps,
  { fetchCustomerOrdersRequest, redirectToUrl },
)(MyOrdersContainer);
