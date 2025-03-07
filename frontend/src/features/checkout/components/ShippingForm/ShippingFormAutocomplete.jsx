import React, { Component } from 'react';
import styled from 'react-emotion';
import Script from 'react-load-script';

import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { getAddressDictFromGooglePlaces } from 'src/features/checkout/helpers/getAddressDictFromGooglePlaces';

const FormInput = styled.input`
  width: 100%;
  border: ${props => `1px solid ${props.hasError ? 'red' : '#ededed'}`};
  border-radius: 4px;
  font-size: 14px;
  height: 48px;
  line-height: 1;
  padding: 0 15px;
  border: 1px solid rgb(230, 224, 224);
  outline: 0;
  &:focus {
    box-shadow: none;
  }
`;

const googleApiKey = getEnvValue('GOOGLE_PLACES_API_KEY');
const googleApiUrl = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;

export class ShippingFormAutocomplete extends Component {
  componentWillUnmount() {
    const autocomplete = document.getElementsByClassName('pac-container')[0];
    if (autocomplete) {
      autocomplete.parentNode.removeChild(autocomplete);
    }
  }

  handleScriptLoad = () => {
    const options = {
      types: ['geocode'],
    };

    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      options,
    );

    this.autocomplete.setFields(['address_components', 'formatted_address']);
    this.autocomplete.setComponentRestrictions({ country: ['us'] });
    this.autocomplete.addListener('place_changed', this.handlePlaceChanged);
    this.handlePlaceChanged();
  };

  handlePlaceChanged = () => {
    const addressObject = this.autocomplete.getPlace();
    const placesList = addressObject ? addressObject.address_components : null;

    if (placesList) {
      const addressDict = getAddressDictFromGooglePlaces(placesList);

      for (var key in addressDict) {
        const shippingDetailsKeyName = `shippingDetails.${key}`;
        this.props.setFieldValue(shippingDetailsKeyName, addressDict[key]);
        document.getElementsByName(shippingDetailsKeyName)[0].value = addressDict[key];
      }

      document.getElementsByName('shippingDetails.phone')[0].focus();
    }
  };

  setGoogleAutocompleteVisible = () => {
    if (document.getElementsByClassName('pac-container')[0]) {
      document.getElementsByClassName('pac-container')[0].style.zIndex = '10000';
    }
  }

  render() {
    return (
      <div>
        <Script url={googleApiUrl} onLoad={this.handleScriptLoad} />
        <FormInput
          name="shippingDetails.addressLine1"
          id="autocomplete"
          defaultValue={this.props.defaultValue}
          autoComplete="off"
          placeholder=""
          onChange={this.props.onChange}
          onBlur={this.props.handleBlur}
          hasError={this.props.hasError}
          onFocus={this.setGoogleAutocompleteVisible}
        />
      </div>
    );
  }
}
