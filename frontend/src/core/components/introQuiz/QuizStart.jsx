import React from "react"
import Link from 'react-router-dom/Link'
import styled from "@emotion/styled"

import continueArrowIcon from "src/assets/images/rightArrow_white.svg"

import {
  Wrapper,
  PhotoSection,
  SectionPhoto,
  ContentSection,
  Header,
  Description,
} from "./styles"
import { colors, fontSize, breakpoints } from "src/variables"
import { quizUrl } from "./constants/quizUrl"

const StyledButton = styled.button`
  border: none;
  background: ${colors.darkModerateBlue};
  width: 13.83rem;
  height: 4rem;
  border-radius: 4px;
  color: ${colors.clear};
  font-weight: 800;
  font-size: ${fontSize.small};
  line-height: 17px;
  margin-bottom: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    background: ${colors.blumineLight};
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
`

export const BackIcon = styled.img`
  margin-left: 0.5rem;
  width: 1rem;
  height: 1.3rem;

  ${breakpoints.sm} {
    position: relative;
    right: 0;
  }
`

const sectionPhoto =
  "https://d17yyftwrkmnyz.cloudfront.net/DearBrightly_0847.jpg"

export const QuizStart = ({ currentStep, nextStep }) => (
  <Wrapper>
    <PhotoSection>
      <SectionPhoto src={sectionPhoto} />
    </PhotoSection>
    <ContentSection>
      <Header>Learn how retinoid can benefit you</Header>
      <Description>
        Ready to learn about the dermatologist-loved, derm-grade retinoid serum
        tailored and delivered to you?
      </Description>
      <StyledLink to={quizUrl}>
        <StyledButton onClick={() => nextStep(currentStep + 1)}>
          Let’s get started <BackIcon src={continueArrowIcon} />
        </StyledButton>
      </StyledLink>
    </ContentSection>
  </Wrapper>
)
