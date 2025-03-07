import React from 'react';
import {graphql, createFragmentContainer} from 'react-relay'
import { Button } from 'reactstrap';
import styled from "react-emotion";
import InitiatePrescriptionMutation from 'src/features/emr/mutations/InitiatePrescriptionMutation'


const ButtonContainer = styled('div')`
  padding-top: 15px;
`


class AddPatientPrescription extends React.Component {

  _initiatePrescription = () => {
    const { uuid } = this.props.patient

    InitiatePrescriptionMutation(
      uuid,
      (response) => {
        window.open(response.initiatePrescription.prescriptionUrl)
      },
      (err) => {
        this.setState({ error: err })
      }
    );
  }

  // Remove disable when Surescripts approval goes through and we can push data to DoseSpot
  render() {
    return (
      <ButtonContainer>
        <Button
          disabled={false}
          color="outline-primary"
          size="sm"
          onClick={() => {
            this._initiatePrescription();
          }}
        >
          Add Prescription
        </Button>
      </ButtonContainer>
    )
  }

}

export default createFragmentContainer(
    AddPatientPrescription,
    {
        patient: graphql`
            fragment AddPatientPrescription_patient on UserType {
                uuid
            }
        `
    }
)