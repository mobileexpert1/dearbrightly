import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'react-emotion';

import { colors, breakpoints, fontSize } from 'src/variables';

const MenuItemWrapper = styled.div`
  display: flex;
  padding: 15px;
  flex-direction: row;
`;

const MenuItem = styled(NavLink)`
  font-size: ${fontSize.medium};
  color: black;
  cursor: pointer;
  &.selected {
    text-decoration: none;
    color: #3b5998;
  }
  &:hover {
    text-decoration: none;
    color: #3b5998;
  }
  ${breakpoints.md} {
    border: unset;
    padding: 5px 15px;
    margin-top: 20px;

    &.selected {
      border: unset;
      border-bottom: 2px solid ${colors.salmon};
    }
    &:hover {
      border: unset;
      border-bottom: 2px solid ${colors.salmon};
    }
  }
  ${breakpoints.xs} {
    font-size: ${fontSize.medium};
  }
`;

const NotificationDot = styled.div`
  display: ${props => (props.userActionRequired ? 'block' : 'none')};
  margin: 0.5rem 0.5rem;
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  background-color: ${colors.mulberry};
`;

export const DashboardMenu = ({ routePrefix, menuItems }) => {
  return menuItems.map(({ name, url, userActionRequired }, i) => (
    <MenuItemWrapper key={i.toString()}>
      <MenuItem to={routePrefix + url} activeClassName="selected">
        {name}
      </MenuItem>
      <NotificationDot userActionRequired={userActionRequired} />
    </MenuItemWrapper>
  ));
};
