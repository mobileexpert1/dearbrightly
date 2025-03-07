import React, { Component } from 'react';
import styled from 'react-emotion';
import { Input } from 'reactstrap';
import { fontFamily } from 'src/variables';

const Wrapper = styled('div')`
    .valid-case {
        color: #23ab01;
    }
`;
const PasswordRequirements = styled('div')`
    margin-top: 10px;
    font-size: 14px;
    line-height: 18px;
    color: rgb(105, 105, 105);
    font-family: ${fontFamily.baseFont};
`;

export default class PasswordInputWithValidations extends Component {
    state = {
        passwordValidations: {
            atLeastEightChars: false,
            oneCapOneLower: false,
            oneNumber: false,
        },
        isValid: false,
        enableValidation: false,
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.validatePassword(nextProps.value);
        }
    }

    handleOnFocus = () => {
        this.setState({
            enableValidation: true,
        });
    };

    validatePassword = password => {
        const passwordValidations = {
            atLeastEightChars: false,
            oneCapOneLower: false,
            oneNumber: false,
        };

        // check for at least 8 characters
        if (password.length >= 8) {
            passwordValidations.atLeastEightChars = true;
        }

        // check for at least one capital and one lowercase letter
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
            passwordValidations.oneCapOneLower = true;
        }

        // check for at least one number
        if (/[0-9]/.test(password) > 0) {
            passwordValidations.oneNumber = true;
        }

        setTimeout(() => {
            this.setState({
                passwordValidations,
                isValid:
                    passwordValidations.atLeastEightChars &&
                    passwordValidations.oneCapOneLower &&
                    passwordValidations.oneNumber,
            }, () => {
                    this.props.onCallback && this.props.onCallback(this.state.isValid)
            });
        }, 200);
    };

    render() {
        const { value, onChange, name, inputClass, onBlur } = this.props;
        const { atLeastEightChars, oneCapOneLower, oneNumber } = this.state.passwordValidations;
        const { isValid } = this.state;

        return (
            <Wrapper isValid={isValid}>
                <Input
                    type="password"
                    value={value}
                    onChange={onChange}
                    name={name}
                    className={inputClass}
                    onBlur={onBlur}
                    onFocus={this.handleOnFocus}
                />
                {this.state.enableValidation && (
                    <PasswordRequirements>
                        Your password must have:
                        <ul style={{marginTop: '10px'}}>
                            <li style={{fontSize: '12px'}} className={atLeastEightChars ? 'valid-case' : ''}>
                                <span>&#10003;</span> at least 8 characters
                            </li>
                            <li style={{fontSize: '12px'}} className={oneCapOneLower ? 'valid-case' : ''}>
                                <span>&#10003;</span> at least 1 capital and 1 lowercase letter
                            </li>
                            <li style={{fontSize: '12px'}} className={oneNumber ? 'valid-case' : ''}>
                                <span>&#10003;</span> at least 1 number
                            </li>
                        </ul>
                    </PasswordRequirements>
                )}
            </Wrapper>
        );
    }
}
