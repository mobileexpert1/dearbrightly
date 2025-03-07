import React from 'react';
import { connect } from 'react-redux';
import { CustomSpinner } from "src/common/components/CustomSpinner";
import { updateCustomerDataRequest } from 'src/features/customers/actions/customersActions';
import { ShippingAddress } from 'src/features/dashboard/components/ShippingAddress';
import { MyProfile } from 'src/features/dashboard/components/MyProfile';
import { validateUserEntry } from 'src/features/dashboard/helpers/validateUserEntry';
import { myAccountTabs } from 'src/features/dashboard/constants/myAccountPage';
import { isUpdatingAccountDetails } from 'src/features/user/selectors/userSelectors';
import { MessageBar } from 'src/features/dashboard/shared/components/Messages';
import { successMessages } from 'src/features/dashboard/constants/myAccountPage';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { stripeConnectFetchUserIdRequest } from 'src/features/checkout/actions/paymentActions';
import { SubscriptionShippingAddress } from '../components/SubscriptionShippingAddress';
import UpdatePaymentMethod from '../components/UpdatePaymentMethod';
import { convertPhoneNumberToDigitsOnly } from '../helpers/convertPhoneNumberToDigitsOnly';

class EditMyAccountDetailsContainer extends React.Component {
  constructor(props) {
    super(props);
    const { user } = this.props;
    this.state = {
      optInSmsAppNotifications: user ? user.optInSmsAppNotifications : false,
      accountDetails: {
        id: user ? user.id : '',
        email: user ? user.email : '',
        firstName: user ? user.firstName : '',
        lastName: user ? user.lastName : '',
      },
      shippingDetails: {
        firstName: user && user.shippingDetails ? user.shippingDetails.firstName : '',
        lastName: user && user.shippingDetails ? user.shippingDetails.lastName : '',
        addressLine1: user && user.shippingDetails ? user.shippingDetails.addressLine1 : '',
        addressLine2: user && user.shippingDetails ? user.shippingDetails.addressLine2 : '',
        city: user && user.shippingDetails ? user.shippingDetails.city : '',
        state: user && user.shippingDetails ? user.shippingDetails.state : '',
        postalCode: user && user.shippingDetails ? user.shippingDetails.postalCode : '',
        phone: user && user.shippingDetails ? user.shippingDetails.phone : '',
      },
      isSubmitted: false,
      isRequiredFieldEmpty: false,
    };
  }

  componentDidMount() {
    const { 
      selectedTab, 
      stripeConnectFetchUserIdRequest,
    } = this.props;
    const urlParams = new URLSearchParams(window.location.search);

    // only want this to get called once
    if (selectedTab === myAccountTabs.myProfile) {
      if (urlParams.has('code')) {
        const userUUID = urlParams.get('state')
        const stripeAuthorizationCode = urlParams.get('code')
        stripeConnectFetchUserIdRequest(userUUID, stripeAuthorizationCode);
      }
    }
  }

  handleUpdateUserShippingDetails = event => {
    const { accountDetails, shippingDetails, optInSmsAppNotifications } = this.state;

    event.preventDefault();

    this.setState({ isRequiredFieldEmpty: false });

    if (validateUserEntry(shippingDetails)) {
      let filteredShippingDetails = Object.fromEntries(Object.entries(shippingDetails).filter(([_, v]) => (v != null && v!='')));

      const cleanedPhone = convertPhoneNumberToDigitsOnly(filteredShippingDetails["phone"]);
      if (cleanedPhone && cleanedPhone.length > 0){
        filteredShippingDetails["phone"] = cleanedPhone;
        let userData = {
          id: accountDetails.id,
          shippingDetails: filteredShippingDetails,
        }
        if (optInSmsAppNotifications != null) {
          userData['optInSmsAppNotifications'] = optInSmsAppNotifications
        }
        this.props.updateCustomerDataRequest(userData);
      } else {
        this.setState(state => ({
          shippingDetails: { ...state.shippingDetails, phone: '' },
          isRequiredFieldEmpty: true,
        }));
      }
    } else {
      this.setState({ isRequiredFieldEmpty: true});
    }

    this.setState({ isSubmitted: true });
  };

  handleUpdateAccountDetails = event => {
    const { accountDetails, optInSmsAppNotifications } = this.state;

    event.preventDefault();

    if (accountDetails.firstName || accountDetails.lastName || accountDetails.phone) {
      const userData = {
        id: accountDetails.id,
        firstName: accountDetails.firstName,
        lastName: accountDetails.lastName,
        shippingDetails: { 'phone': accountDetails.phone },
      }
      if (optInSmsAppNotifications != null) {
        userData['optInSmsAppNotifications'] = optInSmsAppNotifications
      }
      this.props.updateCustomerDataRequest(userData);
    }

    this.setState({ isSubmitted: true });
  };

  handleShippingDetailsChange = event => {
    const { name, value } = event.target;

    this.setState(state => ({
      shippingDetails: { ...state.shippingDetails, [name]: value },
    }));
  };

  toggleSubmitted = () => {
    this.setState({ isSubmitted: false });
  };

  handleAccountDetailsChange = event => {
    const { name, value } = event.target;

    this.setState(state => ({
      accountDetails: { ...state.accountDetails, [name]: value },
    }));
  };

  handleOptInSmsNotificationsChange = () => {
    this.setState(state => ({ optInSmsAppNotifications: !state.optInSmsAppNotifications }));
  };

  handleStripeConnectOAuthRequest = () => {
    const { user } = this.props;
    const STRIPE_CLIENT_ID = getEnvValue('STRIPE_CLIENT_ID');

    window.location = `https://connect.stripe.com/express/oauth/authorize?redirect_uri=http://localhost:8080/user-dashboard/my-account&client_id=${ STRIPE_CLIENT_ID }&state=${ user.id }&suggested_capabilities[]=transfers&stripe_user[business_type]=individual&stripe_user[email]=${ user.email }&stripe_user[first_name]=${ user.firstName}&stripe_user[last_name]=${ user.lastName}&stripe_user[phone_number]=${ user.shippingDetails.phone }`;
  };

  subscriptionsByShippingDetails = (subscriptions) => {
    const { user } = this.props;
    if (subscriptions) {
      const subscriptionsByShippingDetails = subscriptions.reduce((accumulator, currentValue) => {
        if (currentValue.shippingDetails) {
          const key = currentValue.shippingDetails.id;
          if(!accumulator[key]){
            accumulator[key] = [];
          }
          accumulator[key].push(currentValue);
        }
        return accumulator;
      }, {});
      
      return (
        Object.entries(subscriptionsByShippingDetails).map(([_, v]) => {
          return (
            <SubscriptionShippingAddress
              associatedSubscriptions={v}
              shippingDetails={v[0].shippingDetails}
              user={user}
            />
          )
        })
      )
    }
  }

  render() {
    const {
      user,
      updateAccountDetailsErrorMessage,
      isUpdatedSuccessfully,
      selectedTab,
      isUpdatingAccountDetails,
      subscriptions,
    } = this.props;

    const { isSubmitted, accountDetails, optInSmsAppNotifications, isRequiredFieldEmpty } = this.state;
    const displaySuccessMessage =
      isSubmitted &&
      validateUserEntry(accountDetails) &&
      !updateAccountDetailsErrorMessage &&
      isUpdatedSuccessfully;
    const displayErrorMessage =
      isSubmitted && validateUserEntry(accountDetails) && updateAccountDetailsErrorMessage;
    const shippingDetails = user ? user.shippingDetails : null;

    return (
      <React.Fragment>
        <CustomSpinner spinning={isUpdatingAccountDetails} blur={true} animate={false}>
          {displaySuccessMessage && <MessageBar messageContent={successMessages.myProfile} />}
          {displayErrorMessage && (
              <MessageBar isErrorMessage messageContent={updateAccountDetailsErrorMessage} />
          )}
          {selectedTab === myAccountTabs.shippingAddress && (
              <React.Fragment>
                <ShippingAddress
                    shippingDetails={shippingDetails}
                    optInSmsAppNotifications={optInSmsAppNotifications}
                    handleUpdateDetails={this.handleUpdateUserShippingDetails}
                    toggleSubmitted={this.toggleSubmitted}
                    handleChange={this.handleShippingDetailsChange}
                    handleOptInSmsNotificationsChange={this.handleOptInSmsNotificationsChange}
                    formShippingDetails={this.state.shippingDetails}
                    displaySuccessMessage={displaySuccessMessage}
                    displayErrorMessage={displayErrorMessage}
                    isSubmitted={isSubmitted}
                    isRequiredFieldEmpty={isRequiredFieldEmpty}
                    errorMessage={updateAccountDetailsErrorMessage}
                    isDefault={true}
                />
                {subscriptions && subscriptions.length > 0 && (
                    <React.Fragment>
                      {this.subscriptionsByShippingDetails(subscriptions)}
                    </React.Fragment>
                )}
              </React.Fragment>
          )}
          {selectedTab === myAccountTabs.myProfile && (
            <MyProfile
              handleUpdateDetails={this.handleUpdateAccountDetails}
              toggleSubmitted={this.toggleSubmitted}
              handleChange={this.handleAccountDetailsChange}
              handleStripeConnectOAuthRequest={this.handleStripeConnectOAuthRequest}
              user={user}
              accountDetails={accountDetails}
              displaySuccessMessage={displaySuccessMessage}
              displayErrorMessage={displayErrorMessage}
              isSubmitted={isSubmitted}
              optInSmsAppNotifications={optInSmsAppNotifications}
              handleOptInSmsNotificationsChange={this.handleOptInSmsNotificationsChange}
            />
          )}
          {selectedTab === myAccountTabs.paymentMethod && (
            <UpdatePaymentMethod
              subscriptions={subscriptions}
            />
          )}
        </CustomSpinner>
      </React.Fragment>
    );
  }
}

export const EditMyAccountDetails = connect(
  state => ({
    user: state.user.user,
    updateAccountDetailsErrorMessage: state.user.updateAccountDetailsErrorMessage,
    isUpdatedSuccessfully: state.user.isUpdatedSuccessfully,
    isUpdatingAccountDetails : isUpdatingAccountDetails(state),
  }),
  {
    updateCustomerDataRequest,
    stripeConnectFetchUserIdRequest,
  },
)(EditMyAccountDetailsContainer);
