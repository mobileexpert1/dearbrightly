import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { NavbarBrand } from 'reactstrap';
import DownOutlined from '@ant-design/icons/DownOutlined';
import Dropdown from 'rc-dropdown';
import Menu, { MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';

import openMenuIcon from 'src/assets/images/openMenuIcon.svg';
import closeMenuIcon from 'src/assets/images/closeMenuIcon.svg';

import { history } from 'src/history';
import { colors, breakpoints } from 'src/variables';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { logOutRequest } from 'src/features/auth/actions/authenticationActions';
import { MobileNavMenu } from 'src/components/navbar/MobileNavMenu';
import { getMedicalVisit } from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { UserNotifications } from './UserNotifications';
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import Logo from 'src/components/Logo';
import Arrow from 'src/assets/images/arrowLeft.svg';
import ArrowDown from 'src/assets/images/arrowDown.svg';

const logo = 'https://d17yyftwrkmnyz.cloudfront.net/dearbrightly_rgb_darkb_2x.png';

const NavbarWrapper = styled.div`
  z-index: 9;
  position: fixed;
  width: 100%;
  padding-top: 13px;
  padding-bottom: 13px;
  display: flex;
  top: 0;
  background: ${colors.clear};
  min-height: 4.5em;

  ${breakpoints.md} {
    padding-top: 20px;
    padding-bottom: 16px;
  }

  ${breakpoints.xs} {
    position: fixed;
    height: 4.5rem;
    top: 0;
    padding-top: 1.2rem;
    padding-bottom: 0.75rem;
  }

  .navbar-collapse {
    @media (max-width: 991px) {
      position: fixed;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between;
      width: 100%;
      left: 0;
      top: 69px;
      bottom: 0;
      background: ${colors.veryLightGray};
      z-index: 99;
      padding: 10px 15px 20px 53px;
      transition: all 0.4s ease-in-out 0s;
      -webkit-transition: all 0.4s ease-in-out 0s;
      -moz-transition: all 0.4s ease-in-out 0s;
      transform: scale(0);
      -webkit-transform: scale(0);
      -moz-transform: scale(0);
      overflow-y: auto;
    }

    &.show {
      transform: scale(1);
      -webkit-transform: scale(1);
      -moz-transform: scale(1);
    }
  }
`;

const Brand = styled(NavbarBrand)`
  background: url(${logo}) center no-repeat;
  margin-left: 20px !important;
  background-size: 80px;
  height: 33px;
  width: 88px;
  padding: 0;
  margin: 0;
  transition: all 0.4s ease-in-out 0s;
  position: relative;
  cursor: pointer;

  @media (min-width: 992px) {
    background: url(${logo}) center left no-repeat;
    background-size: 110px 45px;
    margin-left: 20px !important;
    height: 45px;
    margin: inherit;
    width: 110px;
    margin-right: 40px;
  }
`;

const TogglerIcon = styled.img`
  display: none;

  ${breakpoints.md} {
    display: block;
    position: absolute;
    width: 20px;
    height: 17px;
    margin-top: 3px;
    top: 21px;
    right: 20px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 1280px;
  margin: 0 auto;
`;

const UserNameWrapper = styled.div`
  position: absolute;
  right: 40px;
  top: 22px;
  display: ${props => (props.isVisible ? 'flex' : 'none')};
`;

const StyledIcon = styled(DownOutlined)`
  fill: ${colors.black};
  padding-left: 10px;
  color: black;
`;

const StyledDropdownLink = styled.a`
  margin-left: 0.5rem;
  margin-top: 0.3rem;
`;

const LogoutDropdown = styled(Dropdown)`
  display: initial;

  ${breakpoints.md} {
    display: none;
  }
`;

const ArrowIcon = styled.img`
  padding-bottom: 0.2rem;
`;

const ReturnButton = styled.button`
  margin-right: 65%;
  font-size: 10px;
  font-weight: 800;
  width: 100%;
  text-transform: uppercase;
  background: ${colors.white};
  border: none;

  &:focus:not(:focus-visible) {
    outline: none;
  }

  ${breakpoints.md} {
    display: none;
  }
`;

const ReturnButtonText = styled.span`
  padding-left: 0.5rem;
`;

const WelcomeUser = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: black;
`;
class UserDashboardNavbar extends React.Component {
  state = {
    isTop: true,
    openNav: false,
  };

  handleScroll = () => {
    const isTop = window.scrollY < 60;
    if (isTop !== this.state.isTop) {
      this.setState({ isTop });
    }
  };

  goToPage = (page, e) => {
    e.preventDefault();
    history.push(page);
    this.setState(prevState => ({
      openNav: false,
    }));
  };

  goToProductPage = (page, e) => {
    this.setState({
      openNav: false,
    });

    e.preventDefault();
    history.push(page);
  };

  toggleNav = () => {
    this.setState(prevState => ({
      openNav: !prevState.openNav,
    }));
  };

  logout = e => {
    if (e) {
      e.preventDefault();
      localStorage.setItem('logout_by_user', true);
      this.props.logOutRequest();
    }
  };

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll);
  }

  render() {
    const { isTop } = this.state;
    const {
      user,
      visit,
      isAuthenticatedUser,
      rxSubscription,
      navigateOrderCheckout,
    } = this.props;

    const userFirstName = user && user.firstName;
    const menu = (
      <Menu>
        <MenuItem>
          <a href="#" className="nav-link" onClick={this.logout}>
            Log out
          </a>
        </MenuItem>
      </Menu>
    );
    return (
      <div>
        {this.state.openNav ? (
          <MobileNavMenu
            isAuthenticatedUser={isAuthenticatedUser}
            userState={user}
            goToPage={this.goToPage}
            goToProductPage={this.goToProductPage}
            logout={this.logout}
            toggleNav={this.toggleNav}
          />
        ) : (
          <NavbarWrapper isTop={isTop}>
            <ContentWrapper>
              <div style={{ marginLeft: 22, width: '100%' }}>
                <Logo onClick={e => this.goToPage('/', e, 'Home Logo')} />
              </div>
              <ReturnButton onClick={e => this.goToPage('/', e, 'Home Logo')}>
                <ArrowIcon src={Arrow} /> <ReturnButtonText>back to website</ReturnButtonText>
              </ReturnButton>
              <TogglerIcon
                isOpen={this.state.openNav}
                onClick={this.toggleNav}
                src={
                  this.state.openNav
                    ? closeMenuIcon
                    : this.props.isAuthenticatedUser
                      ? openMenuIcon
                      : openMenuIcon
                }
              />
            </ContentWrapper>
            <UserNameWrapper isVisible={!this.state.openNav}>
              <UserNotifications
                visit={visit}
                user={user}
                navigateOrderCheckout={navigateOrderCheckout}
                rxSubscription={rxSubscription}
                isUserDashboardView={true}
              />
              <LogoutDropdown overlay={menu}>
                <StyledDropdownLink className="ant-dropdown-link" href="#">
                  <WelcomeUser>Hi {userFirstName},</WelcomeUser>
                  <StyledIcon />
                </StyledDropdownLink>
              </LogoutDropdown>
            </UserNameWrapper>
          </NavbarWrapper>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    user: getUserData(state),
    visit: getMedicalVisit(state),
    rxSubscription: getMostRecentRxSubscription(state),
  }),
  { logOutRequest },
)(UserDashboardNavbar);
