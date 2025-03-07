export const convertPhoneNumberToDigitsOnly = (phoneNumber) => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    return cleanPhoneNumber;
}
