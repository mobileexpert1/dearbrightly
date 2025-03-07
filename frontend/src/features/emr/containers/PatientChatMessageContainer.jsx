import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { graphql, QueryRenderer } from 'react-relay';
import {
    fetchMessagesFail,
} from 'src/features/dashboard/actions/messagesActions';
import { fetchUserRequest, setMessagesRead } from 'src/features/user/actions/userActions';
import { breakpoints, fontFamily } from 'src/variables';
import { relayEnvironment } from 'src/common/services/RelayService';
import ChatMessageContainer from 'src/features/emr/containers/ChatMessageContainer';
import { getUserData } from 'src/features/user/selectors/userSelectors';


const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  margin: 0 auto;
  font-family: ${fontFamily.baseFont};
  font-size: 14px;
`;

const BodyWrapper = styled.div`
  margin: 0 0 20px 0;
  display: flex;

  ${breakpoints.md} {
    flex-direction: column;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-grow: 3;
  flex-direction: column;
  ${breakpoints.md} {
    padding-left: initial;
  }
`;

class PatientChatMessage extends React.Component {
    componentDidMount() {
      const {fetchUserRequest, userData, setMessagesRead} = this.props;
      if (userData && userData.id) {
        fetchUserRequest(userData.id);
       }

      setMessagesRead();
    }

  render() {
    const { userData } = this.props;
    const globalId = userData ? userData.globalId : null;

    return (
      <Wrapper>
        <BodyWrapper>
          <ContentWrapper>
            <QueryRenderer
              environment={relayEnvironment}
              query={graphql`
                query PatientChatMessageContainerQuery($patientId: ID!) {
                  patient(id: $patientId) {
                    uuid
                    ...ChatMessageContainer_patient
                  }
                }
              `}
              variables={{
                patientId: globalId,
              }}
              render={({ error, props }) => {
                if (error) {
                  this.props.fetchMessagesFail(error);
                  return <div>{error}</div>;
                }
                if (!props) {
                  return <div>Loading...</div>;
                }

                return (
                  <ChatMessageContainer
                    isPatientView={true}
                    sender={userData}
                    receiver={userData.medicalProvider}
                    patient={props.patient}
                  />
                );
              }}
            />
          </ContentWrapper>
        </BodyWrapper>
      </Wrapper>
    );
  }
}

export const PatientChatMessageContainer = connect(
  state => ({
    userData: getUserData(state),
  }),
  {
    fetchMessagesFail,
    fetchUserRequest,
    setMessagesRead,
  },
)(PatientChatMessage);
