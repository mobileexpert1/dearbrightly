import { commitMutation, graphql } from 'react-relay';
import { relayEnvironment } from 'src/common/services/RelayService';

const mutation = graphql`
  mutation CreateChatMessageMutation($input: CreateChatMessageMutationInput!) {
    createChatMessage(input: $input) {
      chatMessage {
        ...ChatMessage_message
      }
    }
  }
`;

export default (sender, receiver, body, onSuccess, onError, onSubmit) => {
  const variables = {
    input: {
      senderUuid: sender.id,
      receiverUuid: receiver.uuid,
      body,
      clientMutationId: '',
    },
  };

  const optimisticMsgId = `mocked_${new Date().getTime()}`;
  const optimisticMsg = {
    id: optimisticMsgId,
    body,
    createdDatetime: '',
    readDatetime: null,
    sender: {
      fullName: sender.fullName,
      id: sender.globalId,
      profilePhotoFile: null,
      uuid: sender.id,
    },
    receiver: {
      id: null,
      fullName: receiver.fullName,
      profilePhotoFile: null,
      uuid: receiver.uuid,
    },
  };

  commitMutation(relayEnvironment, {
    mutation,
    variables,
    // updater: proxyStore => {
    //   const createChatMessageField = proxyStore.getRootField('createChatMessage')
    //   const newChatMessage = createChatMessageField.getLinkedRecord('chatMessage')
    //   const senderNode = proxyStore.get(senderGlobalId)
    //   const chatMessages = senderNode.getLinkedRecords('allChatMessages') || []
    //   const newChatMessages = [...chatMessages, newChatMessage]
    //   senderNode.setLinkedRecords(newChatMessages, 'allChatMessages')
    // },
    onCompleted: (resp, err) => {
      if (err) return onError(err, optimisticMsgId);
      return onSuccess(resp, optimisticMsgId);
    },
    onError: err => {
      onError(err, optimisticMsgId);
    },
  });

  if (onSubmit) {
    onSubmit(optimisticMsg);
  }
};
