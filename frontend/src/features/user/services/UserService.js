export class UserService {
  constructor(http) {
    this.http = http;
  }

  async fetchUser(id) {
    try {
      return this.http.GET(`customers/${id}`);
    } catch (error) {
      if (error.code === 401) {
        return Promise.reject('Token refresh error.');
      }
      return Promise.reject('Unable to fetch user info. Please try again later.');
    }
  }

}
