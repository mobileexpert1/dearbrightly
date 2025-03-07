import React, { useState, useEffect } from 'react';
import styled from 'react-emotion';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import threeDots from 'src/assets/images/threeDots.svg';
import { breakpoints, colors } from 'src/variables';
import EditActivePlanModal from './EditActivePlanModal';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { formatAmountToDollarsWithCents } from 'src/common/helpers/formatAmountToDollars';
import Pause from 'src/features/cancellation/Pause';
import Cancel from 'src/features/cancellation/Cancel';
import CustomModal from 'src/components/Modal';
import moment from 'moment';
import { RxBadge } from "src/features/dashboard/shared/styles";
import { ORDER_STATUSES } from "src/common/constants/orders";
import { getSubscriptionProductData } from 'src/features/dashboard/helpers/getSubscriptionProductData';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const CardContainer = styled.div`
  border: 1px solid ${colors.brightGray};
  border-radius: 6px;
  width: 200px;
  ${breakpoints.sm} {
    max-width: 252px;
    margin-left: 1rem;
  }
`;

const Card = styled.div`
`;

const CardBody = styled.div`
`;

const CardTitle = styled.div`
  color: ${colors.facebookBlue};
  height: 50px;
  padding: 10px 0;
`;

const CardText = styled.div`
  font-weight: bold;
  font-size: small;
`;

const CardDescription = styled.div`
  color: ${props => props.warning ? colors.red : colors.black};
  font-size: small;
  min-height: ${props => props.minHeight ? props.minHeight : '40px'};
`;

const CardDropdown = styled.ul`
  text-align: end;
`;

const OpenDropdownIcon = styled.img``;

const ProductImage = styled.img`
  border-radius: 5px;
`;

const MyPlanCard = ({
  products,
  subscription,
  user,
  defaultPaymentMethod,
  updateSubscriptionRequest,
  isSubscriptionUpdateSuccess,
  isUpdatingSubscription,
  subscriptionBundleOptions,
  orderStatuses,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalActive, setIsEditModalActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPauseModalActive, setIsPauseModalActive] = useState(false);
  const [isCancelModalActive, setIsCancelModalActive] = useState(false);
  const toggleModal = () => {
    setIsEditModalActive(!isEditModalActive);
  };
  const { isMobile } = useDeviceDetect();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const displayOverlay = display => {
    setShowOverlay(display);
  };

  const cancelClick = () => {
    GTMUtils.trackCall('myplan_cancel_click');
    setIsCancelModalActive(true);
  };

  const displayShippingAddress = () => {
    const shippingDetails = (subscription && subscription.shippingDetails) ? subscription.shippingDetails : 
      (user && user.shippingDetails) ? user.shippingDetails : null;
    const addressLine = (shippingDetails && shippingDetails.addressLine2) ? `${shippingDetails.addressLine1}, ${shippingDetails.addressLine2}` :
      (shippingDetails ? `${shippingDetails.addressLine1}` : '');
    
    return (
      shippingDetails && (
        <React.Fragment>
          <CardText className="card-text mb-2">SHIPPING ADDRESS</CardText>
          <CardDescription className="mb-3" minHeight={'60px'}>
            {addressLine}
            <br />
            {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
          </CardDescription>
        </React.Fragment>
      )
    )
  }

  const displayPaymentMethod = () => {
    let last4 = null;
    if ( subscription && subscription.paymentDetails && subscription.paymentDetails.last4 ) {
      last4 = `**** **** **** ${subscription.paymentDetails.last4}`;
    }
    else if ( defaultPaymentMethod && defaultPaymentMethod.card && defaultPaymentMethod.card.last4 ) {
      last4 = `**** **** **** ${defaultPaymentMethod.card.last4}`;
    }

    return (
      last4 && (
        <React.Fragment>
          <CardText className="card-text mb-2">PAYMENT METHOD</CardText>
          <CardDescription className="mb-3">
            {last4}
          </CardDescription>
        </React.Fragment>
      )
    )
  }

  const editActivePlanModal = 'isEditModalActive';
  const isRxProduct = subscription ? subscription.productType == 'Rx' : false;
  const isCurrentOrderPending = subscription && subscription.currentOrder ? subscription.currentOrder.status !== ORDER_STATUSES['Shipped'] : false;
  const isCurrentOrderPendingPayment = subscription && subscription.currentOrder ? subscription.currentOrder.status == ORDER_STATUSES['Payment Failure'] : false;
  const subscriptionProductData = getSubscriptionProductData(products, subscription);
  const nextSubscriptionOrderShipDate = subscription ? subscription.currentPeriodEndDatetime : null;
  const formattedDate = new Date(nextSubscriptionOrderShipDate);
  const shipDateOrStatus = isCurrentOrderPending ? isCurrentOrderPendingPayment ? "Pending payment" : "Pending" : moment(formattedDate).format('MM/DD/YYYY');
  const formattedMonthlyPrice = formatAmountToDollarsWithCents(subscriptionProductData.price/subscriptionProductData.frequency);
  const formattedTotalPrice = formatAmountToDollarsWithCents(subscriptionProductData.price);
  const monthText = subscriptionProductData.frequency > 1 ? "months" : "month";

  //TODO: Change dropdown position after opening it, if not possible replace it with a modal
  return (
    <CardContainer className="mb-5 mr-3">
      <Card className="card p-3 border-0">
        <ProductImage alt="Product" className="card-img-top" src={subscriptionProductData.productImage} />
        <CardBody id={"card-body"} className="pl-0">
          <CardTitle className="card-title">
            {subscriptionProductData.quantity} x {subscriptionProductData.productName}
            {isRxProduct && (<RxBadge>RX</RxBadge>)}
          </CardTitle>
          <CardText className="card-text mb-3">
            {formattedMonthlyPrice}
            /mo
          </CardText>
          <CardText className="card-text mb-2">REFILL FREQUENCY</CardText>
          <CardDescription className="mb-3">
            Ships and bills every <b>{subscriptionProductData.frequency} {monthText}</b> at {formattedTotalPrice}
          </CardDescription>
          <CardText className="card-text mb-2">NEXT SHIPMENT</CardText>
          <CardDescription warning={isCurrentOrderPendingPayment} className="mb-2">
            {shipDateOrStatus}
          </CardDescription>
          {displayShippingAddress()}
          {displayPaymentMethod()}
          {!isCurrentOrderPending && (
              <CardDropdown id="cardDropdown">
                <Dropdown isOpen={isOpen} direction="up" toggle={handleToggle}>
                  <DropdownToggle className="bg-transparent border-0 ">
                    <OpenDropdownIcon src={threeDots} />
                  </DropdownToggle>
                  <DropdownMenu container="#cardDropdown">
                    <DropdownItem onClick={() => toggleModal(editActivePlanModal)}>Edit</DropdownItem>
                    <EditActivePlanModal
                        isMobile={isMobile}
                        isVisible={isEditModalActive}
                        toggleEditActivePlanModal={() => toggleModal(editActivePlanModal)}
                        subscription={subscription}
                        updateSubscriptionRequest={updateSubscriptionRequest}
                        isSubscriptionUpdateSuccess={isSubscriptionUpdateSuccess}
                        isUpdatingSubscription={isUpdatingSubscription}
                        subscriptionBundleOptions={subscriptionBundleOptions}
                        toggleEditActivePlanModal={() => toggleModal(editActivePlanModal)}
                    />
                    <DropdownItem divider />
                    <DropdownItem onClick={() => setIsPauseModalActive(true)}>Pause</DropdownItem>
                    {isPauseModalActive && (
                        <CustomModal
                            onClose={() => setIsPauseModalActive(false)}
                            showOverlay={showOverlay}
                        >
                          <Pause
                              displayOverlay={displayOverlay}
                              onClose={() => setIsPauseModalActive(false)}
                              subscription={subscription}
                              updateSubscriptionRequest={updateSubscriptionRequest}
                              isSubscriptionUpdateSuccess={isSubscriptionUpdateSuccess}
                              isUpdatingSubscription={isUpdatingSubscription}
                          />
                        </CustomModal>
                    )}
                    <DropdownItem divider />
                    <DropdownItem onClick={cancelClick}>Cancel</DropdownItem>
                    {isCancelModalActive && (
                        <CustomModal
                            onClose={() => setIsCancelModalActive(false)}
                            showOverlay={showOverlay}
                        >
                          <Cancel
                              displayOverlay={displayOverlay}
                              onClose={() => setIsCancelModalActive(false)}
                              subscription={subscription}
                              updateSubscriptionRequest={updateSubscriptionRequest}
                              isSubscriptionUpdateSuccess={isSubscriptionUpdateSuccess}
                              isUpdatingSubscription={isUpdatingSubscription}
                          />
                        </CustomModal>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </CardDropdown>
          )}
        </CardBody>
      </Card>
    </CardContainer>
  );
};

export default MyPlanCard;
