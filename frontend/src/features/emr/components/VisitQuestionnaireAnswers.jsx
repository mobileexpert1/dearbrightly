import React from 'react';
import { graphql, createRefetchContainer } from 'react-relay';
import moment from 'moment'
import { Link } from 'react-router-dom'
import { capitalizeEnum } from 'src/common/helpers/formatText';
import CreateFlagModal from 'src/features/emr/containers/CreateFlagModal'
import Flag from 'src/features/emr/components/Flag'
import styled from "react-emotion";
import UpdateMedicalVisitMutation from 'src/features/emr/mutations/UpdateMedicalVisitMutation'
import { upperCaseSnakeToCapital } from 'src/common/helpers/stringUtils';
import { formatCreatedDateTime } from 'src/common/helpers/formatTimestamp';
import { UpdateVisitMedicalProviderModal } from "src/features/emr/components/UpdateVisitMedicalProviderModal";
import MessageBannerAlert from 'src/common/components/MessageBannerAlert';

const SERVICES = {
  "INITIAL_VISIT": "Initial Visit",
  "REPEAT_VISIT": "Repeat Visit",
  "SHORT_REPEAT_VISIT_MALE": "Repeat Visit",
  "SHORT_REPEAT_VISIT_FEMALE": "Repeat Visit"
}

const FlagButton = styled.button`
    font-size: 14px;
    padding: 2px;
    border: none;
    background: none;
    color: #5c5c5c;
    &:focus {
      box-shadow: none;
      outline: 0;
    }
    &:hover {
      background-color: #fff;
      color: #a9a9a9;
      cursor: pointer;
    }
`;

const CancelButton = styled.button`
    font-size: 14px;
    padding: 2px;
    border: none;
    margin-left: 10px;
    background: none;
    color: #5c5c5c;
    &:focus {
      box-shadow: none;
      outline: 0;
    }
    &:hover {
      background-color: #fff;
      color: #a9a9a9;
      cursor: pointer;
    }
`;

const OptionalText = styled.p`
  color: #5c5c5c;
  font-size: 8px;
`;

class VisitQuestionnaireAnswers extends React.Component {
  state = {
    createFlagModalOpen: false,
    isEditingMedicalProvider: false
  }

  _updateVisitMedicalProvider = (medicalProviderUserId) => {
    if (!medicalProviderUserId) {
      return;
    }

    const { visitId } = this.props.visit;

    UpdateMedicalVisitMutation(
        visitId,
        null,
        medicalProviderUserId,
        (resp) => {
          this.setState({body: ''})
          if (this.props.onSuccess) {
            this.props.onSuccess()
          }
        },
        (err) => {
          if (Array.isArray(err)) {
              err = err[0]
              const error_msg = err['message']
              err = (typeof error_msg !== "undefined") ? error_msg : "Medical visit provider update error.";
          }
          this.setState({error: err})
        }
    )
  }

  closeCreateFlagModal = () => {
    this.setState({createFlagModalOpen: false})
  }

  // TODO (Alda) - Is there a better way to refresh flags than re-fetching?
  flagCreationSuccess = () => {
    this._refetch()
  }

  _refetch = () => {
    this.props.relay.refetch(
      {visitId: this.props.visit.id},
      null,
      {force: true},
    );
  }

  _toggleCancelVisit = (id, status) => {
    const isVisitCancelled = status === "PROVIDER_CANCELLED"
    let confirmationText = "Are you sure you want to cancel this visit?"
    let updatedStatus = "Provider Cancelled"
    if (isVisitCancelled) {
        confirmationText = "Are you sure you want to undo visit cancel? This will re-queue the visit for the medical provider."
        updatedStatus = "Provider Pending Action"
    }
    const confirmed = window.confirm(confirmationText);

    if (confirmed) {
      UpdateMedicalVisitMutation(
          id,
          updatedStatus,
          null,
        (resp) => {
          this.setState({body: ''})
          if (this.props.onSuccess) {
            this.props.onSuccess()
          }
        },
        (err) => {
          this.setState({error: err})
        }
      )
    }
  }

  render() {

    const { id, uuid, visitId, service, skinProfileStatus, status, createdDatetime, questionnaireAnswers, questionnaire, patient, medicalProvider } = this.props.visit

    const isVisitCancelled = status === "PROVIDER_CANCELLED"
    const noSkinProfileUpdates = (skinProfileStatus === "NO_CHANGES_NO_USER_RESPONSE" || skinProfileStatus === "NO_CHANGES_USER_SPECIFIED")
    const emptyVisitStatus = questionnaireAnswers === null ?
      (noSkinProfileUpdates ? upperCaseSnakeToCapital(skinProfileStatus) : "Questionnaire Unanswered") : null
    const visitStatus = emptyVisitStatus ? emptyVisitStatus : capitalizeEnum(status)

    if (!this.props.display) {
      return (
        <div>
          <Link to={`/emr/patients/${patient.id}/visits/${id}`}>{SERVICES[service]}</Link>
          <hr/>
        </div>
      )
    }

    // TODO (Alda) - Create resolvers for the data structures created below so all this logic can sit in the backend
    // The questions and answers are provided as JSON strings, so let's
    // turn them into objects to process.
    const questions = questionnaire ? JSON.parse(questionnaire.questions) : {}
    const answers = questionnaireAnswers ? JSON.parse(questionnaireAnswers.answers) : {}

    // We need to be able to quickly lookup a question, an answer (a choice),
    // and a question's children by IDs. We assume that each ID is globally unique.
    let questionById = {}
    let choiceById = {}

    // Preprocess the questions to create a map of:
    // 1. questionId -> question
    // 2. choiceId -> choice
    for (let questionIndex in questions) {
      const question = questions[questionIndex]
      const questionId = String(question.id)
      questionById[questionId] = question

      for (let choiceIndex in question.choices) {
        let choice = question.choices[choiceIndex]
        choiceById[String(choice.id)] = choice.label
      }
    }

    // Map questionId to the user's provided answer.
    // This includes top-level and child questions.
    let questionToAnswer = {};
    for (let answerIndex in answers) {
      let userAnswers = answers[answerIndex]
      const questionId = String(userAnswers.question_id)
      let userAnswerIds = userAnswers.value

      if (!Array.isArray(userAnswers.value)) {
        userAnswerIds = [userAnswers.value]
      }

      questionToAnswer[questionId] = []
      for (var i = 0; i < userAnswerIds.length; i++) {
        const userAnswerId = userAnswerIds[i];
        let selectedChoice = choiceById[userAnswerId]
        // If a selected choice is defined, we will use the stored answer.
        // Otherwise, it is a free-form answer and we'll use what the user
        // provided.
        if (selectedChoice !== undefined) {
          questionToAnswer[questionId] += ` • ${selectedChoice}`
        } else {
          questionToAnswer[questionId] = userAnswerId
        }
      }
    }

    return (
      <div style={{width: "100%"}}>
        {this.state.error && (<MessageBannerAlert text={this.state.error} color="danger" />)}
        <Link to={`/emr/patients/${patient.id}/visits/${id}`}>{SERVICES[service]}</Link> [{visitId}]
        {this.props.user.isMedicalAdmin && (
          <CancelButton className="pull-right" onClick={() => this._toggleCancelVisit(visitId, status)}>
              {!isVisitCancelled && <i className="fa fa-times" aria-hidden="true"></i>}
              {isVisitCancelled && <i className="fa fa-undo" aria-hidden="true"></i>}
          </CancelButton>
        )}
        <FlagButton className="pull-right" onClick={() => this.setState({ createFlagModalOpen: true })}>
          <i className="fa fa-flag" aria-hidden="true"></i>
        </FlagButton>
        <CreateFlagModal
          isOpen={this.state.createFlagModalOpen}
          closeHandler={this.closeCreateFlagModal}
          onSuccess={this.flagCreationSuccess}
          visitUuid={uuid}
        />
        <br />
        <span><strong>Date Created: </strong>{formatCreatedDateTime(createdDatetime)} [{moment(createdDatetime).fromNow()}]</span>
        <br />
        <span><strong>Provider: </strong>{medicalProvider.fullName}</span>
        {this.props.user.isMedicalAdmin && (<UpdateVisitMedicalProviderModal
            defaultValue={medicalProvider}
            onSave={this._updateVisitMedicalProvider}
        />)}
        <br />
        <span><strong>Status: </strong>{visitStatus}</span>
        <div>
          {this.props.visit.allFlags && this.props.visit.allFlags.edges.map(edge =>
            <Flag
              key={`${edge.node.id}_flag`}
              flag={edge.node}
              closeHandler={this.closeCreateFlagModal}
            />
          )}
          <hr />
          {/*<strong><span>Questionnaire</span></strong>*/}
          {!emptyVisitStatus && (
            <div>
              <ol style={{"list-style-type":"decimal", "padding-left":"10px"}}>
                {
                  // Go over all the questions a person should answer.
                  Object.keys(questionById).map(questionId => (
                    <li key={questionId} style={{ "listStyleType": "decimal" }}>
                      <strong>{questionById[questionId].title}</strong>
                      <i>{questionById[questionId].validations.required ? "" : " [optional]"}</i>
                      <ul>
                        <li key={questionId}>
                          {questionToAnswer[String(questionId)]}
                        </li>
                        {questionById[String(questionId)].children.map(childQuestion => (
                          // If the person answered it, then display. Otherwise, do nothing.
                          questionToAnswer[String(childQuestion.id)] !== undefined ? <li key={childQuestion.id}><em>{childQuestion.title}</em><br />{questionToAnswer[String(childQuestion.id)]}</li> : null
                        ))}
                      </ul>
                    </li>
                  ))
                }
              </ol>
              <hr />
            </div>
          )}
        </div>

      </div>
    );
  }
}

export default createRefetchContainer(
  VisitQuestionnaireAnswers,
  {
    visit: graphql`
      fragment VisitQuestionnaireAnswers_visit on VisitType {
          id,
          uuid,
          visitId,
          service,
          medicalProvider {
            id,
            fullName
          },
          skinProfileStatus,
          status,
          createdDatetime,
          questionnaireAnswers {
            answers
          },
          questionnaire {
            questions
          },
          patient {
            id
          },
          allFlags {
            edges {
              node {
                ...Flag_flag
              }
            }
          }
      }`
  },
  graphql`
    query VisitQuestionnaireAnswersRefetchQuery($visitId: ID!) {
      visit(id:$visitId) {
      ...VisitQuestionnaireAnswers_visit
    }
   },
`,
)