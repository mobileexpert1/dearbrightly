import React from 'react';
import styled from 'react-emotion';
import { Alert, Button, Form, Input } from 'reactstrap';
import { graphql, createFragmentContainer } from 'react-relay';

import SnippetListButton from 'src/features/emr/components/SnippetListButton';
import CreateChatMessageMutation from 'src/features/emr/mutations/CreateChatMessageMutation';

const ComponentWrapper = styled.div`
  bottom: 0;
  position: sticky;
  background: ${props => props.isMedicalProviderView && 'white'};
  padding-bottom: ${props => props.isMedicalProviderView && '10px'};
`;

const SendButtonContainer = styled('div')`
  padding-bottom: 5px;
  position: ${props => (props.isMedicalProviderView ? 'relative' : 'absolute')};
  right: 0.2rem;
  top: 0.8rem;
  display: ${props => props.isMedicalProviderView && 'flex'};
  flex-direction: ${props => props.isMedicalProviderView && 'row'};
  justify-content: ${props => props.isMedicalProviderView && 'space-between'};
`;

const StyledForm = styled(Form)`
  position: relative;
  margin: 0;
`;

const StyledButton = styled(Button)`
  padding-right: ${props => props.isMedicalProviderView && '0.5rem'} !important;
  padding-top: ${props => props.isMedicalProviderView && '0.3rem'} !important;
`;

class ChatMessageComposer extends React.Component {
  state = {
    body: '',
    error: null,
    isFetching: false,
  };

  createChatMessage = () => {
    // Reset error state before the next request.
    this.setState({ error: null });

    if (!this.state.body || typeof this.state.body !== 'string') {
      return;
    }

    if (!this.props.receiver) {
      this.setState({ error: 'Unable to send message. Receiver not specified.' });
      return;
    }

    this.setState({ isFetching: true });

    CreateChatMessageMutation(
      this.props.sender,
      this.props.receiver,
      this.state.body,
      (res, optimisticMsgId) => {
        this.setState({ body: '', isFetching: false });
        if (this.props.onSuccess) {
          this.props.onSuccess(res, optimisticMsgId);
        }
      },
      (err, optimisticMsgId) => {
        this.setState({ error: err, isFetching: false });
        this.props.onError(err, optimisticMsgId);
      },
      optimisticMsg => {
        if (this.props.onSubmit) this.props.onSubmit(optimisticMsg);
      },
    );
    this.setState({ body: '' });
  };

  selectedSnippetHandler = body => {
    this.setState({
      body,
    });
  };

  render() {
    const { isPatientView } = this.props;

    return (
      <ComponentWrapper isMedicalProviderView={!isPatientView}>
        {this.state.error !== null ? (
          <Alert color="danger">There was an error. Please try again.</Alert>
        ) : null}
        <StyledForm onSubmit={event => event.preventDefault()}>
          <Input
            type="textarea"
            name="text"
            id="new-chat-message"
            value={this.state.body}
            onChange={event => this.setState({ body: event.target.value })}
          />
          <SendButtonContainer isMedicalProviderView={!isPatientView}>
            {!isPatientView && (
              <SnippetListButton selectedSnippetHandler={this.selectedSnippetHandler} />
            )}
            <StyledButton
              isMedicalProviderView={!isPatientView}
              id="Send Message Button"
              color="link"
              size="lg"
              disabled={!this.state.body.length}
              onClick={this.createChatMessage}
            >
              <img src="https://d2ndcoyp4lno8u.cloudfront.net/send-message-icon.svg" alt="" />
            </StyledButton>
          </SendButtonContainer>
        </StyledForm>
      </ComponentWrapper>
    );
  }
}

export default createFragmentContainer(ChatMessageComposer, {
  patient: graphql`
    fragment ChatMessageComposer_patient on UserType {
      uuid
    }
  `,
});
