import React from 'react';
import classnames from 'classnames';
import './Select.css';

const Select = ({
    handleChange,
    handleBlur = () => {},
    name,
    title,
    disabled,
    required,
    optionItems,
    value,
    width,
    fullWidth,
    minHeight,
    month,
    noMarginBottom,
}) => {
    const requiredSpan = required ? <span className="Select-required">*</span> : null;

    return (
        <div
            className={classnames('Select-container', {
                'Select-container--full-width': fullWidth,
                'Select-container--min-height': minHeight,
                'no-margin-bottom': noMarginBottom,
            })}
            css={{ width: width && width }}
        >
            {title && (
                <div className="Select-title">
                    {title}
                    {requiredSpan}
                </div>
            )}
            <select
                className={classnames('form-control minimal', {
                    month,
                })}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                name={name}
                value={value}
            >
                {optionItems.map(item => {
                    const isObject = typeof item == 'object';
                    const optionValue = isObject ? item.value : item;
                    const optionLabel = isObject ? item.name : item;

                    return (
                        <option value={optionValue} key={optionValue}>
                            {optionLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default Select;
