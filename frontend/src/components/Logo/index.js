import React from 'react';
import styled from 'react-emotion';
import NavbarBrand from 'reactstrap/lib/NavbarBrand';
import { breakpoints } from 'src/variables';
const logo = 'https://d17yyftwrkmnyz.cloudfront.net/dearbrightly_rgb_darkb_2x.png';

const Brand = styled(NavbarBrand)`
  background: url(${logo}) ${props => !props.position ? 'center' : props.position} no-repeat;
  background-size: 80px;
  height: 33px;
  width: 100%;
  padding: 0;
  margin: 0;
  transition: all 0.4s ease-in-out 0s;
  position: relative;
  cursor: pointer;

  ${breakpoints.sm} {
    left: 10px;
    height: 33px;
    margin-left: 10px;
    background-position-x: left;
  }

  ${breakpoints.md} {
    width: 200px;
  }

  @media (min-width: 992px) {
    background: url(${logo}) center left no-repeat;
    background-size: 110px 45px;
    height: 45px;
    margin: inherit;
    position: absolute;
    width: 110px;
    margin-right: 40px;
  }
  @media (max-width: 768px) {
    width: 55%;
  }
`;

const Logo = ({ onClick, position }) => {
  return (
    <Brand onClick={onClick} position={position} />
  );
};

export default Logo;
