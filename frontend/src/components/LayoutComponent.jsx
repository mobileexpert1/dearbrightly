import React from 'react';
import styled from 'react-emotion';
import { mobileFirstBreakpoints, topMenuHeight, colors } from 'src/variables';
import { NavbarContainer } from './navbar/NavbarC';
import { CheckoutPage } from '../features/checkout/containers/CheckoutContainer';
import UserDashboardNavbar from './navbar/UserDashboardNavbar';
import { SidebarHeader } from '../features/checkout/components/SidebarHeader';


const AppWrapper = styled('div')(
  ({ isUserDashboard, isQuestionnaireOpen, isPhotoUploadOpen, isWelcomeBackOpen }) => ({
    height: isWelcomeBackOpen && '100%',
    position: 'relative',
    minHeight: `calc(100vh - 400px)`,
    paddingTop:
      isUserDashboard && !isPhotoUploadOpen ? '50px' : isPhotoUploadOpen ? 0 : topMenuHeight.xs,
    backgroundColor: isQuestionnaireOpen
      ? colors.clear
      : isUserDashboard && colors.gainsboroOpacity,
    zIndex: 1,

    [mobileFirstBreakpoints.lg]: {
      paddingTop: isUserDashboard ? '4rem' : isPhotoUploadOpen ? 0 : topMenuHeight.lg,
    },
  }),
);

const CheckoutContainer = styled('div')`
  width: 100%;
  max-width: 100%;
  padding-left: 100px !important;
  padding-right: 100px !important;
  height: 100%;
  background-color: #fff;
  position: fixed;
  overflow-y: unset;
  right: 0;
  -webkit-transform: translate3d(0vw, 0, 0);
  transform: translate3d(0vw, 0, 0);
  transition-property: -webkit-transform;
  transition-property: transform;
  transition-property: transform, -webkit-transform;
  transition-duration: 600ms;
  transition-timing-function: cubic-bezier(0.33, 0, 0, 1);
  z-index: 9999;
  top: 0;
  box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.08);
  @media (max-width: 768px) {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
`;


export default class LayoutComponent extends React.Component {

  // called when user clicks on cart
  toggleCart = (value, e) => {
    if (e) {
      e.preventDefault();
    }

    this.props.navigateCheckout(this.props.checkoutCurrentStepName, value);
  };

  toggleIntercom = showCheckoutModal => {
    if (showCheckoutModal) {
      document.body.classList.add('hideIntercom');
    } else {
      document.body.classList.remove('hideIntercom');
    }
  };

  render() {
    const { props } = this;
    // this will hide intercom when cart is open
    props && this.toggleIntercom(props.showCheckoutModal);

    const isUserDashboardOpen = window.location.pathname.includes('user-dashboard');
    const isQuestionnaireOpen = window.location.pathname.includes('skin-profile');
    const isPhotoUploadOpen = window.location.pathname.includes('photos');
    const isWelcomeBackOpen = window.location.pathname.includes('welcome-back');

    const { navigateCheckout, navigateOrderCheckout, showCheckoutModal, userState } = this.props
    const isAuthenticatedUser = userState && this.props.isAuthenticated;

    return (
      <AppWrapper id="apps-wrapper"
        isUserDashboard={isUserDashboardOpen}
        isQuestionnaireOpen={isQuestionnaireOpen}
        isPhotoUploadOpen={isPhotoUploadOpen}
        isWelcomeBackOpen={isWelcomeBackOpen}
      >
        {isUserDashboardOpen && !showCheckoutModal && (
          <UserDashboardNavbar
            isAuthenticatedUser={isAuthenticatedUser}
            userState={userState}
            navigateCheckout={navigateCheckout}
            navigateOrderCheckout={navigateOrderCheckout}
          />
        )}

        {(isUserDashboardOpen && showCheckoutModal) && (
          <React.Fragment>
            <UserDashboardNavbar
              isAuthenticatedUser={isAuthenticatedUser}
              userState={userState}
              navigateCheckout={navigateCheckout}
              navigateOrderCheckout={navigateOrderCheckout}
            />
            <CheckoutContainer id="checkout-container">
              <SidebarHeader toggleCart={this.toggleCart} />
              <CheckoutPage toggleCart={this.toggleCart} />
            </CheckoutContainer>
          </React.Fragment>
        )}

        {!isUserDashboardOpen && (
          <React.Fragment>
            <NavbarContainer
              userState={userState}
              navigateOrderCheckout={navigateOrderCheckout}
              navigateCheckout={navigateCheckout}
            />
          </React.Fragment>
        )}

        {!isUserDashboardOpen && showCheckoutModal && (
          <React.Fragment>
            <CheckoutContainer>
              <SidebarHeader toggleCart={this.toggleCart} />
              <CheckoutPage toggleCart={this.toggleCart} />
            </CheckoutContainer>
          </React.Fragment>
        )}

        <div className="app-content">{props.children}</div>
      </AppWrapper>
    );
  }
}
