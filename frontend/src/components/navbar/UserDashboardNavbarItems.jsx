import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { NavItem, NavLink } from 'reactstrap';
import { fontSize, colors, mobileFirstBreakpoints } from 'src/variables';
import { getUserData, hasUnreadMessages } from 'src/features/user/selectors/userSelectors';
import { getMedicalVisit } from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {
  isUserActionRequired,
  isSubscriptionNone,
} from 'src/features/dashboard/helpers/userStatuses';
import { getMostRecentRxSubscription } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import {
  getProgressAnswers,
  getQuestionsLength,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import {
  isUserSkinProfileActionRequired,
  isVisitSkinProfileComplete,
  getUserSkinProfileAction,
} from 'src/features/dashboard/helpers/userStatuses';
import { getOrder } from 'src/features/orders/selectors/orderSelectors';


const StyledNavItem = styled(NavItem)`
  display: ${props => (props.hideItem ? 'none' : 'flex')};
  border-bottom: 1px solid rgba(36,39,42,0.06);
`;

const MobileNavLink = styled(NavLink)`
  font-size: ${fontSize.big};
  padding-bottom: 12px !important;
  width: 100%;

  ${mobileFirstBreakpoints.xs} {
    padding: 15px 4px !important;
  }

  ${mobileFirstBreakpoints.lg} {
    padding: 15px 4px !important;
    border-bottom: 1px solid rgba(36, 39, 42, 0.06);
    max-width: 550px;
  }
`;

const MobileNavWithNotificationLink = styled(NavLink)`
  font-size: ${fontSize.big};
  padding-bottom: 12px !important;
  width: 100%;

  ${mobileFirstBreakpoints.xs} {
    padding: 0 0 0 4px !important;
  }

  ${mobileFirstBreakpoints.lg} {
    padding: 0 0 0 4px !important;
    border-bottom: 1px solid rgba(36, 39, 42, 0.06);
    max-width: 550px;
  }
`;

const MenuNotificationContainer = styled.table`
  width: 100%;
  height: 50px;
`

const MenuNotificationRow = styled.tr`
  width: 100%;
  vertical-align: middle;
`;

const MenuNotificationButtonContainer = styled.td`
  text-align: right;
  width: 40%;
`;

const MenuText = styled.td`
  font-size: ${fontSize.small};
  vertical-align: middle;
  text-align: left;
  width: 60%;
`;

const NotificationButton = styled.button`
  cursor: pointer;
  width: 100%;
  height: 40px;
  background: ${colors.mulberryOpacity};
  border-radius: 4px;
  margin: 5px 0;
  border: none;
  color: ${colors.mulberry};
  padding: 5px;
  font-weight: 600;
  font-size: ${fontSize.smallest};

  :hover {
    background: ${colors.mulberry};
    color: ${colors.clear};
  }
`;

const NotificationDotWrapper = styled.div`
  width: auto;
`;

const NotificationDotContainer = styled.div`
  vertical-align: middle;
`;

const NotificationDot = styled.div`
  text-align: center;
  margin: 10px;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${colors.mulberry};
  display: ${props => (props.userActionRequired ? 'block' : 'none')};
`;


class UserDashboardNavbarItems extends React.Component {

  render() {
    const { goToPage, user, visit, rxSubscription, pendingCheckoutOrder, userHasUnreadMessages } = this.props;
    const userActionRequired = isUserActionRequired(user, visit, rxSubscription, pendingCheckoutOrder);
    const noRxSubscription = isSubscriptionNone(rxSubscription);
    const userSkinProfileAction = getUserSkinProfileAction(user, visit);
    const userSkinProfileActionURLRoute = userSkinProfileAction.urlRoute;
    const visitSkinProfileComplete = isVisitSkinProfileComplete(visit);
    const userSkinProfileActionRequired = isUserSkinProfileActionRequired(user, visit);

    const navigationItems = [
      {
        name: 'My plan',
        url: 'my-plan',
        hideInNav: false,
        userActionRequired,
      },
      {
        name: 'Treatment plan',
        url: 'treatment-plan',
        hideInNav: noRxSubscription,
      },
      {
        name: 'Messages',
        url: 'messages',
        hideInNav: !visit.id,
        userActionRequired: userHasUnreadMessages,
      },
      {
        name: 'Skin Profile',
        url: 'my-skin',
        hideInNav: !visit.id || pendingCheckoutOrder,
      },
      {
        name: 'Account',
        url: 'my-account',
        hideInNav: false,
      },
    ];

    return (
      <React.Fragment>
        {navigationItems.map(navigationItem => (
          <StyledNavItem key={navigationItem.name} hideItem={navigationItem.hideInNav}>
            {navigationItem.url !== "my-skin" && (
              <MobileNavLink
                onClick={e =>
                  goToPage(
                    navigationItem.redirectToMainPage
                      ? `/${navigationItem.url}`
                      : `/user-dashboard/${navigationItem.url}`,
                    e,
                  )
                }
              >
                {navigationItem.name}
              </MobileNavLink>
            )}
            {/*Add Skin Profile progress for the Skin Profile menu item*/}
            {navigationItem.url === "my-skin" && (
              <MobileNavWithNotificationLink
                onClick={e =>
                  goToPage(
                    navigationItem.redirectToMainPage
                      ? `/${navigationItem.url}`
                      : `/user-dashboard/${(!visitSkinProfileComplete || userSkinProfileActionRequired) ? userSkinProfileActionURLRoute : navigationItem.url}`,
                    e,
                  )
                }
              >
                <MenuNotificationContainer>
                  <MenuNotificationRow>
                    <MenuText>{navigationItem.name}</MenuText>
                    {/*{(!visitSkinProfileComplete || userSkinProfileActionRequired) && (*/}
                    {/*  <MenuNotificationButtonContainer>*/}
                    {/*    <NotificationButton>*/}
                    {/*      {userSkinProfileActionCTAText}*/}
                    {/*    </NotificationButton>*/}
                    {/*  </MenuNotificationButtonContainer>*/}
                    {/*)}*/}
                  </MenuNotificationRow>
                </MenuNotificationContainer>
              </MobileNavWithNotificationLink>
            )}
            <NotificationDotWrapper>
              <NotificationDotContainer><NotificationDot userActionRequired={navigationItem.userActionRequired} /></NotificationDotContainer>
            </NotificationDotWrapper>
          </StyledNavItem>
        ))}
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    user: getUserData(state),
    visit: getMedicalVisit(state),
    rxSubscription: getMostRecentRxSubscription(state),
    progressAnswers: getProgressAnswers(state),
    questionsLength: getQuestionsLength(state),
    pendingCheckoutOrder: getOrder(state),
    userHasUnreadMessages: hasUnreadMessages(state),
  }),
  {},
)(UserDashboardNavbarItems);
