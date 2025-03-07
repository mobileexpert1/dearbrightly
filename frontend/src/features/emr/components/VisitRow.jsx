import React from 'react';
import { history } from 'src/history'
import moment from 'moment'
import { capitalizeEnum } from 'src/common/helpers/formatText';
import { reactStrapColorForEMRFlagCategory } from 'src/common/helpers/colorForEMRFlagCategory';
import { graphql, createFragmentContainer } from 'react-relay'
import {Button} from "reactstrap";
import styled from "react-emotion";

const FlagIconContainer = styled.div`
    height: 30px;
    width: 30px;
    font-size: 14px;
    border-radius: 50%;
    background-color: ${props => props.color};
    padding: 5px;
`;

class VisitRow extends React.Component {

  render() {
    const { id, status, patient, createdDatetime, medicalProvider, visitId, allFlags } = this.props.visit
    const patientFullName = patient && patient.fullName ? patient.fullName : 'Unknown'
    const providerFullName = medicalProvider && medicalProvider.fullName ? medicalProvider.fullName : 'Unknown'
    const patientShippingDetails = patient && patient.shippingDetails ? patient.shippingDetails.state : "N/A"
    const patientDetailURI = `/emr/patients/${patient.id}/visits/${id}`
    const patientInfo = `[${patient.userId}] ${patientFullName}`
    const visitInfo = `${capitalizeEnum(status)}`
    const isFlagged = allFlags && allFlags.edges && allFlags.edges.length > 0
    const category = isFlagged ? allFlags.edges[0].node.category : ''
    const color = reactStrapColorForEMRFlagCategory(category)


    return (
      <tr key={id} onClick={() =>
        history.push({
          pathname: patientDetailURI
        })}>
        <td>
          {visitId}
        </td>
        <td>
          {moment(createdDatetime).format("MM/DD/YYYY hh:mm A")}
        </td>
        <td>
          {patientInfo}
        </td>
        <td>
          {providerFullName}
        </td>
        <td>
          {visitInfo}
        </td>
        <td>
          {patientShippingDetails}
        </td>
        { isFlagged && (
          <td>
            <FlagIconContainer>
              <Button disabled={true} color={color}>
                <i className="fa fa-flag" aria-hidden="true"></i>
              </Button>
            </FlagIconContainer>
          </td>
        )}
        { !isFlagged && (<td/>) }
      </tr>
    )
  }
}

export default createFragmentContainer(
  VisitRow,
  {
    visit: graphql`
            fragment VisitRow_visit on VisitType {
                id,
                visitId,
                status,
                service,
                createdDatetime,
                patient {
                    id,
                    userId,
                    fullName,
                    shippingDetails {
                        state
                    }
                },
                medicalProvider {
                    fullName
                }
                allFlags {
                  edges {
                    node {
                      category
                    }
                  }
                }            
            }
        `
  }
)

