const request = require('request');
const { merge } = require('lodash');

module.exports = class Request {

  constructor(options) {
    this.get = this.get.bind(this);
    this.request = request.defaults({
      baseUrl: options.endpoint,
      headers: {
        Cookie: `JSESSIONID=${this.parseSessionId(options.session)}`
      }
    });
  }

  parseSessionId(sessionStr) {
    return sessionStr
      .split("JSESSIONID=")
      .pop()
      .split(";")
      .shift();
  }

  get(options) {
    return new Promise((resolve, reject) => {
      this.request(options, (err, response, body) => {
        if (err) {
          reject(err);
        }

        if (!response) {
          reject(new Error('Unexpected error fetching ...'));
        }

        if (response && response.statusCode === 401) {
          reject(new Error('Please check if session parameter is valid'));
        }

        return resolve(body);
      });
    });
  }

};
