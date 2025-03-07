import React, { Component } from 'react';
import styled, { css } from 'react-emotion';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import Select from 'src/common/components/Select/Select';
import listOfStates from 'src/common/helpers/listOfStates.js';
import { fontFamily } from 'src/variables';

const fontSizes = {
    small: '14px',
    normal: '16px',
};

const colors = {
    dark: '#666',
    light: '#ababab',
};

const FormRow = styled('div')`
    display: flex;
`;

const FormLabel = styled('label')`
    line-height: 36px;
    color: ${colors.dark};
    text-align: right;
    width: 35%;
    padding-right: 10px;
t-size: ${fontSizes.small};    fon
`;

const FormInput = styled(`input`)`
    border: 1px solid ${colors.light};
    height: 50px;
    border-radius: 4px;
    width: 100%;
    font-size: ${fontSizes.small};
`;

const FormColumn = styled('div')`
    display: flex;
    width: 50%;
    padding-bottom: 20px;
    h4 {
        font-size: ${fontSizes.normal};
        font-weight: light;
    }
`;

const Title = styled('h4')`
    font-size: ${fontSizes.normal};
    font-weight: bold;
    margin: 20px 0;
`;

const ModalStyles = css`
font-family: ${fontFamily.baseFont};
    font-size: 14px;
    width: 850px !important;
    max-width: 850px !important;

    .modal-title {
        font-size: 20px;
    }

    .form-group {
        width: 100%;
    }

    .form-control {
        font-size: 14px;
    }

    input {
        height: 25px;
        min-height: initial;
    }

    textarea.form-control {
        height: 100px;
    }

    button {
        font-size: inherit;
    }
`;

export class AddCustomerModal extends Component {
    state = {
        billingDetails: {
            firstName: '',
            lastName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            country: '',
            state: '',
            postalCode: '',
        },
        shippingDetails: {
            firstName: '',
            lastName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            country: '',
            state: '',
            postalCode: '',
        },
    };

    onBillingValueChange = (value, field) => {
        this.setState(state => ({
            billingDetails: {
                ...state.billingDetails,
                [field]: value,
            },
        }));
    };

    onShippingValueChange = (value, field) => {
        this.setState(state => ({
            shippingDetails: {
                ...state.shippingDetails,
                [field]: value,
            },
        }));
    };

    renderBillingDetails() {
        const {
            firstName,
            lastName,
            phone,
            addressLine1,
            addressLine2,
            city,
            country,
            state,
            postalCode,
        } = this.state.billingDetails;

        return (
            <React.Fragment>
                <Title>Billing:</Title>
                <FormRow>
                    <FormColumn>
                        <FormLabel>First Name:</FormLabel>
                        <FormInput
                            type="text"
                            value={firstName}
                            onChange={e => this.onBillingValueChange(e.target.value, 'firstName')}
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Last Name:</FormLabel>
                        <FormInput
                            type="text"
                            value={lastName}
                            onChange={e => this.onBillingValueChange(e.target.value, 'lastName')}
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Phone Number:</FormLabel>
                        <FormInput
                            type="tel"
                            value={phone}
                            onChange={e => this.onBillingValueChange(e.target.value, 'phone')}
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Address Line 1:</FormLabel>
                        <FormInput
                            type="text"
                            value={addressLine1}
                            onChange={e =>
                                this.onBillingValueChange(e.target.value, 'addressLine1')
                            }
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Adress Line 2:</FormLabel>
                        <FormInput
                            type="text"
                            value={addressLine2}
                            onChange={e =>
                                this.onBillingValueChange(e.target.value, 'addressLine2')
                            }
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Suburb/City:</FormLabel>
                        <FormInput
                            type="text"
                            value={city}
                            onChange={e => this.onBillingValueChange(e.target.value, 'city')}
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Country:</FormLabel>
                        <FormInput
                            type="text"
                            value={country}
                            onChange={e => this.onBillingValueChange(e.target.value, 'country')}
                            disabled
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>State/Province:</FormLabel>
                        <Select
                            name="state"
                            handleChange={e => this.onBillingValueChange(e.target.value, 'state')}
                            optionItems={listOfStates()}
                            value={state}
                            fullWidth
                            minHeight
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Zip/Postcode:</FormLabel>
                        <FormInput
                            type="text"
                            value={postalCode}
                            onChange={e => this.onBillingValueChange(e.target.value, 'postalCode')}
                        />
                    </FormColumn>
                </FormRow>
            </React.Fragment>
        );
    }

    renderShippingDetails() {
        const {
            firstName,
            lastName,
            company,
            phone,
            addressLine1,
            addressLine2,
            city,
            country,
            state,
            postalCode,
        } = this.state.shippingDetails;

        return (
            <React.Fragment>
                <Title>Shipping:</Title>
                <FormRow>
                    <FormColumn>
                        <FormLabel>First Name:</FormLabel>
                        <FormInput
                            type="text"
                            value={firstName}
                            onChange={e => this.onShippingValueChange(e.target.value, 'firstName')}
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Last Name:</FormLabel>
                        <FormInput
                            type="text"
                            value={lastName}
                            onChange={e => this.onShippingValueChange(e.target.value, 'lastName')}
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Phone Number:</FormLabel>
                        <FormInput
                            type="tel"
                            value={phone}
                            onChange={e => this.onShippingValueChange(e.target.value, 'phone')}
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Address Line 1:</FormLabel>
                        <FormInput
                            type="text"
                            value={addressLine1}
                            onChange={e =>
                                this.onShippingValueChange(e.target.value, 'addressLine1')
                            }
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Adress Line 2:</FormLabel>
                        <FormInput
                            type="text"
                            value={addressLine2}
                            onChange={e =>
                                this.onShippingValueChange(e.target.value, 'addressLine2')
                            }
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>Suburb/City:</FormLabel>
                        <FormInput
                            type="text"
                            value={city}
                            onChange={e => this.onShippingValueChange(e.target.value, 'city')}
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Country:</FormLabel>
                        <FormInput
                            type="text"
                            value={country}
                            onChange={e => this.onShippingValueChange(e.target.value, 'country')}
                            disabled
                        />
                    </FormColumn>
                </FormRow>
                <FormRow>
                    <FormColumn>
                        <FormLabel>State/Province:</FormLabel>
                        <Select
                            name="state"
                            handleChange={e => this.onShippingValueChange(e.target.value, 'state')}
                            optionItems={listOfStates()}
                            value={state}
                            fullWidth
                            minHeight
                        />
                    </FormColumn>
                    <FormColumn>
                        <FormLabel>Zip/Postcode:</FormLabel>
                        <FormInput
                            type="text"
                            value={postalCode}
                            onChange={e => this.onShippingValueChange(e.target.value, 'postalCode')}
                        />
                    </FormColumn>
                </FormRow>
            </React.Fragment>
        );
    }

    render() {
        const { isOpen, toggle } = this.props;

        return (
            <Modal isOpen={isOpen} toggle={toggle} className={ModalStyles}>
                <ModalHeader toggle={toggle}>Add Customer</ModalHeader>
                <ModalBody>
                    {this.renderBillingDetails()}
                    {this.renderShippingDetails()}
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
