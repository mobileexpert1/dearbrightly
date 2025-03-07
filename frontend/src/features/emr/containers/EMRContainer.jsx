import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import { VisitTableContainer } from 'src/features/emr/containers/VisitTableContainer';
import { connect } from 'react-redux';
import { getUserData } from 'src/features/user/selectors/userSelectors';

import styled from 'react-emotion';
import { fetchUserRequest } from 'src/features/user/actions/userActions';

const AlertContainer = styled('div')`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 0px;

  .alert {
    width: 100%;
    margin: 0;
    text-align: center;
  }
`;

class EMR extends Component {
  // ---- Disable for now until we're Surescript certified ----
  //componentDidMount() {
  //   this.interval = setInterval(() => {
  //     // Poll for new DoseSpot transmission error count and SSO URL every 10 minutes
  //     fetchUserRequest(userData.id);
  //   }, 1000 * 60 * 10);
  // }
  //}

  render() {
    const { userData } = this.props;
    // const dosespotNotificationsCount = userData ? userData.dosespotNotificationsCount : 0;
    // const dosespotNotificationsSsoUrl = userData ? userData.dosespotNotificationsSsoUrl : '';

    if (!userData) {
      return <div></div>
    }

    return (
      <div>
        {/*{dosespotNotificationsCount == 0 && (*/}
        {/*  <AlertContainer>*/}
        {/*    <Alert color="info">*/}
        {/*      <a href={dosespotNotificationsSsoUrl} target="_blank">*/}
        {/*        DoseSpot Notifications*/}
        {/*      </a>*/}
        {/*    </Alert>*/}
        {/*  </AlertContainer>*/}
        {/*)}*/}
        {/*{dosespotNotificationsCount > 0 && (*/}
        {/*  <AlertContainer>*/}
        {/*    <Alert color="danger">*/}
        {/*      {' '}*/}
        {/*      ATTENTION: DoseSpot prescription transcription errors [{dosespotNotificationsCount}*/}
        {/*      ]. Please correct errors*/}
        {/*      <a href={dosespotNotificationsSsoUrl} target="_blank">*/}
        {/*        {' '}*/}
        {/*        hereR*/}
        {/*      .*/}
        {/*    </Alert>*/}
        {/*  </AlertContainer>*/}
        {/*)}*/}
        <VisitTableContainer userData={userData} />
      </div>
    );
  }
}

export const EMRContainer = connect(
  state => ({
    userData: getUserData(state), // logged in user data (new data is not fetched until another login)
  }),
  {
    fetchUserRequest,
  },
)(EMR);

export default EMRContainer;
