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
  });
}

