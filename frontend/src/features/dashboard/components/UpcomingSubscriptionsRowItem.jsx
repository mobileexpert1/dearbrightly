import React from 'react';
import styled from 'react-emotion';
import { RxBadge } from './../shared/styles';
import EditSubscriptionModal from './EditSubscriptionModal';
import { colors, fontFamily } from 'src/variables';
import moment from 'moment';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';

const EditButton = styled.button`
  background: none;
  border: none;
  font-family: ${fontFamily.baseFont};
  text-decoration: underline;
  color: ${colors.facebookBlue};
  font-size: 13px;

  &:focus {
    outline: none;
  }
`;

const OrderStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin-top: 8px;
`;

const RxProductNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export default class UpcomingSubscriptionsRowItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubscriptionModalVisible: false,
    };
  }

  toggleModal = modalState => {
    this.setState(prevState => ({
      [modalState]: !prevState[modalState],
    }));
  };

  formatDate = date => {
    return moment(new Date(date)).format('MM/DD/YYYY');
  };

  displayProductInfo = () => {
    const { subscriptions }  = this.props;
    return (
        subscriptions.map(subscription => {
          return (
              <RxProductNameContainer>
                <div className="font-weight-bold mb-2">
                  {subscription.quantity} x {subscription.productName}
                </div>
                {subscription.productType == 'Rx' && (<RxBadge>RX</RxBadge>)}
              </RxProductNameContainer>
          )
        })
    )
  }

  displayShippingAddress = () => {
    const { shippingDetails } = this.props;
    if (!shippingDetails){
      return;
    }

    const addressLine = (
      shippingDetails.addressLine2 ? `${shippingDetails.addressLine1} ${shippingDetails.addressLine2}` : `${shippingDetails.addressLine1}`
    );
    return (
      <React.Fragment>
        <div>{addressLine}</div>
        <div>
          {shippingDetails.city}, {shippingDetails.state}, {shippingDetails.postalCode}
        </div>
      </React.Fragment>
    );
  };

  render() {
    const subscriptionModal = 'isSubscriptionModalVisible';
    const { 
      bundleOptionsDate,
      shipDate,
      subscriptions,
      subscriptionBundleOptions,
      user,
      shippingDetails,
    } = this.props;
    const isMobile = isMobileDevice();

    return (
      <tr>
        {isMobile ? (
          <React.Fragment>
            <td className="align-middle pt-4 pr-4 pb-4" scope="row">
              {this.formatDate(shipDate)}
              <OrderStatusContainer>
                  Upcoming
              </OrderStatusContainer>
            </td>{' '}
              <td className="align-middle pt-4 pr-4 pb-4">
                {this.displayProductInfo()}
                {this.displayShippingAddress()}
              </td>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <td className="align-middle pt-4 pr-4 pb-4" scope="row">
              {this.formatDate(shipDate)}
            </td>
            <td className="align-middle pt-4 pr-4 pb-4">
              {this.displayProductInfo()}
            </td>
            <td className="align-middle pt-4 pr-4 pb-4">
              <OrderStatusContainer>
                Upcoming
              </OrderStatusContainer>
            </td>
            <td className="align-middle pt-4 pr-4 pb-4">{this.displayShippingAddress()}</td>
          </React.Fragment>
        )}
        <td className={`${isMobile ? 'align-bottom' : 'align-middle'}`}>
          <EditButton
              className={` pb-4  ${isMobile ? 'pl-0 pr-0' : 'pt-4 pr-4 '}`}
              color="secondary"
              onClick={() => this.toggleModal(subscriptionModal)}
          >
            Edit
          </EditButton>
          {this.state.isSubscriptionModalVisible && (
            <EditSubscriptionModal
              isVisible={this.state.isSubscriptionModalVisible}
              toggleSubscriptionModal={() => this.toggleModal(subscriptionModal)}
              subscriptions={subscriptions}
              shippingDetails={shippingDetails}
              subscriptionBundleOptions={subscriptionBundleOptions}
              user={user}
              shipDate={shipDate}
              bundleOptionsDate={bundleOptionsDate}
            />
          )}
        </td>
      </tr>
    );
  }
}
