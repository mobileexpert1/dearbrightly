import React from 'react';
import styled from 'react-emotion';
import Input from 'src/common/components/Input/Input';
import { breakpoints, fontFamily } from 'src/variables';
import * as S from './styles';

const Wrapper = styled('div')`
    font-family: ${fontFamily.baseFont};
    .cart-forgot {
        margin-top: 0px;
        padding-top: 0;
        input {
            display: block;
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 12px;
            line-height: 1.5;
            color: #495057;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
    }
`;
const ForgotPasswordStyledForm = styled.form`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
`;

const InputWrapper = styled.div`
    display:flex
    width: 100%;
    @media (min-width: 768px) {
        display:flex
        width: 100%;
    }
    margin: 0 auto
    justify-content: center;
    align-items: center;
    text-align: center;  
    padding-bottom: 20px;
    ${breakpoints.sm} {
        max-width: 300px;
    }
    min-width: 250px;
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

export const ForgotPasswordForm = props => (
    <Wrapper id={"wrapper"}>
        <S.Container id={"container"} className={props.topClass}>
            <S.Header>Forgot Password</S.Header>
            <S.Section id={"section"}>
                <S.Description>
                    Enter your email associated with your account, and we'll email you a link to
                    reset your password.
                </S.Description>
                <ForgotPasswordStyledForm id={"forgot-password-styled-form"} onSubmit={e => {
                    e.preventDefault();
                    props.onSubmit();
                }}>
                    <InputWrapper id={"input-wrapper"}>
                        <Input
                            id={"input"}
                            title="Email Address"
                            width="100%"
                            required
                            handleChange={props.onChange}
                            type="email"
                            name="email"
                            value={props.value}
                        />

                        {props.hasError && <Alert>{props.errorMessage}</Alert>}
                    </InputWrapper>
                </ForgotPasswordStyledForm>
            </S.Section>
        </S.Container>
    </Wrapper>
);