import { shippingAddressInputs } from 'src/features/dashboard/constants/shippingAddressContent';

export const validateUserEntry = shippingDetails => {
  let i;
  for (i = 0; i < shippingAddressInputs.length; i++) {
    if (shippingAddressInputs[i].required) {
      const userInput = shippingDetails[shippingAddressInputs[i].name];
      if (!userInput || userInput.length === 0) {
        return false;
      }
    }
  }
  return true;
}
