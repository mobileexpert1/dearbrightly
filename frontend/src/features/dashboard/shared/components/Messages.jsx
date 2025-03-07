import React from 'react';
import styled from 'react-emotion';
import { Alert } from 'reactstrap';
import closeIcon from 'src/assets/images/close.svg';
import { colors, fontFamily, fontWeight } from 'src/variables';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';


const StyledAlert = styled(Alert)`
  position: fixed !important;
  display: flex;
  justify-content: space-between;
  align-items: centered;
  padding: 0.9rem 0.9rem 0.7rem 2rem !important;
  width: 100%;
  background: ${props =>
    props.isErrorMessage ? colors.mulberry : colors.darkModerateBlue} !important;
  color: ${colors.clear} !important;
  border: 'none' !important;
  height: fit-content;
  z-index: 99 !important; 
  left: 0;
  top: 0;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;

const MessageWrapper = styled.div`
  color: ${colors.clear} !important;
  border: 'none' !important;
  display: ${props => !props.isOpen && 'none'};
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
`;

const HideMessageBtn = styled.button`
  cursor: pointer;
  width: 6.5rem;
  height: 2.5rem;
  background: ${colors.whiteOpacityLight};
  border: none;
  border-radius: 4px;
  color: ${colors.clear} !important;
  :hover {
    background: ${colors.whiteOpacityHeavy};
  }
`;

const CloseIcon = styled.img`
  width: 15px;
  height: 15px;
  margin-right: 0.7rem;
`;

class MessageBarContainer extends React.Component {
  state = {
    isMessageVisible: true,
  };

  componentDidMount() {
    this.intervalTimer = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalTimer);
  }

  hideMessage = () => {
    this.setState({
      isMessageVisible: false,
    });
  };

  render() {
    const { messageContent, isErrorMessage } = this.props;
    const { isMessageVisible } = this.state;
    const isMobile = isMobileDevice();

    return (
      <MessageWrapper isOpen={isMessageVisible}>
        <StyledAlert isErrorMessage={isErrorMessage} isOpen={isMessageVisible} fade>
          {messageContent}
          {isMobile ? (
            <CloseIcon onClick={this.hideMessage} src={closeIcon} />
          ) : (
            <HideMessageBtn onClick={this.hideMessage}>DISMISS</HideMessageBtn>
          )}
        </StyledAlert>
      </MessageWrapper>
    );
  }
}

export const MessageBar = MessageBarContainer;
