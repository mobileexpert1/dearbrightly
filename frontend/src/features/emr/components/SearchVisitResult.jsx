import React from 'react';
import { history } from 'src/history'
import moment from 'moment'
import { graphql, createFragmentContainer } from 'react-relay'

class SearchVisitResult extends React.Component {

    render() {
        const { id, patient, createdDatetime, visitId } = this.props.visit;
        const patientFullName = patient ? patient.fullName : '';

        return (
          <div key={id} onClick={() => history.push("/emr/patients/" + patient.id + "/visits/" + id)}>
            [{visitId}] {patientFullName} on {moment(createdDatetime).format("MM/DD/YYYY hh:mm A")}
          </div>
        )
    }
}

export default createFragmentContainer(
  SearchVisitResult,
  {
      visit: graphql`
            fragment SearchVisitResult_visit on VisitType {
                id,
                visitId,
                status,
                service,
                createdDatetime,
                patient {
                  id
                  fullName,
                }
            }
        `
  }
)

