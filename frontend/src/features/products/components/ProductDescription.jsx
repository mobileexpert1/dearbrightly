import React, { Component } from 'react';
import styled from 'react-emotion';
import { colors, fontSize, fontFamily } from 'src/variables';
import * as S from 'src/features/products/components/styles';

const automaticIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/automatic-icon.svg';
const personalizedIcon = 'https://d2ndcoyp4lno8u.cloudfront.net/personalized-icon.svg';
const chatIcon = 'https://d17yyftwrkmnyz.cloudfront.net/chat-icon.png';
const oilFreeMoisturizerIcon =
  'https://d2ndcoyp4lno8u.cloudfront.net/oil-free-moisturizer-icon.svg';

const Description = styled('div')`
  margin-bottom: 16px;
  max-width: 400px;
`;

const DescriptionItem = styled('li')`
  font-size: 13px;
  font-family: ${fontFamily.baseFont};
  color: ${colors.black};
  margin-bottom: 5px;
  margin-left: 35px;
  text-align: top;  
  max-width: 320px;
  i {
    height: 18px;
    width: 18px;
    display: inline-block;
    margin-left: -35px;
    margin-right: 15px;
    vertical-align: middle;
    &.automatic-icon {
      background: url(${automaticIcon}) center no-repeat;
      background-size: 15px;
    }
    &.chat-icon {
      background: url(${chatIcon}) center no-repeat;
      background-size: 18px;
      margin-top: 3px;
    }
    &.personalized-icon {
      background: url(${personalizedIcon}) center no-repeat;
      background-size: 15px;
    }
    &.oil-free-moisturizer-icon {
      background: url(${oilFreeMoisturizerIcon}) center no-repeat;
      background-size: 18px;
      margin-top: 3px;
    }
    &.circle-bullet {
      height: 8px;
      width: 8px;
      background-color: ${colors.doveGray};
      border-radius: 50%;
      margin-left: -25px;
    }    
  }
`;
const DescriptionSummary = styled('p')`
  margin: 0;
  margin-left: 0px;
  padding: 0px 0px 10px 0px;
  color: #000;
  font-size: 16px;
  font-family: ${fontFamily.baseFont};
`;

const StyledHeading = styled(S.Heading2)`
  font-size: ${fontSize.big};
  font-family: ${fontFamily.baseFont};
  font-weight: 700;
  line-height: 30px;
`;

export const ProductDescription = props => {
  const { description, name } = props.data;
  const isRx = props.isRx;
  function getIconDisplay(item) {
    let iconDisplay;

    if (item.includes('Change frequency or cancel anytime')) {
      iconDisplay = 'automatic-icon';
    } else if (item.includes("doctor's consult")) {
      iconDisplay = 'chat-icon';
    } else if (item.includes('Bonus ingredient:')) {
      iconDisplay = 'personalized-icon';
    } else if (item.includes('Medical grade moisturizer')) {
      iconDisplay = 'oil-free-moisturizer-icon';
    } else {
      iconDisplay = 'circle-bullet';
    }

    return iconDisplay;
  }
  return (
    <Description>
      <StyledHeading bold>Get to know {name}</StyledHeading>
      <ul>
        {/* {isRx && (
            <DescriptionItem>
              <i className="automatic-icon" />
              First-time bottle lasts ~2 months. Refills last ~3 months and bill at { this.getSubscriptionPrice()}/quarter.
              Change frequency or cancel anytime.
            </DescriptionItem>
          )} */}
        {description.length > 1 &&
          description.map((item, index) => (
            <DescriptionItem key={index}>
              <i className={'circle-bullet'} />
              {item}
            </DescriptionItem>
          ))}

        {description.length === 1 && <DescriptionSummary>{description}</DescriptionSummary>}
      </ul>
    </Description>
  );
};
