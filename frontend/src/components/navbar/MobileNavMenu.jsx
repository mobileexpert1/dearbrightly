import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { Collapse, Container, Nav, Navbar, NavItem, NavLink } from 'reactstrap';
import { colors, mobileFirstBreakpoints, breakpoints, fontFamily, fontWeight } from 'src/variables';
import megaphoneIcon from 'src/assets/images/megaphoneIcon.svg';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { sharingEntryPointOptions } from 'src/features/sharingProgram/constants/sharingProgramConstants';
import { saveIfEmpty } from 'src/common/helpers/localStorage';
import UserDashboardNavbarItems from './UserDashboardNavbarItems';
import closeMenuIcon from 'src/assets/images/closeMenuIcon.svg';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');

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
      padding: 20px 0;
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

    .mobile-padding {
      ${mobileFirstBreakpoints.xs} {
        padding: 15px 4px !important;
        border-bottom: 1px solid rgba(36, 39, 42, 0.06);
      }

      ${mobileFirstBreakpoints.lg} {
        padding: 15px 20px !important;
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
            font-weight: bold;
            color: ${colors.screamingGray};
          }

          ${mobileFirstBreakpoints.xs} {
            font-weight: normal;
          }

          ${mobileFirstBreakpoints.lg} {
            font-weight: 800;
          }
        }

        .mobile-padding: {
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
          padding: 8px 2px;
        }
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

const WelcomeText = styled.div`
  ${breakpoints.md} {
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    font-size: 16px;
    line-height: 18px;
    transition: all 0.4s ease-in-out 0s;
    margin-left: 20px;
    margin-top: 10px;
  }
`;

const AccountHeadingText = styled.div`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: 16px;
  line-height: 18px;
  transition: all 0.4s ease-in-out 0s;

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }
  ${mobileFirstBreakpoints.xl} {
    display: none;
  }
`;

const InviteFriendsButton = styled.button`
  cursor: pointer;
  width: 100%;
  height: 55px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px;
  color: ${colors.facebookBlue};
  background-color: white;
  display: flex;
  justify-content: center;
  border: 1px solid ${colors.facebookBlue};

  :hover {
    opacity: 0.5;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }
`;

const GetStartedMobileButton = styled.button`
  cursor: pointer;
  width: 100%;
  height: 55px;
  border-radius: 4px;
  background: ${colors.facebookBlue};
  display: flex;
  justify-content: center;
  line-height: 18px;
  margin-top: 12px;
  color: ${colors.linen};
  border: 1px solid ${colors.facebookBlue};

  ${mobileFirstBreakpoints.md} {
    margin-top: 0;
    margin-left: 12px;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }

  ${mobileFirstBreakpoints.xl} {
    display: none;
  }

  :hover {
    opacity: 0.5;
  }
`;

const GetStartedMobileButtonText = styled.span`
  margin-top: 15px;
  color: white;
  height: auto;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  line-height: 18px;
  font-size: 14px;
`;

const MobileNavFooter = styled.div`
  width: 100%;

  ${mobileFirstBreakpoints.md} {
    display: flex;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }
`;

const InviteFriendsButtonText = styled.span`
  ${mobileFirstBreakpoints.xs} {
    margin-top: 15px;
    color: ${colors.facebookBlue};
    font-style: normal;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    line-height: 18px;
    font-size: 14px;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }

  ${mobileFirstBreakpoints.xl} {
    display: none;
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

const TogglerIcon = styled.img`
  ${breakpoints.md} {
    position: absolute;
    cursor: pointer;
    width: 26px;
    height: 17px;
    margin-top: 3px;
    right: 20px;
  }

  ${mobileFirstBreakpoints.lg} {
    display: none;
  }
`;


class MobileNav extends React.Component {
  renderNav = (
    goToPage,
    goToProductPage,
    isAuthenticatedUser,
    logout,
    toggleNav,
    userState
  ) => (
      <Navbar expand="lg">
        <Container fluid={true}>
          <WelcomeText isAuthenticatedUser>
            {isAuthenticatedUser && userState && userState.firstName ? `Hi ${userState.firstName}!` : 'Welcome to Dear Brightly!'}
          </WelcomeText>
          <TogglerIcon
            isOpen={true}
            onClick={toggleNav}
            src={closeMenuIcon}
          />
          <Collapse isOpen={true} navbar>
            <Nav className="mr-auto" navbar>
              <React.Fragment>
                {/*<NavItem>*/}
                {/*  <NavLink className="mobile-padding" onClick={e => goToPage('/products', e)}>*/}
                {/*    Products*/}
                {/*</NavLink>*/}
                {/*</NavItem>*/}
                {/*<NavItem>*/}
                {/*  <NavLink className="mobile-padding" onClick={e => goToPage('/about', e)}>*/}
                {/*    About us*/}
                {/*</NavLink>*/}
                {/*</NavItem>*/}
                {/*<NavItem>*/}
                {/*  <NavLink className="mobile-padding" onClick={e => goToExternalPage('https://support.dearbrightly.com/', e)}>*/}
                {/*    FAQ*/}
                {/*</NavLink>*/}
                {/*</NavItem>*/}
                {isAuthenticatedUser && (
                  <AccountHeadingText className="mobile-padding">Account</AccountHeadingText>
                )}
                {isAuthenticatedUser && (
                  <UserDashboardNavbarItems goToPage={goToPage} />
                )}
                {!isAuthenticatedUser ? (
                  <React.Fragment>
                    <NavItem>
                      <NavLink className="mobile-padding" onClick={e => goToPage('/login', e)}>
                        Log in
                    </NavLink>
                    </NavItem>
                  </React.Fragment>
                ) : (
                    <NavItem>
                      <NavLink
                        className="mobile-padding"
                        onClick={e => {
                          logout(e);
                        }}
                      >
                        Log out
                  </NavLink>
                    </NavItem>
                  )}
              </React.Fragment>
            </Nav>
            <MobileNavFooter>
              <InviteFriendsButton
                onClick={e => {
                  GTMUtils.trackCall('navbar-share_click');
                  saveIfEmpty('sp_ep', sharingEntryPointOptions.navigationBar);
                  goToPage('/sharing-program', e, 'Share');
                }}
              >
                <MegaphoneIcon src={megaphoneIcon} />
                <InviteFriendsButtonText>Invite friends</InviteFriendsButtonText>
              </InviteFriendsButton>
              {!userState && (
                <GetStartedMobileButton onClick={e => goToPage('/products', e, 'Buy')}>
                  <GetStartedMobileButtonText>Shop today</GetStartedMobileButtonText>
                </GetStartedMobileButton>
              )}
            </MobileNavFooter>
          </Collapse>
        </Container>
      </Navbar>
    );


  render() {
    const {
      goToPage,
      goToProductPage,
      isAuthenticatedUser,
      logout,
      toggleNav,
      userState
    } = this.props;

    return (
      <Header>
        {this.renderNav(
          goToPage,
          goToProductPage,
          isAuthenticatedUser,
          logout,
          toggleNav,
          userState
        )}
      </Header>
    );
  }
}

const mapStateToProps = state => ({
});

export const MobileNavMenu = connect(
  mapStateToProps,
)(MobileNav);
