import React from 'react';
import styled from 'react-emotion';
import { isInstagramWebview } from 'src/common/helpers/userAgent';
import { fontFamily, fontWeight } from 'src/variables';

const Wrapper = styled('div')`
    padding: 10px 0;
`;

const Button = styled('button')`
    color: #fff;
    border-radius: 0;
    font-size: 16px;
    font-weight: bold;
    border: 2px solid transparent;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 40px;
    font-family: ${fontFamily.baseFont};
    background: #3b5998
        url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPjxnPjxnPjxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjRkZGRkZGIi8+PC9nPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4=);
    background-repeat: no-repeat;
    background-size: 17px;
    background-position: 14px center;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    width: ${props => (props.width ? props.width : 'auto')};
    &:hover {
        color: #000;
        background: transparent
            url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48Zz48cGF0aCBkPSJNMjg4LDE3NnYtNjRjMC0xNy42NjQsMTQuMzM2LTMyLDMyLTMyaDMyVjBoLTY0Yy01My4wMjQsMC05Niw0Mi45NzYtOTYsOTZ2ODBoLTY0djgwaDY0djI1Nmg5NlYyNTZoNjRsMzItODBIMjg4eiIvPjwvZz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PC9zdmc+);
        border: 2px solid #000;
        background-repeat: no-repeat;
        background-size: 17px;
        background-position: 14px center;
        text-decoration: none;
    }
    &:focus {
        box-shadow: none;
        outline: none;
    }
    @media (max-width: 320px) {
        font-size: 14px;
    }
`;

const Or = styled('div')`
    text-align: center;
    color: #BDBDBD;
    font-weight: bold;
    font-family: ${fontFamily.baseFont};
    padding: 20px 0 0;
    position: relative;
    margin-top: 6px;
    font-size: 10px;
    &:before {
        content: '';
        position: absolute;
        left: 0;
        width: 45%;
        height: 4px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.28);
        top: 50%;
    }
    &:after {
        content: '';
        position: absolute;
        right: 0;
        width: 45%;
        height: 4px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.28);
        top: 50%;
    }
`;

export default class FbButton extends React.Component {
    render() {
        const { text, orAlign, width, onClick, props } = this.props;
        return (
            <div>
                {isInstagramWebview() === false ? (<Wrapper>
                    <React.Fragment>
                        <Button
                            style={{
                                borderRadius: 4
                            }}
                            id="facebookCreateAccount"
                            onClick={e => {
                                if (props) {
                                    onClick(e, props);
                                } else {
                                    onClick(e);
                                }
                            }}
                            width={width}
                            type="submit"
                        >
                            {text}
                        </Button>

                        <Or align={orAlign}>OR</Or>
                    </React.Fragment>
                </Wrapper>) : null}
            </div>

        );
    }
}
