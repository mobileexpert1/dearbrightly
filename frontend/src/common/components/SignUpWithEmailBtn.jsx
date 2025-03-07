import React from 'react';
import styled from 'react-emotion';
import { fontFamily, fontWeight } from 'src/variables';

const SignUpEmailBtn = styled('button')`
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid transparent;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 40px;
    font-family: ${fontFamily.baseFont};
    background: #24272A
        url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNTEycHgiIGhlaWdodD0iMzkwcHgiIHZpZXdCb3g9IjAgMCA1MTIgMzkwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1Mi4yICg2NzE0NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+ZW1haWw8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iZW1haWwiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik00NjcsMCBMNDUsMCBDMjAuMjE4LDAgMCwyMC4xOTYgMCw0NSBMMCwzNDUgQzAsMzY5LjcyIDIwLjEyOCwzOTAgNDUsMzkwIEw0NjcsMzkwIEM0OTEuNzIsMzkwIDUxMiwzNjkuODcyIDUxMiwzNDUgTDUxMiw0NSBDNTEyLDIwLjI4IDQ5MS44NzIsMCA0NjcsMCBaIE00NjAuNzg2LDMwIEwyNTYuOTU0LDIzMy44MzMgTDUxLjM1OSwzMCBMNDYwLjc4NiwzMCBaIE0zMCwzMzguNzg4IEwzMCw1MS4wNjkgTDE3NC40NzksMTk0LjMwOSBMMzAsMzM4Ljc4OCBaIE01MS4yMTMsMzYwIEwxOTUuNzgzLDIxNS40MyBMMjQ2LjQ0LDI2NS42NTIgQzI1Mi4zMDQsMjcxLjQ2NiAyNjEuNzY3LDI3MS40NDcgMjY3LjYwNywyNjUuNjA2IEwzMTcsMjE2LjIxMyBMNDYwLjc4NywzNjAgTDUxLjIxMywzNjAgWiBNNDgyLDMzOC43ODcgTDMzOC4yMTMsMTk1IEw0ODIsNTEuMjEyIEw0ODIsMzM4Ljc4NyBaIiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==');
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
            url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNTEycHgiIGhlaWdodD0iMzkwcHgiIHZpZXdCb3g9IjAgMCA1MTIgMzkwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1Mi4yICg2NzE0NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+ZW1haWw8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iZW1haWwiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik00NjcsMCBMNDUsMCBDMjAuMjE4LDAgMCwyMC4xOTYgMCw0NSBMMCwzNDUgQzAsMzY5LjcyIDIwLjEyOCwzOTAgNDUsMzkwIEw0NjcsMzkwIEM0OTEuNzIsMzkwIDUxMiwzNjkuODcyIDUxMiwzNDUgTDUxMiw0NSBDNTEyLDIwLjI4IDQ5MS44NzIsMCA0NjcsMCBaIE00NjAuNzg2LDMwIEwyNTYuOTU0LDIzMy44MzMgTDUxLjM1OSwzMCBMNDYwLjc4NiwzMCBaIE0zMCwzMzguNzg4IEwzMCw1MS4wNjkgTDE3NC40NzksMTk0LjMwOSBMMzAsMzM4Ljc4OCBaIE01MS4yMTMsMzYwIEwxOTUuNzgzLDIxNS40MyBMMjQ2LjQ0LDI2NS42NTIgQzI1Mi4zMDQsMjcxLjQ2NiAyNjEuNzY3LDI3MS40NDcgMjY3LjYwNywyNjUuNjA2IEwzMTcsMjE2LjIxMyBMNDYwLjc4NywzNjAgTDUxLjIxMywzNjAgWiBNNDgyLDMzOC43ODcgTDMzOC4yMTMsMTk1IEw0ODIsNTEuMjEyIEw0ODIsMzM4Ljc4NyBaIiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==');
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
`;

export default class SignUpWithEmailBtn extends React.Component {
    render() {
        const { width, onClick } = this.props;
        return (
            <SignUpEmailBtn width={width} onClick={onClick}>
                Sign up with Email
            </SignUpEmailBtn>
        );
    }
}
