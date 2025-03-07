import { getEnvValue } from 'src/common/helpers/getEnvValue';

export const loadFbApi = () => {
  window.fbAsyncInit = function() {
    const FACEBOOK_APP_ID = getEnvValue('FACEBOOK_APP_ID');
    const FACEBOOK_API_VERSION = getEnvValue('FACEBOOK_API_VERSION');
    FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: FACEBOOK_API_VERSION,
    });
  };

  (function(d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};
