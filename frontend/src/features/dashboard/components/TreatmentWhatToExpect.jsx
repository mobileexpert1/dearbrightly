import React from 'react';
import styled from 'react-emotion';

import {
  ComponentWrapper,
  ComponentHeader,
  ComponentSubheading,
  BlueContentHeader,
  ContentSubheading,
} from 'src/features/dashboard/shared/styles';
import { colors, fontSize, breakpoints } from 'src/variables';

import { TreatmentTimeline } from './TreatmentTimeline';
import { TreatmentProTips } from './TreatmentProTips';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import { timelineElements } from 'src/features/dashboard/constants/treatmentPlanContent';
import { TreatmentSlider } from './TreatmentTimelineSlider';

const InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  ${breakpoints.xs} {
    flex-direction: column;
  }
`;

const BreakLine = styled.div`
  height: 1px;
  width: 8rem;
  border-top: 1px solid ${colors.remy};
  margin: 2rem 0;
`;

const AdditionalInfo = styled.p`
  font-size: ${fontSize.small};
  color: ${colors.veryLightGrayOpacity};
  margin-bottom: 4rem;
`;

const Wrapper = styled.div`
  padding-right: 4rem;

  ${breakpoints.xs} {
    padding-right: 0;
  }
`;

const Content = styled.div`
 text-align: justify;
`;

export const TreatmentWhatToExpect = () => {
  const isMobile = isMobileDevice();

  return (
    <ComponentWrapper extraTopMargin extraBottomMargin>
      <InnerWrapper>
        <Wrapper>
          <ComponentHeader>Is this normal?</ComponentHeader>
          <Content>
            <ComponentSubheading>
              Most likely, yes! Your skin takes about 6 weeks to acclimate to your derm-grade retinoid.
              Typical reactions may include redness, sensitivity, dryness, peeling, or acne breakouts aka
              "purging" for 2-4 weeks. Purging is actually a good thing! Your pores are unclogging
              themselves, and your skin clears up feeling better than before, thanks to your retinoid.
            </ComponentSubheading>
            <BreakLine />
            <BlueContentHeader>It's doing its thing, so give it time.</BlueContentHeader>
            <ContentSubheading>Patience is the name of the game as your skin learns to tolerate.</ContentSubheading>
            <ContentSubheading>
              Soon you'll see the clinically proven benefits&mdash;or, what we call your best skin ever.
            </ContentSubheading>
          </Content>
        </Wrapper>
        <div>
          {isMobile ? <TreatmentSlider carouselSlides={timelineElements} /> : <TreatmentTimeline />}
          <div>
            <AdditionalInfo>
              Keep in mind all skin is unique. This is a typical timeline with consistent use.
            </AdditionalInfo>
          </div>
        </div>
      </InnerWrapper>
      <InnerWrapper>
        <TreatmentProTips />
      </InnerWrapper>
    </ComponentWrapper>
  );
};
