import React from 'react';

import { Route, Redirect, Switch, withRouter } from 'react-router-dom';

export const UserDashboardContent = withRouter(({ routePrefix, defaultRoute, navigationItems }) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <Switch>
      {navigationItems.map(item => (
        <Route
          key={item.url}
          path={routePrefix + item.url}
          render={item.render}
          component={item.component}
          exact={item.exact}
        />
      ))}
      <Redirect to={routePrefix + defaultRoute} />
    </Switch>
  );
});
