module.exports = (options) => {

  const request = require('request');
  const { merge } = require('lodash');

  const defaultOptions = {
    baseUrl: options.endpoint,
    headers: {
      Cookie: `JSESSIONID=${parseSessionId(options.session)}`
    }
  };

  function parseSessionId(sessionStr) {
    return sessionStr
      .split("JSESSIONID=")
      .pop()
      .split(";")
      .shift();
  };

  const requestPromise = options => {
    return new Promise((resolve, reject) => {
      request.defaults(defaultOptions)(options, (err, response, body) => {
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
  };

  return { defaultOptions, parseSessionId, request: requestPromise };
}

