import React from 'react';
import { Collapse } from 'reactstrap';

import plusIcon from 'src/assets/images/plusCircle.svg';
import minusIcon from 'src/assets/images/minusCircle.svg';

import {
  AnswerWrapper,
  QuestionTitle,
  AnswerContentWrapper,
  AnswerLabelsWrapper,
  AnswerAndIconWrapper,
  OpenAndCloseIcon,
  AnswerInputsWrapper,
  UserInputWrapper,
  InputAnswer,
  Answer,
} from 'src/features/dashboard/shared/styles';

export const CompleteQuestionnaireAnswers = ({ question, toggleAnswerPreview, activeTab }) => (
  <AnswerWrapper>
    <QuestionTitle>{question.title}</QuestionTitle>
    <AnswerContentWrapper>
      <AnswerLabelsWrapper>
        {question.answers.user.map(answer => (
          <AnswerAndIconWrapper key={answer.label}>
            <Answer>{answer.label}</Answer>
          </AnswerAndIconWrapper>
        ))}
        {question.answers.input.length > 0 && (
          <OpenAndCloseIcon
            extraMargin
            onClick={() => toggleAnswerPreview(question.title)}
            iconSrc={activeTab === question.title ? minusIcon : plusIcon}
          />
        )}
      </AnswerLabelsWrapper>
      <AnswerInputsWrapper>
        {question.answers.input.length > 0 &&
          question.answers.input.map(answer => (
            <Collapse key={answer.value} isOpen={activeTab === question.title}>
              <UserInputWrapper>
                <InputAnswer>{answer.value}</InputAnswer>
              </UserInputWrapper>
            </Collapse>
          ))}
      </AnswerInputsWrapper>
    </AnswerContentWrapper>
  </AnswerWrapper>
);
