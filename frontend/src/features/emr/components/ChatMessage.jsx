import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import defaultAvatarIcon from 'src/assets/images/defaultAvatar.svg';

import { formatCreatedDateTime } from 'src/common/helpers/formatTimestamp';
import ChatMessageBase from './ChatMessageBase';

function ChatMessage(props) {
  const { body, createdDatetime, receiver, sender } = props.message;
  const { isPatientView } = props;
  const formattedCreatedDatetime = formatCreatedDateTime(createdDatetime);
  const isSender =
    (props.isPatientView && sender && props.patient && props.patient.uuid === sender.uuid) ||
    (!props.isPatientView && receiver && props.patient && props.patient.uuid === receiver.uuid)
      ? true
      : false;

  const senderFullName = sender && sender.fullName ? sender.fullName : 'Unknown';

  const medicalProviderAvatar =
    isPatientView && sender && sender.profilePhotoFile
      ? sender.profilePhotoFile
      : defaultAvatarIcon;

  return (
    <ChatMessageBase
      isPatientView={isPatientView}
      isSender={isSender}
      avatar={medicalProviderAvatar}
      body={body}
      fullName={senderFullName}
      time={formattedCreatedDatetime}
    />
  );
}

export default createFragmentContainer(ChatMessage, {
  message: graphql`
    fragment ChatMessage_message on ChatMessageType {
      readDatetime
      createdDatetime
      body
      sender {
        uuid
        fullName
        profilePhotoFile
      }
      receiver {
        uuid
        fullName
        profilePhotoFile
      }
    }
  `,
  patient: graphql`
    fragment ChatMessage_patient on UserType {
      uuid
    }
  `,
});
