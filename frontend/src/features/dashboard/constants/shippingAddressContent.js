export const shippingAddressInputs = [
  {
    title: 'First name',
    name: 'firstName',
    type: 'text',
    required: true,
  },
  {
    title: 'Last name',
    name: 'lastName',
    type: 'text',
    required: true,
  },
  {
    title: 'Address Line 1',
    name: 'addressLine1',
    type: 'address',
    required: true,
  },
  {
    title: 'Address Line 2',
    name: 'addressLine2',
    type: 'address',
    required: false,
  },
  {
    title: 'City',
    name: 'city',
    type: 'text',
    required: true,
  },
  {
    title: 'State',
    name: 'state',
    type: 'select',
    required: true,
  },

  {
    title: 'Zip Code',
    name: 'postalCode',
    type: 'zip',
    required: true,
  },
  {
    title: 'Phone Number',
    type: 'tel',
    name: 'phone',
    required: true,
  },
];
