import React from 'react';
import styled from 'react-emotion';
import { FormGroup, Input } from 'reactstrap';

import SelectedIcon from 'src/assets/images/SelectedIcon.svg';
import Humid from 'src/assets/images/climates_type/keep-dry.svg';
import Temperate from 'src/assets/images/climates_type/autumn.svg';
import Dry from 'src/assets/images/climates_type/drought.svg';
import { colors, breakpoints, fontSize, fontFamily } from 'src/variables';

const Label = styled('label')`
  color: black;
  font-size: ${fontSize.small};
  padding: 8px 12px 8px 24px;
  margin: 0;
  font-family: ${fontFamily.baseFont};
  cursor: pointer;
  width: 100%;
`;

const InputStyled = styled(Input)`
  &[type*='radio'],
  &[type*='checkbox'] {
    width: 20px;
    height: 20px;
    min-height: unset;
    left: 0px;
    top: 6px;
    margin: 0;
  }
`;

const FormGroupStyled = styled(FormGroup)`
  && {
    margin: 10px 0;
    padding-left: 1.5rem;
    background-color: ${colors.whiteSmokeOpacity};
    min-height: 41px;
    height: fit-content;
    border-radius: 4px;

    .checkmark {
      position: absolute;
      top: 9px;
      left: 12px;
      height: 22px;
      width: 22px;
      background-color: ${colors.clear};
      border: 0.5px solid ${colors.chambray};
      border-radius: 50%;
      cursor: pointer;

      &:after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 5px;
        border-radius: 50%;
        background: url(${SelectedIcon}) center no-repeat;
        background-size: 10px;
        height: 10px;
        width: 10px;
      }
    }

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;

      &:checked {
        ~ .checkmark {
          background: ${colors.chambray};

          &:after {
            display: block;
          }
        }
      }
    }
    input[type='checkbox'] {
      & ~ .checkmark {
        border-radius: 3px;
        width: 28px;
        height: 28px;
        top: 6px;
        left: 8px;
        &:after {
          background: url(${SelectedIcon}) center no-repeat;
          background-size: 14px;
          height: 28px;
          width: 28px;
          top: -2px;
          left: 0px;
        }
      }
      &:checked {
        &:after {
          display: block;
        }
      }
    }

    .ck-content {
      color: ${colors.doveGray};
      font-size: ${fontSize.smallest};
      padding-left: 24px;
      margin: 0;
    }
  }
`;

const QuestionIcon = styled.img`
  margin-right: 10px;
  margin-bottom: 5px;
  width: 19px;
  height: 18px;
`;

const Icons = [Dry, Temperate, Humid];

export const QuestionnaireChoices = props => {
  const { question, handleClick, isChecked, renderSubInput, answers, disableNext } = props;

  const isBlank = value => !(value !== '' && value.replace(/\s/g, '').length > 0);

  const isSubInputFilled = (children, choiceId, answers) => {
    const triggeredChild = children.filter(child => child.trigger.qnrChoiceId == choiceId);

    const subInputs = triggeredChild.map(
      subInput => answers[subInput.id] && !isBlank(answers[subInput.id].answer[subInput.id]),
    );

    const isAnswerFilled = e => e === true;

    return !subInputs.every(isAnswerFilled);
  };

  return question.choices.map((choice, index) => (
    <React.Fragment key={choice.id}>
      <FormGroupStyled check>
        <Label
          check
          onClick={() =>
            disableNext(
              !!question.children.filter(child => child.trigger.qnrChoiceId == choice.id).length,
            )
          }
        >
          <InputStyled
            className="skin-type"
            checked={isChecked(question.id, choice.id)}
            name={question.id}
            type={question.type}
            value={choice.id}
            onChange={e =>
              handleClick(e.target, question.type, question.id, choice.id, choice.label, question)
            }
          />
          {/*TODO - Include the image link in the questionnaire data structure -- don't hardcode it here!*/}
          {question.title === 'What kind of climate do you live in?' && (
            <QuestionIcon src={Icons[index]} />
          )}
          <span className="type-name">{choice.label}</span>

          <span className="checkmark" />
        </Label>
      </FormGroupStyled>
      {question.children &&
        answers[question.id].answer[choice.id] &&
        renderSubInput(
          question.children,
          choice.id,
          isSubInputFilled(question.children, choice.id, answers),
        )}
    </React.Fragment>
  ));
};
