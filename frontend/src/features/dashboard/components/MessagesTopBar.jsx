import React from 'react';
import styled from 'react-emotion';

const TopBar = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: left;
    margin-bottom: 45px;
    p {
      font-size: 16px;
      margin-bottom: 7px;
    }
`;

const Button = styled.button`
    border: 2px solid #ededed;
    height: 30px;
    width: 100px;
    font-size: 14px;
    background-color: #fff;
    transition: 0.25s all;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;

export const MessagesTopBar = props => (
    <TopBar>
        <p>For treatment related questions, message your provider here anytime! For anything else, email support@dearbrightly.com.</p>
        <Button onClick={props.onClickSendMessage}>Send message</Button>
    </TopBar>
);
