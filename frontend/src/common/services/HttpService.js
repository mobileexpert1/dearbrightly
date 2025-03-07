import axios from 'axios';
import { saveAs } from 'file-saver';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { httpRequestAuthFail } from 'src/common/actions/httpRequestActions';

const SCHEME = getEnvValue('BACKEND_SCHEME');
const HOST = getEnvValue('BACKEND_HOST');
const PORT = getEnvValue('BACKEND_PORT');
const ENV_MODE = getEnvValue('NODE_ENV');

const BASE_URL =
  ENV_MODE === 'development'
    ? `${SCHEME}://${HOST}:${PORT}/api/v1/`
    : `${SCHEME}://${HOST}/api/v1/`;

export class HttpService {
  // option.download saves the file blob by blob to option.filename file
  GET(path, options) {
    return this.makeRequest('GET', path, null, options);
  }

  POST(path, body, options) {
    return this.makeRequest('POST', path, body, options);
  }

  PATCH(path, body, options) {
    return this.makeRequest('PATCH', path, body, options);
  }

  DELETE(path, body, options) {
    return this.makeRequest('DELETE', path, body, options);
  }

  PUT(path, body, options) {
    return this.makeRequest('PUT', path, body, options);
  }

  makeRequest(method, path, body = null, options = {}) {
    const bodyJSON = method === 'GET' ? body : JSON.stringify(body);
    const authorized = options.authorized;

    var jwt = null;

    if (authorized) {
      jwt = localStorage.getItem('jwt');
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    const params = {
      body: bodyJSON,
      credentials: 'include',
      headers: jwt
        ? {
            ...headers,
            Authorization: `JWT ${JSON.parse(jwt)}`,
          }
        : headers,
      method,
    };

    if (options.download) {
      // uses streaming to download a file
      const fileName = options.fileName;
      return fetch(BASE_URL + path, params)
        .then(res => res.blob())
        .then(blob => saveAs(blob, fileName))
        .catch(error => {
          throw error;
        });
    } else if (path.startsWith('payment/get_discount') || path.endsWith('authorize-payment')) {
      // TODO: remove 'else if' when all endpoints are changed to v2
      return fetch(BASE_URL.replace('v1', 'v2') + path, params)
        .then(async response => {
          if (response.ok) {
            // TODO - Better handle different responses from API (another data type can be png/jpg)
            // used to fix issue with CSV response type being interpereted as invalid structure
            if (response.headers.get('Content-Type') === 'text/csv') {
              return response.text();
            }
            return response.json();
          }
          const err = new Error(response.statusText);
          err.body = await response.json();
          err.code = response.status;
          throw err;
        })
        .then(data => {
          return data;
        })
        .catch(error => {
          if (error.code === 401) {
            httpRequestAuthFail();
          }
          throw error;
        });
    } else {
      return fetch(BASE_URL + path, params)
        .then(async response => {
          if (response.ok) {
            // TODO - Better handle different responses from API (another data type can be png/jpg)
            // used to fix issue with CSV response type being interpereted as invalid structure
            if (response.headers.get('Content-Type') === 'text/csv') {
              return response.text();
            }
            return response.json();
          }
          const err = new Error(response.statusText);
          err.body = await response.json();
          err.code = response.status;
          throw err;
        })
        .then(data => {
          return data;
        })
        .catch(error => {
          if (error.code === 401) {
            httpRequestAuthFail();
          }
          throw error;
        });
    }
  }

  // TODO (Alda) - Figure a way to actually batch send all files at once
  // Implement cleaner solution for throwing the error?
  async batchFileUpload(path, files) {
    for (let i = 0; i < files.length; i += 1) {
      try {
        await this.fileUpload(path, files[i]);
        continue;
      } catch (error) {
        const err = new Error(error.response.statusText);
        err.body = error.response;
        err.code = error.response.status;
        throw err;
      }
    }
  }

  async fileUpload(path, file) {
    const jwt = localStorage.getItem('jwt');
    const uri = `${BASE_URL}${path}`;
    const data = new FormData();
    axios.defaults.withCredentials = true;

    const headers = {
      'content-type': 'multipart/form-data',
    };

    const config = {
      headers: jwt
        ? {
            ...headers,
            Authorization: `JWT ${JSON.parse(jwt)}`,
          }
        : headers,
    };

    data.append('file', file.file[0]);
    data.append('id', file.id);

    return axios.post(uri, data, config).then(async res => {
      if (res.status == 200) {
        return res.data;
      }
      const err = new Error(res.statusText);
      err.body = await res;
      err.code = res.status;
      throw err;
    });
  }
}
