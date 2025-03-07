import React from 'react';
import { Collapse } from 'reactstrap';

import plusIcon from 'src/assets/images/plusCircle.svg';
import minusIcon from 'src/assets/images/minusCircle.svg';

import {
  AnswerWrapper,
  QuestionTitle,
  AnswerContentWrapper,
  AnswerLabelsWrapper,
  Answer,
  OpenAndCloseIcon,
  AnswerInputsWrapper,
  UserInputWrapper,
  InputAnswer,
  AnswerAndIconWrapper,
} from 'src/features/dashboard/shared/styles';

export const InProgressQuestionnaireAnswers = ({ question, toggleAnswerPreview, activeTab }) => (
  <AnswerWrapper>
    <QuestionTitle>{question.title}</QuestionTitle>
    <AnswerContentWrapper>
      <AnswerLabelsWrapper>
        {question.answers.map(answer => (
          <AnswerAndIconWrapper key={answer.label}>
            <Answer>{answer.label}</Answer>
            {answer.input &&
              answer.input.length > 0 && (
                <OpenAndCloseIcon
                  extraMargin
                  onClick={() => toggleAnswerPreview(question.title)}
                  iconSrc={activeTab === question.title ? minusIcon : plusIcon}
                />
              )}
          </AnswerAndIconWrapper>
        ))}
      </AnswerLabelsWrapper>
      <AnswerInputsWrapper>
        {question.answers.map(answer => (
          <div key={answer.label}>
            {answer.input &&
              answer.input.length > 0 && (
                <Collapse isOpen={activeTab === question.title}>
                  <UserInputWrapper>
                    {answer.input &&
                      answer.input.map(userInput => (
                        <InputAnswer key={userInput}>{userInput}</InputAnswer>
                      ))}
                  </UserInputWrapper>
                </Collapse>
              )}
          </div>
        ))}
      </AnswerInputsWrapper>
    </AnswerContentWrapper>
  </AnswerWrapper>
);
