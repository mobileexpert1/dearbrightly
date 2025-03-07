import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { relayEnvironment } from 'src/common/services/RelayService'
import styled from 'react-emotion';
import SearchVisitResult from 'src/features/emr/components/SearchVisitResult';
import SearchPatientResult from 'src/features/emr/components/SearchPatientResult';
import {DebounceInput} from 'react-debounce-input';

const Container = styled.div`
  width: 100%;
`;

const SearchButton = styled.button`
  font-size: 20px;
  border: none;
  padding: 10px;
  background: none;
  float: right;
`;

const SearchModal = styled('div')`
  width: 100%;
  max-width: 375px;
  height: 100%;
  background-color: #faf8f7;
  position: fixed;
  overflow-y: auto;
  right: 0;
  -webkit-transform: translate3d(100vw, 0, 0);
  transform: translate3d(100vw, 0, 0);
  transition-property: -webkit-transform;
  transition-property: transform;
  transition-property: transform, -webkit-transform;
  transition-duration: 600ms;
  transition-timing-function: cubic-bezier(0.33, 0, 0, 1);
  z-index: 9999;
  top: 0;
  box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.08);
  @media (max-width: 768px) {
    max-width: 100%;
  }

  &.show {
    -webkit-transform: translate3d(0vw, 0, 0);
    transform: translate3d(0vw, 0, 0);
    transition-duration: 600ms;
  }
  
  .loader .ant-spin-dot i {
    background-color: #040201;
  }
`;

const SearchInputContainer = styled.div`
  margin-top: 30px;
  padding: 20px;
`;

const SearchResults = styled.div`
  padding: 10px 20px 0px 20px; 
`;

const SearchResultContainer = styled.div`
  font-size: 14px;
  &:hover {
    background-color: #FFF;
    text-color: #FFF;
    cursor: pointer;
  }
`;

const SearchResultsHeader = styled.p`
   font-size: 22px;
   margin: 0;
   padding-bottom: 10px;
`;

export class GlobalSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandVisits: false,
      expandPatients: false,
      searchField: '',
    };
  }


  onSearchChange = (e) => {
    if (e.target.value) {
      this.setState({
        searchField: e.target.value
      })
    }
  }

  render() {
    return (
      <Container>
        <SearchModal className={this.props.drawerOpen ? 'show' : ''}>
          <SearchButton onClick={this.props.toggleDrawer}><i className="fa fa-times" aria-hidden="true"></i></SearchButton>
          <SearchInputContainer>
            <DebounceInput
              margin={"10px"}
              type="text"
              placeholder="Search by visits and patients"
              value={this.state.searchField}
              minLength={2}
              debounceTimeout={300}
              onChange={this.onSearchChange} />
          </SearchInputContainer>

          <QueryRenderer
            environment={relayEnvironment}
            query={graphql`
              query GlobalSearchPatientQuery ($search: String) {
                searchPatients (search: $search) {
                  edges {
                    node {
                      id,
                      ...SearchPatientResult_patient
                    }
                  }
                }
              }
            `}
            variables={{ search: this.state.searchField }}
            render={({ error, props }) => {
              if (error) {
                return <div>Error!</div>;
              }
              return (
                <SearchResults>
                  <SearchResultsHeader>Patients</SearchResultsHeader>
                  { props && props.searchPatients && (props.searchPatients.edges.map(edge =>
                    <SearchResultContainer>
                      <SearchPatientResult key={edge.node.id} patient={edge.node} />
                    </SearchResultContainer>
                  ))}
                  { !props || props.searchPatients.edges.length == 0 && (
                    <div><small>Unable to find patients matching search criteria</small></div>
                  )}
                  <hr/>
                </SearchResults>
              )
            }}
          />

          <QueryRenderer
            environment={relayEnvironment}
            query={graphql`
              query GlobalSearchVisitQuery ($search: String, ) {
                searchVisits (search: $search)  {
                  edges {
                    node {
                      id,
                      ...SearchVisitResult_visit
                    }
                  }
                }
              }
            `}
            variables={{ search: this.state.searchField }}
            render={({ error, props }) => {
              if (error) {
                return <div>Error!</div>;
              }
              return (
                <SearchResults>
                  <SearchResultsHeader>Visits</SearchResultsHeader>
                  { props && props.searchVisits && (props.searchVisits.edges.map(edge =>
                    <SearchResultContainer>
                      <SearchVisitResult key={edge.node.id} visit={edge.node} />
                    </SearchResultContainer>
                  ))}
                  { !props || props.searchVisits.edges.length == 0 && (
                    <div><small>Unable to find visits matching search criteria</small></div>
                  )}
                </SearchResults>
              )
            }}
          />

        </SearchModal>

      </Container>

    )
  }
}
