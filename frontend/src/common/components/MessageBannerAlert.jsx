import { Alert } from 'reactstrap';
import React from 'react';
import styled from 'react-emotion';
import { breakpoints } from "src/variables"

const AlertContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 10px;

    .alert {
        width: 70%;
        margin: 0 auto;
        ${breakpoints.md} {
            width: 100%;
        }
        text-align: center;
        margin-top: 6px;
    }
`;

const MessageBannerAlert = ({ text, color, hrefText=null, hrefUrl=null}) => {
    return (
        <AlertContainer>
            <Alert color={color}>{text}
            <br/>
                { hrefText && <a href={hrefUrl}><u>{hrefText}</u></a> }
            </Alert>
        </AlertContainer>
    );
};

export default MessageBannerAlert;
