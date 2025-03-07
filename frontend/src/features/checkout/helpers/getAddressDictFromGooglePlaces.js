export const getAddressDictFromGooglePlaces = (placesList) => {
  var addressDict = {};

  placesList.map(placesItem =>
  {
    const placesValueLongName = placesItem.long_name;
    const placesValueShortName = placesItem.short_name;

    if (placesItem.types.includes('postal_code')) {
      addressDict['postalCode'] = placesValueLongName;
    };

    if (placesItem.types.includes('administrative_area_level_1')) {
      addressDict['state'] = placesValueShortName;
    };

    // ---- Merge street number and name for addressLine1 ----
    if (placesItem.types.includes('street_number')) {
      const addressLine1 = addressDict['addressLine1'];
      if (addressLine1) {
        addressDict['addressLine1'] = `${placesValueLongName} ${addressLine1}`;
      } else {
         addressDict['addressLine1'] = placesValueLongName;
      }
    };
    if (placesItem.types.includes('route')) {
      const addressLine1 = addressDict['addressLine1'];
      if (addressLine1) {
        addressDict['addressLine1'] = `${addressLine1} ${placesValueLongName}`;
      } else {
         addressDict['addressLine1'] = placesValueLongName;
      }
    };

    // ---- Use the sub-locality if city is not populated ----
    if (placesItem.types.includes('locality')) {
      addressDict['city'] = placesValueLongName;   // if short name, you might get SF vs San Francisco
    };
    if (placesItem.types.includes('sublocality')) {
      if (!addressDict['city']) {                 // locality and sub-locality might be mutually exclusive, so this check might be redundant
        addressDict['city'] = placesValueLongName;
      }
    };

  });

  return addressDict;
}
