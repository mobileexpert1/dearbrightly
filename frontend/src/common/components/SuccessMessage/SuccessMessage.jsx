import React from 'react';
import styled from 'react-emotion';

const Container = styled('div')`
    font-size: 14px;
    margin-bottom: 10px;
    color: green;
`;

const SuccessMessage = ({ text }) => {
    return (
        <Container>
            <div>{text}</div>
        </Container>
    );
};

export default SuccessMessage;
