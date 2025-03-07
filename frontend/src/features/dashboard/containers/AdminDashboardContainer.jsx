import React, { Component } from 'react';
// import { css } from 'react-emotion';
import { connect } from 'react-redux';
// import {
//     Button,
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     FormGroup,
//     Input,
//     Col,
// } from 'reactstrap';

import { AdminOrdersContainer } from 'src/features/orders/containers/AdminOrdersContainer';
import { CustomersContainer } from 'src/features/customers/containers/CustomersContainer';
import { CustomerDetailsContainer } from 'src/features/customers/containers/CustomerDetailsContainer';
import { redirectToUrl } from 'src/common/actions/navigationActions';
import { AdminOrderDetailsContainer } from 'src/features/orders/containers/AdminOrderDetailsContainer';
import * as selectors from 'src/features/auth/selectors/authenticationSelectors';
// import OrderModal from 'src/sections/dashboard/components/OrderModal';
// import OrdersSection from 'src/sections/dashboard/pages/OrdersSection';

import { Dashboard } from '../components/Dashboard';
import { cleanOrdersData } from 'src/features/orders/actions/ordersActions';
import { cleanCustomersData } from "src/features/customers/actions/customersActions";

// const ModalContainer = css`
//     font-size: 14px;
//     width: 850px !important;
//     max-width: 850px !important;

//     .modal-title {
//         font-size: 20px;
//     }

//     .form-group {
//         width: 100%;
//     }

//     .form-control {
//         font-size: 14px;
//     }

//     input {
//         height: 25px;
//         min-height: initial;
//     }

//     textarea.form-control {
//         height: 100px;
//     }

//     button {
//         font-size: inherit;
//     }
// `;

class AdminDashboard extends Component {
    // state = {
    //     modalNote: false,
    //     modalOrder: false,
    //     notes: '',
    // };

    componentDidMount() {}

    componentWillUpdate() {}

    // toggleModal = (modal, notes) => {
    //     if (modal === 'modalNote' && notes) {
    //         return this.setState(prevState => ({
    //             [modal]: !prevState[modal],
    //             notes,
    //         }));
    //     }

    //     this.setState(prevState => ({
    //         [modal]: !prevState[modal],
    //     }));
    // };

    // updateNotes = notes => {
    //     this.setState({ notes });
    // };

    componentWillUnmount() {
        this.props.cleanOrdersData();
        this.props.cleanCustomersData();
    }

    render() {
        // const { modalNote, modalOrder, notes } = this.state;
        const navigationItems = [
            {
                name: 'Orders',
                url: 'orders',
                exact: true,
                component: AdminOrdersContainer,
            },
            {
                name: 'Orders Details',
                url: 'orders/:id',
                exact: true,
                hideInNav: true,
                component: AdminOrderDetailsContainer,
            },
            {
                name: 'Customers',
                url: 'customers',
                exact: true,
                component: CustomersContainer,
            },
            {
                name: 'Customer Details',
                url: 'customers/:id',
                exact: true,
                hideInNav: true,
                component: CustomerDetailsContainer,
            },
        ];

        return (
            <React.Fragment>
                <Dashboard
                    routePrefix="/admin-dashboard/"
                    navigationItems={navigationItems}
                    defaultRoute="orders"
                />
                {/* <Modal
                    isOpen={modalNote}
                    toggle={() => this.toggleModal('modalNote')}
                    className={ModalContainer}
                >
                    <ModalHeader toggle={() => this.toggleModal('modalNote')}>Add Note</ModalHeader>
                    <ModalBody>
                        <FormGroup row>
                            <Col sm={12}>
                                <Input
                                    type="textarea"
                                    value={notes}
                                    onChange={e => this.updateNotes(e.target.value)}
                                />
                            </Col>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.toggleModal('modalNote')}>
                            Save
                        </Button>
                        <Button color="secondary" onClick={() => this.toggleModal('modalNote')}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal> */}

                {/* <OrderModal
                    isOpen={modalOrder}
                    toggle={() => this.toggleModal('modalOrder')}
                    className={ModalContainer}
                    customers={[]}
                /> */}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({});

export default connect(
    mapStateToProps,
    {
        cleanCustomersData,
        cleanOrdersData,
        redirectToUrl,
    },
)(AdminDashboard);
