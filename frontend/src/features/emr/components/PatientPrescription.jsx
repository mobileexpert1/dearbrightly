import React from 'react';
import moment from 'moment'

import { graphql, createFragmentContainer } from 'react-relay'
import styled from "react-emotion";

const PrescriptionText = styled.p`
  margin: 5px 0 0 0;
  font-size: 12px;
`;

const PrescriptionDescriptionText = styled.p`
  margin-bottom: 0;
  font-size: 9px;
`;

class PatientPrescription extends React.Component {

  render() {
    const {prescription, prescribedDatetime} = this.props.prescription

    return (
      <div>
        <PrescriptionText>- {prescription.displayName}</PrescriptionText>
        <PrescriptionDescriptionText>Prescribed on: {moment(prescribedDatetime).format("MM/DD/YYYY @ hh:mm A")}</PrescriptionDescriptionText>
        <PrescriptionDescriptionText>{prescription.daysSupply} days - {prescription.quantity} {prescription.dispenseUnit} - {prescription.refills} refills</PrescriptionDescriptionText>
      </div>
    )
  }
}

export default createFragmentContainer(
  PatientPrescription,
  {
    prescription: graphql`
            fragment PatientPrescription_prescription on PatientPrescriptionType {
                prescription {
                    displayName
                    daysSupply
                    quantity
                    dispenseUnit
                    refills
                }
                prescribedDatetime
            }
        `
  }
)

