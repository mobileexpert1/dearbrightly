import React from 'react';

import { graphql, createFragmentContainer } from 'react-relay'
import PatientPrescription from '../components/PatientPrescription';
import styled from "react-emotion";

const MedicinesText = styled.p`
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 800;
`;

class PatientPrescriptionsContainer extends React.Component {

  render() {
    const { allPrescriptions } = this.props.patient;

    return (
      <div>
        <MedicinesText>Medicines</MedicinesText>
        {allPrescriptions.edges.map(edge =>
          <PatientPrescription key={edge.node.id} prescription={edge.node}/>
        )}
      </div>
    )
  }
}

export default createFragmentContainer(
  PatientPrescriptionsContainer,
  {
    patient: graphql`
            fragment PatientPrescriptionsContainer_patient on UserType {
                allPrescriptions {
                    edges {
                        node {
                          id
                           ...PatientPrescription_prescription
                        }
                    }
                }
            }
        `
  }
)