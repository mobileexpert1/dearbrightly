import { graphqlRequestAuthFail } from 'src/common/actions/httpRequestActions';

import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

function fetchQuery(
  operation,
  variables,
) {
  return fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw response
  }).catch(error => {
    if (error.status === 401) {
      graphqlRequestAuthFail();
    }
    throw error
  });
}

export const relayEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});