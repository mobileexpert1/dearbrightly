import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
    mutation UpdatePhotoMutation($input:UpdatePhotoMutationInput!){
        updatePhoto(input:$input) {
            photo {
              photoData
              photoFile
              photoType
              photoRejected
            }
        }
    }
`

export default (id, photoRejected, onSuccess, onError) => {
    const variables = {
        input: {
            id,
            photoRejected,
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