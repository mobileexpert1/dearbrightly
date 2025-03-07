import React from 'react';
import styled from 'react-emotion';
import modalCloseIcon from 'src/assets/images/cleanerCloseIcon.svg';

const ModalCloseIcon = styled.img`
    cursor: pointer;
    position: absolute;
    height: 18px;
    width: 18px;
    top: 30px;
    right: 30px;
    z-index: 1;
`;

const CloseIcon = (props) => {
  return (
    <ModalCloseIcon style={props.style ? props.style : {}} src={modalCloseIcon} onClick={props.onClick} />
  );
};

export default CloseIcon;
