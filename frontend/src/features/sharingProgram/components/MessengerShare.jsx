import React from 'react';
import styled from 'react-emotion';

import messengerIcon from 'src/assets/images/fbMessenger.svg';
import mobileMessengerIcon from 'src/assets/images/mobileMessengerIcon.svg';

import { colors } from 'src/variables';
import { IconLabel, MobileShareOptionIcon } from 'src/features/sharingProgram/shared/styles';
import { communicationMethodsOptions } from '../constants/sharingProgramConstants';

const MessengerButtonWrapper = styled.div`
  position: relative;
  height: 54px;
  width: fit-content;
  margin-left: 1rem;
`;

const FacebookMessengerButton = styled.div`
  cursor: pointer;
  width: 54px;
  height: 54px;
  background: #1e88e5;
  color: ${colors.clear};
  border-radius: 50%;
  transition: all 0.2s;

  border: none;

  :hover {
    background: ${colors.blumineLight};
  }
`;

const MessengerIcon = styled.img`
  cursor: pointer;
  position: absolute;
  width: 32px;
  height: 32px;
  top: 0.7rem;
  left: 0.7rem;
`;

export const MessengerShare = ({
  getSharingProgramCode,
  communicationMethod,
  handleMobileShare,
  isMobile,
}) =>
  isMobile ? (
    <div>
      <MobileShareOptionIcon
        src={mobileMessengerIcon}
        onClick={() => {
          handleMobileShare(communicationMethodsOptions.fbMessenger, 'isFbMessengerOptionClicked');
        }}
      />
      <IconLabel>Messenger</IconLabel>
    </div>
  ) : (
    <MessengerButtonWrapper>
      <MessengerIcon
        src={messengerIcon}
        onClick={() => {
          getSharingProgramCode(communicationMethod);
        }}
      />
      <FacebookMessengerButton />
    </MessengerButtonWrapper>
  );
