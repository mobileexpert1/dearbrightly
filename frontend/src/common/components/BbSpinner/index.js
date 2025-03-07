import React from 'react';
import styled from 'react-emotion';
import dbStar from 'src/assets/images/dbStar.svg';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';


const LoadingIcon = styled.img`
    @keyframes fadein {
        70%   { opacity: 0.7; }
        100% { opacity: 1; }
    }
    animation: fadein 1.3s ease-in alternate infinite;
`;
const ImageContainer = styled.div`
    width: 100%;
    text-align: center;
    position: absolute;
    ${props => props.isMobile ? 'top: 20%' : 'top: 30%'};
    z-index: 8;
`;

const DBSpinner = () => {
  const { isMobile } = useDeviceDetect();
  return (
    <ImageContainer isMobile={isMobile}><LoadingIcon src={dbStar} /></ImageContainer>
  );
};


export default DBSpinner;
