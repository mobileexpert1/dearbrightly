import { store } from 'src/';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import moment from "moment";
const DEBUG = getEnvValue('DEBUG');
const MAXIMUM_PHI_IDENTIFIER_AGE = 89;  // Max age that exposing age is allowed for PHI identification purposes

export const GTMUtils = {
  getExternalId: () => {
    const { user } = store.getState().user;
    let externalId = null;
    if (user && user.id) {
      externalId = user.id.hashCode().toString();
    } else {
      const anonymousId = localStorage.getItem('ajs_anonymous_id');
      if (anonymousId) {
        externalId = anonymousId.replace(/"/g, '');
      }
    }
    return externalId;
  },
  getUserTraits: () => {
    const { user } = store.getState().user;
    let traits = {
        user_type: 'visitor'
    };

    const externalId = GTMUtils.getExternalId();
    if (externalId) {
        traits['user_id'] = externalId;
    }

    if (user) {
      const currentDate = moment();
      const yearsDuration = currentDate.diff(user.dob, 'years');
      const isLTEMaxPHIAge = yearsDuration <= MAXIMUM_PHI_IDENTIFIER_AGE;

      traits = {
        user_type: 'member',
        user_gender: user.gender ? user.gender : null,
        user_age: isLTEMaxPHIAge ? yearsDuration : null,
      };
      if (user.shippingDetails) {
        traits['user_state'] = user.shippingDetails.state;
        traits['user_country'] = user.shippingDetails.country;        
      }
    }

    return traits;
  },
  trackCall: (eventName, properties = {}, additionalUserTraits = {}) => {
    const userTraits = GTMUtils.getUserTraits();
    if (DEBUG) {
      
      // eslint-disable-next-line no-console
      console.info(`GTM event "${eventName}" properties: ${JSON.stringify(properties)} traits: ${JSON.stringify(userTraits)} more traits: ${JSON.stringify(additionalUserTraits)}`);

      //return;
    }

    let gtmEventData = {
        'event': eventName,
        ...properties,
        ...userTraits,
        ...additionalUserTraits
    };
    if (DEBUG) {
      console.log('gtm dataLayer push', gtmEventData);
    }
    dataLayer.push(gtmEventData);

  },
};
