import React from 'react';
import { history } from 'src/history'
import { graphql, createFragmentContainer } from 'react-relay'


class SearchPatientResult extends React.Component {

    render() {
        const { id, email, firstName, lastName, userId } = this.props.patient;

        return (
            <div key={id} onClick={() => history.push("/emr/patients/" + id)}>
                [{userId}] {firstName} {lastName}, {email}
            </div>
        )
    }
}

export default createFragmentContainer(
    SearchPatientResult,
    {
        patient: graphql`
            fragment SearchPatientResult_patient on UserType {
                id,
                userId,
                firstName,
                lastName,
                email,
            }
        `
    }
)

