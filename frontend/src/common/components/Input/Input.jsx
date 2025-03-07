import React from 'react';
import './Input.css';
import PropTypes from 'prop-types';

let ref2 = null;

const Input = (props) => {
  const {
    type,
    handleChange,
    onBlur,
    name,
    title,
    required,
    value = '',
    hasError,
    disabled,
    autoFocus,
    inputRefCb
  } = props;

  const requiredSpan = required ? <span className="input-required">*</span> : null;
  return (
    <div className="input-container">
      <div className="input-title">
        {title}
        {requiredSpan}
      </div>
      <input
        {...props}
        ref={input => {
          if (inputRefCb) {
            inputRefCb(input);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.target.focus();
        }}
        autoFocus={autoFocus}
        type={type}
        onChange={handleChange}
        onBlur={onBlur}
        name={name}
        value={value}
        disabled={disabled}
        css={{ borderColor: hasError && 'red' }}
        className="form-control"
      />
    </div>
  );
};

export default Input;

Input.propTypes = {
  type: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string.isRequired,
};
