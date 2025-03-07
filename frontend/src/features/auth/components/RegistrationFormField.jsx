import React from 'react';
import { getIn } from 'formik';

import Input from 'src/common/components/Input/Input';
import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';
import PasswordInputWithValidations from 'src/features/auth/components/PasswordInputWithValidations';

let ranOnce = false;
const inputRefCb = input => {
  if (input && !ranOnce) {
    ranOnce = true;
    setTimeout(() => {
      input.click();
    }, 1000)
  }
}

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
    <div className={`form-group ${hasError && 'has-error'}`}>
      {field.name === 'password' ? (
        <React.Fragment>
          <div className="input-title">
            {field.label}
            {field.required ? <span className="input-required">*</span> : null}
          </div>
          <PasswordInputWithValidations
            onChange={handleChange}
            title={field.label}
            required={field.required}
            onBlur={handleBlur}
            type={field.type || 'text'}
            name={field.name}
            value={values[field.name] || ''}
          />
        </React.Fragment>
      ) : (
          <Input
            autoFocus={field.autoFocus}
            inputRefCb={inputRefCb}
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
