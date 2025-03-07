import React from 'react';

import {
  ComponentWrapper,
  ComponentHeader,
  ComponentSubheading,
  ColumnsWrapper,
  SingleColumnWrapper,
  ColumnHeaderWrapper,
  BlueContentHeader,
  ContentSubheading,
  StepNumber,
  ContentIcon,
} from 'src/features/dashboard/shared/styles';
import { routineSteps } from 'src/features/dashboard/constants/treatmentPlanContent';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import { TreatmentSlider } from './TreatmentTimelineSlider';

export const TreatmentRoutine = () => {
  const isMobile = isMobileDevice();

  return (
    <ComponentWrapper extraTopMargin extraBottomMargin>
      <div>
        <ComponentHeader>Put 5 on it</ComponentHeader>
        <ComponentSubheading>
          We care about every step of your routine, not only your retinoid. We've tapped derms to create
          the simplest (but still effective!) 5-product regimen&mdash;everything else is extra credit.
        </ComponentSubheading>
      </div>
      {isMobile ? (
        <TreatmentSlider carouselSlides={routineSteps} withExtraHeader />
      ) : (
        <ColumnsWrapper wrapContent>
          {routineSteps.map(step => (
            <SingleColumnWrapper key={step.number} narrowColumn>
              <ColumnHeaderWrapper>
                <StepNumber>{step.number}</StepNumber>
                <div>
                  {step.icons.map(stepIcon => (
                    <ContentIcon key={stepIcon} src={stepIcon} />
                  ))}
                </div>
              </ColumnHeaderWrapper>
              <BlueContentHeader>{step.title}</BlueContentHeader>
              <ContentSubheading justify>{step.content}</ContentSubheading>
            </SingleColumnWrapper>
          ))}
        </ColumnsWrapper>
      )}
    </ComponentWrapper>
  );
};
