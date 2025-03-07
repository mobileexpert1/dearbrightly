import React from 'react';
import { Route, Redirect } from 'react-router-dom';


export const CustomRoute = ({
  component: Component,
  secured = true,
  checkQueryParameter = false,
  isAuthenticated,
  isProcessing,
  redirect = '/login',
  path,
  userState,
  ...rest
}) => {
  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        if (path === '/') {
            if (userState && (userState.isMedicalProvider || userState.isMedicalAdmin)) {
                window.location.href = "/emr/visits#status=Provider%20Pending%20Action&service=&state=";
            } else {
                window.location.href = "https://www.dearbrightly.com/";
            }
        }
        if (path === '/privacy-policy') {
            window.location.href = "https://www.dearbrightly.com/pages/privacy-policy";
        }
        if (path === '/terms') {
            window.location.href = "https://www.dearbrightly.com/pages/terms-of-use";
        }
        if (path === '/products') {
            window.location.href = "https://www.dearbrightly.com/collections/all";
        }
        if (checkQueryParameter) {
          const urlParams = new URLSearchParams(window.location.search);
          const shopifyCartID = urlParams.get('scid');
          const rxSKU = urlParams.get('rxsku');
          if (shopifyCartID) {
            localStorage.setItem('scid', shopifyCartID);
          }
          if (rxSKU) {
            localStorage.setItem('rxsku', rxSKU);
          }
          if (shopifyCartID || rxSKU) {
            window.location.href = window.location.origin + window.location.pathname;
          }
        }
        if (!secured) {
          return <Component {...props} />;
        }
        // secured is true
        if (isAuthenticated || isProcessing) {
          return <Component {...props} />;
        }
        localStorage.setItem('redirect_url', window.location.pathname);

        return <Redirect to={redirect} />;
      }}
    />
  );
};

