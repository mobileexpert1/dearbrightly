import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { history } from 'src/history';
import { colors, fontFamily } from 'src/variables';

const Wrapper = styled('div')`
    font-size: 16px;
    line-height: 19px;
    color: #000;
    padding-top: 15px;
    padding-left: 10px;
    padding-right: 10px;
    margin-top: -10px;
    border-left: 1px solid ${colors.whitesmoke};
    border-right: 1px solid ${colors.whitesmoke};
    font-family: ${fontFamily.baseFont};
    p {
        margin-bottom: 0;
    }
    .hide {
        display: none;
    }
`;

const EditButton = styled('button')`
    padding: 0;
    text-align: center;
    background-color: transparent;
    border-color: #fff;
    color: #0000EE;
    text-decoration: underline;    
`;

const ShippingAddress = styled('p')`
    margin-top: 10px;  
`;

// this component is being used in payemnt screen only
class ShippingInfoComponent extends React.Component {

  editShippingDetails = () => {
    history.push('/user-dashboard/my-account');
  };

    render() {
        const { shippingDetails, showPriceBreakup, showEditButton } = this.props;

        return (
            <Wrapper className={showPriceBreakup ? '' : 'hide'}>
              <strong>Ship to</strong>:
                <ShippingAddress>
                    <span>
                        {shippingDetails.addressLine1} {''}
                    </span>
                    <span>{shippingDetails.addressLine2} </span>
                </ShippingAddress>
                <p>
                    <span>
                        {shippingDetails.city} {''}
                    </span>
                    <span>
                        {shippingDetails.state}, {''}
                    </span>
                    <span>{shippingDetails.postalCode} </span>
                </p>
              <p>
                {showEditButton && (<EditButton color="link" onClick={ this.editShippingDetails }>Edit</EditButton>)}
              </p> 
            </Wrapper>
        );
    }
}

export const ShippingInfo = connect(state => ({

}))(ShippingInfoComponent);
