export const prepareUserAnswers = (questions, answers) =>
  questions &&
  questions.map(question => {
    const answerObj = answers && answers.find(a => Number(a.questionId) === question.id);

    return {
      title: question.title,
      answers: {
        user:
          answerObj && Array.isArray(answerObj.value)
            ? answerObj.value
                .map(a => question.choices.filter(choice => choice.id === Number(a)))
                .reduce((acc, val) => acc.concat(val), [])
            : question.choices.filter(choice => choice.id === Number(answerObj && answerObj.value)),
        input: _.filter(
          question.children.map(
            children =>
              answers && answers.find(answer => Number(answer.questionId) === children.id),
          ),
          _.size || _.isEmpty,
        ),
      },
    };
  });
