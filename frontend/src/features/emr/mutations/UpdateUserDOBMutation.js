import { commitMutation, graphql } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'


const mutation = graphql`
  mutation UpdateUserDOBMutation($input:UpdateUserDOBMutationInput!) {
    updateUserDob(input: $input) {
        user {
          id
          userId
          fullName
          gender
          dob
          shippingDetails {
            addressLine1
            addressLine2
            city
            state
            postalCode
            country
            phone
          }
          email
        }
  	}
}`


export default (id, dob, onSuccess, onError) => {
    const variables = {
        input: {
            id,
            dob,
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