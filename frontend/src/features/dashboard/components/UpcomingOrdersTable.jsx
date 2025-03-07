import React from 'react';
import styled from 'react-emotion';
import { Table } from 'reactstrap';
import { colors, breakpoints, fontFamily } from 'src/variables';
import UpcomingOrdersRowItem from 'src/features/dashboard/components/UpcomingOrdersRowItem';
import UpcomingSubscriptionsRowItem from 'src/features/dashboard/components/UpcomingSubscriptionsRowItem';
import NoPlanContent from 'src/features/dashboard/components/NoPlanContent';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';

import { history } from 'src/history';
const CollapseButton = styled.button`
  background: none;
  border: none;
  font-family: ${fontFamily.baseFont};
  text-decoration: underline;
  font-size: 13px;
  color: ${colors.facebookBlue};

  &:focus {
    outline: none;
  }
`;

const Wrapper = styled.div`
  padding: 3rem;
  ${breakpoints.sm} {
    padding: 1rem !important;
  }
`;

export default class UpcomingOrdersTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
    };
  }

  handleToggleCollapse = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  getShippingDetails = (subscription) => {
    const { user } = this.props;
    let shippingDetails = null;
    if (subscription.shippingDetails){
      shippingDetails = subscription.shippingDetails;
    } else if (user && user.shippingDetails){
      shippingDetails = user.shippingDetails;
    }
    return shippingDetails;
  }

  hasUpcomingSubscriptionOrders = () => {
    const { subscriptions } = this.props;
    if (subscriptions && subscriptions.length > 0) {
      return true;
    }
    return false;
  }

  render() {
    const { 
      goToPlansTab,
      subscriptions,
      user,
      orders,
      orderStatuses,
      visit,
      pendingCheckoutOrder,
      navigateOrderCheckout,
    } = this.props;
    const isMobile = isMobileDevice();
    const columnsToDisplay = isMobile
      ? ['Shipment date', 'Order summary']
      : ['Shipment date', 'Order summary', 'Status', 'Shipping address'];

    return (
      <React.Fragment>
        {orders.length > 0 || this.hasUpcomingSubscriptionOrders() ? (
          <div className={isMobile ? '' : 'mx-5 py-4'}>
            <Table responsive="sm">
              <thead>
                <tr>
                  {columnsToDisplay.map(column => (
                    <th
                      key={column}
                      scope="col"
                      className={`border-top-0 border-bottom-0 text-black-50 font-weight-normal pb-4 ${
                        isMobile ? 'pt-4' : ''
                      }`}
                    >
                      {column}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className={`border-top-0 text-black-50 font-weight-normal border-bottom-0 ${
                      isMobile ? 'p-0' : 'pb-4'
                    }`}
                  />
                </tr>
              </thead>
              <tbody>
              { orders && orders.map(order => {
                return (
                <React.Fragment>
                      <UpcomingOrdersRowItem
                          user={user}
                          order={order}
                          products={order.orderItems.filter(orderItem => (orderItem.productType === 'OTC' || orderItem.productType === 'None'))}
                          isRx={false}
                          orderStatuses={orderStatuses}
                      />
                      <UpcomingOrdersRowItem
                          user={user}
                          order={order}
                          products={order.orderItems.filter(orderItem => orderItem.productType === 'Rx')}
                          isRx={true}
                          orderStatuses={orderStatuses}
                      />
                      </React.Fragment>
                )
              })}
              { subscriptions && subscriptions.map(subscription => (
                  <UpcomingSubscriptionsRowItem 
                    user={user} 
                    shipDate={subscription.currentPeriodEndDatetime}
                    subscriptions={[subscription]}
                    shippingDetails={this.getShippingDetails(subscription)}
                    paymentDetails={subscription.paymentDetails}
                  />
              ))}
              </tbody>
            </Table>
            <p className="text-right my-2">
              To view past orders, click
              <CollapseButton onClick={e => { 
                history.push({
                 pathname: '/user-dashboard/my-account',
                  state: { activeTabId: 4 },
                  })}}>
                here
              </CollapseButton>
            </p>
          </div>
        ) : (
            <NoPlanContent
                user={user}
                goToPlansTab={goToPlansTab}
                navigateOrderCheckout={navigateOrderCheckout}
                visit={visit}
                pendingCheckoutOrder={pendingCheckoutOrder}
            />
        )}
      </React.Fragment>
    );
  }
}
