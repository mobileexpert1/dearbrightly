import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';

import { applicationInit } from 'src/common/actions/init';

import { StorageService } from 'src/common/services/StorageService';
import { deleteCookie, getCookie } from 'src/common/helpers/manageCookies';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { configureStore } from './configureStore';
import { saveState } from 'src/common/helpers/localStorage';
import { AppRoutes } from './AppRoutes';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const DEBUG = getEnvValue('DEBUG');

Object.defineProperty(String.prototype, 'hashCode', {
  value: function() {
    var hash = 0, i, chr;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }
});

const BUILD_VERSION_COOKIE_NAME = 'build_version';
const CSRF_TOKEN_COOKIE_NAME = 'csrftoken';
const currentBuildVersion = __webpack_hash__;
//console.log(`curent production hash: ${__webpack_hash__}`);
const localStorageService = new StorageService();

const setCookie = (name, buildVersion) => {
  document.cookie = `${name}=${buildVersion}; path=/`;
};

const verifyCookie = (name, buildVersion) => {
  const storedVersion = getCookie(name);
  if (DEBUG) {
    console.log(`stored version: ${storedVersion} build version: ${buildVersion}`);
  }
  if (storedVersion !== buildVersion) {
    if (DEBUG) {
      console.log('different version; clearing cookies...');
      console.log(`cookie list before delete: ${document.cookie}`);
    }
    if (storedVersion !== buildVersion) {
      if (DEBUG) {
        console.log('different version; clearing cookies...');
        console.log(`cookie list before delete: ${document.cookie}`);
      }

      deleteCookie(BUILD_VERSION_COOKIE_NAME);
      if (!DEBUG) {
        deleteCookie(CSRF_TOKEN_COOKIE_NAME);
      }

      if (DEBUG) {
        console.log(`cookie list after delete: ${document.cookie}`);
        console.log(`build version after delete: ${getCookie(BUILD_VERSION_COOKIE_NAME)}`);
        console.log(`get state: ${localStorageService.getItem('state')}`);
      }
      if (DEBUG) {
        console.log('in debug; not deleting state...');
      } else {
        localStorageService.removeItem('state');
      }

      if (DEBUG) {
        console.log(`get state after removeItem: ${localStorageService.getItem('state')}`);
      }

      setCookie(BUILD_VERSION_COOKIE_NAME, currentBuildVersion);

      if (DEBUG) {
        console.log(`build version after new setCookie: ${getCookie(BUILD_VERSION_COOKIE_NAME)}`);
      }
    }
  }
};

const clearSkinProfileLocalStorage = () => {
  localStorageService.removeItem('skinProfileStep');
  localStorageService.removeItem('userAnswers');
  localStorageService.removeItem('skinProfileAnswers');
};

verifyCookie(BUILD_VERSION_COOKIE_NAME, currentBuildVersion);
clearSkinProfileLocalStorage();

if (DEBUG) {
  console.log(`FN: ${getCookie(BUILD_VERSION_COOKIE_NAME)}`);
}

export const store = configureStore();

store.dispatch(applicationInit());

store.subscribe(
  throttle(() => {
    saveState({
      authentication: store.getState().authentication,
      user: store.getState().user,
      shoppingBag: store.getState().shoppingBag,
      order: store.getState().order,
    });
  }, 500),
);

render(
  <Provider store={store}>
    <React.Fragment>
      <AppRoutes />
    </React.Fragment>
  </Provider>,
  document.getElementById('app'),
);
