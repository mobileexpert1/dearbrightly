import React from 'react';
import { graphql, createPaginationContainer } from 'react-relay';
import VisitRow from 'src/features/emr/components/VisitRow';
import { Table } from 'reactstrap';

export const NUM_PER_PAGE = 10


class VisitTable extends React.Component {

  callback = (error) => {
    if (error !== undefined) {
      console.log(error);
    }
  }

  _loadNextPage = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    this.props.relay.loadMore(NUM_PER_PAGE, this.callback)
  }

  render() {
    const rootQuery = this.props.rootQuery || { allVisits: { edges: [], pageInfo: { hasNextPage: false } } }
    const { allVisits } = rootQuery
    const { user } = this.props

    return (
      <div>
        <Table hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Provider</th>
              <th>Status</th>
              <th>State</th>
              <th></th>
            </tr>
          </thead>

          <tbody style={{ cursor: "pointer" }}>
            {allVisits.edges.map(edge => {
              if (edge.node) {
                return <VisitRow user={user} key={edge.node.id} visit={edge.node} />;
              }
            }

            )}
            <tr>
              <td
                colSpan="5"
                className="text-center"
                onClick={() => allVisits.pageInfo.hasNextPage ? this._loadNextPage() : null}
                style={!allVisits.pageInfo.hasNextPage ? { backgroundColor: 'white', cursor: 'default' } : null}
              >
                {allVisits.pageInfo.hasNextPage ? "Load " + NUM_PER_PAGE + " more from " + allVisits.totalCount + " visits." : "All " + allVisits.totalCount + " visits loaded."}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default createPaginationContainer(
  VisitTable,
  {
    rootQuery: graphql`
      fragment VisitTable_rootQuery on Query
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
        cursor: {type: "String"}
        status: {type: "String"}
        service: {type: "String"}
        state: {type: "String"}
      ) {
        allVisits(first: $count, after: $cursor, status: $status, service: $service, state: $state) @connection(key: "VisitTable_allVisits") {
          totalCount
          edgeCount
          edges {
            node {
              id
              ...VisitRow_visit
            }
          }
        }
      }
    `
  },
  {
    direction: "forward",
    query: graphql`
    # Pagination query to be fetched upon calling 'loadMore'.
    # Notice that we re-use our fragment, and the shape of this query matches our fragment spec.
    query VisitTableQuery(
      $count: Int!
      $cursor: String
      $status: String
      $service: String
      $state: String
    ) {
      ...VisitTable_rootQuery @arguments(count: $count, cursor: $cursor, status: $status, service: $service, state: $state)
    }
  `,
    getVariables(props, { count, cursor, status, service, state }, fragmentVariables) {
      return {
        count,
        cursor,
        status: fragmentVariables.status,
        service: fragmentVariables.service,
        state: fragmentVariables.state
      };
    }
  }
)