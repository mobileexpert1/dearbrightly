import React, { Component } from 'react';
import styled from 'react-emotion';
import { FormGroup, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { Line } from 'rc-progress';
import _ from 'lodash';
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';
import {
  sendQuestionnaireAnswersRequest,
  sendQuestionnaireAnswersClearErrorRequest,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import { colors, breakpoints, fontSize, fontFamily } from 'src/variables';
import { QuestionnaireChoices } from './QuestionnaireChoices';
import {
  saveUserAnswers,
  saveQuestionnaireAnswers,
  setCurrentStep,
  disableNextButton,
} from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {
  sendQuestionnaireAnswersSuccess,
  getMedicalVisitErrorMessage,
  getQuestionnaireId,
  getQuestionnaireAnswersErrorMessage,
  getProgressAnswers,
  getQuestionnaireAnswers,
  getQuestionnaireQuestions,
  getCurrentQuestionnaireStep,
  getQuestionsLength,
  isVisitFetchSuccess,
  isSendingQuestionnaireAnswers,
  getNextButtonState,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import { CustomSpinner } from 'src/common/components/CustomSpinner';
import { getPendingOrCreateVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import optimizelyService from 'src/common/services/OptimizelyService';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { QuestionsAnsweredFixtures } from './questionsAnsweredFixtures';
import PregnancyInfo from 'src/features/checkout/containers/PregnancyInfo';
import { isVisitExpired, isVisitNoUserResponse } from 'src/features/dashboard/helpers/userStatuses';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { getConsentToTelehealth } from "src/features/user/selectors/userSelectors";
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');
const MANUAL_TEST_MODE = getEnvValue('MANUAL_TEST_MODE');

const Wrapper = styled('div')`
  width: 100%;
  height: 80%;
  margin: 0;
  overflow-y: scroll;
  @media (min-height: 568px) and (min-width: 576px) {
    display: flex;
    flex-direction: column;
  }
  @media (min-height: 800px) {
    height: unset;
  }
`;

const Container = styled('div')`
  background-color: ${colors.white};
  max-width: 900px;
  margin: 0 auto;
  padding-top: 5px;
  height: 100%;
  .min-questionnaire-height {
    height: fit-content;
  }

  * {
    font-family: ${fontFamily.baseFont};
  }

  ${breakpoints.sm} {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 30px;
  }
`;

const QuestionContainer = styled.div`
  padding: 0px 15px 40px;
`;

const Question = styled.h2`
  padding: 35px 0px 20px 0px;
  margin: 0 auto;
  text-align: center;
  font-weight: bold;
  font-size: ${fontSize.big};
  line-height: 29px;
  color: ${colors.chambray};
  max-width: 400px;
  font-size: 24px !important;
  font-weight: normal !important;
  font-family: PFHandbookPro-Regular;
  ${breakpoints.xs} {
    padding: 10px 0px 15px 0px;
    font-size: ${fontSize.big};
    line-height: 29px;
    max-width: 285px;
  }
`;

const Label = styled('label')`
  color: dimgray;
  font-size: 17px;
  padding-left: 24px;
  margin: 0;
  cursor: pointer;
`;

// const QuestionNumberProgress = styled('p')`
//   margin-top: 3px;
//   font-size: 18px;
//   line-height: 22px;
//   color: ${colors.darkModerateBlue};
//   text-transform: uppercase;
//   display: flex;
//   justify-content: center;
//   width: fit-content;
// `;

const Info = styled('p')`
  padding: 0px 20px 5px 20px;
  font-size: 13px;
  line-height: 152%;
  max-width: 419px;
  text-align: center;
`;

const InputStyled = styled(Input)`
  &[type*='radio'],
  &[type*='checkbox'] {
    width: 20px;
    height: 20px;
    min-height: unset;
    left: 0px;
    top: 3;
    bottom: 0;
    margin: 3px;
    cursor: pointer;
  }
`;

const FormGroupStyled = styled(FormGroup)`
  && {
    padding-left: 0;
  }
`;

const TextAreaWrapper = styled('div')`
  margin-bottom: 10px;
`;

const StyledTextArea = styled('textarea')`
  min-height: 80px;
  line-height: 16px;
  border: 0.5px solid #24272a;
  width: 100%;
  font-size: ${fontSize.smallest};
  padding: 16px 19px;
  border-radius: 4px;
`;

const ProgressContainer = styled('div')`
  background-color: ${colors.white};
`;

const Progress = styled(Line)`
  && {
    position: fixed;
    top: ${props => props.headerHeight || 80};
    left: 0;
    z-index: 9;
    .rc-progress-line-trail {
      stroke-width: 0.5px;
      ${breakpoints.xs} {
        stroke-width: 10px;
      }
      stroke: ${colors.gallery};
    }
    .rc-progress-line-path {
      stroke-width: 0.5px;
      ${breakpoints.xs} {
        stroke-width: 10px;
      }
      stroke: ${colors.mulberry};
    }
    .ant-progress-outer {
      padding-right: 0;
    }
    .ant-progress-text {
      display: none;
    }
    .ant-progress-inner {
      border-radius: 0;
      background-color: ${colors.white};
    }
    .ant-progress-bg {
      height: 5px !important;
      border-radius: 0 100px 100px 0;
      background-color: ${colors.mulberry};
    }
  }
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 455px;
  margin: 0 auto;
`;

const QuestionHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const QuestionRequiredIndicator = styled.p`
  margin-top: 10px;
  font-size: ${fontSize.normal};
  color: ${colors.mulberry};

  ${breakpoints.sm} {
    font-size: ${fontSize.small};
  }
`;

class Questionnaire extends Component {
  state = {
    currentQuestion: 0,
    answered: [],
    percentageProgress: 8,
    disableNextButton: true,
    preparedAnswers: [],
    displayIsPregnantErrorMessage: false,
    showNursingWarning: false,
    showTTCWarning: false,
  };

  componentDidMount() {
    const {
      consentToTelehealth,
      getPendingOrCreateVisitRequest,
      questions,
      isUserReturning,
      progressAnswers,
      questionnaireAnswers,
      currentQuestionnaireStep,
      questionsLength,
      getNextButtonState,
      user,
      visit,
    } = this.props;

    if (!questions) {
      return;
    }

    let gtmCheckoutEvents = (sessionStorage.getItem('gtmCheckoutEvents') !== null) ? JSON.parse(sessionStorage.getItem('gtmCheckoutEvents')) : [];    
    if (gtmCheckoutEvents.indexOf('questionnaire_start') == -1) {
      GTMUtils.trackCall('questionnaire_start');
      gtmCheckoutEvents.push('questionnaire_start');
      sessionStorage.setItem('gtmCheckoutEvents', JSON.stringify(gtmCheckoutEvents))
    }  

    if (user && user.id) {
      const visitExpired = isVisitExpired(visit);
      const visitNoUserResponse = isVisitNoUserResponse(visit);
      if (!visit.id || (visit.id && (visitExpired || visitNoUserResponse))) {
        getPendingOrCreateVisitRequest(user.id, null, consentToTelehealth);
      }
    }

    // TODO - Fix bug in which the user's answers are NOT displayed if only the first question is answered.
    // Currently, the user's answers are displayed only if the user answers the first and second questions.
    if (!isUserReturning || (isUserReturning && !currentQuestionnaireStep)) {
      this.setState({
        answers: this.getInitialAnswersState(questions),
        initialState: this.getInitialAnswersState(questions),
      });
    }

    if (isUserReturning && currentQuestionnaireStep) {
      this.setState({
        answers: questionnaireAnswers,
        currentQuestion: currentQuestionnaireStep,
        preparedAnswers: progressAnswers,
        initialState: this.getInitialAnswersState(questions),
        percentageProgress: Number(
          (((currentQuestionnaireStep + 1) * 100) / (questionsLength + 1)).toFixed(0),
        ),
        disableNextButton: getNextButtonState,
      });
    }

    this.props.setCurrentStep(this.state.currentQuestion, questions && questions.length);
  }

  componentDidUpdate(prevProps) {
    const {
      questions,
      sendQuestionnaireAnswersSuccess,
      isUserReturning,
      saveQuestionnaireAnswers,
      visitFetchSuccess,
      onSkinProfileQuestionsSubmitSuccess,
    } = this.props;

    // ---- Visit with Questionnaire just fetched ----
    if (
      this.props.questions &&
      visitFetchSuccess &&
      !prevProps.visitFetchSuccess &&
      !isUserReturning
    ) {
      this.setState({
        answers: this.getInitialAnswersState(questions),
        initialState: this.getInitialAnswersState(questions),
      });
    }

    this.state.answers !== undefined && saveQuestionnaireAnswers(this.state.answers);

    this.props.setCurrentStep(this.state.currentQuestion, questions && questions.length);
    
    let gtmQEventName = `questionnaire_question_view_${this.state.currentQuestion+1}`;
    let gtmCheckoutEvents = (sessionStorage.getItem('gtmCheckoutEvents') !== null) ? JSON.parse(sessionStorage.getItem('gtmCheckoutEvents')) : [];    
    if (gtmCheckoutEvents.indexOf(gtmQEventName) == -1) {
      GTMUtils.trackCall('questionnaire_question_view', { 'questionnaire_step': this.state.currentQuestion+1 });
      gtmCheckoutEvents.push(gtmQEventName);
      sessionStorage.setItem('gtmCheckoutEvents', JSON.stringify(gtmCheckoutEvents))
    }  

    this.props.disableNextButton(this.state.disableNextButton);

    if (
      !prevProps.sendQuestionnaireAnswersSuccess &&
      sendQuestionnaireAnswersSuccess &&
      !this.state.displayIsPregnantErrorMessage
    ) {
      if (onSkinProfileQuestionsSubmitSuccess) {
        // if (!DEBUG) {
        //   optimizelyService.track('questionnaire_questions_answered');
        // }
        GTMUtils.trackCall('questionnaire_questions_complete');
        onSkinProfileQuestionsSubmitSuccess();
      }
    }
  }

  skipQuestionBasedOnUserAnswers = question => {
    let skipCurrentQuestion = false;

    if (!question.skip) {
      return skipCurrentQuestion;
    }

    const parentQuestionId = question.skip.parentQuestionId ? question.skip.parentQuestionId : null;
    const parentQuestionSkipChoiceIds = question.skip.parentQuestionSkipChoiceIds
      ? question.skip.parentQuestionSkipChoiceIds
      : null;
    if (parentQuestionId && parentQuestionSkipChoiceIds) {
      const parentQuestionAnswer = this.state.answers[parentQuestionId].answer;
      const userParentQuestionAnswer = Object.keys(parentQuestionAnswer).filter(
        key => parentQuestionAnswer[key],
      );
      skipCurrentQuestion = parentQuestionSkipChoiceIds.includes(
        parseInt(userParentQuestionAnswer),
      );
    }

    return skipCurrentQuestion;
  };

  getInitialAnswersState = questions => {
    return (
      questions &&
      questions.reduce((acc, item) => {
        acc[item.id] = {
          answer: item.choices.reduce((ansAcc, choice) => {
            ansAcc[choice.id] = false;
            return ansAcc;
          }, {}),
        };
        return acc;
      }, {})
    );
  };

  onInputChange = (value, field, isSubInputFilled) => {
    this.setState(prevState => ({
      answers: {
        ...prevState.answers,
        [field]: {
          answer: {
            [field]: value,
          },
        },
      },

      disableNextButton: isSubInputFilled || !(value !== '' && value.replace(/\s/g, '').length > 0),
    }));
  };

  onCheckboxChange = (value, field, checkField, text, question) => {
    let isAlreadyChecked = false;
    let alreadyTrueKey = null;
    const noneTextArr = [
      'No',
      'None of the above apply',
      'Nothing to note',
      'No, never had any of these',
      'No, never seen a dermatologist',
    ];
    const prevAnswerObj = this.state.answers[field].answer;
    // if any of the above text is present and its value is true
    // then uncheck other checkboxes
    if (noneTextArr.indexOf(text) !== -1 && value === true) {
      for (var key in prevAnswerObj) {
        if (prevAnswerObj.hasOwnProperty(key)) {
          prevAnswerObj[key] = false;
        }
      }
    } else if (noneTextArr.indexOf(text) === -1 && value === true) {
      // find if already any answer selected
      for (var key in prevAnswerObj) {
        if (prevAnswerObj.hasOwnProperty(key)) {
          if (prevAnswerObj[key] === true) {
            isAlreadyChecked = true;
            alreadyTrueKey = key;
          }
        }
      }
      // if any value already true
      if (isAlreadyChecked) {
        // find the text of already true value
        const choiceIndex = question.choices.findIndex(choice => choice.id == alreadyTrueKey);
        // match the choice label text with above array
        // to check if already selected value in from one of them
        // if yes then unselect that
        if (noneTextArr.indexOf(question.choices[choiceIndex].label) !== -1) {
          prevAnswerObj[alreadyTrueKey] = false;
        }
      }
    }

    const childrenId = question.children && question.children.map(a => a.id);

    this.setState(prevState => {
      const filteredAnswers = _.omit(prevState.answers, childrenId);

      return {
        answers: {
          ...filteredAnswers,
          [field]: {
            answer: {
              ...prevAnswerObj,
              [checkField]: value,
            },
          },
        },
      };
    });
  };

  onRadioChange = (value, field, radioField, question, percent, isQuestionRequired, index) => {
    const childrenId = question.children && question.children.map(a => a.id);
    const shouldRenderSubInputs = !!this.getSubInputs(question.children, radioField).length;

    const onSetState = () => {
      if (shouldRenderSubInputs) {
        return;
      }
      this.onNext(question.id, percent, index, question, isQuestionRequired);
    };

    this.setState(prevState => {
      const filteredAnswers = _.omit(prevState.answers, childrenId);

      return {
        answers: {
          ...filteredAnswers,
          [field]: {
            ...prevState.answers[field],
            answer: {
              ...this.state.initialState[field].answer,
              [radioField]: value,
            },
          },
        },
      };
    }, onSetState);
  };

  onNext = (questionId, percent, index, question, isQuestionRequired) => {
    const { sendQuestionnaireAnswersRequest, visit } = this.props;
    const visitId = visit.uuid;

    if (question.type.toLowerCase() === 'radio') {
      const selectedAnswerId = Object.keys(this.state.answers[`${questionId}`].answer).filter(
        k => this.state.answers[`${questionId}`].answer[k],
      )[0];

      const selectedAnswerChoice = question.choices.find(c => c.id == selectedAnswerId);
      const selectedAnswerChoiceLabel =
        selectedAnswerChoice && selectedAnswerChoice.label
          ? selectedAnswerChoice.label.toLowerCase()
          : null;
      if (
        selectedAnswerChoiceLabel &&
        selectedAnswerChoiceLabel.includes('pregnant') |
          selectedAnswerChoiceLabel.includes('nursing') |
          selectedAnswerChoiceLabel.includes('trying to conceive')
      ) {
        this.setState({
          displayIsPregnantErrorMessage: true,
        });

        const flattenedAnswers = this.prepareQuestionnaireAnswers(this.state.answers);
        const answers = {
          questionnaireAnswers: {
            answers: flattenedAnswers,
          },
        };
        sendQuestionnaireAnswersRequest({ visitId, answers });
        return;
      } else {
        this.setState({
          displayIsPregnantErrorMessage: false,
        });
      }
    }

    if (!this.isQuestionAnswered(questionId) && isQuestionRequired) {
      return;
    }

    let answers = null;
    if (this.isLastQuestion()) {
      const flattenedAnswers = this.prepareQuestionnaireAnswers(this.state.answers);
      answers = {
        questionnaireAnswers: {
          answers: flattenedAnswers,
        },
      };
    }

    if (MANUAL_TEST_MODE && DEBUG) {
      answers = {
        questionnaireAnswers: {
          answers: QuestionsAnsweredFixtures,
        },
      };
    }

    if (answers) {
      sendQuestionnaireAnswersRequest({ visitId, answers });
    } else {
      this.setState(prevState => ({
        answered: [...prevState.answered, questionId],
        currentQuestion: this.skipQuestionBasedOnUserAnswers(
          this.props.questions[prevState.currentQuestion + 1],
        )
          ? prevState.currentQuestion + 2
          : prevState.currentQuestion + 1,
        percentageProgress: percent,
        // showNursingWarning: false,
        // showTTCWarning: false
      }));
    }

    this.questionnaireProgressAnswers(this.state.answers, question);
  };

  isLastQuestion = () => {
    const { currentQuestion } = this.state;
    const { questions } = this.props;

    if (questions && currentQuestion) {
      return currentQuestion === questions.length - 1;
    }
    return false;
  };

  onBack = (_, percent, question) => {
    const { sendQuestionnaireAnswersClearErrorRequest } = this.props;
    const answered = this.state.answered;
    answered.pop();
    this.questionnaireProgressAnswers(this.state.answers, question);
    this.setState(prevState => ({
      answered,
      currentQuestion:
        prevState.currentQuestion === 0
          ? 0
          : this.skipQuestionBasedOnUserAnswers(this.props.questions[prevState.currentQuestion - 1])
            ? prevState.currentQuestion - 2
            : prevState.currentQuestion - 1,
      percentageProgress: percent,
    }));

    sendQuestionnaireAnswersClearErrorRequest();
  };

  isQuestionAnswered(questionId) {
    const answer = this.state.answers[questionId].answer;
    const answered = Object.keys(answer).filter(key => answer[key]);

    return !!answered.length;
  }

  handleClick = (
    target,
    type,
    questionId,
    fieldValue,
    text,
    question,
    percent,
    isQuestionRequired,
    index,
  ) => {
    const onChangeArgs = [target.checked, questionId, fieldValue];

    if (type.toLowerCase() === 'radio') {
      this.onRadioChange(...onChangeArgs, question, percent, isQuestionRequired, index);
      // if (text.toLowerCase().includes('nursing')) {
      //   this.setState({
      //     showNursingWarning: true
      //   })
      // } else {
      //   this.setState({
      //     showNursingWarning: false
      //   })
      // }
      // if (text.toLowerCase().includes('trying to conceive')) {
      //   this.setState({
      //     showTTCWarning: true
      //   })
      // } else {
      //   this.setState({
      //     showTTCWarning: false
      //   })
      // }
    }

    if (type.toLowerCase() === 'checkbox') {
      this.onCheckboxChange(...onChangeArgs, text, question);
    }
  };

  isChecked = (questionId, choiceId) => {
    return this.state.answers[questionId].answer[choiceId];
  };

  prepareQuestionnaireAnswers = answers => {
    const questionnaireAnswers = Object.keys(answers).map(item => {
      const value = Object.keys(answers[item].answer).reduce((acc, key) => {
        if (answers[item].answer[key] && answers[item].answer[key] !== true) {
          acc.push(answers[item].answer[key]);
        } else if (answers[item].answer[key]) {
          acc.push(key);
        }
        return acc;
      }, []);

      return {
        questionId: item,
        value: value.length === 1 ? value[0] : value,
      };
    });

    return questionnaireAnswers;
  };

  questionnaireProgressAnswers = (answers, question) => {
    const prepared = Object.keys(answers).map(item => {
      if (question.id != item) return;

      return Object.keys(answers[item].answer)
        .filter(key => answers[item].answer[key] === true)
        .map(answerId => {
          const answeredQuestion = question.id == item && question;

          const parentQuestionId = question.children.filter(
            a => a.trigger.qnrChoiceId === Number(answerId),
          );

          const additionalUserAnswersIds = parentQuestionId.map(answer => answer.id);

          const additionalUserAnswers =
            additionalUserAnswersIds &&
            additionalUserAnswersIds.map(userAnswerId => answers[userAnswerId]);

          const reducedInputs = additionalUserAnswers
            .map(userInput => Object.values(userInput.answer))
            .reduce((acc, val) => acc.concat(val), []);

          return (
            answeredQuestion.choices &&
            answeredQuestion.choices.filter(chosenAnswer => chosenAnswer.id == answerId).map(
              chosenAnswer =>
                chosenAnswer.id === Number(answerId)
                  ? {
                      label: chosenAnswer.label,
                      input: reducedInputs,
                    }
                  : {
                      label: chosenAnswer.label,
                    },
            )
          );
        })
        .reduce((acc, val) => acc.concat(val), []);
    });

    const filteredAnswers = _.filter(prepared, _.size || _.isEmpty);

    this.setState(() => {
      const removedDuplicatedAnswers = this.state.preparedAnswers.find(
        answer => answer.title === question.title,
      )
        ? this.state.preparedAnswers.filter(
            answer => answer.title !== question.title && answer.title !== '',
          )
        : this.state.preparedAnswers;
      return {
        preparedAnswers: [
          ...removedDuplicatedAnswers,
          {
            title: question.title,
            answers: filteredAnswers.reduce((acc, val) => acc.concat(val), []),
          },
        ],
      };
    });

    return filteredAnswers;
  };

  disableNext = value => {
    this.setState(prevState => {
      if (prevState.disableNextButton !== value) {
        return {
          disableNextButton: value,
        };
      }
    });
  };

  isBlank = value => !(value !== '' && value.replace(/\s/g, '').length > 0);

  getSubInputs = (questionChildren, choiceId) =>
    questionChildren.filter(child => child.trigger.qnrChoiceId == choiceId);

  renderSubInput = (children, choiceId, isSubInputFilled) => {
    const subInputs = this.getSubInputs(children, choiceId);

    if (subInputs.length) {
      return subInputs.map(subInput => (
        <FormGroupStyled check key={subInput.id}>
          {(subInput.type === 'text' || subInput.type === 'textarea') && (
            <TextAreaWrapper>
              <StyledTextArea
                placeholder={subInput.title}
                name={subInput.id}
                value={
                  this.state.answers[subInput.id] &&
                  this.state.answers[subInput.id].answer[subInput.id]
                }
                onChange={e => this.onInputChange(e.target.value, subInput.id, isSubInputFilled)}
              />
            </TextAreaWrapper>
          )}
          {subInput.type !== 'text' &&
            subInput.type !== 'textarea' && (
              <Label check>
                <InputStyled
                  name={subInput.id}
                  type={subInput.type}
                  value={
                    this.state.answers[subInput.id] &&
                    this.state.answers[subInput.id].answer[subInput.id]
                  }
                  onChange={e => this.onInputChange(e.target.value, subInput.id, isSubInputFilled)}
                />
              </Label>
            )}
        </FormGroupStyled>
      ));
    }
  };

  renderQuestion = (question, index, length, displayBackButton, nextButtonText) => {
    const percent = Number((((index + 2) * 100) / (length + 1)).toFixed(0));

    const percentMinus = Number(((index * 100) / (length + 1)).toFixed(0));

    this.state.preparedAnswers !== undefined &&
      this.state.preparedAnswers.length > 0 &&
      this.props.saveUserAnswers(this.state.preparedAnswers);

    const isQuestionRequired = !!question.validations.required;
    const isFirstQuestion = this.state.currentQuestion === 0;

    

    return (
      <Wrapper id={'wrapper'}>
        <QuestionContainer id={'question-container'} className="min-questionnaire-height">
          <QuestionHeaderWrapper>
            {/*<QuestionNumberProgress>*/}
            {/*  {index + 1}/{length}*/}
            {/*</QuestionNumberProgress>*/}
            {!isQuestionRequired && <QuestionRequiredIndicator>Optional</QuestionRequiredIndicator>}
          </QuestionHeaderWrapper>
          <QuestionWrapper id={'question-wrapper'}>
            <Question>{question.title}</Question>
            {question.description && <Info>{question.description}</Info>}
            {/* {this.renderChoices(question)} */}
            <QuestionnaireChoices
              question={question}
              answers={this.state.answers && this.state.answers}
              handleClick={(...args) =>
                this.handleClick(...args, percent, isQuestionRequired, index)
              }
              isChecked={this.isChecked}
              renderSubInput={this.renderSubInput}
              disableNext={this.disableNext}
            />
          </QuestionWrapper>
        </QuestionContainer>
        <BottomNav
          currentCheckoutStepName={'shipping'}
          backButtonType={'arrow'}
          backButtonClick={
            displayBackButton && index === 0
              ? this.props.onPrevModalStep
              : () => this.onBack(question.id, percentMinus, question)
          }
          backButtonTitle={'Back'}
          disableBackButton={!this.state.currentQuestion}
          disableNextButton={
            this.state.displayIsPregnantErrorMessage ||
            !(
              !this.state.disableNextButton &&
              (this.isQuestionAnswered(question.id) || !isQuestionRequired)
            )
          }
          hideNextButtonArrow={false}
          hideBackButton={isFirstQuestion}
          nextButtonClick={() =>
            this.onNext(question.id, percent, index, question, isQuestionRequired)
          }
          nextTitle={nextButtonText}
        />
      </Wrapper>
    );
  };

  render() {
    const {
      isSendingQuestionnaireAnswers,
      questions,
      questionnaireAnswersErrorMessage,
      visitErrorMessage,
      isSkinProfileContainer,
      headerHeight,
    } = this.props;
    const { answers, percentageProgress } = this.state;
    const displayBackButton = this.props.onPrevModalStep != null;
    const nextButtonText = this.isLastQuestion() ? 'Submit' : 'Continue';

    //strokeWidth="1" strokeColor={colors.mulberry} borderRadius="0"
    return (
      <div>
        {this.state.displayIsPregnantErrorMessage ? (
          <PregnancyInfo />
        ) : (
          <div
            id="top"
            style={{
              height: '100%',
              overflow: 'scroll',
            }}
          >
            <ProgressContainer id="progress-container">
              <Progress
                headerHeight={headerHeight}
                isSkinProfileContainer={isSkinProfileContainer}
                percent={percentageProgress}
              />
            </ProgressContainer>
            <CustomSpinner spinning={isSendingQuestionnaireAnswers} blur={true}>
              <Container id="container">
                {questionnaireAnswersErrorMessage && (
                  <MessageBannerAlert text={questionnaireAnswersErrorMessage} color="danger" />
                )}
                {visitErrorMessage && (
                  <MessageBannerAlert text={visitErrorMessage} color="danger" />
                )}
                {questions &&
                  answers &&
                  questions.map((question, index) => {
                    if (index === this.state.currentQuestion) {
                      return this.renderQuestion(
                        question,
                        index,
                        questions.length,
                        displayBackButton,
                        nextButtonText,
                      );
                    }
                  })}
              </Container>
            </CustomSpinner>
          </div>
        )}
      </div>
    );
  }
}

//TODO - Pass these states and actions down from HOC
export const QuestionnaireContainer = connect(
    state => ({
      sendQuestionnaireAnswersSuccess: sendQuestionnaireAnswersSuccess(state),
      isSendingQuestionnaireAnswers: isSendingQuestionnaireAnswers(state),
      questionnaireAnswersErrorMessage: getQuestionnaireAnswersErrorMessage(state),
      questions: getQuestionnaireQuestions(state),
      questionnaireId: getQuestionnaireId(state),
      visitFetchSuccess: isVisitFetchSuccess(state),
      visitErrorMessage: getMedicalVisitErrorMessage(state),
      progressAnswers: getProgressAnswers(state), // TODO - change to better name; state contains human-readable user questionnaire answers
      questionnaireAnswers: getQuestionnaireAnswers(state), // TODO - change to better name; state contains questionnaire answers formatted for server consumption
      currentQuestionnaireStep: getCurrentQuestionnaireStep(state),
      questionsLength: getQuestionsLength(state),
      getNextButtonState: getNextButtonState(state),
      consentToTelehealth: getConsentToTelehealth(state),
    }),
    {
      getPendingOrCreateVisitRequest,
      sendQuestionnaireAnswersRequest,
      sendQuestionnaireAnswersClearErrorRequest,
      saveUserAnswers,
      saveQuestionnaireAnswers,
      setCurrentStep,
      disableNextButton,
    },
)(Questionnaire);
