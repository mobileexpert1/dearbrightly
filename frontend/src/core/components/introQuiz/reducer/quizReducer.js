import {
  ADD_MULTIPLE_ANSWERS,
  ADD_SINGLE_ANSWER,
} from "src/core/components/introQuiz/actions/quizActions"

const updateMultipleAnswer = (question, answerId) => {
  return {
    ...question,
    answers: question.answers.includes(answerId)
      ? question.answers.filter(answer => answer !== answerId)
      : [...question.answers, answerId],
  }
}

const updateSingleAnswer = (question, answerId) => {
  return {
    ...question,
    answers: question.answers.includes(answerId)
      ? question.answers.filter(answer => answer !== answerId)
      : [answerId],
  }
}

export const quizReducer = (state, action) => {
  switch (action.type) {
    case ADD_MULTIPLE_ANSWERS:
      const multipleAnswers = state.map(question =>
        question.id === action.payload.questionId
          ? updateMultipleAnswer(question, action.payload.answerId)
          : question
      )

      return multipleAnswers

    case ADD_SINGLE_ANSWER:
      const singleAnswer = state.map(question =>
        question.id === action.payload.questionId
          ? updateSingleAnswer(question, action.payload.answerId)
          : question
      )

      return singleAnswer

    default:
      return state
  }
}
