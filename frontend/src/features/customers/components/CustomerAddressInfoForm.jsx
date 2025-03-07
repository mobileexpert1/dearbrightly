import React from 'react';
import styled from 'react-emotion';
import { withFormik, getIn } from 'formik';
import * as Yup from 'yup';

import Select from 'src/common/components/Select/Select';
import listOfStates from 'src/common/helpers/listOfStates';

const FormRow = styled.div`
    display: flex;
    
`;

const Title = styled.h4`
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0;
`;

const FormLabel = styled.label`
    line-height: 50px;
    color: #666;
    text-align: left;
    width: 30%;
    padding-right: 3px;
    font-size: 14px;
`;

const Button = styled.button`
    border: 2px solid #ededed;
    font-size: 16px;
    padding: 10px 20px;
    margin-left: 8px;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;

const FormInputWrapper = styled.div`
    width: 70%;
    position: relative;
`;

const FormInput = styled.input`
    width: 100%;
    border: ${props => `1px solid ${props.hasError ? 'red' : '#ededed'}`};    
    border-radius: 4px;
    font-size: 14px;
`;

const ErrorText = styled.p`
    position: absolute;
    bottom: -35px;
    color: red;
`;

const FormColumn = styled.div`
    display: flex;
    width: 50%;
    padding: 0 10px 0px;

    h4 {
        font-size: 16px;
        font-weight: light;
    }
`;

const formRows = [
  [
    { label: 'First Name', name: 'firstName' },
    { label: 'Last Name', name: 'lastName' },
    { label: 'Phone Number', type: 'tel', name: 'phone' },
  ],
  [
    { label: 'Address Line 1', name: 'addressLine1' },
    { label: 'Address Line 2', name: 'addressLine2' },
    { label: 'Suburb/City', name: 'city' },
  ],
  [
    { label: 'Country', name: 'country', disabled: true },
    { label: 'State/Province', type: 'select', options: listOfStates(), name: 'state' },
    { label: 'Zip/Postcode', name: 'postalCode' },
  ],
];

const validationSchemaRules = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required'),
  phone: Yup.number().required('Phone number is required'),
  addressLine1: Yup.string()
    .trim()
    .required('Address is required'),
  city: Yup.string()
    .trim()
    .required('City is required'),
  state: Yup.string()
    .trim()
    .required('State is required'),
  postalCode: Yup.string()
    .trim()
    .required('Postal code is required'),
});

const FormRows = ({ prefix, data, handleChange, handleBlur, touched, errors }) =>
  formRows.map((fields, i) => (
    <FormRow key={fields[0].name + i}>
      {fields.map(field => {
        const name = `${prefix}.${field.name}`;

        const error = getIn(errors, field.name);
        const touch = getIn(touched, field.name);

        const hasError = error && touch;

        return (
          <FormColumn key={field.name}>
            <FormLabel>{field.label}:</FormLabel>
            <FormInputWrapper>
              {field.type == 'select' ? (
                <Select
                  name={name}
                  handleChange={handleChange}
                  optionItems={field.options}
                  value={data[field.name]}
                  fullWidth
                  minHeight
                />
              ) : (
                  <FormInput
                    name={name}
                    defaultValue={data[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    hasError={hasError}
                    disabled={field.disabled}
                  />
                )}
              {hasError && <ErrorText>{error}</ErrorText>}
            </FormInputWrapper>
          </FormColumn>
        );
      })}
    </FormRow>
  ));

const CustomerAddressInfoFormRaw = ({
  values,
  touched,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  isValid,
  isSaving,
}) => (
    <form onSubmit={handleSubmit}>
      <Title>Shipping:</Title>
      <FormRows
        prefix="shippingDetails"
        data={values.shippingDetails}
        errors={errors.shippingDetails}
        touched={touched.shippingDetails}
        handleBlur={handleBlur}
        handleChange={handleChange}
      />

      <Button type="submit" disabled={!isValid || isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );

export const CustomerAddressInfoForm = withFormik({
  enableReinitialize: true,
  mapPropsToValues: props => props.data,
  validationSchema: Yup.object().shape({
    shippingDetails: validationSchemaRules,
  }),
  handleSubmit: (values, { props }) => props.onSubmit(values),
})(CustomerAddressInfoFormRaw);
