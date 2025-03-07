import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { Collapse } from 'reactstrap';
import plusIcon from 'src/assets/images/plusCircle.svg';
import minusIcon from 'src/assets/images/minusCircle.svg';
import { formatCreatedDateTime } from 'src/common/helpers/formatTimestamp';
import { history } from 'src/history';
import { fontSize, colors, breakpoints } from 'src/variables';
import { BoxContainer, BoxHeaderWrapper, BoxHeader } from '../shared/styles';
import { UserNotificationBar } from 'src/features/dashboard/components/UserNotificationBar';
import { getMostRecentVisitRequest } from 'src/features/medicalSurvey/actions/medicalSurveyActions';
import {
  getProgressAnswers,
  getCurrentQuestionnaireStep,
  getQuestionsLength,
  getCompletedQuestionnaireQuestions,
  getQuestionnaireCompletedAnswers,
} from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';

import {
  isVisitQuestionnaireComplete,
  isVisitPhotosUploadComplete,
} from 'src/features/dashboard/helpers/userStatuses';
import { CompleteQuestionnaireAnswers } from 'src/features/dashboard/components/CompleteQuestionnaireAnswers';
import { InProgressQuestionnaireAnswers } from 'src/features/dashboard/components/InProgressQuestionnaireAnswers';
import { prepareUserAnswers } from '../helpers/prepareUserAnswers';
import moment from 'moment';

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  text-align: center;
  margin: auto;

  ${breakpoints.sm} {
    margin-top: 100px;
  }
`;

const MessageHeader = styled.p`
  font-size: ${fontSize.huge};
  line-height: 43px;
  margin-bottom: 0;

  ${breakpoints.sm} {
    font-size: ${fontSize.hugeMobile};
  }
`;

const MessageSubheading = styled.p`
  font-size: ${fontSize.small};
  max-width: 258px;
  line-height: 17px;
  margin: 12px auto;
`;

const ActionButton = styled.button`
  cursor: pointer;
  width: 175px;
  height: 40px;
  background: ${colors.blumine};
  color: ${colors.clear};
  border-radius: 4px;
  font-size: ${fontSize.small};
  line-height: 17px;
  font-weight: 600;
  margin: ${props => (props.toLeft ? 0 : '0 auto')};
  border: none;

  :hover {
    background: ${colors.blumineLight};
  }
`;

const AnswerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.darkModerateBlueOpacity};
  padding: 24px 35px 24px 35px;

  ${breakpoints.sm} {
    flex-direction: column;
    padding: 24px 20px 19px 20px;
  }
`;

const ElementWrapper = styled.div`
  padding: 17px 35px 10px;

  ${breakpoints.xs} {
    padding: 17px 10px 10px;
  }
`;

const FacePhoto = styled.img`
  width: 194px;
  height: 194px;
  margin-right: 21px;
  margin-bottom: 21px;
  object-fit: cover;
  border-radius: 4px;

  ${breakpoints.xs} {
    margin: 21px auto 0px;
    width: 93px;
    height: 76px;
  }
`;

const PhotosSubheadingWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const PhotosSubheading = styled.p`
  width: 87px;
  height: fit-content;
  margin: 0;
`;

const OpenAndCloseIcon = styled.svg`
  background-image:  url('${props => props.iconSrc}') ;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  overflow: initial !important;
  cursor: pointer;
  margin-left: ${props => props.extraMargin && '1rem'};
`;

const PhotosWrapper = styled.div`
  margin-bottom: 1rem;
  ${breakpoints.xs} {
    display: flex;
    flex-direction: row;
  }
`;

const ComponentWrapper = styled.div`
  display: flex;
  height: 70%;

  ${breakpoints.md} {
    margin: 0 auto;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;

  ${breakpoints.md} {
    width: 80vw;
  }
  ${breakpoints.xs} {
    width: 90vw;
  }
`;

const CollapseContent = styled.div`
  display: flex;

  ${breakpoints.sm} {
    flex-direction: column;
  }
`;

const EditPhotosLink = styled.p`
  cursor: pointer;
  font-size: ${fontSize.small};
  color: ${colors.blumine};
  text-align: left;
  text-decoration: underline;
`;

export const VisitDate = styled.p`
  font-size: ${fontSize.small};
  line-height: 29px;
  margin: 0;
  ${breakpoints.sm} {
    font-size: ${fontSize.normal} !important;
  }
`;

class MySkinProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPhotoPreviewOpen: false,
      activeTab: '',
    };
  }

  goToPage = (option, page, e) => {
    e.preventDefault();
    history.push(page, option);
  };

  togglePhotoPreview = () => {
    this.setState(prevState => ({
      isPhotoPreviewOpen: !prevState.isPhotoPreviewOpen,
    }));
  };

  toggleAnswerPreview = questionTitle => {
    this.setState(prevState => ({
      isAnswerPreviewOpen: !prevState.isAnswerPreviewOpen,
      activeTab: prevState.activeTab === questionTitle ? '' : questionTitle,
    }));
  };
  
  goToEditPhotos = () => {
    history.push('/user-dashboard/edit-photos');
  };

  render() {
    const {
      visit,
      progressAnswers,
      currentQuestionnaireStep,
      questionsLength,
      user,
      rxSubscription,
      questions,
      answers,
      pendingCheckoutOrder,
      navigateOrderCheckout,
    } = this.props;
    const { isPhotoPreviewOpen, activeTab } = this.state;

    const questionnaireComplete = isVisitQuestionnaireComplete(visit);
    const visitPhotosUploadComplete = isVisitPhotosUploadComplete(visit);
    const answeredQuestions = progressAnswers;
    const photoFrontFace = visit.photoFrontFace && visit.photoFrontFace.photoFile;
    const photoLeftFace = visit.photoLeftFace && visit.photoLeftFace.photoFile;
    const photoRightFace = visit.photoRightFace && visit.photoRightFace.photoFile;
    const userFacePhotos = [photoFrontFace, photoLeftFace, photoRightFace];
    const preparedAnswers = prepareUserAnswers(questions, answers);
    const visitDateTime = moment(visit.createdDatetime).format("MMMM D, YYYY")

    return (
      <ComponentWrapper>
        {currentQuestionnaireStep || questionnaireComplete ? (
          <ContentWrapper>
            <BoxContainer>
              <BoxHeaderWrapper>
                <BoxHeader>Skin Profile</BoxHeader>
              </BoxHeaderWrapper>
              <UserNotificationBar
                localUserAnswers={answeredQuestions}
                user={user}
                visit={visit}
                rxSubscription={rxSubscription}
                currentQuestionnaireStep={currentQuestionnaireStep}
                questionsLength={questionsLength}
                displayOnlySkinProfileActions={true}
                pendingCheckoutOrder={pendingCheckoutOrder}
                navigateOrderCheckout={navigateOrderCheckout}
              />
            </BoxContainer>
            <BoxContainer>
              <BoxHeaderWrapper>
                <BoxHeader>Your Skin Profile</BoxHeader>
                {/*<VisitDate>{visitDateTime} [{visit.id}]</VisitDate>*/}
              </BoxHeaderWrapper>

              <div>
                {questionnaireComplete
                  ? preparedAnswers.map(question => (
                      <CompleteQuestionnaireAnswers
                        key={question.title}
                        question={question}
                        activeTab={activeTab}
                        toggleAnswerPreview={this.toggleAnswerPreview}
                      />
                    ))
                  : answeredQuestions.map(question => (
                      <InProgressQuestionnaireAnswers
                        key={question.title}
                        question={question}
                        activeTab={activeTab}
                        toggleAnswerPreview={this.toggleAnswerPreview}
                      />
                    ))}

                {/*{answeredQuestions &&*/}
                {/*  answeredQuestions.length !== questionsLength &&*/}
                {/*  !questionnaireComplete && (*/}
                {/*    <AnswerWrapper>*/}
                {/*      <ActionButton*/}
                {/*        toLeft={1}*/}
                {/*        onClick={e => this.goToPage('continue', '/user-dashboard/skin-profile', e)}*/}
                {/*      >*/}
                {/*        Continue*/}
                {/*      </ActionButton>*/}
                {/*    </AnswerWrapper>*/}
                {/*  )}*/}
              </div>
            </BoxContainer>
            {questionnaireComplete && visitPhotosUploadComplete && (
              <BoxContainer>
                <BoxHeaderWrapper>
                  <BoxHeader>Photos</BoxHeader>
                </BoxHeaderWrapper>
                <ElementWrapper>
                  <PhotosSubheadingWrapper>
                    <PhotosSubheading>
                      {isPhotoPreviewOpen ? 'Hide Photos' : 'Show Photos'}
                    </PhotosSubheading>
                    <OpenAndCloseIcon
                      onClick={() => this.togglePhotoPreview()}
                      iconSrc={isPhotoPreviewOpen ? minusIcon : plusIcon}
                    />
                  </PhotosSubheadingWrapper>
                  <Collapse isOpen={isPhotoPreviewOpen}>
                    <CollapseContent>
                      <PhotosWrapper>
                        {userFacePhotos.map(facePhotos => {
                          if (facePhotos) {
                            return <FacePhoto key={facePhotos} src={facePhotos} />
                          }
                        }
                        )}
                      </PhotosWrapper>
                    </CollapseContent>
                    <EditPhotosLink onClick={this.goToEditPhotos}>
                      Edit photos
                    </EditPhotosLink>
                  </Collapse>
                </ElementWrapper>
              </BoxContainer>
            )}
          </ContentWrapper>
        ) : (
          <MessageWrapper>
            <MessageHeader>
              You have not completed your Skin Profile yet.
            </MessageHeader>
            <MessageSubheading>
              Understanding your skin condition is very important to us.
            </MessageSubheading>
            <ActionButton
              onClick={e => this.goToPage('firstVisit', '/user-dashboard/skin-profile', e)}
            >
              Complete Skin Profile
            </ActionButton>
          </MessageWrapper>
        )}
      </ComponentWrapper>
    );
  }
}

//TODO - Pass these states and actions down from HOC
const mapStateToProps = state => ({
  questions: getCompletedQuestionnaireQuestions(state),
  progressAnswers: getProgressAnswers(state),
  currentQuestionnaireStep: getCurrentQuestionnaireStep(state),
  questionsLength: getQuestionsLength(state),
  answers: getQuestionnaireCompletedAnswers(state),
});

export const MySkinProfileContainer = connect(
  mapStateToProps,
  {
    getMostRecentVisitRequest,
  },
)(MySkinProfile);
