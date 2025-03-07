import React from 'react';
import styled from 'react-emotion';

import { GlobalSearch } from 'src/features/emr/components/GlobalSearch';
import { breakpoints, fontFamily } from 'src/variables';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  font-family: ${fontFamily.baseFont};
`;

const BodyWrapper = styled.div`
  margin: 10px 0 10px 0;
  display: flex;
  ${breakpoints.md} {
    flex-direction: column;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-grow: 3;
  flex-direction: column;
  padding-left: 30px;
  ${breakpoints.md} {
    padding-left: initial;
  }
`;

const EMRNavBar = styled.table`
  margin: 0 90px 0 90px;
  width: 100%;
  height: 50px;
`

const Shade = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  content: "";
  background-color: rgba(0,0,0,0.6);
  z-index: 9000;
  display: block;
  opacity: 0.95 !important;
`

const HomeButton = styled.a`
  color: #5c5c5c;
  font-size: 20px;
  border: none;
  padding: 3px;
  background: none;
  float: Left;
  &:hover {
    background-color: #fff;
    color: #a9a9a9;
    cursor: pointer;
  }
  &:focus {
    box-shadow: none;
    outline: 0;
  }
`;

const SearchButton = styled.button`
  color: #5c5c5c;
  font-size: 20px;
  border: none;
  padding: 3px;
  background: none;
  float: right;
  &:hover {
    background-color: #fff;
    color: #a9a9a9;
    cursor: pointer;
  }
`;

export function withEMRNavContainer (WrappedComponent, route) {
  return class EMRNavContainer extends React.Component {
    constructor(props) {
      super(props);

      const navElems = this.props.match.path.split('/');
      const navParams = this.props.match.params;

      this.state = {
        drawerOpen: false,
      }
    }

    toggleDrawer = () => {
      this.setState({
        drawerOpen: !this.state.drawerOpen
      })
    }

    shadeClick = () => {
      this.setState({
        drawerOpen: false,
      })
    }

    render() {
      return(
        <div>
          <Wrapper>
            <BodyWrapper>
              <EMRNavBar>
                <tr>
                  <td>
                    <HomeButton href="/emr/visits"><i className="fa fa-home"></i></HomeButton>
                  </td>
                  <td>
                    <SearchButton onClick={this.toggleDrawer}><i className="fa fa-search"></i></SearchButton>
                  </td>
                </tr>
              </EMRNavBar>
            </BodyWrapper>
            {this.state.drawerOpen && (
              <div>
                <GlobalSearch toggleDrawer={this.toggleDrawer} drawerOpen={this.state.drawerOpen} />
              </div>
            )}
          </Wrapper>

          
          <WrappedComponent {...this.props} />

          {this.state.drawerOpen &&
            <Shade onClick={this.shadeClick} />
          }
        </div>
      )
    }
  }
}

