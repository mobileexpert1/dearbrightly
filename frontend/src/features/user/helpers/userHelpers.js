import moment from 'moment';
import allowedStates from 'src/core/constants/allowedStates';
import { MINIMUM_AGE, MAXIMUM_AGE } from 'src/features/user/constants/userContants';

export const isUserEligibleForService = (dateOfBirth, shippingAddressState) => {
  const formattedDob = moment(dateOfBirth, 'YYYY-M-D', true)
  dateOfBirth = formattedDob.isValid() ? formattedDob : null;

  const isStateAllowed = allowedStates.filter(item => item === shippingAddressState).length > 0;
  const currentDate = moment();
  const yearsDuration = currentDate.diff(dateOfBirth, 'years');
  const isGTEMinAge = yearsDuration >= MINIMUM_AGE;
  const isLTEMaxAge = yearsDuration <= MAXIMUM_AGE;

  // ---- no shipping address state selected, no dob is entered (possibly a partial dob entered) ----
  if (!shippingAddressState && !dateOfBirth) {
    return {
      "isEligible": false,
      "error": null
    }
  }

  // ---- no shipping address state selected, but dob is entered ----
  if (!shippingAddressState) {
    if (!isLTEMaxAge) {
      return {
        "isEligible": false,
        "error": "Please enter a valid year."
      };
    };

    if (!isGTEMinAge) {
      return {
        "isEligible": false,
        "error": "We're sorry. You're not eligible just yet."
      };
    };
    return {
      "isEligible": false,
      "error": "Please select a state."
    }
  }

  // ---- no dob entered, but shipping address state selected ----
  if (!dateOfBirth) {
    if (!isStateAllowed) {
      return {
        "isEligible": false,
        "error": "We're sorry. We're not in your state just yet."
      }
    };
    return {
      "isEligible": false,
      "error": null
    }
  }

  // ---- dob and shipping address entered ----
  if (!isStateAllowed) {
    return {
      "isEligible": false,
      "error": "We're sorry. We're not in your state just yet."
    }
  };

  if (!isLTEMaxAge) {
    return {
      "isEligible": false,
      "error": "Please enter a valid year."
    };
  };

  if (!isGTEMinAge) {
    return {
      "isEligible": false,
      "error": "We're sorry. You're not eligible just yet."
    };
  };

  return {
    "isEligible": true,
    "error": null
  };
};

