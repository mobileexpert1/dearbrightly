import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
    font-size: 14px;
    margin-bottom: 10px;
    color: red;
`;

const ErrorMessage = ({ text }) => {
    return (
        <Container>
            <div>{text}</div>
        </Container>
    );
};

export default ErrorMessage;
