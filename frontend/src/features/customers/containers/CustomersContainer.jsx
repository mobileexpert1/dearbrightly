import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';

import { redirectToUrl } from 'src/common/actions/navigationActions';
import { Pagination } from 'src/common/components/Pagination';
import { WithLoader } from 'src/common/components/WithLoader';
import { ConfirmationModal } from 'src/common/components/ConfirmationModal';

import {
    getCustomers,
    getCustomersErrorMessage,
    isFetchingCustomers,
    isDataFetchedSuccessfully,
    getCustomersPagination,
    getSearchFilter,
    getRxStatusFilter,
} from '../selectors/customersSelectors';
import {
    fetchCustomersRequest,
    fetchCustomersExportRequest,
    removeCustomersRequest,
    updateCustomerSearchFilter,
    updateRxStatusFilter,
    updateCustomerPagination,
} from '../actions/customersActions';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { CustomersTable } from '../components/CustomersTable';
import { CustomersTopBar } from '../components/CustomersTopBar';

const Container = styled.div`
    font-size: 16px;

    th {
        font-size: 16px;
        vertical-align: middle !important;
    }

    td {
        vertical-align: middle !important;
        color: #333;
        font-size: 14px;
    }

    ul {
        padding: 0;
        margin: 0;
    }
`;

const perPageOptions = [10, 20, 30, 40];

const firstPage = 1;

// TODO - Request status options from backend and store in a reducer
const rxStatusOptions = [
  {name: 'All', value: 'All'},
  {name: 'None', value: 'None'},
  {name: 'Subscription', value: 'Subscription'},
  {name: 'Active', value: 'Active'},
  {name: 'Expired', value: 'Expired'},
  {name: 'Pending Provider Review', value: 'Pending Provider Review'},
  {name: 'Pending User Questionnaire', value: 'Pending User Questionnaire'},
  {name: 'Pending User Photos', value: 'Pending User Photos'},
  {name: 'Pending User Input', value: 'Pending User Input'},
];

class CustomersSection extends React.Component {
    state = {
      selectedCustomersIds: [],
      activeModal: '',
      filterChanged: false,
    };

    constructor(props) {
      super(props);

      this.requestCustomersRefresh = this.requestCustomersRefresh.bind(this)
    }

    componentDidMount() {
      this.requestCustomersRefresh(false);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.search !== this.props.search || prevProps.rxStatus !== this.props.rxStatus || prevProps.pagination.size !== this.props.pagination.size) {
        this.requestCustomersRefresh(true);
      } else if (prevProps.pagination.current !== this.props.pagination.current) {
        this.requestCustomersRefresh(false);
      }
    }

    // dispatches all requests from the component, first param is isAdmin (always true in this component)
    // second param is so the pagination component can request other pages; triggers instant request
    requestCustomersRefresh(skipPagination) {

      const paginationParams = {
        page: this.props.pagination.current,
        size: this.props.pagination.size,
      };

      if (skipPagination) {
        paginationParams.page = 1;
      }

      const searchData = this.props.search.toLowerCase();
      const statusData = (this.props.rxStatus !== 'All' ? encodeURI(this.props.rxStatus) : '');

      this.props.fetchCustomersRequest(true, paginationParams, searchData, statusData);
    }

    onUpdatePagination = (_, paginationParams) => {
      const pagination = {
        current: paginationParams.page,
        size: this.props.pagination.size,
      };

      this.props.updateCustomerPagination(pagination);
    }

    handleValueChange = (value, field) => {
        this.setState({
            [field]: value,
        });
    };

    handleSearchChange = async (value) => {
      await this.props.updateCustomerSearchFilter(value);
      await this.setState({
        filterChanged: true,
      });
    }

    handleRxStatusChange = async ({ target }) => {
      await this.props.updateRxStatusFilter(target.value);
      await this.setState({
        filterChanged: true,
      });
    }

    handleResultsPerPageChange = async ({ target }) => {
      const pagination = {
        current: this.props.pagination.current,
        size: parseInt(target.value),
      };

      this.props.updateCustomerPagination(pagination);
    }

    isAnyCustomerSelected = () => !!this.state.selectedCustomersIds.length;

    getSelectedCustomers = () =>
      this.props.customers.filter(customer =>
          this.state.selectedCustomersIds.includes(customer.id),
      );

    // deprecated while we don't have individual exporting
    // exportSelectedCustomers = () => {
    //     if (!this.isAnyCustomerSelected()) {
    //         return;
    //     }

    //     this.exportCustomers(this.getSelectedCustomers());
    // };

    requestExportCustomers = (customers = this.props.customers) => {
      const searchData = this.props.search.toLowerCase();
      const statusData = (this.props.rxStatus !== 'All' ? encodeURI(this.props.rxStatus) : '');

      this.props.fetchCustomersExportRequest(true, searchData, statusData);
    }

    handleCustomerSelect = id => {
        const isSelected = this.state.selectedCustomersIds.includes(id);

        this.setState(state => ({
            selectedCustomersIds: isSelected
                ? state.selectedCustomersIds.filter(customerId => customerId != id)
                : [...state.selectedCustomersIds, id],
        }));
    };

    handleAllCustomersSelect = () =>
        this.setState(state => ({
            selectedCustomersIds:
                state.selectedCustomersIds.length == this.props.customers.length
                    ? []
                    : this.props.customers.map(({ id }) => id),
        }));

    handleCustomerClick = ({ id }) => this.props.redirectToUrl(`customers/${id}`);

    handleRemoveClick = () => {
        if (!this.isAnyCustomerSelected()) {
            return;
        }

        this.showRemoveCustomerModal();
    };

    handleRemoveCustomersRequest = () => {
        if (!this.isAnyCustomerSelected()) {
            return;
        }

        this.props.removeCustomersRequest(this.state.selectedCustomersIds);
    };

    changeModal = activeModal => this.setState({ activeModal });

    showAddCustomerModal = () => this.changeModal('add');

    showRemoveCustomerModal = () => this.changeModal('remove');

    hideModal = () => this.changeModal('');

    render() {
        const { filterChanged, selectedCustomersIds, activeModal } = this.state;
        const {
            pagination,
            isFetching,
            fetchedSuccessfully,
            errorMessage,
            customers,
            search,
            rxStatus
        } = this.props;

        return (
            <WithLoader
              hasData={customers.length || filterChanged}
              isFetching={isFetching}
              fetchingMessage="Fetching customers list.."
              fetchedSuccessfully={fetchedSuccessfully}
              noDataErrorMessage="No customers found"
              errorMessage={errorMessage}
            >
              <Container>
                <CustomersTopBar
                  onAddClick={this.showAddCustomerModal}
                  onRemoveClick={this.handleRemoveClick}
                  onExportAllClick={() => this.requestExportCustomers()}
                  onExportSelectedClick={this.exportSelectedCustomers}
                  onSearchValueChange={e => this.handleSearchChange(e.target.value)}
                  onPagesValueChange={this.handleResultsPerPageChange}
                  searchValue={search}
                  rxStatusOptions={rxStatusOptions}
                  rxStatusOptionValue={rxStatus}
                  rxStatusOptionValueChange={this.handleRxStatusChange}
                  pagesOptions={perPageOptions}
                  pagesValue={pagination.size}
                />
                <CustomersTable
                  customers={customers}
                  onCustomerSelect={this.handleCustomerSelect}
                  onSelectAllCustomers={this.handleAllCustomersSelect}
                  selectedCustomersIds={selectedCustomersIds}
                  onCustomerClick={this.handleCustomerClick}
                />
                <Pagination
                    pagination={pagination}
                    handleOnChange={this.onUpdatePagination}
                />
                <AddCustomerModal isOpen={activeModal == 'add'} toggle={this.hideModal} />
                <ConfirmationModal
                    isOpen={activeModal == 'remove'}
                    toggle={this.hideModal}
                    onConfirm={this.handleRemoveCustomersRequest}
                    header="Remove Customer"
                    message="Customer will be removed. Are you sure?"
                    confirmButtonText="Remove"
                />
              </Container>
            </WithLoader>
        );
    }
}

const mapStateToProps = state => ({
    customers: getCustomers(state),
    errorMessage: getCustomersErrorMessage(state),
    isFetching: isFetchingCustomers(state),
    fetchedSuccessfully: isDataFetchedSuccessfully(state),
    pagination: getCustomersPagination(state),
    search: getSearchFilter(state),
    rxStatus: getRxStatusFilter(state),
});

export const CustomersContainer = connect(
    mapStateToProps,
    { fetchCustomersRequest, redirectToUrl, removeCustomersRequest, fetchCustomersExportRequest, updateCustomerSearchFilter, updateRxStatusFilter, updateCustomerPagination },
)(CustomersSection);
