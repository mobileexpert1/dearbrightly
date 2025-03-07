import { getErrorMessages } from 'src/common/helpers/getErrorMessages';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { klaviyoIdentifyUser } from 'src/common/helpers/klaviyoUtils';
import { store } from 'src/';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');
const FACEBOOK_PIXEL_ID = getEnvValue('FACEBOOK_PIXEL_ID');

export class AuthService {
  constructor(http, localStorage) {
    this.http = http;
    this.localStorage = localStorage;
  }

  async registerUser(user) {
    try {
      const sharingProgramCode = localStorage.getItem('sp_c');
      const userData = {
        ...user,
        sharing_code: sharingProgramCode,
        phone: user.phoneNumber,
        address_line1: user.addressLineOne,
        address_line2: user.addressLineTwo || '',
        country: 'US',
        postal_code: user.zip,
      };

      await this.http.POST('auth/register', userData, { authorized: false });

      GTMUtils.trackCall('registration_complete');

      return Promise.resolve('Account has been successfully created. Logging in...');
    } catch (error) {
      const errorMsg = error.body && error.body.detail;

      return Promise.reject(errorMsg);
    }
  }

  async requestPasswordResetEmail(email) {
    try {
      return await this.http.POST('customers/reset_password', { email }, { authorized: false });
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async verifyPasswordResetToken(token) {
    try {
      return await this.http.POST(
        `customers/reset_password_token`,
        { token },
        { authorized: false },
      );
    } catch (error) {
      return Promise.reject('Token has expired. Please request a new one.');
    }
  }

  async setNewPassword(data) {
    try {
      return await this.http.PATCH('customers/reset_password_confirm', data, { authorized: false });
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async logIn(payload) {
    try {
      const response = await this.http.POST('auth/login', payload.credentials, {
        authorized: false,
      });

      GTMUtils.trackCall('login-login_success');
      klaviyoIdentifyUser({ email: response.email, id: response.id });

      return response;
    } catch (error) {
      // TODO - Add some id to the track (email?)
      GTMUtils.trackCall('login-login_fail');

      var errorMessage = 'Incorrect email address or password.';
      if (error.body && error.body.detail) {
        errorMessage = error.body.detail;
      }
      return Promise.reject(errorMessage);
    }
  }

  async logOut(username) {
    try {
      // TODO (Alda) - Properly handle FB logout
      window.FB.logout();
      const response = await this.http.POST('auth/logout', username, { authorized: false });
      this.localStorage.removeItem('redirect_url');
      this.localStorage.removeItem('skinProfileAnswers');
      this.localStorage.removeItem('skinProfileStep');
      this.localStorage.removeItem('userAnswers');
      this.localStorage.removeItem('uuid');
      this.localStorage.removeItem('state');
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async facebookAuthentication(credentials) {
    try {
      const response = await this.http.POST(
        'auth/facebook',
        { accessToken: credentials.accessToken },
        { authorized: false },
      );

      GTMUtils.trackCall('login-fb-login_success');

      return response;
    } catch (error) {
      // TODO - Add some id to the track (email?)
      GTMUtils.trackCall('login-fb-login_fail', {
        success: false,
        error: error,
      });

      var errorMessage = 'Incorrect email address or password.';
      if (error.body && error.body.detail) {
        errorMessage = error.body.detail;
      }
      window.FB.logout();
      return Promise.reject(errorMessage);
    }
  }

  async validateOTPCode(code, enable2faTimeout) {
    try {
      const response = await this.http.POST(
        `auth/validate_otp?code=${code}&enable2faTimeout=${enable2faTimeout}`,
      );
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async get2faSetupCode() {
    try {
      const response = await this.http.GET(`auth/get_2fa_setup_code`);
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async confirm2FA(code, secretKey) {
    try {
      const response = await this.http.POST(`auth/confirm_2fa?code=${code}&secret=${secretKey}`);
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async disable2FA(code) {
    try {
      const response = await this.http.POST(`auth/disable_2fa`, {
        code,
      });
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  async toggleOtpTimeout() {
    try {
      const response = await this.http.POST(`auth/toggle_otp_timeout`);
      return response;
    } catch (error) {
      const errorMsg = getErrorMessages(error);
      return Promise.reject(errorMsg);
    }
  }

  // new endpoint

  // async refreshToken() {
  //     const token = this.localStorage.getItem(authConfig.tokenField);
  //     try {
  //         return await this.http.POST('auth/token-refresh/', { token });
  //     } catch (error) {
  //         const errorMsg = getErrorMessages(error);

  //         return Promise.reject(errorMsg);
  //     }
  // }

  // new endpoint

  // async getToken(payload) {
  //     try {
  //         return this.http.POST('auth/token-auth/', payload.credentials);
  //     } catch (error) {
  //         const errorMsg = getErrorMessages(error);

  //         return Promise.reject(errorMsg);
  //     }
  // }

  // new endpoint

  // logOut() {
  //     this.localStorage.removeItem(authConfig.tokenField);
  // }

  // new endpoint

  // getUserId(token) {
  //     const { user_id: userId } = jwtDecode(token);

  //     return userId;
  // }
}
