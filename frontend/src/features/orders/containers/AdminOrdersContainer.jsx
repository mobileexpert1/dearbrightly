import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';

import { Pagination } from 'src/common/components/Pagination';
import { redirectToUrl } from 'src/common/actions/navigationActions';
import { WithLoader } from 'src/common/components/WithLoader';
import { ConfirmationModal } from 'src/common/components/ConfirmationModal';
import { compareOrdersByDate } from 'src/common/helpers/compareOrdersByDate';

import { AdminOrderNoteModal } from '../components/AdminOrderNoteModal';
import { AdminOrdersTable } from '../components/AdminOrdersTable';
import { AdminOrdersTopBar } from '../components/AdminOrdersTopBar';
import {
    fetchOrdersRequest,
    fetchOrdersExportRequest,
    archiveOrdersRequest,
    updateOrderRequest,
    cleanOrdersData,
    updateOrderSearchFilter,
    updateOrderStatusFilterValue,
    updateOrderPagination,
} from '../actions/ordersActions';
import {
    isUpdateOrderSuccess,
} from 'src/features/orders/selectors/orderSelectors';

import {
    getOrders,
    getOrdersErrorMessage,
    isFetchingOrders,
    isDataFetchedSuccessfully,
    getOrderStatuses,
    getOrderStatusesOptions,
    getOrdersPagination,
    getSearchFilter,
    getStatusFilterValue,
} from '../selectors/ordersSelectors';


const Container = styled('div')`
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

const actionsOptions = ['Choose an action'];

const perPageOptions = [10, 20, 30, 40];

const firstPage = 1;

class AdminOrders extends React.Component {
    state = {
        seletedAction: '',
        selectedOrdersIds: [],
        archiveModalActive: false,
        noteModalActive: false,
        noteData: {},
        ordersToArchive: [],
        sortByDateAscending: false, // sorting should be done in selectors!
        filterModified: false,
    };

    constructor (props) {
      super(props);
      this.requestOrdersRefresh = this.requestOrdersRefresh.bind(this);
    }

    componentDidMount() {
      this.requestOrdersRefresh(false);
    }
    
    componentDidUpdate(prevProps) {
      if (prevProps.searchFilter !== this.props.searchFilter || prevProps.statusFilterValue !== this.props.statusFilterValue || prevProps.pagination.size !== this.props.pagination.size) {
        this.requestOrdersRefresh(true);
      } else if (prevProps.pagination.current !== this.props.pagination.current) {
        this.requestOrdersRefresh(false);
      }
    }
    
    // dispatches all requests from the component, first param is isAdmin (always true in this component)
    // second param is so the pagination component can request other pages; triggers instant request
    requestOrdersRefresh(skipPagination) {

      const paginationParams = {
        page: this.props.pagination.current,
        size: this.props.pagination.size,
      };

      if (skipPagination) {
        paginationParams.page = 1;
      }
      
      const searchData = this.props.searchFilter.toLowerCase();
      const statusFilterData = ( this.props.statusFilterValue > -1 ? this.props.statusFilterValue : '');
      
      // dispatch a new request for the filtered list of orders
      this.props.fetchOrdersRequest(true, paginationParams, searchData, statusFilterData)
    }

    handleValueChange = (value, field) => this.setState({ [field]: value });

    handleArchiveModalToggle = () =>
        this.setState(state => ({ archiveModalActive: !state.archiveModalActive }));

    handleNoteModalToggle = () =>
        this.setState(state => ({ noteModalActive: !state.noteModalActive }));

    handleActionChange = ({ target }) => this.handleValueChange(target.value, 'seletedAction');

    // modified to make a new api fetch when the search field changes
    handleSearchValueChange = async ({ target }) => {
      this.props.updateOrderSearchFilter(target.value);
      await this.setState({
        filterModified: true
      });
    }

    handleStatusFilterChange = async ({ target }) => {
      this.props.updateOrderStatusFilterValue(target.value);
      await this.setState({
        filterModified: (target.value !== -1 ? true : this.state.filterModified),
      })
    }

    handlePerPageChange = ({ target }) => {
      const paginationData = {
        current: this.props.pagination.current,
        size: parseInt(target.value),
      };
      
      this.props.updateOrderPagination(paginationData);
    }

    onUpdatePagination = (_, paginationParams) => {
      const pagination = {
        current: paginationParams.page,
        size: this.props.pagination.size,
      };

      this.props.updateOrderPagination(pagination);
    }

    handleCustomerClick = id => this.props.redirectToUrl(`customers/${id}`);

    handleOrderIdClick = id => this.props.redirectToUrl(`orders/${id}`);

    handleActionConfirm = () => {
        if (!this.isAnyOrderSelected()) {
            return;
        }

        switch (this.state.seletedAction) {
            case 'Export Selected': {
                const ordersToExprt = this.getSelectedOrders();

                return this.exportOrders(ordersToExprt);
            }
            // case 'Archive Selected':
            //     return this.handleArchiveOrdersRequest();
        }
    };

    handleOrderSelect = id => {
        const isSelected = this.state.selectedOrdersIds.includes(id);

        this.setState(state => ({
            selectedOrdersIds: isSelected
                ? state.selectedOrdersIds.filter(orderId => orderId != id)
                : [...state.selectedOrdersIds, id],
        }));
    };

    handleAllOrdersSelect = () =>
        this.setState(state => ({
            selectedOrdersIds:
                state.selectedOrdersIds.length == this.props.orders.length
                    ? []
                    : this.props.orders.map(({ id }) => id),
        }));

    handleArchiveOrdersRequest = id =>
        this.setState(
            state => ({
                ordersToArchive: id ? [id] : state.selectedOrdersIds,
            }),
            this.handleArchiveModalToggle,
        );

    handleAddOrderNote = id => {
        const order = this.props.orders.find(item => item.id == id);

        this.setState(
            {
                noteData: {
                    id,
                    value: order.notes,
                },
            },
            this.handleNoteModalToggle,
        );
    };

    archiveOrders = () => {
        this.props.archiveOrdersRequest(this.state.ordersToArchive);

        this.setState({
            selectedOrdersIds: [],
            ordersToArchive: [],
        });
    };

    exportSelectedOrders = () => {
        if (!this.isAnyOrderSelected()) {
            return;
        }

        this.exportOrders(this.getSelectedOrders());
    };

    isAnyOrderSelected = () => !!this.state.selectedOrdersIds.length;

    getSelectedOrders = () =>
        this.props.orders.filter(order => this.state.selectedOrdersIds.includes(order.id));

    // deprecated; remove after implementing more complete filter
    // filterOrders = (orders, filter) => orders;

    toggleSortByDateOrder = () =>
        this.setState(prevState => ({
            sortByDateAscending: !prevState.sortByDateAscending,
        }));

    exportOrders = () => {
      const searchData = this.props.searchFilter;

      const statusFilterData = ( this.props.statusFilterValue > -1 ? this.props.statusFilterValue : '');

      this.props.fetchOrdersExportRequest(true, searchData, statusFilterData);
    }

    render() {
        const { seletedAction, selectedOrdersIds, filterModified, archiveModalActive, noteModalActive, noteData } = this.state;
        const { errorMessage, fetchedSuccessfully, isFetching, orders, updateOrderRequest, orderStatuses, orderStatusesOptions, pagination, searchFilter, statusFilterValue } = this.props;
        const hasOrderData = filterModified ? true : (orders.length > 0);

        // make a new status filter array that has the option to not filter any statuses
        let orderStatusFilterOptions = orderStatusesOptions;
        if (orderStatusFilterOptions.length > 0 && orderStatusFilterOptions[0].name !== 'All') {
          orderStatusFilterOptions.unshift({name: 'All', value: -1});
        }

        return (
            <WithLoader
                hasData={hasOrderData}
                data={orders}
                isFetching={isFetching}
                fetchingMessage="Fetching orders list..."
                fetchedSuccessfully={fetchedSuccessfully}
                noDataErrorMessage="No orders found"
                errorMessage={errorMessage}
            >
                {orders => {
                    const filteredOrders = orders;
                    // TODO - this might be redundant as the sorting is done in the backend
                    const comparator = compareOrdersByDate(this.state.sortByDateAscending);
                    const sortedOrders = [...filteredOrders.sort(comparator)];

                    return (
                        <Container>
                            <AdminOrdersTopBar
                                actionsOptions={actionsOptions}
                                selectedAction={seletedAction}
                                perPageOptions={perPageOptions}
                                selectedPerPage={pagination.size}
                                searchValue={searchFilter}
                                statusFilterValue={statusFilterValue}
                                onExportAll={() => this.exportOrders()}
                                onPerPageChange={this.handlePerPageChange}
                                onSearchChange={this.handleSearchValueChange}
                                orderStatusesOptions={orderStatusFilterOptions}
                                onStatusFilterChange={this.handleStatusFilterChange}
                                onActionChange={this.handleActionChange}
                                onActionConfirm={this.handleActionConfirm}
                            />
                            <AdminOrdersTable
                                orders={sortedOrders}
                                orderStatuses={orderStatuses}
                                orderStatusesOptions={orderStatusesOptions}
                                selectedOrdersIds={selectedOrdersIds}
                                onOrderSelect={this.handleOrderSelect}
                                onAllOrdersSelect={this.handleAllOrdersSelect}
                                onStatusChange={updateOrderRequest}
                                onCustomerClick={this.handleCustomerClick}
                                onOrderIdClick={this.handleOrderIdClick}
                                onDateHeaderClick={this.toggleSortByDateOrder}
                                onOrderArchive={this.handleArchiveOrdersRequest}
                                onAddOrderNote={this.handleAddOrderNote}
                            />
                            <Pagination
                                pagination={pagination}
                                handleOnChange={this.onUpdatePagination}
                            />

                            <ConfirmationModal
                                isOpen={archiveModalActive}
                                toggle={this.handleArchiveModalToggle}
                                onConfirm={this.archiveOrders}
                                header="Archive Order"
                                message="Order will be archived. Are you sure?"
                                confirmButtonText="Archive"
                            />

                            <AdminOrderNoteModal
                                isOpen={noteModalActive}
                                noteData={noteData}
                                onConfirm={updateOrderRequest}
                                onCancel={this.handleNoteModalToggle}
                            />
                        </Container>
                    );
                }}
            </WithLoader>
        );
    }
}

const mapStateToProps = state => ({
    orders: getOrders(state),
    orderStatuses: getOrderStatuses(state),
    orderStatusesOptions: getOrderStatusesOptions(state),
    errorMessage: getOrdersErrorMessage(state),
    isFetching: isFetchingOrders(state),
    fetchedSuccessfully: isDataFetchedSuccessfully(state),
    pagination: getOrdersPagination(state),
    orderUpdated: isUpdateOrderSuccess(state),
    searchFilter: getSearchFilter(state),
    statusFilterValue: getStatusFilterValue(state),
});

const mapActionsToProps = {
    fetchOrdersRequest,
    fetchOrdersExportRequest,
    redirectToUrl,
    archiveOrdersRequest,
    updateOrderRequest,
    cleanOrdersData,
    updateOrderSearchFilter,
    updateOrderStatusFilterValue,
    updateOrderPagination
};

export const AdminOrdersContainer = connect(
    mapStateToProps,
    mapActionsToProps,
)(AdminOrders);
