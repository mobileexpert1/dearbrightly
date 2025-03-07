import React from 'react';
import styled from 'react-emotion';

import moreIcon from 'src/assets/images/moreIcon.svg';
import mobileMoreIcon from 'src/assets/images/mobileMoreIcon.svg';
import { MobileShareOptionIcon, IconLabel } from 'src/features/sharingProgram/shared/styles';
import { communicationMethodsOptions } from '../constants/sharingProgramConstants';

const MoreIcon = styled.img`
  cursor: pointer;
  width: 54px;
  height: 54px;
  margin-left: 1rem;
`;

export const MoreOptionsShare = ({ handleShareButton, isMobile, shareLink, handleMobileShare }) =>
  isMobile ? (
    <div>
      <MobileShareOptionIcon
        src={mobileMoreIcon}
        onClick={() => handleMobileShare(communicationMethodsOptions.more, 'isMoreOptionClicked')}
      />
      <IconLabel>More</IconLabel>
    </div>
  ) : (
    <MoreIcon src={moreIcon} onClick={() => handleShareButton(shareLink)} />
  );
