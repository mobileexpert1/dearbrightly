import React from 'react';
import styled from 'react-emotion';

import cleanseIcon from 'src/assets/images/cleanseIcon.svg';
import nightShiftIcon from 'src/assets/images/nightShiftIcon.svg';
import moisturizeIcon from 'src/assets/images/moisturizeIcon.svg';

import {
  ComponentWrapper,
  ComponentHeader,
  ComponentSubheading,
  ColumnsWrapper,
  SeparateLine,
  SingleColumnWrapper,
  BlueContentHeader,
  ContentSubheading,
  ColumnHeaderWrapper,
  StepNumber,
} from 'src/features/dashboard/shared/styles';

const StepIcon = styled.img`
  width: 2.4rem;
  height: 2.4rem;
`;

const guideSteps = [
  {
    id: 1,
    name: 'Cleanse',
    descriptions: [`Wash your face with a gentle cleanser, then dry completely.`],
    icon: cleanseIcon,
  },
  {
    id: 2,
    name: 'Treat with Night Shift',
    descriptions: [
      `Apply only a pea-sized amount evenly to your face, including neck if desired.`,
      `Start by using every third night, then gradually build to nightly as tolerated.
      Listen to your skin, it knows best.`,
    ],
    icon: nightShiftIcon,
  },
  {
    id: 3,
    name: 'Moisturize',
    descriptions: [`Follow up with your go-to moisturizer.`],
    icon: moisturizeIcon,
  },
];

export const TreatmentHowToUse = () => (
  <ComponentWrapper extraTopMargin extraBottomMargin>
    <div>
      <ComponentHeader>Take on the Night Shift</ComponentHeader>
      <ComponentSubheading>
        The Dear Brightly guide to using your retinoid. For nighttime use only. For best results, use consistently.
      </ComponentSubheading>
    </div>
    <ColumnsWrapper>
      {guideSteps.map(step => (
        <React.Fragment key={step.name}>
          <SingleColumnWrapper narrowColumn>
            <ColumnHeaderWrapper>
              <StepNumber>{step.id}</StepNumber>
              <StepIcon src={step.icon} />
            </ColumnHeaderWrapper>
            <BlueContentHeader>{step.name}</BlueContentHeader>
            {step.descriptions.map(singleDescription => (
              <ContentSubheading justify key={singleDescription}>{singleDescription}</ContentSubheading>
            ))}
          </SingleColumnWrapper>
          <SeparateLine />
        </React.Fragment>
      ))}
    </ColumnsWrapper>
  </ComponentWrapper>
);
