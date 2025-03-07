import React from 'react';
import styled from 'react-emotion';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import closeIcon from 'src/assets/images/cancel.svg';
import Logo from 'src/components/Logo';
import { breakpoints } from 'src/variables';

const Wrapper = styled('div')`
    position: relative;
    top: 10px;
    margin-bottom: 25px;
    background: #fff;
    width: 100%;
    ${breakpoints.sm} {
        margin-bottom: 30px;
    }
`;

const CloseSidebar = styled('div')`
    transition: all 0.5s 0s;
    opacity:.5;
    &:hover {
        opacity: 1;
    }
    img {
        width: 28px;
    }
`;

const CustomRow = styled(Row)`
    ${breakpoints.xl} {
        padding: 20px;
    }
    ${breakpoints.xxl} {
        padding: 20px;
    }
    ${breakpoints.xs} {
        padding: 0px;
    }
`

export const SidebarHeader = props => {
    return (

        <Wrapper id='sidebar-header'>
            <CustomRow>
                <Col xs={6}>
                    <Logo position="left" onClick={() => props.toggleCart(false)} />
                </Col>
                <Col xs={6} className="text-right">
                    <CloseSidebar onClick={() => props.toggleCart(false)}>
                        <img src={closeIcon} alt="close" style={{ marginRight: 15 }} />
                    </CloseSidebar>
                </Col>
            </CustomRow>
        </Wrapper>




    );
};