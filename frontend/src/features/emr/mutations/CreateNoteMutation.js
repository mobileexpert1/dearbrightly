import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
mutation CreateNoteMutation($input: CreateNoteMutationInput!) {
    createNote(input: $input) {
        note {
            id
            body
            patient {
                ...MedicalNoteContainer_patient
            }
        }
  	}
}`



export default (patientUuid, body, onSuccess, onError) => {
    const variables = {
        input: {
            patientUuid,
            body,
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