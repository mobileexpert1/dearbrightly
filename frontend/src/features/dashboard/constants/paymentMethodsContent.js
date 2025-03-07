import visaIcon from 'src/assets/images/visaCard.svg';
import masterCardIcon from 'src/assets/images/masterCard.svg';
import aeIcon from 'src/assets/images/aeCard.svg';
import discIcon from 'src/assets/images/discCard.svg';

export const paymentInputs = ['Card number', 'Expiration date', 'CVC'];

export const cardIcons = [visaIcon, masterCardIcon, aeIcon, discIcon];

export const cardsKeyIconMapping = {
  "visa": visaIcon,
  "mastercard": masterCardIcon,
  "americanExpress": aeIcon,
  "discover":  discIcon
}
