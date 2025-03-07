import React from 'react';
import styled from 'react-emotion';
import { Popover } from 'reactstrap';

import { getUpcomingTretinoinStrength } from 'src/features/dashboard/helpers/getUpcomingTretinoinStrength';

import questionMarkIcon from 'src/assets/images/questionMarkIcon.svg';

import { colors, fontSize, breakpoints, fontFamily, fontWeight } from 'src/variables';
import {
  ComponentHeader,
  ComponentSubheading,
  ComponentWrapper,
  ColumnsWrapper,
  SeparateLine,
  ContentSubheading,
  SingleColumnWrapper,
  ColumnHeaderWrapper,
} from 'src/features/dashboard/shared/styles';

const strengthArrowIcon = `https://d2ndcoyp4lno8u.cloudfront.net/strengthArrow.svg`;

const PercentageWrapper = styled.div`
  display: flex;
`;

const StrengthRow = styled.div`
  flex-direction: row;
`;

const StrengthColumn = styled.div`
  flex-direction: column;
  display: inline-block;
`;

const CurrentStrength = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.small};
  color: ${colors.mulberry};
`;

const StrengthArrowIcon = styled.svg`
  width: 1.55rem;
  height: 1.55rem;
  margin: 0 1rem;
  background:  url('${props => props.iconSrc}') no-repeat;
`;

const UpcomingStrength = styled.p`
font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.small};
  color: ${colors.infoGray};
`;

const Label = styled.p`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.small};
  color: ${colors.blumine};
  text-transform: uppercase;
  margin: auto;
`;

const QuestionMarkIcon = styled.svg`
  cursor: pointer;
  width: 1.55rem;
  height: 1.55rem;
  margin-left: 1rem;
  background-image:  url('${props => props.iconSrc}');
`;

const StyledPopover = styled(Popover)`
  min-width: 23rem;
  padding: 2rem;

  ${breakpoints.sm} {
    min-width: 10rem;
    max-width: 17rem;
    padding: 1rem;
  }
`;

const PopoverContent = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.small};
  line-height: 26px;
  margin-bottom: 0;
  text-align: justify;
`;

const Values = styled.span`
  color: ${colors.blumine};
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.small};
`;

export const TreatmentFormula = ({
  rxSubscription,
  onHover,
  onHoverLeave,
  handleIconClick,
  isPopoverOpen,
}) => {
  const currentTretinoinStrength = rxSubscription && rxSubscription.currentTreatment && rxSubscription.currentTreatment.tretinoinStrength;
  const upcomingTretinoinStrength = getUpcomingTretinoinStrength(rxSubscription);

  // TODO: build this data structure programmatically with more formulation variants
  const compounds = [
    {
      name: 'Tretinoin',
      description: `The only FDA-approved retinoid for photoaging, Tretinoin is hands down the best version of a
          derm-grade retinoid available–that's why it's a must. According to clinical trials, it's the most effective way
          to get that almost endless list of skin benefits (e.g., improvements in fine lines and wrinkles,
          dark sun spots, big pores, more even skin tone) that come with regular retinoid use.`,
      currentStrength: currentTretinoinStrength,
      upcomingStrength: upcomingTretinoinStrength,
      additionalInfo: `For the best experience, your provider started you on your lower strength before ramping you up to your
      highest strength–-this is the strength that is best suited for your skin going forward.
      When starting on your highest strength, remember to ramp up slowly again.`,
    },
    {
      name: 'Niacinamide',
      description: `Niacinamide is an anti-inflammatory healing compound that calms redness, reduces the appearance of big pores, prevents moisture loss and dehydration, and brightens the skin.`,
      currentStrength: `4`, // TODO: This is always the same, but pull from treatment data
      upcomingStrength: ``,
      additionalInfo: ``,
    },
  ];

  return (
    <ComponentWrapper extraTopMargin extraBottomMargin>
      <div>
        <ComponentHeader>The dream team</ComponentHeader>
        <ComponentSubheading>
          Based on feedback from you, the derms selected the most effective ingredients,
          all of which are <Values>cruelty free, paraben free, fragrance free, and vegan</Values>, in their purest form.
          Meet the all stars of your formula.
        </ComponentSubheading>
      </div>
      <ColumnsWrapper>
        {compounds.map(compound => (
          <React.Fragment key={compound.name}>
            <SingleColumnWrapper>
              <ColumnHeaderWrapper noBottomMargin>
                <ContentSubheading darkBlue isBold>{compound.name}</ContentSubheading>
              </ColumnHeaderWrapper>
              {compound.currentStrength && (
                <PercentageWrapper>
                  <StrengthRow>
                    <StrengthColumn>
                      <Label>{compound.upcomingStrength ? 'current' : 'strength'}</Label>
                      <CurrentStrength>{compound.currentStrength}%</CurrentStrength>
                    </StrengthColumn>
                    {compound.upcomingStrength && (
                      <StrengthColumn>
                        <StrengthArrowIcon iconSrc={strengthArrowIcon} />
                      </StrengthColumn>
                    )}
                    {compound.upcomingStrength && (
                      <StrengthColumn>
                        <Label>upcoming</Label>
                        <UpcomingStrength>{compound.upcomingStrength}</UpcomingStrength>
                      </StrengthColumn>
                    )}
                    {compound.upcomingStrength && (compound.upcomingStrength > compound.currentStrength) && compound.additionalInfo && (
                      <StrengthColumn>
                        <React.Fragment>
                          <QuestionMarkIcon
                            onMouseEnter={onHover}
                            onMouseLeave={onHoverLeave}
                            onClick={handleIconClick}
                            id="treatmentPopover"
                            iconSrc={questionMarkIcon}/>
                          <StyledPopover
                            placement="top-start"
                            title=""
                            target="treatmentPopover"
                            isOpen={isPopoverOpen}
                            trigger="click">
                            <PopoverContent>{compound.additionalInfo}</PopoverContent>
                          </StyledPopover>
                        </React.Fragment>
                      </StrengthColumn>
                    )}
                  </StrengthRow>
                </PercentageWrapper>
              )}
              <ContentSubheading justify>{compound.description}</ContentSubheading>
            </SingleColumnWrapper>
            <SeparateLine />
          </React.Fragment>
        ))}
      </ColumnsWrapper>
    </ComponentWrapper>
  );
};
