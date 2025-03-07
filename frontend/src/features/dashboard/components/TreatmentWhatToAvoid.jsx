import React from 'react';
import styled from 'react-emotion';

import { retinoidRivals } from 'src/features/dashboard/constants/treatmentPlanContent';
import {
  ComponentWrapper,
  ComponentHeader,
  ComponentSubheading,
  ColumnsWrapper,
  BlueContentHeader,
  ContentSubheading,
  SeparateLine,
} from 'src/features/dashboard/shared/styles';
import { breakpoints } from 'src/variables';

export const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 26rem;
  margin-right: 2rem;
  margin-bottom: 2rem;
  margin-top: 1rem;

  ${breakpoints.xs} {
    margin-right: 0;
    margin-bottom: 0;
    margin-top: 0;
  }
`;

export const TreatmentWhatToAvoid = () => (
  <ComponentWrapper extraTopMargin extraBottomMargin>
    <div>
      <ComponentHeader>Retinoid rivals</ComponentHeader>
      <ComponentSubheading>
        Your retinoid formula is your skin’s new best friend, but it doesn’t always mesh well with others.
        The above routine works great, but these ingredients and procedures require some extra planning around.
      </ComponentSubheading>
    </div>
    <ColumnsWrapper wrapContent wrapOnMobile>
      {retinoidRivals.map(step => (
        <React.Fragment key={step.title}>
          <ColumnWrapper extraMarginRight extraMarginTop>
            <BlueContentHeader>{step.title}</BlueContentHeader>
            <ContentSubheading justify>{step.content}</ContentSubheading>
          </ColumnWrapper>
        </React.Fragment>
      ))}
    </ColumnsWrapper>
  </ComponentWrapper>
);
