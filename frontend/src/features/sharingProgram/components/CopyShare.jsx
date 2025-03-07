import React from 'react';
import styled from 'react-emotion';
import { Tooltip } from 'reactstrap';

import mobileCopyIcon from 'src/assets/images/mobileCopyIcon.svg';

import { colors } from 'src/variables';
import { MobileShareOptionIcon, IconLabel } from 'src/features/sharingProgram/shared/styles';

const StyledTextArea = styled.div`
  position: relative;
  width: 100%;

  .styledTextArea {
    height: 54px;
    width: 100%;
    resize: none;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding-top: 0.9rem;
    padding-left: 0.9rem;
    white-space: nowrap;
    overflow: auto;
  }
`;

const CopyButton = styled.p`
  cursor: pointer;
  position: relative;
  height: fit-content;
  margin: auto;
  font-size: 15px;
  font-weight: 800;
  color: ${colors.darkModerateBlue};
  width: 3.5rem;
  margin-top: 1rem;
`;

const CopyButtonWrapper = styled.div`
  background: ${colors.clear};
  position: ${props => (props.isMobile ? 'relative' : 'absolute')};
  top: ${props => !props.isMobile && '2px'};
  right: 1px;
  height: ${props => !props.isMobile && '50px'};
  border-radius: 3px;
  display: flex;
  flex-direction: ${props => props.isMobile && 'column'};
  justify-content: center;
`;

export const CopyShare = ({
  textAreaRef,
  copyLink,
  copyCodeToClipboard,
  isCopied,
  isMobile,
  mobileCopyCodeToClipboard,
}) =>
  isMobile ? (
    <div>
      <CopyButtonWrapper
        onClick={() => mobileCopyCodeToClipboard(copyLink)}
        isMobile={isMobile}
        id="mobileCopyWrapper"
      >
        <MobileShareOptionIcon src={mobileCopyIcon} id="TooltipExample" />
        <IconLabel>Copy Link</IconLabel>
      </CopyButtonWrapper>
      <Tooltip placement="bottom" isOpen={isCopied} target="TooltipExample">
        Copied!
      </Tooltip>
    </div>
  ) : (
    <StyledTextArea>
      <textarea
        contentEditable={true}
        className="styledTextArea"
        ref={textAreaRef}
        value={copyLink}
        readOnly
      />
      <CopyButtonWrapper>
        <CopyButton onClick={() => copyCodeToClipboard()} id="TooltipExample">
          Copy
        </CopyButton>
      </CopyButtonWrapper>
      <Tooltip placement="bottom" isOpen={isCopied} target="TooltipExample">
        Copied!
      </Tooltip>
    </StyledTextArea>
  );
