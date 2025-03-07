import React from 'react';
import styled from 'react-emotion';

import { BlueContentHeader, ContentSubheading } from 'src/features/dashboard/shared/styles';
import { timelineElements } from 'src/features/dashboard/constants/treatmentPlanContent';
import { colors, breakpoints } from 'src/variables';

const TimelineWrapper = styled.div`
  position: relative;
  border-left: 1px solid ${colors.darkModerateBlue};

  ${breakpoints.xs} {
    display: none;
  }
`;

const TimelineElementWrapper = styled.div`
  padding-left: 1rem;
`;

const TimelineCircle = styled.div`
  height: 0.9rem;
  width: 0.9rem;
  border-radius: 50%;
  border: 1px solid ${colors.darkModerateBlue};
  position: absolute;
  left: -0.5rem;
  background: ${colors.clear};
`;

export const TreatmentTimeline = () => (
  <TimelineWrapper>
    {timelineElements.map(element => (
      <TimelineElementWrapper key={element.title}>
        <TimelineCircle />
        <ContentSubheading isBold darkBlue>{element.title}</ContentSubheading>
        <ContentSubheading>{element.content}</ContentSubheading>
      </TimelineElementWrapper>
    ))}
  </TimelineWrapper>
);
