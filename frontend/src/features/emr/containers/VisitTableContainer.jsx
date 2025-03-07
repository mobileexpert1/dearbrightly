import React from 'react';
import { breakpoints, fontFamily } from 'src/variables';
import styled from 'react-emotion';
import { graphql, QueryRenderer } from 'react-relay';
import { relayEnvironment } from 'src/common/services/RelayService'
import { Container, Row, Col } from 'reactstrap';

import VisitFilterForm from 'src/features/emr/components/VisitFilterForm'
import VisitTable from 'src/features/emr/components/VisitTable'
import { NUM_PER_PAGE } from 'src/features/emr/components/VisitTable'
import listOfStates from 'src/common/helpers/listOfStates'


const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  font-family: ${fontFamily.baseFont};
`;

const BodyWrapper = styled.div`
  margin: 10px 0 50px 0;
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

// Skip the "Select State" value.
const states = listOfStates().slice(1)

export class VisitTableContainer extends React.Component {

    constructor(props) {
        super(props)
        const urlParams = new URLSearchParams(window.location.hash.slice(1))
        this.state = {
            status: urlParams.get('status') || '',
            service: urlParams.get('service') || '',
            state: urlParams.get('state') || '',
        }
    }

    // componentDidMount() {
    //     const {
    //         user,
    //         visit,
    //         isQuestionnaireFetching,
    //         fetchMedicalSurveyQuestionsRequest,
    //         questions,
    //     } = this.props;
    //
    //
    //     if (questions) {
    //         this.setState({
    //             answers: this.getInitialAnswersState(questions),
    //             initialState: this.getInitialAnswersState(questions),
    //         });
    //     }
    // }

    updateFilterVariables = (key, value) => {
        this.setState({
            [key]: value
        },
            () => {
                window.location.hash = `status=${this.state.status}&service=${this.state.service}&state=${this.state.state}`
            })
    }

    render() {
        //const { patientId, visitId } = this.props.match.params
        const { user } = this.props
        const urlParams = new URLSearchParams(window.location.hash.slice(1))

        let selectedStatus = []
        if (urlParams.get('status')) {
            selectedStatus = urlParams.get('status').split(',').map(value => {
                return {
                    label: value,
                    value: value
                }
            })
        }

        let selectedService = []
        if (urlParams.get('service')) {
            selectedService = urlParams.get('service').split(',').map(value => {
                return {
                    label: value,
                    value: value
                }
            })
        }

        let selectedState = []
        if (urlParams.get('state')) {
            selectedState = urlParams.get('state').split(',').map(value => {
                return states.find(obj => obj.value === value)
            })
        }

        return (
            <Wrapper>
                <BodyWrapper>
                    <ContentWrapper>
                        <Container>
                            <QueryRenderer
                                environment={relayEnvironment}
                                query={graphql`
                                  query VisitTableContainerQuery($count: Int!, $cursor: String, $status: String, $service: String, $state: String) {
                                      allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) {
                                          edgeCount
                                      }
                                      ...VisitTable_rootQuery @arguments(count: $count, cursor: $cursor, status: $status, service: $service, state: $state)
                                      ...VisitFilterForm_rootQuery
                                  }
                                `}
                                variables={{
                                    count: NUM_PER_PAGE,
                                    cursor: '',
                                    status: this.state.status,
                                    service: this.state.service,
                                    state: this.state.state
                                }}
                                render={({ error, props }) => {
                                    if (error) {
                                        return <div>Error!</div>;
                                    }
                                    if (!props) {
                                        return (
                                            <Row>
                                                <Col xs="3">
                                                    <VisitFilterForm
                                                        onSubmit={this.updateFilterVariables}
                                                        rootQuery={props}
                                                        selectedState={selectedState}
                                                        selectedStatus={selectedStatus}
                                                        selectedService={selectedService}
                                                        states={states}
                                                    />
                                                </Col>
                                                <Col><VisitTable user={user} rootQuery={props} /></Col>
                                            </Row>
                                        )
                                    }

                                    return (
                                        <Row>
                                            <Col xs="3">
                                                <VisitFilterForm
                                                    onFilterChange={this.updateFilterVariables}
                                                    rootQuery={props}
                                                    selectedState={selectedState}
                                                    selectedStatus={selectedStatus}
                                                    selectedService={selectedService}
                                                    states={states}
                                                />
                                            </Col>
                                            <Col><VisitTable user={user} rootQuery={props} /></Col>
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