import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
    mutation UpdateFlagMutation($input:UpdateFlagMutationInput!){
        updateFlag(input:$input) {
            flag {
                id,
                body,
                createdDatetime
            }
        }
    }
`

export default (id, onSuccess, onError) => {
    const variables = {
        input: {
            id,
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