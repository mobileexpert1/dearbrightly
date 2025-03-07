import React from 'react';
import styled from 'react-emotion';

import { breakpoints } from 'src/variables';
import { DashboardMenu } from './DashboardMenu';

const MenuWrapper = styled.div`
  display: ${props => (props.isQuestionnaireOpen || props.isPhotoUploadOpen ? 'none' : 'flex')};
  flex-direction: column;
  flex-basis: 200px;
  flex-shrink: 0;
  margin-bottom: 30px;
  height: fit-content;
  position: sticky;
  top: 7rem;

  ${breakpoints.md} {
    display: none;
  }
`;

export default class UserLeftNav extends React.Component {
  render() {
    const { navigationItems, routePrefix, isQuestionnaireOpen, isPhotoUploadOpen } = this.props;

    return (
      <MenuWrapper isQuestionnaireOpen={isQuestionnaireOpen} isPhotoUploadOpen={isPhotoUploadOpen}>
        <DashboardMenu
          menuItems={navigationItems.filter(item => !item.hideInNav)}
          routePrefix={routePrefix}
        />
      </MenuWrapper>
    );
  }
}
