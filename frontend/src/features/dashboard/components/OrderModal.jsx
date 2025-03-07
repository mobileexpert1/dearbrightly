import React, { Component } from 'react';
import styled from 'react-emotion';
import {
    Row,
    Col,
    Button,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';

const fontSizes = {
    small: '14px',
    normal: '16px',
    big: '20px',
};

const Title = styled('h3')`
    font-size: ${fontSizes.big};
    font-weight: bold;
    margin-bottom: 15px;
`;

const ItemTitle = styled('p')`
    font-size: ${fontSizes.normal};
    font-weight: bold;
    margin-bottom: 20px;
`;

const ClientDataGroup = styled('div')`
    margin-top: 25px;
`;

const CustomInput = styled('input')`
    height: 37px !important;
    border-radius: 4px;
    margin-bottom: 3px;
`;

export default class OrderModal extends Component {
    state = { quantity: 1, customer: '' };

    updateQuantity = quantity => {
        if (quantity < 1) {
            return;
        }

        this.setState({ quantity });
    };

    onValueChange = (value, field) => {
        this.setState({ [field]: value });
    };

    render() {
        const { quantity, customer } = this.state;
        const { toggle, isOpen, className, customers } = this.props;
        const customerTab = customer && customer.split(' ');
        const firstName = customerTab && customerTab[0];
        const lastName = customerTab && customerTab[1];
        const currentCustomerDetails = customers.filter(item => {
            return (
                item.billingDetails.first_name.includes(firstName) ||
                item.billingDetails.last_name.includes(lastName)
            );
        });
        const billingDetails = currentCustomerDetails && currentCustomerDetails[0].billingDetails;
        const shippingDetails = currentCustomerDetails && currentCustomerDetails[0].shippingDetails;
        const customersList = customers.map(item => {
            return `${item.billingDetails.first_name} ${item.billingDetails.last_name}`;
        });

        return (
            <Modal isOpen={isOpen} toggle={toggle} className={className}>
                <ModalHeader toggle={toggle}>Add Order</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Col sm={6}>
                            <Label>Product</Label>
                            <Input type="select" name="product" id="product">
                                <option>Retinoid Serum</option>
                                <option>Salve Moisturizer</option>
                                <option>Retinoid Lite Starter Kit</option>
                            </Input>
                        </Col>
                        <Col sm={3}>
                            <Label>Frequency</Label>
                            <Input type="select" name="product" id="product">
                                <option>Once</option>
                                <option>Every 3 months</option>
                            </Input>
                        </Col>
                        <Col sm={3}>
                            <Label>Quantity</Label>
                            <CustomInput
                                value={quantity}
                                onChange={e => this.updateQuantity(e.target.value)}
                                type="number"
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={12}>
                            <Label>Customer</Label>
                            <Input
                                type="select"
                                name="product"
                                id="product"
                                value={customer}
                                onChange={e => this.onValueChange(e.target.value, 'customer')}
                            >
                                <option>Select</option>
                                {customersList.map((item, index) => (
                                    <option key={index}>{item}</option>
                                ))}
                            </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={6}>
                            <Title>Billing</Title>
                            {customer && (
                                <React.Fragment>
                                    <Row>
                                        <Col lg="3">
                                            <ItemTitle>Name:</ItemTitle>
                                        </Col>
                                        <Col lg="9">
                                            <CustomInput value={billingDetails.first_name} />
                                            <CustomInput value={billingDetails.last_name} />
                                        </Col>
                                    </Row>
                                    <ClientDataGroup>
                                        <Row>
                                            <Col lg="3">
                                                <ItemTitle>Address:</ItemTitle>
                                            </Col>
                                            <Col lg="9">
                                                <CustomInput value={billingDetails.address_line1} />
                                                <CustomInput value={billingDetails.city} />
                                                <CustomInput value={billingDetails.zip} />
                                                <CustomInput value={billingDetails.state} />
                                                <CustomInput value={billingDetails.country} />
                                            </Col>
                                        </Row>
                                    </ClientDataGroup>
                                    <ClientDataGroup>
                                        <Row>
                                            <Col lg="3">
                                                <ItemTitle>Email:</ItemTitle>
                                            </Col>
                                            <Col lg="9">
                                                <CustomInput value={customer.email} />
                                            </Col>
                                        </Row>
                                    </ClientDataGroup>
                                    <Row>
                                        <Col lg="3">
                                            <ItemTitle>Phone:</ItemTitle>
                                        </Col>
                                        <Col lg="9">
                                            <CustomInput value={billingDetails.phone} />
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            )}
                        </Col>
                        <Col sm={6}>
                            <Title>Shipping</Title>
                            {customer && (
                                <React.Fragment>
                                    <Row>
                                        <Col lg="3">
                                            <ItemTitle>Name:</ItemTitle>
                                        </Col>
                                        <Col lg="9">
                                            <CustomInput value={shippingDetails.first_name} />
                                            <CustomInput value={shippingDetails.last_name} />
                                        </Col>
                                    </Row>
                                    <ClientDataGroup>
                                        <Row>
                                            <Col lg="3">
                                                <ItemTitle>Address:</ItemTitle>
                                            </Col>
                                            <Col lg="9">
                                                <CustomInput
                                                    value={shippingDetails.address_line1}
                                                />
                                                <CustomInput value={shippingDetails.city} />
                                                <CustomInput value={shippingDetails.zip} />
                                                <CustomInput value={shippingDetails.state} />
                                                <CustomInput value={shippingDetails.country} />
                                            </Col>
                                        </Row>
                                    </ClientDataGroup>
                                    <ClientDataGroup>
                                        <Row>
                                            <Col lg="3">
                                                <ItemTitle>Email:</ItemTitle>
                                            </Col>
                                            <Col lg="9">
                                                <CustomInput value={customer.email} />
                                            </Col>
                                        </Row>
                                    </ClientDataGroup>
                                    <Row>
                                        <Col lg="3">
                                            <ItemTitle>Phone:</ItemTitle>
                                        </Col>
                                        <Col lg="9">
                                            <CustomInput value={shippingDetails.phone} />
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            )}
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={12}>
                            <Label>Notes</Label>
                            <Input type="textarea" />
                        </Col>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggle}>
                        Save
                    </Button>
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
