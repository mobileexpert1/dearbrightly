export const getLastUserYearlyVisitAnswer = preparedAnswers => {
  const lastAnswer =
    preparedAnswers &&
    preparedAnswers[preparedAnswers.length - 1].answers.user.map(answer => answer.label);

  const shouldUserUpdatePhotos = lastAnswer && lastAnswer.includes('No');

  return shouldUserUpdatePhotos;
};
