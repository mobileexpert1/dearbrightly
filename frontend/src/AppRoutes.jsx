import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import * as selectors from 'src/features/auth/selectors/authenticationSelectors';
import { Routes } from 'src/routing/Routes';

import { history } from './history';
import LayoutComponent from './components/LayoutComponent';
import NotFoundComponent from './components/NotFoundComponent';
import {
  navigateCheckout,
  navigateOrderCheckout,
} from './features/checkout/actions/checkoutStepsActions';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { getCurrentCheckoutStepName, getShowCheckoutModal } from 'src/features/checkout/selectors/checkoutStepsSelectors';

const App = props => {
  const { isAuthenticated, isProcessing, userState, checkoutCurrentStepName } = props;

  const isAndroid = () => {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      return true;
    }
    return false;
  }

  const isAndroidAndInstagramWebview = () => {
    if (navigator.userAgent.includes("Instagram") && isAndroid()) {
      window.location.href = `https://${window.location.hostname}/api/v1/auth/open_browser?referer=${window.location.href}`;
    }
  }
  
  React.useEffect(() => {
    isAndroidAndInstagramWebview()
  }, [])

  return (
    <Router history={history}>
      <LayoutComponent
        showCheckoutModal={props.showCheckoutModal}
        navigateCheckout={props.navigateCheckout}
        navigateOrderCheckout={props.navigateOrderCheckout}
        isAuthenticated={isAuthenticated}
        userState={userState}
        checkoutCurrentStepName={checkoutCurrentStepName}
      >
        <Switch>
          <Routes isAuthenticated={isAuthenticated} isProcessing={isProcessing} userState={userState} />
        </Switch>
      </LayoutComponent>
    </Router>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: selectors.isAuthenticated(state),
  isProcessing: selectors.isProcessing(state),
  checkoutCurrentStepName: getCurrentCheckoutStepName(state),
  showCheckoutModal: getShowCheckoutModal(state),
  userState: getUserData(state),
});

export const AppRoutes = connect(
  mapStateToProps,
  {
    navigateCheckout,
    navigateOrderCheckout,
  },
)(App);
