import React from 'react';
import styled from 'react-emotion';
import { colors } from 'src/variables';
import Input from 'src/common/components/Input/Input';
import { config } from 'src/config';

import * as S from './styles';

const InputsRow = styled.div`
    display: flex;
    justify-content: space-between;
`;

const InputWrapper = styled.div`
    width: 48%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    color: ${colors.red}
`;

const Alert = styled('div')`
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
`;

export const ResetPasswordForm = props => (
    <S.Container>
        <S.Section>
            <S.Header>New Password</S.Header>
            <S.Description>{config.passwordTooWeakError}</S.Description>
            <form onSubmit={props.onSubmit} onClick={props.onClick}>
                <InputsRow>
                    <InputWrapper>
                        <Input
                            title="New Password"
                            width="100%"
                            hasError={props.missingPassword || props.invalidPassword}
                            required
                            handleChange={props.onChange}
                            type="password"
                            name="password"
                            onBlur={props.onBlur}
                            value={props.passwordValue}
                        />
                        {props.missingPassword && (
                            <ErrorMessage>Please enter a password.</ErrorMessage>
                        )}
                        {props.invalidPassword && (
                            <ErrorMessage>Password doesn't meet requirements.</ErrorMessage>
                        )}
                    </InputWrapper>
                    <InputWrapper>
                        <Input
                            title="Confirm Password"
                            width="100%"
                            hasError={
                                props.missingPasswordConfirmation || props.passwordDoesNotMatch
                            }
                            required
                            onBlur={props.onBlur}
                            handleChange={props.onChange}
                            type="password"
                            name="passwordConfirmation"
                            value={props.passwordConfirmationValue}
                        />
                        {props.missingPasswordConfirmation && (
                            <ErrorMessage>Please enter a password.</ErrorMessage>
                        )}
                        {props.passwordDoesNotMatch && (
                            <ErrorMessage>Your passwords do not match.</ErrorMessage>
                        )}
                    </InputWrapper>
                </InputsRow>
                {props.serverSideErrors && <Alert>{props.serverSideErrors}</Alert>}
                <S.SubmitButton type="submit">
                    {props.isFetching ? 'Updating...' : 'Update Password'}
                </S.SubmitButton>
            </form>
        </S.Section>
    </S.Container>
);
