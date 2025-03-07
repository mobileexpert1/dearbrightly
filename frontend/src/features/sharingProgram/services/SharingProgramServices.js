export class SharingProgramService {
  constructor(http) {
    this.http = http;
  }

  async getSharingProgramCode(
    entryPoint,
    communicationMethod,
    emailType,
    emailReminderIntervalInDays,
    referrerEmail,
  ) {
    try {
      let data = {
        referrerEmail: referrerEmail,
        entryPoint: entryPoint,
        communicationMethod: communicationMethod,
        emailType: emailType,
        emailReminderIntervalInDays: emailReminderIntervalInDays,
      };
      // TODO - Revisit using a GET request (had issues with the body when using GET)
      return await this.http.POST('sharing/get_referral_code', data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async sendSharingEmail(refereeEmail, entryPoint, emailType, emailReminderIntervalInDays) {
    try {
      const body = {
        refereeEmail: refereeEmail,
        entryPoint: entryPoint,
        emailType: emailType,
        emailReminderIntervalInDays: emailReminderIntervalInDays,
      };
      return await this.http.POST('mail/send_sharing_email', body);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
