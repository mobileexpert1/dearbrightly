import React, { useReducer } from "react"
import styled from "@emotion/styled"
import { Progress } from "reactstrap"
import Link from 'react-router-dom/Link'

import leftArrowIcon from "src/assets/images/left-arrow.svg"
import closeIcon from "src/assets/images/closeMenuIcon.svg"

import { colors, breakpoints, fontSize } from "src/variables"
import { QuizQuestion } from "./QuizQuestion"
import { quizReducer } from "./reducer/quizReducer"
import { QuizDescriptionStep } from "./QuizDescriptionStep"
import { steps } from "./constants/stepsData"
import { quizUrl } from "./constants/quizUrl"

const QuizStepsBar = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ProgressBar = styled(Progress)`
  width: 100%;
  border-radius: 0;
  height: 0.5rem;
  .progress-bar {
    border-radius: 0 3rem 3rem 0;
    background-color: ${colors.mulberry};
  }
`

const QuizStepWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
`

const QuizStepsBarInnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 4.6rem;
  padding: 1.5rem 2.7rem;
  background: ${colors.barBackground};
  align-items: center;

  ${breakpoints.sm} {
    height: 3.1rem;
    padding: 0.9rem 1.1rem;
  }
`
const StyledLink = styled(Link)`
  :hover {
    text-decoration: none;
    color: ${colors.veryDarkBlue};
  }
  font-weight: bold;
  font-size: ${fontSize.small};
  color: ${colors.veryDarkBlue};
`

const BackIcon = styled.img`
  width: 1rem;
  margin-right: 0.7rem;
  margin-bottom: 0.2rem;
`

const StepIndicator = styled.p`
  margin-bottom: 0;
  font-weight: bold;
  font-size: ${fontSize.small};
  color: ${colors.darkModerateBlue};
  margin-right: 0.7rem;

  ${breakpoints.sm} {
    margin-right: 2rem;
    margin-top: 0.2rem;
  }
`

const CloseQuizIcon = styled.img`
  width: 0.8rem;
  height: 0.8rem;
  margin-bottom: 0.3rem;
`

const initialState = [
  {
    id: 1,
    answers: [],
  },
  {
    id: 2,
    answers: [],
  },
  {
    id: 3,
    answers: [],
  },
  {
    id: 4,
    answers: [],
  },
  {
    id: 5,
    answers: [],
  },
  {
    id: 6,
    answers: [],
  },
  {
    id: 7,
    answers: [],
  },
]

export const QuizStep = ({ currentStep, nextStep }) => {
  const [answeredQuestions, setAnswers] = useReducer(quizReducer, initialState)

  const progress = Number(((currentStep * 100) / steps.length).toFixed(0))
  const stepData = steps[currentStep - 1]

  return (
    <QuizStepWrapper>
      <QuizStepsBar>
        <QuizStepsBarInnerWrapper>
          <StyledLink
            to={quizUrl}
            state={{ isQuizOpen: currentStep > 1 }}
            onClick={() => nextStep(currentStep - 1)}
          >
            <BackIcon src={leftArrowIcon} />
          </StyledLink>
          <StepIndicator>
            {currentStep} of {steps.length}
          </StepIndicator>
          <Link to="/">
            <CloseQuizIcon src={closeIcon} />
          </Link>
        </QuizStepsBarInnerWrapper>
        <ProgressBar value={progress} />
      </QuizStepsBar>

      {stepData.stepType === "question" ? (
        <QuizQuestion
          handleAnswerClick={setAnswers}
          question={stepData}
          answeredQuestions={answeredQuestions}
          nextStep={() => nextStep(currentStep + 1)}
          currentStep={currentStep}
        />
      ) : (
        <QuizDescriptionStep
          stepData={stepData}
          currentStep={currentStep}
          nextStep={() => nextStep(currentStep + 1)}
        />
      )}
    </QuizStepWrapper>
  )
}
