import React from 'react';
import styled from 'react-emotion';
import dbStar from 'src/assets/images/dbStar.svg';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { breakpoints } from 'src/variables';

const LoadingIcon = styled.img`
    @keyframes fadein {
        70%   { opacity: 0.7; }
        100% { opacity: 1; }
    }
    ${props => props.animate && 'animation: fadein 1.3s ease-in alternate infinite;'};
`;

const LoadingContainer = styled.div`
    position: relative;
`;

const BlurredContent = styled.div`
    clear: both;
    overflow: hidden;
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
`;

const ImageContainer = styled.div`
    width: 100%;
    text-align: center;
    position: absolute;
    ${props => props.isMobile ? 'top: 10%' : 'top: 50%'};
    z-index: 8;
`;

export const CustomSpinner = props => {
  const { blur, spinning, animate = true } = props;
  const { isMobile } = useDeviceDetect();

  return (
    <LoadingContainer>
      {spinning && <ImageContainer isMobile={isMobile}><LoadingIcon src={dbStar} animate={animate} /></ImageContainer>}
      {spinning && blur ? (
        <BlurredContent>
          {props.children}
        </BlurredContent>
      ) : props.children}
    </LoadingContainer>
  );
};
