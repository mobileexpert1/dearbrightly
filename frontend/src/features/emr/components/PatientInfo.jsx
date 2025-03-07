import React from 'react';
import moment from 'moment';

import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'react-emotion';
import UpdateUserDOBMutation from 'src/features/emr/mutations/UpdateUserDOBMutation';

import { colors, fontFamily, fontWeight } from 'src/variables';
import AddPatientDob from './AddPatientDob';

const GENDER_DISPLAY = {
  MALE: 'Male',
  FEMALE: 'Female',
  NONE_SPECIFIED: 'Gender Unspecified',
};

const Container = styled.div`
  font-family: ${fontFamily.baseFont};
  font-size: 12px;
`;

const PatientNameText = styled.p`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-size: 13px;
  line-height: normal;
`;

const PatientInfoText = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: 12px;
  line-height: normal;
`;


class PatientInfo extends React.Component {
  state = {
    dob: '',
    error: null,
    dobValid: false
  };

  _handleDobFieldUpdate(date) {
    this.setState({
      dob: date,
    });
  }

  _updateUserDOB = () => {
    const { dob } = this.state;
    const { userId } = this.props.patient;

    const id = userId;

    if (!dob) {
      return;
    }

    UpdateUserDOBMutation(
      id,
      dob,
      resp => {

        if (this.props.onSuccess) {
          this.props.onSuccess();
        }
      },
      err => {
        this.setState({ error: err });
      },
    );
  };

  // US Phone Number formatter: https://stackoverflow.com/a/8358141
  formatPhoneNumber(phoneNumberString) {
    const cleaned = `${phoneNumberString}`.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return null;
  }

  onDobChange = (value) => {
    if (value) {
       const isValid = /^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/.test(value)
      this.setState({
        dobValid: isValid,
        dob: value
      })
    }
  }

  componentDidMount() {
    const { dob } = this.props.patient;
    this.onDobChange(dob)
  }

  render() {
    const { userId, fullName, gender, dob, shippingDetails, email } = this.props.patient;
    

    const shippingAddressText =
      shippingDetails && shippingDetails.addressLine1
        ? shippingDetails.addressLine2
        ? `${shippingDetails.addressLine1}, \n ${shippingDetails.addressLine2}`
        : shippingDetails.addressLine1
        : '';
    const shippingAddressCityStatePostalCode =
      shippingDetails && shippingDetails.city && shippingDetails.state && shippingDetails.postalCode
        ? `${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.postalCode}`
        : '';
    const shippingAddressPhone =
      shippingDetails && shippingDetails.phone ? this.formatPhoneNumber(shippingDetails.phone) : '';

    const formattedDob = dob ? moment(dob).format('MM/DD/YYYY') : null;
    const age = formattedDob ? moment().diff(formattedDob, 'years') : null;

    return (
      <Container>
        <PatientInfoText>
          <strong>
            {fullName} [{userId}]
          </strong>
          <br />
          <br />
          {GENDER_DISPLAY[gender]}
          <br />
          {dob && (<div>
            <br />
            {age && (`${formattedDob} - ${age} years old`)}
            <br />
          </div>)}
          <AddPatientDob
            defaultValue={dob}
            onChange={this.onDobChange}
            active={this.state.dobValid}
            onOkPressed={this._updateUserDOB}
          />
          <br />
          {shippingAddressText}
          <br />
          {shippingAddressCityStatePostalCode}
          <br />
          <br />
          {email}
          <br />
          {shippingAddressPhone}
        </PatientInfoText>
      </Container>
    );
  }
}

export default createFragmentContainer(PatientInfo, {
  patient: graphql`
    fragment PatientInfo_patient on UserType {
      id
      userId
      fullName
      gender
      dob
      shippingDetails {
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        phone
      }
      email
    }
  `,
});
