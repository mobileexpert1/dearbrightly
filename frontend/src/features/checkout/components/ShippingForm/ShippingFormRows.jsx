import React, { Component } from 'react';
import styled from 'react-emotion';
import { getIn } from 'formik';
import * as Yup from 'yup';

import listOfStates from 'src/common/helpers/listOfStates';
import { ShippingFields } from 'src/features/checkout/components/ShippingForm/ShippingFields';
import { fontFamily, fontWeight } from 'src/variables';

const ErrorText = styled.p`
  color: red;
  margin-top: 15px;
`;

const FormRow = styled.div`
  display: flex;
`;

const FormLabel = styled.label`
  font-size: 14px;
  line-height: 16px;
  font-weight: ${fontWeight.regular};
  font-family: ${fontFamily.baseFont};
  color: rgb(105, 105, 105);
  padding: 1px 3px;
  margin-bottom: 0.2rem;
  .shippingDetails.state {
    margin-bottom: 0;
  }
`;

const FormInputWrapper = styled.div`
  width: 100%;
  position: relative;
  select {
    height: 48px !important;
  }
`;

const FormGroup = styled('div')`
  margin-bottom: 5px;
  width: 100%;
  div {
    padding: 0 3px 3px;
    width: 100%;
  }
  .select-input {
    p {
      margin-bottom: 0;
    }
  }
`;

const formRows = [
  [{ label: 'First Name', name: 'firstName' }, { label: 'Last Name', name: 'lastName' }],
  [{ label: 'Address 1', name: 'addressLine1', type: 'autocomplete' }],
  [{ label: 'Address 2', name: 'addressLine2' }],
  [
    { label: 'City', name: 'city' },
    { label: 'State', type: 'select', options: listOfStates(), name: 'state' },
  ],
  [{ label: 'Zip Code', name: 'postalCode' }, { label: 'Phone', type: 'tel', name: 'phone' }],
];

export const shippingValidationSchemaRules = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required'),
  lastName: Yup.string()
    .trim()
    .min(2, 'Must be longer than one letter')
    .required('Last name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .nullable(),
  addressLine1: Yup.string()
    .trim()
    .required('Address is required'),
  addressLine2: Yup.string().trim(),
  city: Yup.string()
    .trim()
    .required('City is required'),
  state: Yup.string()
    .trim()
    .required('State is required'),
  postalCode: Yup.string()
    .trim()
    .required('Zip Code is required'),
});

export class ShippingFormRows extends Component {
  fieldsRefs = {};

  componentDidMount() {
    const { firstName } = this.fieldsRefs;
    if (firstName) {
      firstName.focus();
    }
  }

  setFieldRef = (input, fieldName, defaultValue) => {
    if (!defaultValue) {
      this.fieldsRefs[fieldName] = input;
    }
  };

  render() {
    const { prefix, data, handleChange, touched, errors, onStateBlur } = this.props;
    return (
      <React.Fragment>
        {formRows.map((fields, i) => (
          <FormRow key={fields[0].name + i}>
            {fields.map(field => {
              const name = `${prefix}.${field.name}`;
              const error = getIn(errors, field.name);
              const touch = getIn(touched, field.name);
              const hasError = error && touch;
              const fieldValue = data[field.name];

              return (
                <FormGroup key={field.name}>
                  <FormLabel className={`${name}`}>{field.label}</FormLabel>
                  <FormInputWrapper>
                    <ShippingFields
                      handleChange={handleChange}
                      onStateBlur={onStateBlur}
                      field={field}
                      hasError={hasError}
                      defaultValue={fieldValue}
                      fieldsRefs={this.fieldsRefs}
                      name={name}
                      setFieldValue={this.props.setFieldValue}
                      setFieldRef={input => {
                        this.setFieldRef(input, field.name, fieldValue);
                      }}
                    />
                    {hasError && <ErrorText>{error}</ErrorText>}
                  </FormInputWrapper>
                </FormGroup>
              );
            })}
          </FormRow>
        ))}
      </React.Fragment>
    );
  }
}
