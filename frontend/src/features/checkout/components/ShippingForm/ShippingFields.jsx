import React from 'react';
import styled from 'react-emotion';
import NumberFormat from 'react-number-format';

import Select from 'src/common/components/Select/Select';
import { ShippingFormAutocomplete } from 'src/features/checkout/components/ShippingForm/ShippingFormAutocomplete';

const FormInput = styled.input`
  width: 100%;
  border: ${props => `1px solid ${props.hasError ? 'red' : '#ededed'}`};
  border-radius: 4px;
  font-size: 14px;
  height: 48px;
  line-height: 1;
  padding: 0 15px;
  border: 1px solid rgb(230, 224, 224);
  outline: 0;
  &:focus {
    box-shadow: none;
  }
`;

export const ShippingFields = ({
  handleChange,
  onStateBlur,
  field,
  hasError,
  defaultValue,
  name,
  setFieldValue,
  setFieldRef,
  fieldsRefs,
}) => {
  {
    const handleBlur = e => {
      if (onStateBlur) {
        onStateBlur(e.target.value);
      }
    }
    switch (true) {
      case field.type === 'select':
        return (
          <Select
            name={name}
            handleChange={handleChange}
            optionItems={field.options}
            value={defaultValue}
            fullWidth
            minHeight
            noMarginBottom
            handleBlur={handleBlur}
          />
        );

      case field.type === 'tel':
        return (
          <NumberFormat
            customInput={FormInput}
            name={name}
            format="(###) ###-####"
            mask=""
            defaultValue={defaultValue}
            onBlur={handleBlur}
            type={field.type}
            hasError={hasError}
            onChange={handleChange}
            innerRef={setFieldRef}
          />
        );

      case field.type === 'autocomplete':
        return (
          <ShippingFormAutocomplete
            setFieldValue={setFieldValue}
            defaultValue={defaultValue}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={hasError}
            fieldsRefs={fieldsRefs}
          />
        );

      default:
        return (
          <FormInput
            name={name}
            defaultValue={defaultValue}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={hasError}
            disabled={field.disabled}
            innerRef={setFieldRef}
          />
        );
    }
  }
};
