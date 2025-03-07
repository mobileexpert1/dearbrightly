import React, { useState } from "react"

import { QuizContainer } from "./QuizContainer"

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNextStep = step => {
    setCurrentStep(step)
  }

  return (
      <QuizContainer
        currentStep={currentStep}
        handleNextStep={handleNextStep}
      />
  )
}

export default Quiz