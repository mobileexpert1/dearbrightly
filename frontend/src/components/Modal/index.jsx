import React from 'react';
import styled from 'react-emotion';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import CloseIcon from 'src/common/components/CloseIcon';
import { ModalTitle } from 'src/features/dashboard/shared/styles';
import { colors, breakpoints, fontFamily, fontWeight } from 'src/variables';


const StyledModal = styled(Modal)`
  .modal-body {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    height: inherit;
    padding-left: 70;
    padding-right: 70;
    ${breakpoints.sm} {
      padding: 0 0 80 0;
    }
    ${breakpoints.xs} {
      padding: 0 0 80 0;
    }
  }

  .modal-content {
    margin: 0px;
    padding: 20px;
    ${breakpoints.xs} {
      border: 0;
      border-radius: 0;
    }
  }

  ${breakpoints.xs} {
    .modal-dialog {
      margin: 0 !important;
    }
    .modal-content {
      height: max-content !important;
      min-height: 100% !important;
    }  
  }

  .modal-close {
    display: none;
  }
`;

const OverLay = styled.div`
    position: absolute;
    background: ${colors.clear};
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: .8;
    margin: -20px;  
`
const OverlayText = styled.div`
  padding: 0px 30px;
  text-align: center;
  position: absolute;
  top: 50%;
  width: 100%;
  color: ${colors.black};
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`


const CustomModal = (props) => {
  return (
    <StyledModal
      size="lg"
      isOpen={true}
      onClose={props.onClose}
    >
      {props.showOverlay && (
        <OverLay>
          <OverlayText>
            {props.overlayText}
          </OverlayText>
        </OverLay>
      )}

      <CloseIcon onClick={props.onClose} />

      <ModalBody>
        {props.title && (<ModalTitle>{props.title}</ModalTitle>)}
        {props.children}
      </ModalBody>

    </StyledModal>
  );
};

export default CustomModal;
