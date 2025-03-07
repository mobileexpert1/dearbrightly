import {graphql, commitMutation} from 'react-relay';
import { relayEnvironment } from 'src/common/services/RelayService'

// We start by defining our mutation from above using `graphql`
const mutation = graphql`
mutation CreateMedicalVisitMutation($input: CreateMedicalVisitInput!) {
    createVisit (input: $input) {
        visit {
            id
        }
    }
}
`;

export default (userUuid) => {
  const variables = {
    input: {
      userUuid
    },
  }

  commitMutation(
    relayEnvironment,
    {
      mutation,
      variables,
    },
  )
}