import React, { Component } from 'react';
import { connect } from 'react-redux';
import { unsubscribeCustomerRequest } from 'src/features/customers/actions/customerActions';
import {
  isCustomerUnsubscribing,
  isCustomerUnsubscribeSuccess,
  getCustomerErrorMessage
} from 'src/features/customers/selectors/customerSelectors';
import { Spinner } from 'reactstrap';
import { colors } from 'src/variables';


import styled from 'react-emotion';


const Container = styled.div`
  justify-content: center;
  align-items: center;
  padding: 50px 100px;
  flex-direction: column;
  text-align: center;
`;

const UnsubscribeText = styled.p`
  padding-top:'30px';
  font-size: 28px;
  line-height: 43px;
  color: ${colors.blumine};
`;


class UnsubscribeContainer extends Component {

  componentDidMount() {
    const { unsubscribeCustomerRequest } = this.props;
    const { email, token } = this.props.match.params;

    if (email && token) {
      unsubscribeCustomerRequest(email, token);
    }
  }

  unsubscribeCustomer = (email, token) => {
    const { unsubscribeCustomerRequest } = this.props;

    unsubscribeCustomerRequest(email, token);
  };

  render() {
    const { errorMessage, customerUnsubscribing, customerUnsubscribeSuccess } = this.props;

    return (
      <Container>
        {customerUnsubscribing && <Spinner color="primary"/>}
         {customerUnsubscribeSuccess && (
           <UnsubscribeText>Unsubscribe Confirmed</UnsubscribeText>
         )}
         {errorMessage && (
           <UnsubscribeText>Unable to unsubscribe. Please contact support@dearbrightly.com</UnsubscribeText>
         )}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  customerUnsubscribing: isCustomerUnsubscribing(state),
  customerUnsubscribeSuccess: isCustomerUnsubscribeSuccess(state),
  errorMessage: getCustomerErrorMessage(state)
});

export default connect(
  mapStateToProps,
  { unsubscribeCustomerRequest },
)(UnsubscribeContainer);
