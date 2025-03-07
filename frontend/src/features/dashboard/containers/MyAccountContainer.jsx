import React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import styled from 'react-emotion';

import { colors, fontSize, breakpoints } from 'src/variables';
import { BoxContainer, BoxHeaderWrapper } from 'src/features/dashboard/shared/styles';
import { EditMyAccountDetails } from './EditMyAccountDetails';
import { myAccountTabs } from '../constants/myAccountPage';
import { MyOrders } from './MyOrdersContainer';
import AccountSettings from 'src/common/components/AccountSettings';


const Container = styled('div')`
  margin: 0;
`;

const StyledNav = styled(Nav)`
  height: 7rem;
  font-size: ${fontSize.medium};

  ${breakpoints.sm} {
    white-space: nowrap;
    flex-direction: row;
    overflow-x: scroll;
    flex-wrap: nowrap !important;
    height: 3.7rem;
    font-size: ${fontSize.normal};
  }
`;

const StyledNavItem = styled(NavItem)`
  height: fit-content;
  color: ${props => props.isActive && colors.darkModerateBlue};
  margin: auto 0 !important;
`;

const StyledNavLink = styled(NavLink)`
  border: none !important;
  padding: 0.5rem 2rem 0.5rem 0 !important;

  ${breakpoints.sm} {
    padding: 0.5rem 0.5rem !important;
  }

  :hover {
    border: none !important;
    cursor: pointer;
  }
`;


export class MyAccountContainer extends React.Component {
  state = {
    activeTab: 1,
  };

  componentDidMount() {
    const { activeTab } = this.props;

    if (activeTab) {
      this.setState({
        activeTab: activeTab,
      });
    }
  }

  toggleTab = value => {
    this.setState(prevState => {
      if (prevState.activeTab !== value) {
        return { activeTab: value };
      }
    });
  };

  render() {
    const { activeTab } = this.state;
    const {
      subscriptions,
    } = this.props;
    const requireOTP = this.props.user ? (this.props.user.isMedicalAdmin
      || this.props.user.isMedicalProvider
      || this.props.user.isSuperuser) : false;

    const navItems = [
      {
        id: 1,
        title: 'Personal info',
      },
      {
        id: 2,
        title: 'Shipping address',
      },
      {
        id: 3,
        title: 'Payment method',
      },
      {
        id: 4,
        title: 'Orders history',
      },
    ];

    requireOTP && navItems.push({
      id: 5,
      title: 'Security'
    })

    const tabContents = [
      {
        id: 1,
        content: <EditMyAccountDetails selectedTab={myAccountTabs.myProfile} />,
      },
      {
        id: 2,
        content: <EditMyAccountDetails
          selectedTab={myAccountTabs.shippingAddress}
          subscriptions={subscriptions}
        />,
      },
      {
        id: 3,
        content: <EditMyAccountDetails 
          selectedTab={myAccountTabs.paymentMethod}
          subscriptions={subscriptions}
        />,
      },
      {
        id: 4,
        content: <MyOrders mostRecentOrderId={this.props.mostRecentOrderId} />,
      },
    ];

    requireOTP && tabContents.push({
      id: 5,
      content: <AccountSettings />
    })

    return (
      <Container>
        <BoxContainer>
          <BoxHeaderWrapper>
            <StyledNav>
              {navItems.map(navItem => (
                <StyledNavItem key={navItem.id} isActive={activeTab === navItem.id}>
                  <StyledNavLink
                    onClick={() => {
                      this.toggleTab(navItem.id);
                    }}
                  >
                    {navItem.title}
                  </StyledNavLink>
                </StyledNavItem>
              ))}
            </StyledNav>
          </BoxHeaderWrapper>
          <TabContent activeTab={activeTab}>
            {tabContents.map(tabContent => (
              <TabPane key={tabContent.id} tabId={tabContent.id}>
                {tabContent.content}
              </TabPane>
            ))}
          </TabContent>
        </BoxContainer>
      </Container>
    );
  }
}
