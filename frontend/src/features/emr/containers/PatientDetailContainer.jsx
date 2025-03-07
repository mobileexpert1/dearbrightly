import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { graphql, QueryRenderer } from 'react-relay';
import { relayEnvironment } from 'src/common/services/RelayService'
import {Container, Row, Col} from 'reactstrap';
import { breakpoints, colors, fontFamily } from 'src/variables';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { getUserData } from 'src/features/user/selectors/userSelectors';

import VisitQuestionnaireAnswers from "src/features/emr/components/VisitQuestionnaireAnswers";
import VisitPhotosContainer from 'src/features/emr/containers/VisitPhotosContainer';
import ChatMessageContainer from 'src/features/emr/containers/ChatMessageContainer';

import MedicalNoteContainer from 'src/features/emr/containers/MedicalNoteContainer';
import PatientInfo from 'src/features/emr/components/PatientInfo'
import PatientPrescriptionsContainer from 'src/features/emr/containers/PatientPrescriptionsContainer';
import AddPatientPrescription from 'src/features/emr/components/AddPatientPrescription';
import UpdateVisitMedicalProvider from 'src/features/emr/components/UpdateVisitMedicalProviderModal';

const Wrapper = styled.div`
  margin: 0 auto;
  font-family: ${fontFamily.baseFont};
  font-size: 14px;
`;

const BodyWrapper = styled.div`
  border: 1px solid transparent;
  border-radius: 0.25rem;
  margin: 0 0 50px 0;
  display: flex;
  ${breakpoints.md} {
    margin-top: 60px;
    flex-direction: column;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-grow: 3;
  flex-direction: column;
  ${breakpoints.md} {
    padding-left: initial;
  }
`;

const ChatMessageWrapper = styled.div`
  margin: 0 auto;
  padding: 20px;
  border: 1px solid ${colors.light};
  border-radius: 4px;
`;

const customLightboxStyles = {
  content: {
    position: 'absolute',
    top: '90px',
    left: '40px',
    right: '40px',
    bottom: '40px',
  }
};


class PatientDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPhotoModalView: false,
      images: null,
      imageIndex: 0
    };
  }

  togglePhotoModalView = (images, index) => {
    this.setState(prevState => ({
      displayPhotoModalView: !prevState.displayPhotoModalView,
      images: images,
      imageIndex: index
    }));
  }

  render() {
    const { patientId, visitId } = this.props.match.params
    const { displayPhotoModalView, images, imageIndex } = this.state
    const { user } = this.props
    
    return (
      <Wrapper>
        <BodyWrapper>
          <ContentWrapper>
            <Container>
              <QueryRenderer
                environment={relayEnvironment}
                query={graphql`
                    query PatientDetailContainerQuery($patientId: ID!) {
                      patient(id:$patientId) {
                        uuid
                        ...ChatMessageContainer_patient
                        patientVisits {
                          edges {
                            node {
                              id
                              ...VisitQuestionnaireAnswers_visit
                              ...VisitPhotosContainer_visit
                            }
                          }
                        }
                        ...MedicalNoteContainer_patient
                        ...PatientInfo_patient
                        ...PatientPrescriptionsContainer_patient
                        ...AddPatientPrescription_patient
                      }
                    }
                  `}
                variables={{
                  patientId: patientId
                }}
                render={({ error, props }) => {
                  if (error) {
                    return <div>Error!</div>;
                  }
                  if (!props) {
                    return <div>Loading...</div>;
                  }

                  return (
                    <Row style={{ wordWrap: "break-word" }}>
                      <Col xs={2}>
                        <PatientInfo patient={props.patient} />
                        <hr/>
                        <PatientPrescriptionsContainer patient={props.patient} />
                        <AddPatientPrescription patient={props.patient}/>
                        <hr />
                      </Col>
                      <Col xs={6}>
                        {props.patient.patientVisits.edges.map(edge =>
                          <div>
                            <VisitQuestionnaireAnswers
                              user={user}
                              key={edge.node.id}
                              visit={edge.node}
                              display={visitId === edge.node.id}
                            />
                            <VisitPhotosContainer
                              togglePhotoModalView={this.togglePhotoModalView}
                              key={`${edge.node.id}_photos`}
                              visit={edge.node}
                              display={visitId === edge.node.id}
                            />
                          </div>
                        )}
                        {displayPhotoModalView && (
                          <Lightbox
                            mainSrc={images[imageIndex].node.photoFile}
                            nextSrc={images[(imageIndex + 1) % images.length].node.photoFile}
                            prevSrc={images[(imageIndex + images.length - 1) % images.length].node.photoFile}
                            imageTitle={images[imageIndex].node.photoType}
                            reactModalStyle={customLightboxStyles}
                            onCloseRequest={() => this.togglePhotoModalView()}
                            onMovePrevRequest={() =>
                              this.setState({
                                imageIndex: (imageIndex + images.length - 1) % images.length,
                              })
                            }
                            onMoveNextRequest={() =>
                              this.setState({
                                imageIndex: (imageIndex + 1) % images.length,
                              })
                            }
                          />
                        )}
                      </Col>
                      <Col xs={4}>
                        <ChatMessageWrapper>
                          <ChatMessageContainer isPatientView={false}
                                                sender={user}
                                                receiver={props.patient}
                                                patient={props.patient}/>
                        </ChatMessageWrapper>
                        <br/>
                        <MedicalNoteContainer patient={props.patient} />
                      </Col>
                    </Row>
                  )
                }}
              />
            </Container>
          </ContentWrapper>
        </BodyWrapper>
      </Wrapper>
    );
  }
}


export const PatientDetailContainer = connect(
  state => ({
    user: getUserData(state),
  })
)(PatientDetail);

export default PatientDetailContainer;