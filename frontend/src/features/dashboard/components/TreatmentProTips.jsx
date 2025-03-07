import React from 'react';
import styled from 'react-emotion';

import dbStar from 'src/assets/images/dbStar.svg';
import { ContentSubheading } from 'src/features/dashboard/shared/styles';
import { proTips } from 'src/features/dashboard/constants/treatmentPlanContent';
import { colors, breakpoints, fontSize, fontFamily } from 'src/variables';

const proTipPhoto = `https://d17yyftwrkmnyz.cloudfront.net/DearBrightlyPeaSize.jpg`;

const ProTipsWrapper = styled.div`
  display: flex;
  border: 1px solid ${colors.darkModerateBlue};
  margin-bottom: 3rem;
  width: 100%;

  ${breakpoints.xs} {
    flex-direction: column;
    margin-bottom: 2rem;
  }
`;

const TipsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  padding: 4rem;

  ${breakpoints.lg} {
    padding: 2rem;
  }

  ${breakpoints.xs} {
    width: fit-content;
    margin: 0 auto 1rem;
    padding: 2rem;
  }
`;

const TipsHeader = styled.p`
  font-family: ${fontFamily.baseFont};
  color: ${colors.blumine};
  font-size: ${fontSize.biggest};
  line-height: 1.3;

  ${breakpoints.xs} {
    font-size: ${fontSize.big};
  }
`;
const ProductPhoto = styled.img`
  width: 45%;
  max-width: 34rem;
  max-height: 27rem;
  object-fit: cover;

  ${breakpoints.xs} {
    width: auto;
    max-height: 16.5rem;
  }
`;

const TipWrapper = styled.div`
  display: flex;
`;

const DbStarIcon = styled.img`
  height: 1rem;
  width: 1rem;
  margin-right: 1rem;
`;

export const TreatmentProTips = () => (
  <ProTipsWrapper>
    <ProductPhoto src={proTipPhoto} />
    <TipsWrapper>
      <TipsHeader>If you're experiencing any sensitivity or dryness, here are pro tips</TipsHeader>
      {proTips.map(tip => (
        <TipWrapper key={tip}>
          <DbStarIcon src={dbStar} />
          <ContentSubheading>{tip}</ContentSubheading>
        </TipWrapper>
      ))}
    </TipsWrapper>
  </ProTipsWrapper>
);
