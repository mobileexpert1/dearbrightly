import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';

import { redirectToUrl } from 'src/common/actions/navigationActions';
import { getOrderStatuses } from 'src/features/orders/selectors/ordersSelectors';
import { fetchCustomerOrdersRequest } from 'src/features/orders/actions/ordersActions';
import { WithLoader } from 'src/common/components/WithLoader';
import { updateCustomerDataRequest } from '../actions/customersActions';
import { fetchCustomerRequest } from '../actions/customerActions';
import {
  getCustomer,
  getCustomerErrorMessage,
  isFetchingCustomer,
  isCustomerFetchedSuccessfully,
} from '../selectors/customerSelectors';

import {
  isFetchingOrders,
  isDataFetchedSuccessfully,
  getOrders,
  getLatestOrder,
} from 'src/features/orders/selectors/ordersSelectors';

import { CustomerRecentOrder } from '../components/CustomerRecentOrder';
import { CustomerAddressInfoForm } from '../components/CustomerAddressInfoForm';
import { AdminSubscriptionPlanContainer } from 'src/features/dashboard/containers/AdminSubscriptionPlanContainer';
import { configureStore } from "src/configureStore";
import { applicationInit } from "src/common/actions/init";
import throttle from "lodash/throttle";
import { saveState } from "src/common/helpers/localStorage";
import { fontFamily, fontWeight } from 'src/variables';

const fontSizes = {
  smallest: '13px',
  small: '14px',
  normal: '16px',
  big: '20px',
};

const colors = {
  dark: '#333',
  gray: '#666',
  light: '#ededed',
};

const Container = styled.div`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSizes.small};
`;

const SubscriptionContainer = styled('div')`
    margin-top: 10px;
    padding: 40px 0 40px 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Header = styled.h3`
  font-size: ${fontSizes.big};
  font-weight: bold;
  margin-bottom: ${props => props.marginBottom};
`;

const Button = styled.button`
  border: 2px solid ${colors.light};
  font-size: ${fontSizes.normal};
  padding: 10px 20px;
  margin-left: 8px;

  &:hover {
    background-color: #333;
    border: 2px solid #333;
    color: #fff;
    cursor: pointer;
  }
`;

const SmallInfo = styled.p`
  font-size: ${fontSizes.smallest};
  font-weight: bold;
`;

const SimpleLink = styled.div`
  font-size: ${fontSizes.small};
  color: ${colors.dark};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

class CustomerDetails extends React.Component {
  state = {
    customer: undefined,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchCustomerRequest(id);
    this.props.fetchCustomerOrdersRequest(id);
  }

  componentWillReceiveProps(nextProps) {
    const { customer } = this.props;
    if (nextProps && nextProps.customer !== customer) {
      this.setState({
        customer: nextProps.customer,
      });
    }
  }

  handleBackClick = () => this.props.redirectToUrl('/admin-dashboard/customers');

  handleViewAllOrdersClick = () => this.props.redirectToUrl('/admin-dashboard/orders');

  handleOrderClick = orderId => this.props.redirectToUrl(`/admin-dashboard/orders/${orderId}`);

  handleLogInAsUser = () => {
    fetch('/api/v2/login-as-user', {
      method: 'POST',
      headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
      credentials: 'include',
      body: JSON.stringify({
        email: this.state.customer.email,
      })
    }).then(() => {
      const store = configureStore()
      store.dispatch(applicationInit())
      store.subscribe(
        throttle(() => {
          saveState({
            authentication: store.getState().authentication,
            user: this.state.user.customer,
            order: store.getState().order,
          });
        }, 500),
      );
      localStorage.setItem('uuid', this.state.customer.id);
    }).then(() => {
      window.location.href = "/"
    });
  };

  render() {
    const { recentOrder, isFetchingOrders, isOrdersFetched, orderStatuses } = this.props;
    const { customer } = this.state;
    return (
      <WithLoader
        hasData={customer !== undefined}
        data={customer}
        isFetching={this.props.isFetchingCustomers}
        fetchingMessage="Fetching customer data..."
        fetchedSuccessfully={this.props.isCustomerFetchedSuccessfully}
        noDataErrorMessage="No customer found with given ID"
        errorMessage={this.props.errorMessage}
      >
        {_customer => (
          <Container>
            <Header>Customer details</Header>
            {_customer && (
              <div><b>Email:</b> {_customer.email}</div>
            )}
            {_customer && (
              <div><b>UUID:</b> {_customer.id}</div>
            )}
            {_customer && (
              <div><b>Date joined:</b> {new Date(_customer.dateJoined).toDateString()}</div>
            )}
            {_customer && (
              <div>
                <Button onClick={this.handleLogInAsUser}>Login as user</Button>
              </div>
            )}
            {_customer && _customer.shippingDetails && (
              <CustomerAddressInfoForm
                onChange={this.handleShippingValueChange}
                onSubmit={this.props.updateCustomerDataRequest}
                title="Shipping"
                data={_customer}
              />
            )}
            <SubscriptionContainer>
              <Header>Subscription</Header>
              <AdminSubscriptionPlanContainer user={customer} isAdmin={true}/>
            </SubscriptionContainer>
            <Row>
              <Header>Recent order</Header>
              <SimpleLink onClick={this.handleViewAllOrdersClick}>View All Orders</SimpleLink>
            </Row>

            <CustomerRecentOrder
              isFetching={isFetchingOrders}
              fetched={!!isOrdersFetched}
              order={recentOrder}
              status={recentOrder && orderStatuses[recentOrder.status]}
              onOrderClick={this.handleOrderClick}
            />

            <Button onClick={this.handleBackClick}>Back</Button>
          </Container>
        )}
      </WithLoader>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  recentOrder: getLatestOrder(state),
  orderStatuses: getOrderStatuses(state),
  errorMessage: getCustomerErrorMessage(state),
  isFetchingCustomer: isFetchingCustomer(state),
  isFetchingOrders: isFetchingOrders(state),
  isOrdersFetched: isDataFetchedSuccessfully(state),
  isCustomerFetchedSuccessfully: isCustomerFetchedSuccessfully(state),
});

export const CustomerDetailsContainer = connect(
  mapStateToProps,
  {
    fetchCustomerRequest,
    fetchCustomerOrdersRequest,
    redirectToUrl,
    updateCustomerDataRequest,
  },
)(CustomerDetails);
