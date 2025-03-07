import React from 'react';
import styled from 'react-emotion';
import { Route, Redirect, Switch, withRouter } from 'react-router-dom';

import { breakpoints, colors, fontFamily } from 'src/variables';
import { DashboardMenu } from './DashboardMenu';

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding-right: 30px;
  padding-left: 30px;
  font-family: ${fontFamily.baseFont};
`;

const BodyWrapper = styled.div`
  margin: 110px 0 50px 0;
  display: flex;
  ${breakpoints.md} {
    margin-top: 60px;
    flex-direction: column;
  }
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 200px;
  flex-shrink: 0;
  margin-bottom: 30px;
  ${breakpoints.md} {
    flex-direction: initial;
    flex-basis: unset;
    border-bottom: 1px solid ${colors.light};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-grow: 3;
  flex-direction: column;
  padding-left: 30px;
  ${breakpoints.md} {
    padding-left: initial;
  }
`;

const getTitleByUrl = (url, navigationItems) => {
  const target = navigationItems.find(item => item.url === url);
  return target && target.name;
};

export const Dashboard = withRouter(({ navigationItems, routePrefix, defaultRoute }) => {
  return (
    <Wrapper>
      <BodyWrapper>
        <MenuWrapper>
          <DashboardMenu
            menuItems={navigationItems.filter(item => !item.hideInNav)}
            routePrefix={routePrefix}
          />
        </MenuWrapper>

        <ContentWrapper>
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
        </ContentWrapper>
      </BodyWrapper>
    </Wrapper>
  );
});
