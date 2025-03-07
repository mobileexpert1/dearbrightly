import React from 'react';
import { connect } from 'react-redux';

import ForgotPasswordContainer from '../../auth/containers/ForgotPasswordContainer';
import BottomNav from 'src/features/checkout/components/BottomNav';

class ForgotPasswordCheckoutContainer extends React.Component {
  render() {
    const { handleShowView, navigateBack, navigateCheckout } = this.props;
    return (
      <React.Fragment>
        <ForgotPasswordContainer topClass="cart-forgot" navigateCheckout={navigateCheckout} />
        <BottomNav
          currentCheckoutStepName={"forgot password"}
          backButtonType={"arrow"}
          backButtonClick={navigateBack}
          backButtonTitle={"Back"}
          disableBackButton={true}
          disableNextButton={false}
          hideNextButtonArrow={true}
          hideBackButton={false}
          nextButtonClick={e => handleShowView('sign_in', e)}
          nextTitle={'Continue'}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  order: state.order.data,
});

export default connect(mapStateToProps)(ForgotPasswordCheckoutContainer);
