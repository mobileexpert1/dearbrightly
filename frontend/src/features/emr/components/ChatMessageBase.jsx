import React from 'react';
import styled from 'react-emotion';

import { colors, fontSize, fontFamily, fontWeight } from 'src/variables';

const Container = styled('div')`
  padding-bottom: 5px;
  margin-bottom: 2rem;
`;

const MessageBoxReceiver = styled('div')`
  padding: 1.5rem;
  text-align: left;
  background-color: ${props => (props.isMedicalProviderView ? colors.veryLightGray : colors.clear)};
  border-color: #f5c6cb;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-family: ${fontFamily.baseFont};
  font-size: 14px;
  max-width: 30.5rem;
  margin-right: auto;
  margin-left: 0;
`;

const MessageBoxSender = styled('div')`
  padding: 1.5rem;
  text-align: left;
  background-color: ${colors.darkModerateBlue};
  color: ${colors.clear};
  border-color: #f5c6cb;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-family: ${fontFamily.baseFont};
  font-size: 14px;
  max-width: 30.5rem;
  margin-right: 0;
  margin-left: auto;
`;

const SenderNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${props => props.isSender && 'flex-end'};
`;

const SenderFullName = styled.p`
  font-size: ${fontSize.smallest};
  line-height: 14px;
  margin-bottom: 0.2rem;
`;

const MessageCreatedDateTime = styled.p`
  font-size: ${fontSize.smallest};
  line-height: 14px;
  color: ${colors.veryLightGrayOpacity};
  margin-bottom: 0.3rem;
`;

const Triangle = styled.div`
  position: absolute;
  bottom: -1rem;
  right: ${props => props.right && '1rem'};
  left: ${props => props.left && '1rem'};
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 21px 21.5px 0 21.5px;
  border-color: ${props =>
      props.right
        ? colors.darkModerateBlue
        : props.isMedicalProviderView
          ? colors.veryLightGray
          : colors.clear}
    transparent transparent transparent;
`;

const MessageBoxWrapper = styled.div`
  position: relative;
`;

const NameAndIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: ${props => (props.isSender ? 'right' : 'left')};
`;

const MedicalProviderAvatar = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
  margin-right: 0.75rem;
  border-radius: 50%;
`;

export default function ChatMessage(props) {
  const sanitizedFormattedBody = props.body || '';

  let formattedBody = props.isSender
    ? sanitizedFormattedBody.replace(/<p/g, '<p style="color: #fff;"')
    : sanitizedFormattedBody.replace(/<p/g, '<p style="color: #000;"');

  formattedBody = props.isSender
    ? formattedBody.replace(/<a/g, '<a style="color: #fff; text-decoration: underline;"')
    : sanitizedFormattedBody.replace(/<a/g, '<a style="color: #000; text-decoration: underline;"');

  return (
    <Container style={props.loading || props.error ? { opacity: 0.5 } : {}}>
      <SenderNameWrapper isSender={props.isSender}>
        {!props.isSender && <MedicalProviderAvatar src={props.avatar} />}
        <NameAndIconWrapper isSender={props.isSender}>
          <SenderFullName>{props.fullName}</SenderFullName>
          <MessageCreatedDateTime>
            {props.error ? 'Failed to send the message' : props.loading ? 'Sending...' : props.time}
          </MessageCreatedDateTime>
        </NameAndIconWrapper>
      </SenderNameWrapper>
      {props.isSender && (
        <MessageBoxWrapper>
          <MessageBoxSender dangerouslySetInnerHTML={{ __html: formattedBody }} />
          <Triangle right />
        </MessageBoxWrapper>
      )}
      {!props.isSender && (
        <MessageBoxWrapper>
          <MessageBoxReceiver
            isMedicalProviderView={!props.isPatientView}
            dangerouslySetInnerHTML={{ __html: formattedBody }}
          />
          <Triangle left isMedicalProviderView={!props.isPatientView} />
        </MessageBoxWrapper>
      )}
    </Container>
  );
}
