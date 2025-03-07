import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
    mutation CreateFlagMutation($input:CreateFlagMutationInput!){
        createFlag(input:$input) {
            flag {
                id,
                body,
                createdDatetime
            }
        }
    }
`

export default (visitUuid, body, onSuccess, onError) => {
    const variables = {
        input: {
            visitUuid,
            body,
            clientMutationId: ""
        },
    }

    commitMutation(
        relayEnvironment,
        {
            mutation,
            variables,
            // configs: [{
            //     type: "RANGE_ADD",
            //     parentID: "client:root",
            //     connectionInfo: [{
            //         key: "FlagListModalQuery_allFlags",
            //         rangeBehavior: "append"
            //     }]
            // }],
            onCompleted: (resp, err) => {
                if (err) return onError(err)
                return onSuccess(resp)
            },
            onError: onError,
        },
    )
}