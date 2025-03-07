import React from "react"
import styled from "@emotion/styled"

import continueArrowIcon from "src/assets/images/rightArrow_white.svg"
import checkMarkIcon from "src/assets/images/checkMark.svg"

import {
  NextStepButton,
  NextStepIcon,
  QuizStepContentWrapper,
  StyledLink,
} from "./styles"
import { ADD_MULTIPLE_ANSWERS, ADD_SINGLE_ANSWER } from "./actions/quizActions"
import { colors, breakpoints, fontSize } from "src/variables"
import { quizUrl } from "./constants/quizUrl"

const SingleAnswerWrapper = styled.div`
  cursor: pointer;
  border: 1px solid ${colors.answerWrapper};
  max-width: ${props => !props.isLastStep && "22rem"};
  height: 3.44rem;
  width: 100%;
  border-radius: 0.2rem;
  margin-bottom: 0.44rem;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
`

const StepTitle = styled.p`
  font-weight: bold;
  font-size: ${fontSize.huge};
  line-height: 46px;
  text-align: center;
  color: ${colors.veryDarkBlue};
  margin-bottom: 1.5rem;

  ${breakpoints.md} {
    padding: 0 1rem;
  }

  ${breakpoints.sm} {
    font-size: ${fontSize.biggest};
    line-height: 30px;
  }
`

const MultiAnswersIndicator = styled.p`
  font-weight: normal;
  font-size: ${fontSize.normal};
  color: ${colors.veryDarkBlue};
`

const AnswersWrapper = styled.div`
  display: flex;
  flex-direction: ${props => (props.isLastStep ? "column" : "row")};
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
  margin-top: 2rem;

  ${breakpoints.md} {
    flex-direction: column;
    align-items: center;
    max-width: ${props => props.isLastStep && "44rem"};
    margin: ${props => props.isLastStep && "2rem auto"};
  }

  ${breakpoints.sm} {
    padding: 0 0.5rem;
    justify-content: center;
  }
`

const AnswerContent = styled.p`
  font-size: ${fontSize.medium};
  color: ${props => (props.isChosen ? colors.darkModerateBlue : colors.black)};
  margin: auto 0;
  padding-right: 1rem;

  ${breakpoints.sm} {
    max-width: 17rem;
    font-size: ${fontSize.small};
  }
`

const CheckIcon = styled.img`
  display: ${props => (props.isChosen ? "block" : "none")};
  height: 1rem;
`

const MobileWrapper = styled.div`
  width: 100%;
  ${breakpoints.md} {
    height: 100%;
  }
`

const StyledRedirection = styled.a`
  position: absolute;
  bottom: 0;

  ${breakpoints.md} {
    position: sticky;
    bottom: 0;
    width: 100%;
  }
`

export const QuizQuestion = ({
  question,
  handleAnswerClick,
  answeredQuestions,
  nextStep,
  currentStep,
}) => {
  const stepQuestion = answeredQuestions.find(
    answeredQuestion => answeredQuestion.id === question.id
  )
  const stepAnswers = stepQuestion.answers
  const areMultipleAnswersAvailable = question.questionType === "multiple"
  const isLastStep = currentStep === answeredQuestions.length
  const submitLink = "https://dearbrightly.attn.tv/p/GE7/intro-qnr-submit"

  return (
    <QuizStepContentWrapper>
      <StepTitle>{question.stepTitle}</StepTitle>
      {areMultipleAnswersAvailable && (
        <MultiAnswersIndicator>Check all that apply.</MultiAnswersIndicator>
      )}
      <MobileWrapper>
        <AnswersWrapper isLastStep={isLastStep}>
          {question.answers.map(answer => (
            <SingleAnswerWrapper
              isLastStep={isLastStep}
              key={answer.answerId}
              isChosen={stepAnswers.includes(answer.answerId)}
              onClick={() =>
                handleAnswerClick({
                  type: areMultipleAnswersAvailable
                    ? ADD_MULTIPLE_ANSWERS
                    : ADD_SINGLE_ANSWER,
                  payload: {
                    questionId: question.id,
                    answerId: answer.answerId,
                  },
                })
              }
            >
              <AnswerContent isChosen={stepAnswers.includes(answer.answerId)}>
                {answer.answerContent}
              </AnswerContent>
              <CheckIcon
                isChosen={stepAnswers.includes(answer.answerId)}
                src={checkMarkIcon}
              />
            </SingleAnswerWrapper>
          ))}
        </AnswersWrapper>
      </MobileWrapper>
      {isLastStep ? (
        <StyledRedirection href={submitLink} state={{ isQuizOpen: false }}>
          <NextStepButton disabled={!stepAnswers.length}>
            Sign up to learn more
          </NextStepButton>
        </StyledRedirection>
      ) : (
        <StyledLink to={quizUrl} state={{ isQuizOpen: true }}>
          <NextStepButton disabled={!stepAnswers.length} onClick={nextStep}>
            Next
            <NextStepIcon
              isIconHidden={!stepAnswers.length}
              src={continueArrowIcon}
            />
          </NextStepButton>
        </StyledLink>
      )}
    </QuizStepContentWrapper>
  )
}
