import React from 'react';

import styled, { css } from 'react-emotion';
import { connect } from 'react-redux';
import { Collapse, Container, Nav, Navbar, NavItem, NavLink } from 'reactstrap';
import { history } from 'src/history';
import { breakpoints, colors, fontSize, mobileFirstBreakpoints, fontFamily, fontWeight } from 'src/variables';
import megaphoneIcon from 'src/assets/images/megaphoneIcon.svg';
import { isAuthenticated } from 'src/features/auth/selectors/authenticationSelectors';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { logOutRequest } from 'src/features/auth/actions/authenticationActions';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { sharingEntryPointOptions } from 'src/features/sharingProgram/constants/sharingProgramConstants';
import closeMenuIcon from 'src/assets/images/closeMenuIcon.svg';
import openMenuIcon from 'src/assets/images/openMenuIcon.svg';
import { MobileNavMenu } from 'src/components/navbar/MobileNavMenu';
import { saveIfEmpty } from 'src/common/helpers/localStorage';
import { UserNotifications } from "./UserNotifications";
import { getMedicalVisit } from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import Logo from 'src/components/Logo';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');

const cartIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/cart_2x.svg';
const logo = 'https://d17yyftwrkmnyz.cloudfront.net/dearbrightly_rgb_darkb_2x.png';
const stripe = 'https://d17yyftwrkmnyz.cloudfront.net/db_stripe_x1.png';


const Header = styled('header')`
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 9999;
  transition: all 0.4s ease-in-out 0s;
  background-color: ${colors.clear};

  &.fixed {
    .navbar {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08);
      padding: 8px 0;

      ${mobileFirstBreakpoints.xs} {
        padding: 16px 0;
      }

      ${mobileFirstBreakpoints.sm} {
        padding: 16px 0;
      }

      @media (min-width: 992px) {
        padding: 12px 0;
      }
    }
  }

  .navbar {
    background-color: ${colors.clear} !important;
    border: 0;
    border-radius: 0;
    margin: 0;
    padding: 12px 0;
    transition: 0.8s ease;
    transition: all 0.4s ease-in-out 0s;
    top: -1px;

    @media (min-width: 992px) {
      padding: 0;
    }

    .navbar-nav {
      &:first-child {
        ${breakpoints.md} {
          border-top: 1px solid rgba(36, 39, 42, 0.06);
          margin-top: 4px;
        }
      }
    }

    .navbar-toggler {
      .navbar-toggler-icon {
      }
      &.opened {
        .navbar-toggler-icon {
          &:after {
            transform: translateY(3px) rotate(-135deg);
          }
          &:before {
            transform: translateY(-7px) rotate(135deg);
          }
        }
      }
    }

    .desktop-padding {
      ${mobileFirstBreakpoints.xs} {
        padding: 18px 4px !important;
        border-bottom: 1px solid rgba(36, 39, 42, 0.06);
      }

      ${mobileFirstBreakpoints.lg} {
        padding: 18px 20px !important;
        border-bottom: 0px;
        max-width: 550px;
      }
    }

    .container {
      position: relative;
    }

    .navbar-toggler {
      position: absolute;
      left: 0px;
      top: -8px;
      background: transparent;
      border: 0;
      padding: 30px 20px 20px;
      display: block;
      z-index: 9999;
      height: 30px;

      @media (min-width: 992px) {
        display: none;
      }

      &:focus {
        outline: 0;
      }

      .navbar-toggler-icon {
        height: 2px;
        padding: 0;
        margin: 0;
        position: relative;
        margin-top: -12px;
        width: 20px;
        border-radius: 100px;
        transition: all 0.3s ease-in-out 0s;

        &.cross {
          transform: rotate(45deg);
          margin-top: -2px;
          z-index: 999;
          background: #696969;

          &:before {
            transform: rotate(90deg);
            margin-top: -10px;
            background: #696969;
          }
        }

        &:before {
          content: '';
          background: ${colors.mulberry};
          border-radius: 100px;
          height: 1px;
          width: 100%;
          position: absolute;
          top: 10px;
          display: block;
          transition: transform 0.6s 0s;
        }

        &:after {
          content: '';
          background: ${colors.finch};
          border-radius: 100px;
          height: 1px;
          width: 100%;
          position: absolute;
          top: 0px;
          display: block;
          transition: transform 0.6s 0s;
        }

        &:hover,
        &:focus {
          box-shadow: none;
        }
      }
    }

    .navbar-collapse {
      @media (max-width: 991px) {
        position: fixed;
        width: 100%;
        left: 0;
        top: 47px;
        bottom: 0;
        background: ${colors.clear};
        z-index: 99;
        padding: 10px 15px 20px;
        transition: all 0.4s ease-in-out 0s;
        transform: scale(0);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      ${mobileFirstBreakpoints.lg} {
        margin-right: 35px;
      }

      &.show {
        transform: scale(1);
      }
      .navbar-nav {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .navbar-nav {
      .nav-item {
        .nav-link {
          font-size: 14px;
          line-height: 1.29;
          color: ${colors.dark};
          font-family: ${fontFamily.baseFont};
          padding: 8px 24px;
          &:hover,
          &:focus {
            font-weight: normal;
            color: ${colors.screamingGray};
          }

          ${mobileFirstBreakpoints.xs} {
            font-weight: normal;
          }

          ${mobileFirstBreakpoints.lg} {
            font-weight: 800;
          }
        }

        .desktop-padding: {
          ${breakpoints.sm} {
            padding: 18px 24px !important;
            border-bottom: 1px solid rgba(36, 39, 42, 0.06);
          }
          ${breakpoints.md} {
            padding: 18px 24px !important;
            border-bottom: 1px solid rgba(36, 39, 42, 0.06);
            max-width: 550px;
          }
        }

        .small-padding {
          padding: 8px 2px 8px 15px;
        }

        .no-padding {
          padding: 8px 6px 8px 0px;
        }
      }
    }

    .shopping-cart {
      position: absolute;
      right: 25px;
      flex-direction: row;

      ${breakpoints.md} {
        right: 48px;
      }

      ${mobileFirstBreakpoints.lg} {
        position: relative;
      }
    }
  }
`;

export const PrimaryButton = styled('button')`
  font-family: ${fontFamily.baseFont};
  font-size: 15px;
  line-height: 1.2;
  width: 247px;
  height: 50px;
  letter-spacing: 2.14px;
  border-radius: 4px;
  border: none;
  background-color: ${colors.blumine};
  color: ${colors.clear};
  cursor: pointer;
  text-transform: uppercase;
  &:hover {
    background-color: ${colors.stTropaz};
  }
  &:focus {
    box-shadow: none;
    outline: 0;
  }
  &:active {
    background-color: ${colors.stTropaz};
  }
`;

const TogglerIcon = styled.img`
  ${breakpoints.md} {
    position: absolute;
    cursor: pointer;
    width: 24px;
    height: 16px;
    margin-top: 3px;
    right: 17px;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }
`;

const RainbowBar = styled.div`
  background: url(${stripe}) repeat;
  height: 33px;
  max-height: ${({ hide }) => (hide ? 0 : '33px')};
  transition: max-height 0.4s linear;
  background-size: contain;
`;

const PromoBar = styled.div`
  position: relative;
  background-color: ${colors.medBlue};
  color: ${colors.white};
  font-family: ${fontFamily.baseFont};
  font-size: 12px;
  letter-spacing: 1px;
  height: 48px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: top 0.4s linear, max-height 0.4s linear;
  
  ${breakpoints.xs} {
    padding: 15px;
    font-size: 10px;
  }
  
  ${({ hide }) =>
    hide
      ? css`
          max-height: 0;
          top: -50px;
        `
      : css`
          max-height: 45px;
          top: 0;
        `};
`;


const DesktopNavItem = styled(NavItem)`
  cursor: pointer;
  ${breakpoints.md} {
    display: none;
  }

  nav-link.desktop-padding: {
    ${breakpoints.sm} {
      padding: 18px 24px !important;
      border-bottom: 1px solid rgba(36, 39, 42, 0.06);
    }

    ${breakpoints.md} {
      padding: 18px 24px !important;
      border-bottom: 1px solid rgba(36, 39, 42, 0.06);
      max-width: 550px;
    }
  }
`;


const ShoppingCartButton = styled.button`
  background: url(${cartIcon}) center no-repeat;
  background-size: contain;
  display: ${props => props.isOpen && 'none'};
  width: 40px;
  height: 35px;
  padding: 0 !important;
  margin-right: 10px;
  border: 0;
  margin-top: 0.6rem;
  cursor: pointer;

  ${mobileFirstBreakpoints.xs} {
    width: 42px;
    margin: 8px 0 0 0;
  }

  ${mobileFirstBreakpoints.lg} {
    width: 40px;
    height: 40px;
    margin-top: 0.7rem;
    margin-right: 20px;
  }

  .notification-icon {
    font-size: 10px;
    color: ${colors.black};
    text-align: center;
    font-style: normal;
    height: 15px;
    line-height: 16px;
    width: 15px;
    position: absolute;
    left: 15px;
    top: 3px;

    ${mobileFirstBreakpoints.lg} {
      height: 17px;
      line-height: 17px;
      width: 17px;
      font-size: 11px;
      top: 13px;
    }
  }
`;

const ShareButton = styled.button`
  cursor: pointer;
  width: auto;
  height: 55px;
  background: ${colors.clear};
  border-radius: 4px;
  border: 1px solid ${colors.facebookBlue};
  display: flex;
  justify-content: space-between;
  padding: 12px 24px;
  padding-top: 16px;

  :hover {
    opacity: 0.5;
  }

  ${breakpoints.md} {
    display: none;
  }
`;

const ShareButtonText = styled.span`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.normal};

  ${mobileFirstBreakpoints.xs} {
    margin-top: 0.3em;
    color: ${colors.facebookBlue};
  }

  ${mobileFirstBreakpoints.lg} {
    margin-top: 0.1em;
    font-size: ${fontSize.normal};
  }
`;

const GetStartedButton = styled.button`
  cursor: pointer;
  width: 100%;
  border-radius: 4px;
  background: ${colors.facebookBlue};
  justify-content: center;
  line-height: 18px;
  border: 1px solid ${colors.facebookBlue};
  height: 30px;
  margin: 3px 0 0 0;
  ${mobileFirstBreakpoints.lg} {
    margin: 0 5px 0 10px;
    height: 55px;
  }
  :hover {
    opacity: 0.5;
  }
`;

const GetStartedButtonText = styled.span`
  font-size: ${fontSize.normal};
  color: white;
  height: auto;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  line-height: 18px;

  ${breakpoints.sm} {
    font-size: ${fontSize.smallest};
    margin-top: 5px;
  }
`;

const MegaphoneIcon = styled.img`
  ${mobileFirstBreakpoints.xs} {
    margin-top: 15px;
    position: absolute;
    left: 34px;
    height: 27px;
  }

  ${mobileFirstBreakpoints.lg} {
    margin-top: 0;
    position: relative;
    left: -12px;
    height: 27px;
  }
`;

const NotificationBubbleMobile = styled.div`
  @media (min-width: 320px) and (max-width: 992px) {
    position: relative;
    right: 5;
    top: -5px;
    z-index: 1;
  }
  @media (min-width: 992px) {
    display: none;
  }
`

class TopNavbar extends React.Component {
  state = {
    openNav: false,
    navWithShadow: false,
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleOnScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleOnScroll);
  }

  goToPage = (page, e, menuName = undefined) => {
    this.setState({
      openNav: false,
    });

    if (e.target.text !== 'Dashboard' && e.target.text !== 'EMR') {
      const menu = menuName ? menuName : e.target.text
      if (menu) {
        GTMUtils.trackCall('navbar_click', {
          navbar_menu: menu.toLowerCase(),
        });
      }
    }

    e.preventDefault();
    history.push(page);
  };

  goToExternalPage = (page, e) => {
    e.preventDefault();
    window.location.href = page;
  };

  goToProductPage = (page, e) => {
    this.setState({
      openNav: false,
    });

    e.preventDefault();
    history.push(page);
  };

  handleOnScroll = () => {
    if (!this.state.openNav) {
      if (window.scrollY > 20) {
        this.setState({
          navWithShadow: true,
        });
      } else {
        this.setState({
          navWithShadow: false,
        });
      }
    }
  };

  toggleNav = () => {
    this.setState(prevState => ({
      openNav: !prevState.openNav,
    }));
  };

  openCheckout = e => {
    e.preventDefault();
    this.props.navigateCheckout('your plan', true);
  };

  logout = e => {
    if (e) {
      e.preventDefault();
      localStorage.setItem('logout_by_user', true);
      this.props.logOutRequest();
    }
  };

  showShareButton = () => {
    if (!window.location.pathname.startsWith('/sharing-program')) {
      return (
        <NavItem className="buy-button">
          <NavLink
            className="nav-link small-padding"
            onClick={e => {
              GTMUtils.trackCall('navbar-share_click');
              saveIfEmpty('sp_ep', sharingEntryPointOptions.navigationBar);
              this.goToPage('/sharing-program', e, 'Share');
            }}
          >
            <ShareButton>
              <MegaphoneIcon src={megaphoneIcon} />
              <ShareButtonText>Invite friends</ShareButtonText>
            </ShareButton>
          </NavLink>
        </NavItem>
      );
    }
  };

  showGetStartedButton = () => {
    if (
      !(
        window.location.pathname.startsWith('/product-details') ||
        window.location.pathname.startsWith('/products')
      )
    ) {
      return (
        <NavItem className="buy-button">
          <NavLink
            className="nav-link no-padding"
            onClick={e => {
              GTMUtils.trackCall('navbar-buy_click');
              this.goToPage('/products', e, 'Buy');
            }}
          >
            <GetStartedButton>
              <GetStartedButtonText>Shop today</GetStartedButtonText>
            </GetStartedButton>
          </NavLink>
        </NavItem>
      );
    }
  };

  renderNav = (
    isAuthenticatedUser,
    isSuperuser,
    isMedicalAdmin,
    isMedicalProvider,
    rxSubscription,
    navigateOrderCheckout,
    userState,
    visit
  ) => (
    <div>
      {this.state.openNav ? (
        <MobileNavMenu
          isAuthenticatedUser={isAuthenticatedUser}
          userState={userState}
          goToPage={this.goToPage}
          goToExternalPage={this.goToExternalPage}
          goToProductPage={this.goToProductPage}
          logout={this.logout}
          toggleNav={this.toggleNav}
        />
      ) : (
        <Navbar expand="lg">
          <Container fluid={true}>
            <div style={{ position: "absolute", marginLeft: 22, display: "contents" }}>
              <Logo onClick={e => this.goToPage('/', e, 'Home Logo')} />
            </div>

            <NotificationBubbleMobile>
              <UserNotifications
                visit={visit}
                user={userState}
                navigateOrderCheckout={navigateOrderCheckout}
                rxSubscription={rxSubscription}
                isUserDashboardView={false}
              />
            </NotificationBubbleMobile>
            <TogglerIcon
              isOpen={this.state.openNav}
              onClick={this.toggleNav}
              src={this.state.openNav ? closeMenuIcon : openMenuIcon}
            >

            </TogglerIcon>
            <Collapse isOpen={this.state.openNav} navbar>
              <Nav className="mr-auto" navbar>
                {/*<DesktopNavItem>*/}
                {/*  <NavLink className="desktop-padding" onClick={e => this.goToPage('/products', e)}>*/}
                {/*    Products*/}
                {/*  </NavLink>*/}
                {/*</DesktopNavItem>*/}
                {/*<DesktopNavItem>*/}
                {/*  <NavLink className="desktop-padding" onClick={e => this.goToPage('/about', e)}>*/}
                {/*    About us*/}
                {/*  </NavLink>*/}
                {/*</DesktopNavItem>*/}
                {/*<DesktopNavItem>*/}
                {/*  <NavLink className="desktop-padding" onClick={e => this.goToExternalPage('https://support.dearbrightly.com/', e)}>*/}
                {/*    FAQ*/}
                {/*  </NavLink>*/}
                {/*</DesktopNavItem>*/}
                {!isAuthenticatedUser && (
                  <DesktopNavItem>
                    <NavLink className="desktop-padding" onClick={e => this.goToPage('/login', e)}>
                      Log in
                    </NavLink>
                  </DesktopNavItem>
                )}
                {isAuthenticatedUser && (
                  <DesktopNavItem>
                    <NavLink
                      className="desktop-padding"
                      onClick={e => this.goToPage('/user-dashboard/my-plan', e, 'Account')}
                    >
                      <UserNotifications
                        visit={visit}
                        user={userState}
                        navigateOrderCheckout={navigateOrderCheckout}
                        rxSubscription={rxSubscription}
                        isUserDashboardView={false}
                      >
                        <div>Account</div>
                      </UserNotifications>
                    </NavLink>
                  </DesktopNavItem>
                )}
                {isSuperuser && (
                  <DesktopNavItem>
                    <NavLink className="desktop-padding" onClick={e => this.goToPage('/admin-dashboard', e)}>Admin</NavLink>
                  </DesktopNavItem>
                )}
                {(isMedicalAdmin || isMedicalProvider) && (
                  <DesktopNavItem>
                    <NavLink className="desktop-padding" onClick={e => this.goToPage('/emr/visits#status=Provider%20Pending%20Action&service=&state=', e)}>EMR</NavLink>
                  </DesktopNavItem>
                )}
                {(isSuperuser || isMedicalAdmin || isMedicalProvider) && (
                  <DesktopNavItem>
                    <NavLink className="desktop-padding" onClick={e => this.logout(e)}>Log out</NavLink>
                  </DesktopNavItem>
                )}
              </Nav>
            </Collapse>
            {/*<Nav className="ml-auto shopping-cart" navbar>*/}
            {/*  <NavItem className="cart-btn">*/}
            {/*    <ShoppingCartButton*/}
            {/*      onClick={this.openCheckout}*/}
            {/*      type="button"*/}
            {/*      isOpen={this.state.openNav}*/}
            {/*    >*/}
            {/*      {shoppingBagQuantity > 0 && (*/}
            {/*        <i className="notification-icon">{shoppingBagQuantity}</i>*/}
            {/*      )}*/}
            {/*    </ShoppingCartButton>*/}
            {/*  </NavItem>*/}
            {/*  {this.showShareButton()}*/}
            {/*  {!userState && (*/}
            {/*    this.showGetStartedButton()*/}
            {/*  )}*/}
            {/*</Nav>*/}
          </Container>
        </Navbar>
      )}
    </div>
  );

  render() {
    const { rxSubscription, navigateOrderCheckout, userState, visit } = this.props;
    const isAuthenticatedUser = userState ? this.props.isAuthenticated : false;
    const isUserDashboard = userState ? this.props.isUserDashboard : false;
    const isMedicalAdmin = userState ? userState.isMedicalAdmin : false;
    const isMedicalProvider = userState ? userState.isMedicalProvider : false;
    const isSuperuser = isAuthenticatedUser ? userState.isSuperuser : false;

    return (
      <Header className={this.state.navWithShadow ? 'fixed' : ''}>
        <PromoBar hide={this.state.navWithShadow || this.state.openNav || isUserDashboard}>
          {/*<span>Enjoy free shipping on all items.</span>*/}
        </PromoBar>
        <RainbowBar hide={this.state.navWithShadow || this.state.openNav || isUserDashboard} />
        {this.renderNav(
          isAuthenticatedUser,
          isSuperuser,
          isMedicalAdmin,
          isMedicalProvider,
          rxSubscription,
          navigateOrderCheckout,
          userState,
          visit
        )}
      </Header>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: isAuthenticated(state),
  rxSubscription: getMostRecentRxSubscription(state),
  userState: getUserData(state),
  visit: getMedicalVisit(state),
});

export const NavbarContainer = connect(
  mapStateToProps,
  { logOutRequest },
)(TopNavbar);
