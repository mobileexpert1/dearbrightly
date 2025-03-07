import React from 'react';
import styled from 'react-emotion';

import { history } from 'src/history';
import { colors, mobileFirstBreakpoints, breakpoints, fontFamily, fontWeight } from 'src/variables';
import { upperCaseToKebabCase } from 'src/common/helpers/formatText';

const star = 'https://d2ndcoyp4lno8u.cloudfront.net/star.svg';

const Container = styled('div')`
  display: flex;
  width: 260px;
  height: 425px;  
  flex-direction: column;
  justify-content: space-between;
  margin: 30px;
  @media (max-width: 768px) {
    width: 42%;
    height: 325px;      
    margin: 4%;
  }
  @media (max-width: 400px) {
    width: 46%;
    margin: 2%;
  }
`;

const ImageWrapper = styled('div')`
  width: 100%;
  background: #ffffff;
  box-shadow: 0 0 3px 0 rgba(77, 77, 77, 0.5);
  position: relative;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
  cursor: pointer;
  img {
    max-width: 100%;
  }
`;

const ProductInfo = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const Title = styled('p')`
font-family: ${fontFamily.baseFont};
font-weight: ${fontWeight.bold};
  font-size: 16px;
  color: #000000;
  letter-spacing: 0.6px;
  line-height: 1.2;
  margin-bottom: 0;
  ${breakpoints.xs} {
    font-size: 14px;
  }  
`;

const Price = styled('p')`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: 16px;
  margin-bottom: 0;
  line-height: 1.2;
  text-align: right;
  ${breakpoints.xs} {
    font-size: 14px;
  }  
  padding-left: 5px;
`;

const ProductType = styled('p')`
  font-family: ${fontFamily.baseFont};
  margin: 5px 0 0 0;
  color: rgb(105, 105, 105);
  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const ActionsWrapper = styled('div')`
  display: flex;
  border: 1.5px solid #000;
  padding: 10px;
  margin-top: 15px;
  cursor: pointer;
  display: inline-block;
  position: relative;
  text-transform: uppercase;
  text-align: center;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: 16px;
  @media (max-width: 768px) {
    padding: 8px 10px;
    width: 100%;
    font-size: 15px;
  }
`;

const Subcopy = styled('p')`
  margin: 5px 0 0 0;
  color: rgb(105, 105, 105);
  text-align: right;
  font-size: 14px;
  line-height: 1.2;
  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1;
  }
  @media (max-width: 375px) {
    font-size: 10px;
  }  
`;

const Bestseller = styled.span`
  position: absolute;
  background: ${colors.clear};
  font-family: ${fontFamily.baseFont};
  color: ${colors.dark};
  border-radius: 4px;
  padding: 4px 4px;
  right: 6px;
  top: 9px;
  font-size: 9px;
  line-height: 1.33;
  letter-spacing: 1px;
  text-align: center;
  text-transform: uppercase;

  :before {
    content: " ";
    background: url(${star}) center;
    position: absolute;
    top: -5px;
    left: -5px;
    height: 12px;
    width: 12px;
    
    ${mobileFirstBreakpoints.sm} {
      height: 15px;
      width: 15px;
    }
    
    ${mobileFirstBreakpoints.md} {
      height: 18px;
      width: 18px;
    }
  }
  
  ${mobileFirstBreakpoints.sm} {
    right: 10px;
    top: 10px;
    font-size: 11px;
    padding: 6px 10px;
  }

  ${mobileFirstBreakpoints.lg} {
    right: 10px;
    top: 10px;
    font-size: 11px;
  }

  ${mobileFirstBreakpoints.xl} {
    right: 15px;
    top: 15px;
    font-size: 15px;
  }
`;

export const ProductCard = ({
  name,
  trialPrice,
  discountedTrialPrice,
  price,
  image,
  productSummary,
  subcopy,
  bestseller,
}) => (
  <Container id={"product-card-container"}>
    <ImageWrapper
      onClick={() => {
        history.push(`/product-details/${upperCaseToKebabCase(name)}`);
      }}
    >
      <img src={image} alt={name} />
      {bestseller && <Bestseller>Bestseller</Bestseller>}
    </ImageWrapper>
    <ProductInfo id={"product-info"}>
      <div>
        <Title id={"title"}>{productSummary}</Title>
        <ProductType
          onClick={() => {
            history.push(`/product-details/${upperCaseToKebabCase(name)}`);
          }}
        >
          {name}
        </ProductType>
      </div>
      <div>
          {trialPrice !== discountedTrialPrice ?
              (<Price> <strike>{trialPrice}</strike> {discountedTrialPrice} </Price>) :
              (<Price> {price} </Price>)
          }
        <Subcopy>{subcopy}</Subcopy>
      </div>
    </ProductInfo>
    <ActionsWrapper
      onClick={() => {
        history.push(`/product-details/${upperCaseToKebabCase(name)}`);
      }}
    >
      Learn more
    </ActionsWrapper>
  </Container>
);
