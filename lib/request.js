const requestPromise = require('request-promise');
const { parseSessionId } = require('../helpers/string');
const url = require('url');

function addSafeProtocolIfNotAvailable(endpoint) {
  return url.parse(endpoint).protocol
    ? endpoint
    : 'https://' + endpoint;
}

module.exports = function Request(options) {
  return function(requestOptions) {
    return requestPromise.defaults({
      baseUrl: addSafeProtocolIfNotAvailable(options.endpoint),
      headers: {
        Cookie: `JSESSIONID=${parseSessionId(options.session)}`
      },
      resolveWithFullResponse: true,
      simple: true,
    })(requestOptions);
  };
}
