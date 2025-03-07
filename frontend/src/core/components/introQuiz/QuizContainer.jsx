import React from "react"
import { QuizStart } from "./QuizStart"
import { QuizStep } from "./QuizStep"
import { QuizComplete } from "./QuizComplete"

export const QuizContainer = ({ currentStep, handleNextStep }) => {
  const firstStep = (
    <QuizStart currentStep={currentStep} nextStep={handleNextStep} />
  )

  const middleSteps = new Array(7).fill(
    <QuizStep currentStep={currentStep} nextStep={handleNextStep} />
  )
  const lastStep = (
    <QuizComplete currentStep={currentStep} nextStep={handleNextStep} />
  )

  const steps = [firstStep, ...middleSteps, lastStep]

  return steps[currentStep]
}
