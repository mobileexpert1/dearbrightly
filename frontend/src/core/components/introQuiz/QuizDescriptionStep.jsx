import React from "react"
import styled from "@emotion/styled"

import continueArrowIcon from "src/assets/images/rightArrow_white.svg"
import dbStarIcon from "src/assets/images/dbStar.svg"

import { colors, fontSize, breakpoints } from "src/variables"
import {
  NextStepButton,
  NextStepIcon,
  QuizStepContentWrapper,
  StyledLink,
} from "./styles"
import { quizUrl } from "./constants/quizUrl"

const StepDescription = styled.p`
  font-size: ${fontSize.biggest};
  line-height: 34px;
  color: ${colors.darkModerateBlue};

  ${breakpoints.lg} {
    padding: 0 3.13rem;
  }

  ${breakpoints.sm} {
    font-size: ${fontSize.normal};
  }
`

const DbStarIcon = styled.img`
  height: 5rem;
  width: 5rem;
  margin-bottom: 6rem;

  ${breakpoints.sm} {
    height: 4rem;
    width: 4rem;
    margin-bottom: 3rem;
  }
`

const MobileWrapper = styled.div`
  ${breakpoints.md} {
    width: 100%;
    height: 100%;
  }
`

export const QuizDescriptionStep = ({ stepData, nextStep, currentStep }) => (
  <QuizStepContentWrapper extraWidth smallMargin>
    <DbStarIcon src={dbStarIcon} />
    <MobileWrapper>
      {stepData.stepDescriptions.map(stepDescription => (
        <StepDescription key={stepDescription}>
          {stepDescription}
        </StepDescription>
      ))}
    </MobileWrapper>

    <StyledLink to={quizUrl} state={{ isQuizOpen: true }}>
      <NextStepButton onClick={nextStep}>
        Next
        <NextStepIcon src={continueArrowIcon} />
      </NextStepButton>
    </StyledLink>
  </QuizStepContentWrapper>
)
