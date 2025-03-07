import React from 'react';
import styled from 'react-emotion';
import { graphql, createFragmentContainer } from 'react-relay';

import ChatMessage from 'src/features/emr/components/ChatMessage';
import ChatMessageComposer from 'src/features/emr/components/ChatMessageComposer';
import ChatMessageBase from 'src/features/emr/components/ChatMessageBase';
import { breakpoints } from 'src/variables';

const Container = styled('div')`
  border-radius: 10px;

  ${breakpoints.xs} {
    padding: 0;
    height: calc(100vh - 4rem);
    position: relative;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
  }
`;

const ChatMessageWrapper = styled.div`
  margin-top: 1rem;
  overflow-y: auto;
  width: 100%;
  height: 80vh;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-bottom: 1rem;
  scroll-behavior: smooth;

  ${breakpoints.xs} {
    margin-top: 5rem;
  }
`;

class ChatMessageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: this.props.patient.allChatMessages.edges || [],
      optimisticMessages: [],
    };
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.chatMessageRef.scrollTop = this.chatMessageRef.scrollHeight;
  };

  onSubmit = optimisticMsg => {
    this.setState(prevState => {
      return {
        messages: [...prevState.messages],
        optimisticMessages: [...prevState.optimisticMessages, optimisticMsg],
      };
    });
  };

  onSuccess = (res, optimisticMsgId) => {
    this.setState(prevState => {
      return {
        messages: [...prevState.messages, { node: res.createChatMessage.chatMessage }],
        optimisticMessages: [...prevState.optimisticMessages],
      };
    });
    this.removeOptimisticMsg(optimisticMsgId);
  };

  onError = (err, optimisticMsgId) => {
    this.editOptimisticMsg(optimisticMsgId, { error: true });
  };

  editOptimisticMsg = (id, overwrite) => {
    this.setState(prevState => {
      return {
        ...prevState,
        optimisticMessages: [
          ...prevState.optimisticMessages.map(
            msg => (msg.id === id ? { ...msg, ...overwrite } : msg),
          ),
        ],
      };
    });
  };

  removeOptimisticMsg = id => {
    this.setState(prevState => {
      return {
        ...prevState,
        optimisticMessages: [...prevState.optimisticMessages.filter(msg => msg.id !== id)],
      };
    });
  };

  render() {
    const { isPatientView, patient, sender, receiver } = this.props;

    return (
      <Container>
        <ChatMessageWrapper
          innerRef={el => {
            this.chatMessageRef = el;
          }}
        >
          {this.state.messages.map(edge => (
            <li key={edge.node.__id}>
              <ChatMessage
                patient={this.props.patient}
                isPatientView={isPatientView}
                message={edge.node}
              />
            </li>
          ))}
          {this.state.optimisticMessages.map(msg => (
            <li key={msg.id}>
              <ChatMessageBase
                isPatientView={isPatientView}
                isSender={true}
                avatar=""
                body={msg.body} // fullName={msg.sender.fullName}
                error={msg.error}
                loading={!msg.error}
              />
            </li>
          ))}
        </ChatMessageWrapper>
        <ChatMessageComposer
          isPatientView={isPatientView}
          receiver={receiver}
          sender={sender}
          patient={patient}
          onSubmit={optimisticMsg => this.onSubmit(optimisticMsg)}
          onSuccess={(res, optimisticMsgId) => this.onSuccess(res, optimisticMsgId)}
          onError={(err, optimisticMsgId) => this.onError(err, optimisticMsgId)}
        />
      </Container>
    );
  }
}

export default createFragmentContainer(ChatMessageContainer, {
  patient: graphql`
    fragment ChatMessageContainer_patient on UserType {
      id
      ...ChatMessageComposer_patient
      ...ChatMessage_patient
      allChatMessages {
        edges {
          node {
            id
            ...ChatMessage_message
          }
        }
      }
    }
  `,
});
