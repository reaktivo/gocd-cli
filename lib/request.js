const requestPromise = require('request-promise');
const { parseSessionId } = require('../helpers/string');

module.exports = (options) => {

  return requestPromise.defaults({
    baseUrl: options.endpoint,
    headers: {
      Cookie: `JSESSIONID=${parseSessionId(options.session)}`
    },
    resolveWithFullResponse: true,
    simple: true,
    /*,
    transform: (response) => {
      if (response && response.statusCode === 401) {
        return Promise.resolve(new Error('Please check if session parameter is valid'));
      }

      return Promise.reject(response);
    }*/
  });
}

