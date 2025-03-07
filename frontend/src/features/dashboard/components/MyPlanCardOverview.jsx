import React from 'react';
import styled from 'react-emotion';
import moment from 'moment';

import refillIcon from 'src/assets/images/refill.svg';
import shipmentIcon from 'src/assets/images/shipment.svg';
import trackingIcon from 'src/assets/images/tracking.svg';

import { colors, breakpoints, fontSize } from 'src/variables';
import { history } from 'src/history';
import { ProductName } from 'src/features/dashboard/shared/styles';

const CardWrapper = styled.div`
  display: flex;

  ${breakpoints.md} {
    flex-direction: column;
  }
`;

const PhotoWrapper = styled.div`
  margin-right: 74px;

  ${breakpoints.md} {
    margin: 0 auto;
  }
`;

const ProductImg = styled.img`
  max-width: 290px;
  max-height: 290px;
  border-radius: 4px;

  ${breakpoints.xs} {
    width: 70vw;
  }
`;

const CardContentWrapper = styled.div`
  width: 100%;
`;

const CartContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 25px;

  ${breakpoints.md} {
    width: 301px;
    margin: 25px auto 0;
  }
`;

const ManagePlanButton = styled.button`
  display: ${props => (props.forDesktop ? 'block' : 'none')};
  cursor: pointer;
  max-height: 50px;
  font-size: ${fontSize.small};
  color: ${colors.darkModerateBlue};
  width: 170px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #3b5998;
  background-color: ${colors.clear};

  :hover {
    background-color: ${colors.darkModerateBlue};
    color: ${colors.clear};
  }

   ${breakpoints.md} {
    display: ${props => (props.forDesktop ? 'none' : 'block')};
    max-width: 301px;
    width: 100%;
    margin: 15px auto 8px;
  }
`;

const ShippingAddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  ${breakpoints.md} {
    width: 301px;
  }
`;

const ShippingAddressHeader = styled.span`
  font-size: ${fontSize.small};
  line-height: 17px;
  margin-top: 15px;
  margin-bottom: 7px;
  font-weight: 600;
`;

const ShippingAddressParagraph = styled.p`
  font-size: ${fontSize.small};
  line-height: 22px;
  opacity: 0.6;
  margin: 0;
`;

const PlanInfoWrapper = styled.div`
  display: flex;
  margin-top: 19px;

  ${breakpoints.lg} {
    flex-direction: column;
  }
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 160px;
  height: 69px;
  background: ${colors.mulberryOpacity};
  margin-right: 6px;
  border-radius: 6px;
  padding-top: 14px;
  padding-left: 8px;

  ${breakpoints.lg} {
    flex-direction: row;
    margin: 0 auto 8px;
    width: 100%;
    max-width: 301px;
  }

  ${breakpoints.md} {
    flex-direction: row;
    justify-content: space-between;

    max-width: 301px;
    height: 46px;
    padding-right: 10px;
    margin: 0 auto 8px;
  }
`;

const InfoCardHeader = styled.div`
  font-size: ${fontSize.smallest};
  line-height: 18px;
  font-weight: 600;
  padding: 0 0 0 26px;
`;

const InfoCardContent = styled.div`
  font-size: ${fontSize.smallest};
  line-height: 18px;
  padding: 0 8px 0 26px;
`;

const InfoCardContentWarning = styled.div`
  font-size: ${fontSize.smallest};
  line-height: 18px;
  padding: 0 8px 0 26px;
  color: ${colors.red};
`;

const CardIcon = styled.img`
  position: absolute;
  height: 17px;
  width: 21px;
`;

export const MyPlanCardOverview = ({
  nextSubscriptionOrderShipDate,
  order,
  products,
  data,
  shippingDetails,
  user,
}) => {
  const currentProduct = products.find(product => product.id === data.productUuid);
  const nextShipmentDate = moment(nextSubscriptionOrderShipDate).format('LL'); //"yyyy-MM-ddTHH:mm:ss.ffffffZ"
  const isRx = currentProduct && currentProduct.productType === 'Rx';
  const isShipped = order && order.trackingUri;
  const currentProductImage = currentProduct && currentProduct.image;
  const addressLine = shippingDetails.addressLine2 ?
    `${shippingDetails.addressLine1}, ${shippingDetails.addressLine2}` :  `${shippingDetails.addressLine1}`;

  const today = moment()
  const requirePaymentDetailUpdate = user ? user.requirePaymentDetailUpdate : false;
  const isShipmentOverdue = moment(nextSubscriptionOrderShipDate) < today && requirePaymentDetailUpdate;
  const isShipmentPending = moment(nextSubscriptionOrderShipDate) < today && !requirePaymentDetailUpdate;


  const goToPage = (page, e) => {
    e.preventDefault();
    history.push(page);
  };

  return (
    <CardWrapper>
      <PhotoWrapper>
        <ProductImg src={currentProductImage} />
      </PhotoWrapper>
      <CardContentWrapper>
        <CartContentHeader>
          <ProductName>
            {currentProduct && currentProduct.productSummary.split(' ').join('\n')}
            {isRx ? ' & Consult' : ''}
          </ProductName>
          <ManagePlanButton onClick={e => goToPage('/user-dashboard/my-plan', e)} forDesktop={1}>
            Manage plan
          </ManagePlanButton>
        </CartContentHeader>
        <ShippingAddressWrapper>
          <ShippingAddressHeader>Shipping address:</ShippingAddressHeader>
          <ShippingAddressParagraph>
            {addressLine}
          </ShippingAddressParagraph>
          <ShippingAddressParagraph>
            {shippingDetails.city || ''} {shippingDetails.state || ''} {shippingDetails.postalCode || ''}
          </ShippingAddressParagraph>
        </ShippingAddressWrapper>
        <PlanInfoWrapper>
          <InfoCard>
            <CardIcon src={shipmentIcon} alt="Shipment" />
            <InfoCardHeader>Next shipment</InfoCardHeader>
            {isShipmentOverdue && (
              <InfoCardContentWarning>Delayed - payment overdue</InfoCardContentWarning>
            )}
            {isShipmentPending && (
              <InfoCardContent>Preparing shipment</InfoCardContent>
            )}
            {!isShipmentOverdue && !isShipmentPending && (
              <InfoCardContent>{nextShipmentDate}</InfoCardContent>
            )}
          </InfoCard>
          <InfoCard>
            <CardIcon src={trackingIcon} alt="Tracking" />
            <InfoCardHeader>Tracking status</InfoCardHeader>
            {isShipped && (
              <InfoCardContent>
                <a href={order.trackingUri} target="_blank">
                  Track here
                </a>
              </InfoCardContent>
            )}
            {!isShipped && <InfoCardContent>Awaiting fulfillment</InfoCardContent>}
          </InfoCard>
          <InfoCard>
            <CardIcon src={refillIcon} alt="Refill" />
            <InfoCardHeader>Refill</InfoCardHeader>
            <InfoCardContent>Every {data.frequency} Months</InfoCardContent>
          </InfoCard>
          <ManagePlanButton onClick={e => goToPage('/user-dashboard/my-plan', e)}>
            Manage plan
          </ManagePlanButton>
        </PlanInfoWrapper>
      </CardContentWrapper>
    </CardWrapper>
  );
};
