import React from 'react';
import styled from 'react-emotion';
import closeIcon from 'src/assets/images/cancel.svg';
import { Container, Row, Col } from 'reactstrap';
import LazyLoad from 'react-lazyload';

const Wrapper = styled('div')`
    position: relative;
    top: 10px;
    margin-bottom: 55px;
    background: #faf8f7;
`;

const CloseSidebar = styled('a')`
    position: absolute;
    left: 15px;
    top: 5px;
    z-index: 9999;
    opacity: 0.5;
    transition: all 0.5s 0s;
    &:hover {
        opacity: 1;
    }
    img {
        width: 28px;
    }
`;

const LogoContainer = () => (
    <img src="https://d17yyftwrkmnyz.cloudfront.net/dearbrightly_rgb_darkb_2x.png"
        height="80%"
        width="25%"
        style={{paddingTop:"3%", paddingLeft:"4%"}}
    />
  )


export const MobileSidebarHeader = props => {
    return (
        <Row style={{height:"7%"}}>
            <Col xs="12" md="12">
            <LazyLoad height={ 50 } offset={ 30 } once>
                <LogoContainer></LogoContainer>
            </LazyLoad>
            </Col>
        </Row>
    );
};