import optimizely from '@optimizely/optimizely-sdk'
import { getCookie, setCookie } from 'src/common/helpers/manageCookies';
import { uuidv4 } from 'src/common/helpers/uuidv4';
import { getEnvValue } from 'src/common/helpers/getEnvValue';

const PROJECT_ID = getEnvValue('OPTIMIZELY_PROJECT_ID');
const PROJECT_JSON_URL = `https://cdn.optimizely.com/datafiles/${PROJECT_ID}.json`
const DEBUG = getEnvValue('DEBUG');

// Singleton instance of the Optimizely object
var client;

// In-memory copy of the datafile. We could also keep this in some form of cache like redis or memcached
var datafile;

// Optimizely end user ID used for event tracking
var userId;

optimizely.setLogger(null);

function fetchDatafile() {
  return new Promise((resolve, reject) => {
    fetch(PROJECT_JSON_URL, {mode: 'cors'})
      .then(async (response) => {
        resolve(response.json());
    });
  });
}

function getClient(fetch=false) {
  return new Promise((resolve, reject) => {
      if (fetch || !datafile) {
        fetchDatafile().then(datafile => {
          if (DEBUG) {
            console.log('[OptimizelyService][getClient] Datafile:');
            console.log(datafile);
          }
          const newClient = optimizely.createInstance({
            datafile,
            skipJSONValidation: true, // This should be set to false if the datafile is manually modified in any way
          });
          if (DEBUG) {
            console.log('[OptimizelyService][getClient] New client:');
            console.log(newClient);
          }
          resolve(newClient)
        });
      } else {
        if (DEBUG) {
          console.log('[OptimizelyService][getClient] Client:');
          console.log(client);
        }
        resolve(client)
      }
  });
}

// Try to get the variation from the cookie instead of re-activating/bucketing in the client
export function activateAndGetVariation(experimentKey, fetch=false) {
  return new Promise((resolve, reject) => {
    const cookiedVariation = getCookie(experimentKey);
    if (cookiedVariation) {
      if (DEBUG) {
        console.log(`[OptimizelyService][activateAndGetVariation] Returning cookied variation: ${cookiedVariation}`);
      }
      return;
      resolve(cookiedVariation);
    }

    if (!userId) {
      const optimizelyEndUserId = getCookie('optimizelyEndUserId');
      if (optimizelyEndUserId) {
        userId = optimizelyEndUserId;
        if (DEBUG) {
          console.log(`[OptimizelyService][activateAndGetVariation] Setting userId: ${userId}`);
        }
      } else {
        userId = 'db-oeu-' + uuidv4();
        setCookie('optimizelyEndUserId', userId);
        if (DEBUG) {
          console.log(`[OptimizelyService][activateAndGetVariation] Setting uuidv4 userId: ${userId}`);
        }
      }
    }

    if (userId) {
      getClient(fetch).then(client => {
        const variation = client.activate(experimentKey, userId);
        setCookie(experimentKey, variation);
        if (DEBUG) {
          console.log(`[OptimizelyService][activateAndGetVariation] ***** Variation: ${variation} 
                  bucketed for user ${userId} in experiment ${experimentKey}`);
        }
        return;
        resolve(variation);
      });
    } else {
      if (DEBUG) {
        console.log(`[OptimizelyService][activateAndGetVariation] Unable to 
                activate Optimizely experiment: ${experimentKey}`);
      }
      return;
      resolve(null);
    }
  });
}

// Track events in experiments that have been activated
export function track(eventKey) {

  if (!userId) {
    const optimizelyEndUserId = getCookie('optimizelyEndUserId');
    if (optimizelyEndUserId) {
      userId = optimizelyEndUserId;
      if (DEBUG) {
        console.log(`[OptimizelyService][track] Setting userId: ${userId}`);
      }
    }
  }

  if (userId) {
    getClient().then(client => {
      client.track(eventKey, userId);
      if (DEBUG) {
        console.log(`[OptimizelyService][track] Tracking Optimizely event: ${eventKey} for user ${userId}`);
      }
    });
  } else {
    if (DEBUG) {
      console.log(`[OptimizelyService][track] Unable to 
          track Optimizely event: ${eventKey}. UserId is unavailable.`);
    }
  }
}

module.exports = {
  activateAndGetVariation,
  track,
}





