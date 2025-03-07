import React from 'react';
import { getIn } from 'formik';
import Select from 'react-select';
import { Input, Row, Col } from 'reactstrap';

import ErrorMessage from 'src/common/components/ErrorMessage/ErrorMessage';
import listOfStates from 'src/common/helpers/listOfStates';

import * as S from './styles';

const fields = [
    { name: 'firstName', title: 'First Name' },
    { name: 'lastName', title: 'Last Name' },
    { name: 'addressLine1', title: 'Address Line 1' },
    { name: 'addressLine2', title: 'Address Line 2' },
    { name: 'city', title: 'City' },
    { name: 'postalCode', title: 'Postal Code' },
    { name: 'state', type: 'select', title: 'State' },
    { name: 'phone', type: 'tel', title: 'Phone Number' },
];

const Field = ({ name, value, title, onChange, onBlur, errors, touched, type }) => {
    const error = getIn(errors, name);
    const touch = getIn(touched, name);
    const hasError = error && touch;

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        background: '#fff',
        minHeight: '45px',
        height: '45px',
        boxShadow: state.isFocused ? null : null,
      }),

      container: (provided, state) => ({
        ...provided,
        paddingBottom: '6px'
      }),

      valueContainer: (provided, state) => ({
        ...provided,
        height: '45px',
        padding: '0 6px',
      }),

      input: (provided, state) => ({
        ...provided,
        margin: '0px',
      }),
      indicatorSeparator: state => ({
        display: 'none',
      }),
      indicatorsContainer: (provided, state) => ({
        ...provided,
        height: '45px',
      }),
    };

    return (
        <Row>
            <Col md={4}>
                <S.ItemTitle css={{ marginTop: 10 }}>{title}</S.ItemTitle>
            </Col>
            <Col md={8}>
                {type == 'select' ? (
                  <Select
                      styles={customStyles}
                      options={listOfStates().map(state => ({
                        label: state.value,
                        value: state.value
                      }))}
                      value={{label: value, value: value}}
                      name={name}
                      onChange={val =>
                          val && onChange({
                              target: {
                                  name,
                                  value: val.value,
                              },
                          })
                      }
                  />
                ) : (
                    <Input
                        name={name}
                        type={type || 'text'}
                        placeholder={title}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                )}

                {hasError && <ErrorMessage text={error} />}
            </Col>
        </Row>
    );
};

export const AdminOrderDetailsShippingInfo = ({ data, onChange, onBlur, touched, errors }) => {
    return (
        <Col xl={9} sm={12}>
            <S.Title css={{ marginLeft: 20 }}>Shipping</S.Title>
            {fields.map(({ title, name, type }) => (
                <Field
                    key={name}
                    value={data[name]}
                    title={title}
                    name={name}
                    touched={touched}
                    type={type}
                    errors={errors}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            ))}
        </Col>
    );
};
