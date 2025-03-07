import React from 'react';
import { getIn } from 'formik';
import styled from 'react-emotion';

import Select from 'src/common/components/Select/Select';
import Input from 'src/common/components/Input/Input';
import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';

const StyledSelect = styled(Select)`
    border: 1px solid #ababab;
    height: 50px;
    border-radius: 4px;
    min-width: 400px;
    font-size: 15px;
`;

const StyledInput = styled(Input)`
    min-width: 400px;
    font-size: 15px;
`;

export const RegistrationFormField = ({
    field,
    errors,
    touched,
    handleChange,
    handleBlur,
    values,
}) => {
    const error = getIn(errors, field.name);
    const touch = getIn(touched, field.name);
    const hasError = error && touch;

    return (
        <div>
            {field.type === 'select' ? (
                <StyledSelect
                    width="100%"
                    title={field.label}
                    name={field.name}
                    required={field.required}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    optionItems={field.options}
                    value={values[field.name] || ''}
                />
            ) : (
                <StyledInput
                    title={field.label}
                    required={field.required}
                    handleChange={handleChange}
                    onBlur={handleBlur}
                    type={field.type || 'text'}
                    name={field.name}
                    value={values[field.name] || ''}
                />
            )}
            {hasError && <ErrorMessage text={error} />}
        </div>
    );
};
