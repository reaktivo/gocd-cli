const request = require('request');
const { merge } = require('lodash');
const { parseSessionId } = require('../helpers/string');

module.exports = (options) => {
  const defaultsRequest = request.defaults({
    baseUrl: options.endpoint,
    headers: {
      Cookie: `JSESSIONID=${parseSessionId(options.session)}`
    }
  });

  function CustomRequest(options) {
    return new Promise((resolve, reject) => {
      defaultsRequest(options, (err, response, body) => {
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

  CustomRequest.post = (options, form) => {
    options = Object.assign({
      method: 'POST',
      form: form
    }, options);

    return CustomRequest(options);
  }

  return CustomRequest;
}

