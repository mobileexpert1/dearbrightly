import React from 'react';
import dbStar from 'src/assets/images/dbStar.svg';
import styled from 'react-emotion';
import { BlueButton } from 'src/features/dashboard/shared/styles';
import {breakpoints, colors} from 'src/variables';
import { history } from 'src/history';
import pauseIcon from "src/assets/images/planPausedIcon.svg";
import {
  isSubscriptionActive,
  isSubscriptionNone, isUserPendingCheckout, isUserSkinProfileActionRequired,
  isVisitPendingProviderReview, isVisitPhotosPending, isVisitSkinProfileComplete
} from "src/features/dashboard/helpers/userStatuses";

const DearBrightlyLogo = styled.img`
  width: 4rem;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 28px;
`;

const Description = styled.div`
  font-size: 14px;
  color: ${colors.titanium};
  width: 55%;
  text-align: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  align-content: flex-start;
  margin: 1%;
  padding: 3rem;
  ${breakpoints.sm} {
    padding: 1rem !important;
  }  
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
`;

const NoPlanContent = ({ user, goToPlansTab, pendingCheckoutOrder, visit, navigateOrderCheckout }) => {
  const goToProductPage = (page, e) => {
    e.preventDefault();
    history.push(page);
  };

  const goToOrderCheckout = () => {
    navigateOrderCheckout(true);
  };

  const goToPage = (option, page, e) => {
    e.preventDefault();
    history.push(page, option);
  };

  const goToReturningUserSkinProfile = (e) => {
    const visitPhotosPending = isVisitPhotosPending(visit);
    let pendingVisitURLRoute = 'skin-profile';

    if (visitPhotosPending) {
      pendingVisitURLRoute = 'photos';
    }

    goToPage(
      'continue',
      `/user-dashboard/${pendingVisitURLRoute}`,
      e,
      'Action button',
    )
  }

  const isReturningCustomer =  user && user.paymentProcessorCustomerId;
  const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit);
  const rxOrderPendingCheckout = pendingCheckoutOrder && pendingCheckoutOrder.orderType === 'Rx' && isUserPendingCheckout(pendingCheckoutOrder, visit);


  return (
    <Wrapper>
      <DearBrightlyLogo src={dbStar} className="mb-3" />
      {!isReturningCustomer && !(rxOrderPendingCheckout || userSkinProfileActionRequired) && (
          <TitleWrapper>
            <Title className="mb-3">{ "Ready to start your skin journey?" }</Title>
            <Description className="mb-3">
              The most effective retinoids can’t be store bought. So we get them delivered to you from our
              network of online doctors.
            </Description>
            <BlueButton onClick={e => goToProductPage('/products', e, 'Get Started Button')}>Get started</BlueButton>
          </TitleWrapper>
      )}
      {isReturningCustomer && !(rxOrderPendingCheckout || userSkinProfileActionRequired) && (
          <TitleWrapper>
            {goToPlansTab ? (
                    <div>
                      <Title className="mb-3">{"Ready to re-start your skin journey?"}</Title>
                      <BlueButton onClick={e => goToPlansTab()}>Add plan</BlueButton>
                    </div>
                ) :
                <Title className="mb-3">Ready to re-start your skin journey?<br/>Add a plan below.</Title>
            }
          </TitleWrapper>
      )}
      {(rxOrderPendingCheckout || userSkinProfileActionRequired) && (
          <TitleWrapper>
             <Title className="mb-3">You're steps away</Title>
            <BlueButton onClick={
                  e => { e.preventDefault(); rxOrderPendingCheckout ? goToOrderCheckout() : goToReturningUserSkinProfile(e) }
                }>Continue</BlueButton>
          </TitleWrapper>
      )}
    </Wrapper>
  );
};

export default NoPlanContent;
