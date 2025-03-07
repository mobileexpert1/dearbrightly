import React from 'react';
import { connect } from 'react-redux';
import { ShippingAddress } from './ShippingAddress';
import { updateShippingDetailsRequest, clearSubscriptionErrorMessage } from 'src/features/subscriptions/actions/subscriptionsActions';
import { isUpdateShippingDetailsSuccess, updateShippingDetailsError } from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { validateUserEntry } from 'src/features/dashboard/helpers/validateUserEntry';
import { convertPhoneNumberToDigitsOnly } from '../helpers/convertPhoneNumberToDigitsOnly';

class SubscriptionShippingAddressComponent extends React.Component{
  constructor(props){
    super(props);
    const { shippingDetails } = this.props;
    this.state = {
      isSubmitted: false,
      isRequiredFieldEmpty: false,
      shippingDetailsForm: {
        firstName: shippingDetails ? shippingDetails.firstName : '',
        lastName: shippingDetails ? shippingDetails.lastName : '',
        addressLine1: shippingDetails ? shippingDetails.addressLine1 : '',
        addressLine2: shippingDetails ? shippingDetails.addressLine2 : '',
        city: shippingDetails ? shippingDetails.city : '',
        state: shippingDetails ? shippingDetails.state : '',
        postalCode: shippingDetails ? shippingDetails.postalCode : '',
        phone: shippingDetails ? shippingDetails.phone : '',
      },
    }
  }

  handleChange = event => {
    const { name, value } = event.target;
    this.setState(state => ({
      shippingDetailsForm: { ...state.shippingDetailsForm, [name]: value },
    }));
  }

  toggleSubmitted = () => {
    this.setState({ isSubmitted: false });
  };

  hasShippingDetailsDataChanged = () => {
    const { shippingDetailsForm } = this.state;
    const { shippingDetails } = this.props;
    for (const key in shippingDetailsForm){
      if(shippingDetails.hasOwnProperty(key)){
        if(shippingDetails[key] !== shippingDetailsForm[key]){
          return true;
        }
      }
    }
    return false;
  }

  handleUpdateShippingDetails = event => {
    event.preventDefault();
    const {
      associatedSubscriptions,
      updateShippingDetailsRequest,
      clearSubscriptionErrorMessage,
      shippingDetails,
      user,
    } = this.props;
    const { shippingDetailsForm } = this.state;

    clearSubscriptionErrorMessage();
    this.setState({ isRequiredFieldEmpty: false});

    if (
      this.hasShippingDetailsDataChanged() &&
      shippingDetailsForm &&
      user &&
      user.id &&
      associatedSubscriptions
    ){
      if (!validateUserEntry(shippingDetailsForm)) {
        this.setState({ isRequiredFieldEmpty: true});
      } else {
        const cleanedPhone = convertPhoneNumberToDigitsOnly(shippingDetailsForm["phone"]);
        if (cleanedPhone && cleanedPhone.length > 0) {
          shippingDetailsForm["phone"] = cleanedPhone;
          const data = {
            "id": shippingDetails.id,
            "customerId": user.id,
            "shippingDetails": shippingDetailsForm,
            "subscriptions": associatedSubscriptions,
          }
          updateShippingDetailsRequest({ data });
          this.setState({ isSubmitted: true });
        } else {
          this.setState(state => ({
            shippingDetailsForm: { ...state.shippingDetailsForm, phone: '' },
            isRequiredFieldEmpty: true,
          }));
        }
      }
    }
  }

  render(){
    const { 
      associatedSubscriptions,
      shippingDetails,
      isUpdateShippingDetailsSuccess,
      updateShippingDetailsError,
    } = this.props;
    const { shippingDetailsForm, isSubmitted, isRequiredFieldEmpty } = this.state;
    const displaySuccessMessage = isSubmitted && isUpdateShippingDetailsSuccess;
    const displayErrorMessage = isSubmitted && validateUserEntry(shippingDetailsForm) && updateShippingDetailsError;
    return (
        <ShippingAddress 
            shippingDetails={shippingDetails}
            formShippingDetails={shippingDetailsForm}
            handleUpdateDetails={this.handleUpdateShippingDetails}
            toggleSubmitted={this.toggleSubmitted}
            handleChange={this.handleChange}
            displaySuccessMessage={displaySuccessMessage}
            displayErrorMessage={displayErrorMessage}
            isSubmitted={isSubmitted}
            errorMessage={updateShippingDetailsError}
            isRequiredFieldEmpty={isRequiredFieldEmpty}
            associatedSubscriptions={associatedSubscriptions}
        />
    );
  }
};

export const SubscriptionShippingAddress = connect(
    state => ({
        isUpdateShippingDetailsSuccess: isUpdateShippingDetailsSuccess(state),
        updateShippingDetailsError: updateShippingDetailsError(state),
    }),
    {
      updateShippingDetailsRequest,
      clearSubscriptionErrorMessage,
    },
  )(SubscriptionShippingAddressComponent);
