import { commitMutation, graphql, ConnectionHandler } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
    mutation CreateSnippetMutation($input:CreateSnippetMutationInput!){
        createSnippet(input:$input) {
            snippet {
                id
                ...SnippetEntry_snippet
            }
        }
    }
`



export default (name, body, onSuccess, onError) => {
    const variables = {
        input: {
            name,
            body,
            clientMutationId: ""
        },
    }

    commitMutation(
        relayEnvironment,
        {
            mutation,
            variables,
            configs: [{
                type: "RANGE_ADD",
                parentID: "client:root",
                connectionInfo: [{
                    key: "SnippetListModalQuery_allSnippets",
                    rangeBehavior: "append"
                }]
            }],
            onCompleted: (resp, err) => {
                if (err) return onError(err)
                return onSuccess(resp)
            },
            onError: onError,
        },
    )
}