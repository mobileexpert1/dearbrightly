import React from 'react';
import styled from 'react-emotion';

import { colors, breakpoints, fontSize } from 'src/variables';

const ComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
`;

const ContentWrapper = styled.div`
  margin: 4rem auto 0;
  max-width: 375px;

  ${breakpoints.xs} {
    margin-top: 1rem;
  }
`;

const TipsWrapper = styled.div`
  padding: 0 26px;
  font-size: ${fontSize.small};
`;

const TipsHeader = styled.p`
  margin: 0 0 2rem;
  font-size: ${fontSize.huge};
  color: ${colors.blumine};
  line-height: 2rem;

  ${breakpoints.xs} {
    font-size: ${fontSize.biggest};
    max-width: 13rem;
  }
`;

const SingleTip = styled.p`
  font-size: ${fontSize.normal};
  margin-bottom: 0.3rem;
`;

const PhotosWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3.5rem;

  ${breakpoints.xs} {
    margin-bottom: 2rem;
  }
`;

const SinglePhoto = styled.img`
  height: 138px;
  width: 104px;
  border-radius: 4px;
  :nth-child(even) {
    margin: 0 10px;
  }
`;

const ButtonsWrapper = styled.div`
  position: sticky;
  bottom: 0;
  padding: 0 26px;
  min-width: 375px;
  margin: 5rem auto 0;

  ${breakpoints.sm} {
    padding: 0;
    width: 100%;
    margin: 9rem auto 0;
  }
`;

const StyledButton = styled.button`
  cursor: pointer;
  width: 50%;
  height: 52px;
  background: ${props => (props.backBtn ? colors.clear : colors.blumine)};
  color: ${props => (props.backBtn ? colors.chambrayOpacity : colors.clear)};
  border: none;

  :hover {
    background: ${props => (props.backBtn ? colors.gallery : colors.blumineLight)};
  }
`;

const tips = [
  '1. You have a neutral facial expression.',
  '2. The area is well lit, preferably in natural lighting.',
  '3. You are not wearing makeup, skin products, etc.',
  '4. Your hair does not cover your face.',
  '5. Your face fills the screen.',
  '6. There are no shadows on your face',
  '7. Flash is disabled if there’s natural lighting.',
];

const rightFace = 'https://d17yyftwrkmnyz.cloudfront.net/right_example.jpg';
const centerFace = 'https://d17yyftwrkmnyz.cloudfront.net/front_example.jpg';
const leftFace = 'https://d17yyftwrkmnyz.cloudfront.net/left_example.jpg';

const facesPhotos = [rightFace, centerFace, leftFace];

export const PhotoUploadTips = ({ nextStep, prevStep }) => (
  <ComponentWrapper>
    <ContentWrapper>
      <PhotosWrapper>
        {facesPhotos.map(facePhoto => (
          <SinglePhoto src={facePhoto} />
        ))}
      </PhotosWrapper>
      <TipsWrapper>
        <TipsHeader>Tips on how to take great photos</TipsHeader>
        {tips.map(tip => (
          <SingleTip key={tip}>{tip}</SingleTip>
        ))}
      </TipsWrapper>
    </ContentWrapper>
    <ButtonsWrapper>
      <StyledButton backBtn onClick={prevStep}>
        Back
      </StyledButton>
      <StyledButton onClick={nextStep}>Continue</StyledButton>
    </ButtonsWrapper>
  </ComponentWrapper>
);
