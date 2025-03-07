import React from 'react';
import styled from 'react-emotion';
import { LightBlueButton, RxBadge } from './../shared/styles';
import moment from 'moment';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import {capitalizeFirstWord} from "src/common/helpers/stringUtils";

const TrackingButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const RxProductNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export default class UpcomingOrdersRowItem extends React.Component {
  constructor(props) {
    super(props);
  }

  formatDate = date => {
    return moment(new Date(date)).format('MM/DD/YYYY');
  };

  openTrackingWindow = () => {
    window.open(this.getTrackingUri());
  };

  getTrackingUri = () => {
    const { products } = this.props;
    const trackingUri = products.length > 0 ? products[0].trackingUri : null;
    return trackingUri;
  }

  displayProductInfo = () => {
    const { products } = this.props;

    return (
        products.map(product => {
          return (
              <RxProductNameContainer>
                <div className="font-weight-bold mb-2">
                  {product.quantity} x {product.productName}{' '}
                </div>
                {product && product.productType == 'Rx' && (<RxBadge height={16} lineHeight={10}>RX</RxBadge>)}

              </RxProductNameContainer>
          )
        })
    )
  }

  displayShippingAddress = () => {
    const { order } = this.props;
    if (!order) {
      return;
    }
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
    } = order.shippingDetails;
    const addressLine = addressLine2 ? `${addressLine1} ${addressLine2}` : `${addressLine1}`;
    return (
      <React.Fragment>
        <div>{addressLine}</div>
        <div>
          {city}, {state}, {postalCode}
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { order, orderStatuses, products, isRx } = this.props;
    const shipDate = order.createdDatetime;
    const isMobile = isMobileDevice();
    const trackingUri = this.getTrackingUri();
    const orderStatus = orderStatuses && order.status ? capitalizeFirstWord(orderStatuses[order.status]) : '';
    if (products.length == 0) {
      return <div></div>
    }

    return (
      <tr>
        {isMobile ? (
          <React.Fragment>
            <td className="align-middle pt-4 pr-4 pb-4" scope="row">
              {this.formatDate(shipDate)}
              <TrackingButtonContainer>
                { trackingUri && (
                    <LightBlueButton style={{marginBottom: 10, minWidth: 125}} className="mt-4" onClick={this.openTrackingWindow}>
                      Track order
                    </LightBlueButton>
                )}
                { !trackingUri && isRx &&(
                    <div style={{marginTop: 8}}>{orderStatus}</div>
                )}
                { !trackingUri && !isRx &&(
                    <div style={{marginTop: 8}}>Awaiting fulfillment</div>
                )}
              </TrackingButtonContainer>
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
              <TrackingButtonContainer>
                { trackingUri && (
                    <LightBlueButton style={{marginBottom: 10, minWidth: 155}} onClick={this.openTrackingWindow}>
                      Track order
                    </LightBlueButton>
                )}
                { !trackingUri && isRx &&(
                    <div>{orderStatus}</div>
                )}
                { !trackingUri && !isRx &&(
                    <div>Awaiting fulfillment</div>
                )}
              </TrackingButtonContainer>
            </td>
            <td className="align-middle pt-4 pr-4 pb-4">{this.displayShippingAddress()}</td>
            <td className={`${isMobile ? 'align-bottom' : 'align-middle'}`}>
        </td>
          </React.Fragment>
        )}
      </tr>
    );
  }
}
