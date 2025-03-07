export class MedicalSurveyService {
  constructor(http, localStorage) {
    this.http = http;
    this.localStorage = localStorage;
  }

  async fetchMedicalSurveyQuestions(visit) {
    try {
      return await this.http.GET(`emr/questionnaire/${visit.questionnaire.id}`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The list of questions could not be obtained.');
    }
  }

  async sendQuestionnaireAnswers(data) {
    try {
      const response = await this.http.PATCH(`emr/visits/${data.visitId}`, data.answers);
      this.localStorage.removeItem('skinProfileStep');
      this.localStorage.removeItem('userAnswers');
      return response;
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('Unable to submit questionnaire answers. Please try again.');
    }
  }

  async sendQuestionnairePhoto(data) {
    try {
      return await this.http.POST(`emr/visits/${data.visitUuid}/create_photo`, data);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('Unable to upload photos. Please try again.');
    }
  }

  async createMedicalVisit(data) {
    try {
      return await this.http.POST(`emr/visits`, data);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The medical visit could not be created.');
    }
  }

  async getVisit(visitId) {
    try {
      return await this.http.GET(`emr/visits/${visitId}`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The visit can not be created.');
    }
  }

  async submitConsent(visitId) {
    try {
      return await this.http.POST(`emr/visits/${visitId}/submit_consent`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      if (error.code === 409) {
        return Promise.reject('Unable to submit consent. You already have a visit in progress.');
      }
      return Promise.reject('Unable to submit consent. Please try again.');
    }
  }

  async getPendingOrCreateVisit(data) {
    try {
      let visitData = {};
      if (data.status !== null) {
        visitData['skinProfileStatus'] = data.status;
      }
      if (data.consentToTelehealth !== null) {
        visitData['consentToTelehealth'] = data.consentToTelehealth;
      }
      return await this.http.POST(`customers/${data.userUUID}/visits/get_pending_or_create`, visitData);
    } catch (error) {
      return Promise.reject('Unable to start visit. Please try again or contact support@dearbrightly.com');
    }
  }

  async getPendingVisit(userId) {
    try {
      return await this.http.GET(`customers/${userId}/visits/get_pending`);
    } catch (error) {
      return Promise.reject('The pending visit could not be retrieved.');
    }
  }

  async getMostRecentVisit() {
    try {
      return await this.http.GET(`emr/visits?status=most_recent`);
    } catch (error) {
      return Promise.reject('The most recent visit could not be retrieved.');
    }
  }

  async getVisits() {
    try {
      return await this.http.GET('emr/visits');
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('The list of visits could not be obtained.');
    }
  }
}
