import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
    mutation UpdateMedicalVisitMutation($input:UpdateMedicalVisitMutationInput!){
        updateVisit(input:$input) {
        visit {
            id
            status
            medicalProvider {
                fullName
            }
        }
      }
    }
`

export default (id, status, medicalProviderId, onSuccess, onError) => {
    const variables = {
        input: {
            id,
            status,
            medicalProviderId,
            clientMutationId: ""
        },
    }

    commitMutation(
        relayEnvironment,
        {
            mutation,
            variables,
            onCompleted: (resp, err) => {
                if (err) return onError(err)
                return onSuccess(resp)
            },
            onError: onError,
        },
    )
}