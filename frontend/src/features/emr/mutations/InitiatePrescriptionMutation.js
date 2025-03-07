import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
mutation InitiatePrescriptionMutation($input: InitiatePrescriptionMutationInput!) {
    initiatePrescription(input: $input) {
        prescriptionUrl
  	}
}`



export default (patientUuid, onSuccess, onError) => {
    const variables = {
        input: {
            patientUuid,
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